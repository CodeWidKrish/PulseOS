import enum
import uuid
from datetime import datetime, timezone

from sqlalchemy import Boolean, DateTime, Enum, ForeignKey, String, Text, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class Doctor(Base):
    __tablename__ = "doctors"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID | None] = mapped_column(
        ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True
    )
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    specialty: Mapped[str] = mapped_column(String(100), nullable=False)
    bio: Mapped[str | None] = mapped_column(Text, nullable=True)

    user: Mapped["User | None"] = relationship("User", back_populates="doctor_profile")
    slots: Mapped[list["AvailabilitySlot"]] = relationship(
        "AvailabilitySlot", back_populates="doctor", cascade="all, delete-orphan"
    )
    appointments: Mapped[list["Appointment"]] = relationship(
        "Appointment", back_populates="doctor"
    )


class AvailabilitySlot(Base):
    __tablename__ = "availability_slots"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    doctor_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("doctors.id", ondelete="CASCADE"), nullable=False, index=True
    )
    starts_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    ends_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    is_booked: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)

    doctor: Mapped["Doctor"] = relationship("Doctor", back_populates="slots")
    appointment: Mapped["Appointment | None"] = relationship(
        "Appointment", back_populates="slot"
    )


class AppointmentStatus(str, enum.Enum):
    confirmed = "confirmed"
    cancelled = "cancelled"


class Appointment(Base):
    __tablename__ = "appointments"
    __table_args__ = (
        # DB-level double-booking prevention
        UniqueConstraint("slot_id", name="uq_appointments_slot"),
    )

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    patient_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    doctor_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("doctors.id"), nullable=False, index=True
    )
    slot_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("availability_slots.id"), nullable=False, unique=True
    )
    status: Mapped[AppointmentStatus] = mapped_column(
        Enum(AppointmentStatus), nullable=False, default=AppointmentStatus.confirmed
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    patient: Mapped["User"] = relationship(
        "User", back_populates="appointments", foreign_keys=[patient_id]
    )
    doctor: Mapped["Doctor"] = relationship("Doctor", back_populates="appointments")
    slot: Mapped["AvailabilitySlot"] = relationship("AvailabilitySlot", back_populates="appointment")
