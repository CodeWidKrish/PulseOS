from datetime import datetime
from uuid import UUID

from pydantic import BaseModel


class DoctorResponse(BaseModel):
    id: UUID
    name: str
    specialty: str
    bio: str | None

    model_config = {"from_attributes": True}


class SlotResponse(BaseModel):
    id: UUID
    doctor_id: UUID
    starts_at: datetime
    ends_at: datetime
    is_booked: bool

    model_config = {"from_attributes": True}


class AppointmentCreate(BaseModel):
    doctor_id: UUID
    slot_id: UUID


class AppointmentResponse(BaseModel):
    id: UUID
    patient_id: UUID
    doctor_id: UUID
    slot_id: UUID
    status: str
    created_at: datetime
    doctor: DoctorResponse | None = None
    slot: SlotResponse | None = None

    model_config = {"from_attributes": True}
