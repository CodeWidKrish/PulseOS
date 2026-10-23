from __future__ import annotations

import enum
import uuid
from datetime import UTC, datetime
from typing import TYPE_CHECKING

from sqlalchemy import DateTime, Enum, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base

if TYPE_CHECKING:
    from app.models.appointment import Appointment, Doctor
    from app.models.report import Report
    from app.models.vital import Vital


class UserRole(enum.StrEnum):
    patient = "patient"
    doctor = "doctor"
    admin = "admin"


class User(Base):
    __tablename__ = "users"

    id: Mapped[uuid.UUID] = mapped_column(
        primary_key=True, default=uuid.uuid4
    )
    email: Mapped[str] = mapped_column(String(255), unique=True, nullable=False, index=True)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    full_name: Mapped[str] = mapped_column(String(255), nullable=False)
    role: Mapped[UserRole] = mapped_column(
        Enum(UserRole), nullable=False, default=UserRole.patient
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(UTC),
        nullable=False,
    )

    # Relationships
    reports: Mapped[list[Report]] = relationship("Report", back_populates="user")
    vitals: Mapped[list[Vital]] = relationship("Vital", back_populates="user")
    appointments: Mapped[list[Appointment]] = relationship(
        "Appointment", back_populates="patient", foreign_keys="Appointment.patient_id"
    )
    doctor_profile: Mapped[Doctor | None] = relationship("Doctor", back_populates="user")
