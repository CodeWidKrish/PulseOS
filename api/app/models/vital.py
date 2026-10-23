from __future__ import annotations

import enum
import uuid
from datetime import UTC, datetime
from typing import TYPE_CHECKING

from sqlalchemy import DateTime, Enum, Float, ForeignKey, Index
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base

if TYPE_CHECKING:
    from app.models.user import User


class VitalType(enum.StrEnum):
    heart_rate = "heart_rate"
    bp = "bp"
    glucose = "glucose"
    weight = "weight"


class Vital(Base):
    __tablename__ = "vitals"
    __table_args__ = (
        # Compound index for fast user+time queries
        Index("ix_vitals_user_recorded", "user_id", "recorded_at"),
    )

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    type: Mapped[VitalType] = mapped_column(Enum(VitalType), nullable=False)
    value_1: Mapped[float] = mapped_column(Float, nullable=False)
    value_2: Mapped[float | None] = mapped_column(Float, nullable=True)  # BP diastolic
    recorded_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(UTC),
        nullable=False,
    )

    user: Mapped[User] = relationship("User", back_populates="vitals")
