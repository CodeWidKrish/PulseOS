from datetime import UTC, datetime

import pytest

from app.models.vital import Vital, VitalType
from app.services.scoring import compute_health_score, compute_trend


def make_vital(vtype: str, v1: float, v2: float | None = None) -> Vital:
    v = Vital()
    v.type = vtype
    v.value_1 = v1
    v.value_2 = v2
    v.recorded_at = datetime.now(UTC)
    return v


def test_perfect_health_score():
    vitals = [
        make_vital(VitalType.heart_rate, 75),       # normal
        make_vital(VitalType.bp, 110, 70),           # normal
        make_vital(VitalType.glucose, 85),           # normal
    ]
    score = compute_health_score(vitals)
    assert score == 100


def test_low_heart_rate_reduces_score():
    vitals = [make_vital(VitalType.heart_rate, 40)]
    score = compute_health_score(vitals)
    assert score < 100
    assert score >= 0


def test_high_glucose_reduces_score():
    vitals = [make_vital(VitalType.glucose, 200)]
    score = compute_health_score(vitals)
    assert score < 75


def test_score_never_negative():
    vitals = [
        make_vital(VitalType.heart_rate, 200),
        make_vital(VitalType.glucose, 400),
        make_vital(VitalType.bp, 200, 130),
    ]
    score = compute_health_score(vitals)
    assert 0 <= score <= 100


def test_empty_vitals_returns_25():
    # Only weight base points
    assert compute_health_score([]) == 25


@pytest.mark.asyncio
async def test_log_vital(client, auth_headers):
    resp = await client.post("/api/v1/vitals", json={
        "type": "heart_rate", "value_1": 72
    }, headers=auth_headers)
    assert resp.status_code == 201
    assert resp.json()["type"] == "heart_rate"


@pytest.mark.asyncio
async def test_log_bp_requires_value_2(client, auth_headers):
    resp = await client.post("/api/v1/vitals", json={
        "type": "bp", "value_1": 120
        # missing value_2 (diastolic)
    }, headers=auth_headers)
    assert resp.status_code == 422


@pytest.mark.asyncio
async def test_trend_stable():
    assert compute_trend([80, 80, 80, 80]) == "stable"


@pytest.mark.asyncio
async def test_trend_up():
    assert compute_trend([60, 70, 80, 90]) == "up"


@pytest.mark.asyncio
async def test_trend_down():
    assert compute_trend([90, 80, 70, 60]) == "down"
