import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.deps import get_current_user, get_db
from app.models.appointment import AvailabilitySlot, Doctor
from app.models.user import User
from app.schemas.appointment import DoctorResponse, SlotResponse

router = APIRouter()


@router.get("", response_model=list[DoctorResponse])
async def list_doctors(
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_user),
):
    result = await db.execute(select(Doctor).order_by(Doctor.name))
    return result.scalars().all()


@router.get("/{doctor_id}/slots", response_model=list[SlotResponse])
async def get_available_slots(
    doctor_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_user),
):
    result = await db.execute(
        select(AvailabilitySlot)
        .where(
            AvailabilitySlot.doctor_id == doctor_id,
            AvailabilitySlot.is_booked == False,
        )
        .order_by(AvailabilitySlot.starts_at)
    )
    return result.scalars().all()
