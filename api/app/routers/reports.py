import json
import os
import uuid
from pathlib import Path

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from fastapi.responses import StreamingResponse
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

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
    # Load report (ownership check)
    result = await db.execute(
        select(Report).where(Report.id == report_id, Report.user_id == current_user.id)
    )
    report = result.scalar_one_or_none()
    if not report:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Report not found")

    # Parse text (or extract if not done yet)
    if not report.extracted_text:
        report.extracted_text = extract_text(report.storage_path)
        report.status = ReportStatus.processing
        await db.commit()

    lab_values = parse_lab_values(report.extracted_text or "")

    # Save parsed values
    if lab_values and not report.status == ReportStatus.done:
        for lv in lab_values:
            db.add(ReportValue(
                report_id=report.id,
                test_name=lv.test_name,
                value=lv.value,
                unit=lv.unit,
                ref_low=lv.ref_low,
                ref_high=lv.ref_high,
                status=lv.status,
            ))
        await db.commit()

    ai_service = get_ai_service()
    full_text: list[str] = []

    async def event_stream():
        try:
            async for token in ai_service.stream_explanation(lab_values):
                full_text.append(token)
                yield f"data: {json.dumps({'token': token})}\n\n"

            # Persist the full explanation after streaming completes
            complete = "".join(full_text)
            explanation = ReportExplanation(
                report_id=report.id,
                summary=complete[:500],  # first 500 chars as summary
                details={"full_text": complete},
                questions=[],  # parsed from text in a later enhancement
                model=settings.groq_model,
            )
            db.add(explanation)
            report.status = ReportStatus.done
            await db.commit()

            yield f"data: {json.dumps({'done': True})}\n\n"
        except Exception as e:
            report.status = ReportStatus.error
            await db.commit()
            yield f"data: {json.dumps({'error': str(e)})}\n\n"

    return StreamingResponse(
        event_stream(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",  # disable nginx buffering
        },
    )
