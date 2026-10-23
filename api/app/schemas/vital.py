from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, field_validator


class VitalCreate(BaseModel):
    type: str
    value_1: float
    value_2: float | None = None
    recorded_at: datetime | None = None

    @field_validator("type")
    @classmethod
    def valid_type(cls, v: str) -> str:
        allowed = {"heart_rate", "bp", "glucose", "weight"}
        if v not in allowed:
            raise ValueError(f"type must be one of {allowed}")
        return v

    @field_validator("value_2")
    @classmethod
    def bp_requires_value_2(cls, v, info):
        if info.data.get("type") == "bp" and v is None:
            raise ValueError("BP type requires value_2 (diastolic)")
        return v


class VitalResponse(BaseModel):
    id: UUID
    type: str
    value_1: float
    value_2: float | None
    recorded_at: datetime

    model_config = {"from_attributes": True}


class VitalSummary(BaseModel):
    type: str
    average: float | None
    latest: float | None
    trend: str  # "up" | "down" | "stable"
    health_score: int
    readings: list[VitalResponse]
