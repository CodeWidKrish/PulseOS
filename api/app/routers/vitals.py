from datetime import UTC, datetime, timedelta

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.deps import get_current_user, get_db
from app.models.user import User
from app.models.vital import Vital, VitalType
from app.schemas.vital import VitalCreate, VitalResponse, VitalSummary
from app.services.scoring import compute_health_score, compute_trend

router = APIRouter()


@router.post("", response_model=VitalResponse, status_code=status.HTTP_201_CREATED)
async def log_vital(
    body: VitalCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    vital = Vital(
        user_id=current_user.id,
        type=body.type,
        value_1=body.value_1,
        value_2=body.value_2,
        recorded_at=body.recorded_at or datetime.now(UTC),
    )
    db.add(vital)
    await db.commit()
    await db.refresh(vital)
    return vital


@router.get("", response_model=list[VitalResponse])
async def list_vitals(
    type: str | None = Query(None),
    range: str = Query("7d", pattern="^(7d|30d)$"),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    days = 7 if range == "7d" else 30
    since = datetime.now(UTC) - timedelta(days=days)

    query = (
        select(Vital)
        .where(Vital.user_id == current_user.id, Vital.recorded_at >= since)
        .order_by(Vital.recorded_at.asc())
    )
    if type:
        query = query.where(Vital.type == type)

    result = await db.execute(query)
    return result.scalars().all()


@router.get("/summary", response_model=list[VitalSummary])
async def vitals_summary(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Returns summary (avg, latest, trend, health score) per vital type."""
    since = datetime.now(UTC) - timedelta(days=30)
    result = await db.execute(
        select(Vital)
        .where(Vital.user_id == current_user.id, Vital.recorded_at >= since)
        .order_by(Vital.recorded_at.asc())
    )
    all_vitals = list(result.scalars().all())
    health_score = compute_health_score(all_vitals)

    summaries = []
    for vtype in VitalType:
        typed = [v for v in all_vitals if v.type == vtype]
        if not typed:
            continue
        values = [v.value_1 for v in typed]
        summaries.append(VitalSummary(
            type=vtype,
            average=round(sum(values) / len(values), 1),
            latest=values[-1] if values else None,
            trend=compute_trend(values),
            health_score=health_score,
            readings=[VitalResponse.model_validate(v) for v in typed[-7:]],  # last 7
        ))

    return summaries
