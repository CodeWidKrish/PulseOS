import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.deps import get_current_user, get_db
from app.models.appointment import Appointment, AppointmentStatus, AvailabilitySlot
from app.models.user import User
from app.schemas.appointment import AppointmentCreate, AppointmentResponse
from app.services.mailer import send_appointment_confirmation

router = APIRouter()


@router.post("", response_model=AppointmentResponse, status_code=status.HTTP_201_CREATED)
async def book_appointment(
    body: AppointmentCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Conflict-safe booking using two layers:
    1. SELECT FOR UPDATE pessimistic lock (prevents race conditions)
    2. UNIQUE constraint on slot_id (final safety net)
    """
    try:
        # Layer 1: pessimistic lock on the slot row
        slot_result = await db.execute(
            select(AvailabilitySlot)
            .where(AvailabilitySlot.id == body.slot_id)
            .with_for_update()
        )
        slot = slot_result.scalar_one_or_none()

        if not slot:
            raise HTTPException(status.HTTP_404_NOT_FOUND, "Slot not found")
        if slot.is_booked:
            raise HTTPException(status.HTTP_409_CONFLICT, "This slot is no longer available")
        if slot.doctor_id != body.doctor_id:
            raise HTTPException(status.HTTP_400_BAD_REQUEST, "Slot does not belong to this doctor")

        # Mark as booked
        slot.is_booked = True

        # Create appointment
        appointment = Appointment(
            patient_id=current_user.id,
            doctor_id=body.doctor_id,
            slot_id=body.slot_id,
            status=AppointmentStatus.confirmed,
        )
        db.add(appointment)

        await db.commit()
    except IntegrityError:
        await db.rollback()
        raise HTTPException(
            status.HTTP_409_CONFLICT, "Slot was just booked by another user"
        ) from None

    # Reload with relationships for response
    await db.refresh(appointment)
    result = await db.execute(
        select(Appointment)
        .options(selectinload(Appointment.doctor), selectinload(Appointment.slot))
        .where(Appointment.id == appointment.id)
    )
    appt = result.scalar_one()

    # Send confirmation email (non-blocking)
    import contextlib
    with contextlib.suppress(Exception):
        await send_appointment_confirmation(
            patient_email=current_user.email,
            patient_name=current_user.full_name,
            doctor_name=appt.doctor.name,
            slot_starts_at=appt.slot.starts_at,
        )

    return appt


@router.get("", response_model=list[AppointmentResponse])
async def list_appointments(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(Appointment)
        .options(selectinload(Appointment.doctor), selectinload(Appointment.slot))
        .where(Appointment.patient_id == current_user.id)
        .order_by(Appointment.created_at.desc())
    )
    return result.scalars().all()


@router.delete("/{appointment_id}", status_code=status.HTTP_204_NO_CONTENT)
async def cancel_appointment(
    appointment_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(Appointment).where(
            Appointment.id == appointment_id,
            Appointment.patient_id == current_user.id,
        )
    )
    appt = result.scalar_one_or_none()
    if not appt:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Appointment not found")

    # Release the slot
    slot_result = await db.execute(
        select(AvailabilitySlot).where(AvailabilitySlot.id == appt.slot_id)
    )
    slot = slot_result.scalar_one_or_none()
    if slot:
        slot.is_booked = False

    appt.status = AppointmentStatus.cancelled
    await db.commit()
