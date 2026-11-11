import json
import uuid
from pathlib import Path

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from fastapi.responses import StreamingResponse
from sqlalchemy import delete, select
from sqlalchemy.ext.asyncio import AsyncSession
from starlette.concurrency import run_in_threadpool

from app.core.config import settings
from app.core.deps import get_current_user, get_db
from app.models.report import Report, ReportExplanation, ReportStatus, ReportValue
from app.models.user import User
from app.schemas.report import ReportListItem, ReportResponse
from app.services.ai_service import get_ai_service
from app.services.report_parser import extract_text, parse_lab_values

router = APIRouter()

ALLOWED_MIME_TYPES = {"application/pdf", "image/jpeg", "image/png", "image/tiff"}
MAX_SIZE_BYTES = settings.max_upload_size_mb * 1024 * 1024


@router.post("", response_model=ReportListItem, status_code=status.HTTP_201_CREATED)
async def upload_report(
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # Validate file type
    if file.content_type not in ALLOWED_MIME_TYPES:
        raise HTTPException(status.HTTP_422_UNPROCESSABLE_ENTITY, "File must be PDF or image")

    # Read + size check
    content = await file.read()
    if len(content) > MAX_SIZE_BYTES:
        raise HTTPException(
            status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            f"File exceeds {settings.max_upload_size_mb} MB limit",
        )

    # Save file
    upload_dir = Path(settings.upload_dir) / str(current_user.id)
    upload_dir.mkdir(parents=True, exist_ok=True)
    file_id = uuid.uuid4()
    suffix = Path(file.filename or "report").suffix or ".pdf"
    file_path = upload_dir / f"{file_id}{suffix}"
    file_path.write_bytes(content)

    # Create DB record
    report = Report(
        user_id=current_user.id,
        filename=file.filename or "report",
        storage_path=str(file_path),
        status=ReportStatus.pending,
    )
    db.add(report)
    await db.commit()
    await db.refresh(report)
    return report


@router.get("", response_model=list[ReportListItem])
async def list_reports(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(Report)
        .where(Report.user_id == current_user.id)
        .order_by(Report.created_at.desc())
    )
    return result.scalars().all()


@router.get("/{report_id}", response_model=ReportResponse)
async def get_report(
    report_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(Report).where(Report.id == report_id, Report.user_id == current_user.id)
    )
    report = result.scalar_one_or_none()
    if not report:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Report not found")

    # Eagerly load values and explanation
    from sqlalchemy.orm import selectinload
    result = await db.execute(
        select(Report)
        .options(selectinload(Report.values), selectinload(Report.explanation))
        .where(Report.id == report_id, Report.user_id == current_user.id)
    )
    return result.scalar_one_or_none()


@router.get("/{report_id}/explain")
async def explain_report(
    report_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Server-Sent Events stream. Parses the report, calls Groq, streams tokens.
    The client reads 'data: {...}\\n\\n' events until 'data: [DONE]\\n\\n'.
    """
    result = await db.execute(
        select(Report).where(Report.id == report_id, Report.user_id == current_user.id)
        .with_for_update()
    )
    report = result.scalar_one_or_none()
    if not report:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Report not found")

    saved = await db.scalar(
        select(ReportExplanation).where(ReportExplanation.report_id == report_id)
    )
    cached_text = None
    if saved:
        cached_text = saved.details.get("full_text", saved.summary)
    else:
        try:
            extracted = report.extracted_text or await run_in_threadpool(
                extract_text, report.storage_path
            )
        except Exception:
            raise HTTPException(422, "Could not read the report. Try a clearer file.") from None
        lab_values = parse_lab_values(extracted or "")
        if not lab_values:
            raise HTTPException(422, "No readable results with reference ranges were found.")
        report.extracted_text = extracted
        await db.execute(delete(ReportValue).where(ReportValue.report_id == report_id))
        db.add_all([
            ReportValue(
                report_id=report_id, test_name=value.test_name, value=value.value,
                unit=value.unit, ref_low=value.ref_low, ref_high=value.ref_high,
                status=value.status,
            )
            for value in lab_values
        ])
    await db.commit()
    bind = db.bind

    async def event_stream():
        if cached_text is not None:
            yield f"data: {json.dumps({'token': cached_text})}\n\n"
        else:
            try:
                chunks = []
                async for token in get_ai_service().stream_explanation(lab_values):
                    chunks.append(token)
                    yield f"data: {json.dumps({'token': token})}\n\n"
                complete = "".join(chunks)
                if not complete.strip():
                    raise ValueError("Empty explanation")

                async with AsyncSession(bind, expire_on_commit=False) as session:
                    locked = await session.get(Report, report_id, with_for_update=True)
                    if locked is None:
                        raise ValueError("Report no longer exists")
                    existing = await session.scalar(
                        select(ReportExplanation).where(ReportExplanation.report_id == report_id)
                    )
                    if existing is None:
                        session.add(ReportExplanation(
                            report_id=report_id, summary=complete[:500],
                            details={"full_text": complete}, questions=[],
                            model=settings.groq_model,
                        ))
                    locked.status = ReportStatus.done
                    await session.commit()
            except Exception:
                yield 'data: {"error":"Explanation unavailable. Please try again."}\n\n'
                return
        yield 'data: {"done":true}\n\n'

    return StreamingResponse(
        event_stream(),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"},
    )
