"""
Offline explainer — a deterministic, rule-based fallback used when no LLM key is configured.

It follows the same safety rules as the LLM system prompt (ai_service.py): plain language,
no diagnosis, no medication advice, "a doctor should confirm", questions for the doctor,
an urgent-care notice only for markedly abnormal values, and only the numbers provided.
"""
import asyncio
import re
from collections.abc import AsyncGenerator
from dataclasses import dataclass

from app.services.report_parser import LabValue

MODEL_NAME = "pulseos-offline-explainer"

DISCLAIMER = (
    "PulseOS explains information and does not provide medical advice. "
    "Always consult your doctor."
)


@dataclass(frozen=True)
class _Topic:
    keys: tuple[str, ...]
    what: str
    high: str
    low: str
    question: str


# Plain-language notes for common tests. Deliberately non-diagnostic.
_TOPICS: tuple[_Topic, ...] = (
    _Topic(("a1c", "hba1c"), "reflects your average blood sugar over the past 2–3 months",
           "A higher A1c means blood sugar has been running a bit above the usual range lately.",
           "A lower A1c is uncommon and worth mentioning to your doctor.",
           "What does my A1c mean for my long-term blood sugar, and when should I retest?"),
    _Topic(("glucose", "sugar"), "measures the sugar in your blood at the time of the test",
           "A higher reading can follow a recent meal, stress or poor sleep, so doctors often repeat it.",
           "A lower reading can happen after a long fast or heavy exercise.",
           "Should I repeat my glucose test fasting, and when?"),
    _Topic(("ldl",), "is often called “bad” cholesterol because it can build up in blood vessels",
           "A higher LDL is common and is usually looked at together with your other heart-health factors.",
           "A lower LDL is generally not a concern.",
           "How do my LDL and HDL numbers look together for my heart health?"),
    _Topic(("hdl",), "is often called “good” cholesterol because it helps clear other cholesterol",
           "A higher HDL is usually considered favourable.",
           "A lower HDL is something doctors weigh alongside your other cholesterol results.",
           "Is my HDL level something I should work on?"),
    _Topic(("cholesterol",), "is the total amount of cholesterol in your blood",
           "A higher total is common and is interpreted together with LDL and HDL.",
           "A lower total is usually not a concern on its own.",
           "Should we look at my cholesterol results as a whole panel?"),
    _Topic(("triglyceride",), "are a type of fat in the blood that rises after meals",
           "A higher level can reflect a recent meal or diet and is often rechecked fasting.",
           "A lower level is usually not a concern.",
           "Should my triglycerides be rechecked after fasting?"),
    _Topic(("vitamin d",), "helps keep bones and muscles healthy",
           "A higher level is uncommon and worth mentioning.",
           "A lower level is common, especially with little time in the sun.",
           "Is my vitamin D level something we should follow up on?"),
    _Topic(("tsh", "thyroid"), "checks how your thyroid gland is being signalled",
           "A higher TSH can mean the thyroid is being asked to work harder.",
           "A lower TSH can mean the thyroid is more active than usual.",
           "Do my thyroid results need any follow-up tests?"),
    _Topic(("hemoglobin", "haemoglobin"), "carries oxygen in your red blood cells",
           "A higher level can be linked to things like dehydration.",
           "A lower level can explain tiredness and is worth discussing.",
           "Could my hemoglobin level explain how I've been feeling?"),
    _Topic(("creatinine", "egfr"), "helps show how well your kidneys filter the blood",
           "A higher creatinine can be influenced by muscle mass, hydration or kidney function.",
           "A lower creatinine is usually not a concern.",
           "Do my kidney results need to be rechecked?"),
)

_GENERIC = _Topic((), "is one of the measurements in your report",
                  "It is above the usual range on this test.",
                  "It is below the usual range on this test.",
                  "What does my {name} result mean for me?")


def _topic_for(name: str) -> _Topic:
    lowered = name.lower()
    for topic in _TOPICS:
        if any(key in lowered for key in topic.keys):
            return topic
    return _GENERIC


def _fmt(v: float | None) -> str:
    if v is None:
        return "—"
    return f"{v:g}"


def _markedly_abnormal(v: LabValue) -> bool:
    """Far outside the range (more than 50% beyond the nearest limit)."""
    if v.value is None or v.ref_low is None or v.ref_high is None:
        return False
    if v.value > v.ref_high > 0:
        return (v.value - v.ref_high) / v.ref_high > 0.5
    if v.value < v.ref_low and v.ref_low > 0:
        return (v.ref_low - v.value) / v.ref_low > 0.5
    return False


def build_explanation(values: list[LabValue]) -> str:
    """Compose the full plain-language explanation as text (same layout as the LLM output)."""
    flagged = [v for v in values if v.status != "normal"]
    parts: list[str] = []

    if any(_markedly_abnormal(v) for v in flagged):
        parts.append(
            "URGENT CARE NOTICE: At least one value is far outside its usual range. "
            "Please contact your doctor or local urgent care soon to talk about it."
        )

    if not flagged:
        parts.append(
            f"Overall, all {len(values)} results in this report sit inside their usual ranges, "
            "which is reassuring. Your doctor can confirm how they fit your overall health."
        )
    else:
        in_range = len(values) - len(flagged)
        parts.append(
            f"Overall, {in_range} of {len(values)} results sit inside their usual ranges. "
            f"{len(flagged)} {'value is' if len(flagged) == 1 else 'values are'} outside the range "
            "and worth a calm conversation with your doctor, who should confirm what they mean for you."
        )
        for v in flagged:
            topic = _topic_for(v.test_name)
            unit = f" {v.unit}" if v.unit else ""
            direction = "above" if v.status == "high" else "below"
            note = topic.high if v.status == "high" else topic.low
            parts.append(
                f"{v.test_name} is {_fmt(v.value)}{unit}, {direction} the usual range of "
                f"{_fmt(v.ref_low)}–{_fmt(v.ref_high)}{unit}. This test {topic.what}. {note}"
            )

    questions: list[str] = []
    for v in flagged:
        q = _topic_for(v.test_name).question.format(name=v.test_name)
        if q not in questions:
            questions.append(q)
    for extra in (
        "Are there lifestyle changes you would suggest before my next check?",
        "When should I schedule my next blood test?",
        "Is there anything in this report you would like to look at more closely?",
    ):
        if len(questions) >= 5:
            break
        questions.append(extra)
    questions = questions[:5]

    parts.append("Questions to Ask Your Doctor\n" + "\n".join(f"{i}. {q}" for i, q in enumerate(questions, 1)))
    parts.append(DISCLAIMER)
    return "\n\n".join(parts)


class OfflineExplainer:
    """Drop-in replacement for the LLM service; streams word by word like a model would."""

    model_name = MODEL_NAME

    def __init__(self, delay: float = 0.018) -> None:
        self._delay = delay

    async def stream_explanation(self, values: list[LabValue]) -> AsyncGenerator[str, None]:
        text = build_explanation(values)
        for token in re.findall(r"\S+\s*|\s+", text):
            yield token
            if self._delay:
                await asyncio.sleep(self._delay)
