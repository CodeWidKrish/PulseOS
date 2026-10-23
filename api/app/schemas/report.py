from datetime import datetime
from uuid import UUID

from pydantic import BaseModel


class ReportValueSchema(BaseModel):
    id: UUID
    test_name: str
    value: float | None
    unit: str | None
    ref_low: float | None
    ref_high: float | None
    status: str

    model_config = {"from_attributes": True}


class ReportExplanationSchema(BaseModel):
    id: UUID
    summary: str
    details: dict
    questions: list
    model: str
    created_at: datetime

    model_config = {"from_attributes": True}


class ReportResponse(BaseModel):
    id: UUID
    filename: str
    status: str
    created_at: datetime
    values: list[ReportValueSchema] = []
    explanation: ReportExplanationSchema | None = None

    model_config = {"from_attributes": True}


class ReportListItem(BaseModel):
    id: UUID
    filename: str
    status: str
    created_at: datetime

    model_config = {"from_attributes": True}
