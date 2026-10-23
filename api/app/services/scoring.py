"""
Health Score Service
Computes a 0-100 score from recent vitals using a documented rule-based algorithm.
This is NOT an AI inference — it is a transparent, auditable calculation.

Scoring rules (25 points each):
  Heart Rate:   60-100 bpm = full 25 pts; linear deduction outside range
  Blood Pressure: systolic 90-120, diastolic 60-80 = full 25 pts
  Glucose:      70-100 mg/dL = full 25 pts
  Weight:       Always 25 pts for now (no height data — reserved for future BMI)
"""
from app.models.vital import Vital, VitalType


def _score_in_range(value: float, low: float, high: float, max_pts: float = 25.0) -> float:
    """Linear score: max_pts at center, 0 at 2× deviation beyond range."""
    if low <= value <= high:
        return max_pts
    deviation = max(value - high, low - value)
    allowed_deviation = (high - low) * 2  # tolerance band
    deduction = (deviation / max(allowed_deviation, 1)) * max_pts
    return max(0.0, max_pts - deduction)


def compute_health_score(vitals: list[Vital]) -> int:
    """
    Returns 0-100. Uses only the most recent reading of each vital type.
    """
    by_type: dict[str, Vital] = {}
    for v in sorted(vitals, key=lambda x: x.recorded_at):
        by_type[v.type] = v  # keep latest

    score = 0.0

    # Heart Rate (25 pts)
    if VitalType.heart_rate in by_type:
        hr = by_type[VitalType.heart_rate].value_1
        score += _score_in_range(hr, 60, 100)

    # Blood Pressure (25 pts)
    if VitalType.bp in by_type:
        systolic = by_type[VitalType.bp].value_1
        diastolic = by_type[VitalType.bp].value_2 or 0
        sys_score = _score_in_range(systolic, 90, 120, 12.5)
        dia_score = _score_in_range(diastolic, 60, 80, 12.5)
        score += sys_score + dia_score

    # Glucose (25 pts)
    if VitalType.glucose in by_type:
        glucose = by_type[VitalType.glucose].value_1
        score += _score_in_range(glucose, 70, 100)

    # Weight — 25 pts reserved (BMI calc requires height, not yet collected)
    score += 25.0

    return min(100, round(score))


def compute_trend(values: list[float]) -> str:
    """
    Returns 'up', 'down', or 'stable' based on last N readings.
    Uses simple linear slope: positive = up, negative = down.
    """
    if len(values) < 2:
        return "stable"
    delta = values[-1] - values[0]
    threshold = abs(values[0]) * 0.05  # 5% change = trend
    if delta > threshold:
        return "up"
    elif delta < -threshold:
        return "down"
    return "stable"
