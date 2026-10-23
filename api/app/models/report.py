import enum
import uuid
from datetime import datetime, timezone

from sqlalchemy import DateTime, Enum, ForeignKey, JSON, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class ReportStatus(str, enum.Enum):
    pending = "pending"
    processing = "processing"
    done = "done"
    error = "error"


class ReportValueStatus(str, enum.Enum):
    normal = "normal"
    low = "low"
    high = "high"


class Report(Base):
    __tablename__ = "reports"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    filename: Mapped[str] = mapped_column(String(255), nullable=False)
    storage_path: Mapped[str] = mapped_column(String(512), nullable=False)
    extracted_text: Mapped[str | None] = mapped_column(Text, nullable=True)
    status: Mapped[ReportStatus] = mapped_column(
        Enum(ReportStatus), nullable=False, default=ReportStatus.pending
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    # Relationships
    user: Mapped["User"] = relationship("User", back_populates="reports")
    values: Mapped[list["ReportValue"]] = relationship(
        "ReportValue", back_populates="report", cascade="all, delete-orphan"
    )
    explanation: Mapped["ReportExplanation | None"] = relationship(
        "ReportExplanation", back_populates="report", cascade="all, delete-orphan"
    )


class ReportValue(Base):
    __tablename__ = "report_values"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    report_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("reports.id", ondelete="CASCADE"), nullable=False, index=True
    )
    test_name: Mapped[str] = mapped_column(String(255), nullable=False)
    value: Mapped[float | None] = mapped_column(nullable=True)
    unit: Mapped[str | None] = mapped_column(String(50), nullable=True)
    ref_low: Mapped[float | None] = mapped_column(nullable=True)
    ref_high: Mapped[float | None] = mapped_column(nullable=True)
    status: Mapped[ReportValueStatus] = mapped_column(
        Enum(ReportValueStatus), nullable=False, default=ReportValueStatus.normal
    )

    report: Mapped["Report"] = relationship("Report", back_populates="values")


class ReportExplanation(Base):
    __tablename__ = "report_explanations"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    report_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("reports.id", ondelete="CASCADE"), nullable=False, unique=True, index=True
    )
    summary: Mapped[str] = mapped_column(Text, nullable=False)
    details: Mapped[dict] = mapped_column(JSON, nullable=False, default=dict)
    questions: Mapped[list] = mapped_column(JSON, nullable=False, default=list)
    model: Mapped[str] = mapped_column(String(100), nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    report: Mapped["Report"] = relationship("Report", back_populates="explanation")
