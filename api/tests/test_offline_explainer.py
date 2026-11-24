from app.services.ai_service import extract_questions, get_ai_service
from app.services.offline_explainer import MODEL_NAME, OfflineExplainer, build_explanation
from app.services.report_parser import LabValue


def _v(name, value, low, high, unit="mg/dL"):
    status = "low" if value < low else "high" if value > high else "normal"
    return LabValue(name, value, unit, low, high, status)


def test_falls_back_to_offline_without_key(monkeypatch):
    from app.core import config

    monkeypatch.setattr(config.settings, "llm_provider", "groq")
    monkeypatch.setattr(config.settings, "groq_api_key", "")
    assert get_ai_service().model_name == MODEL_NAME


def test_explanation_follows_safety_layout():
    text = build_explanation([_v("Fasting Glucose", 112, 70, 100), _v("HDL Cholesterol", 52, 40, 80)])
    assert "Fasting Glucose is 112 mg/dL, above the usual range of 70–100 mg/dL" in text
    assert "doctor" in text.lower()
    assert "does not provide medical advice" in text
    assert "URGENT CARE NOTICE" not in text
    questions = extract_questions(text)
    assert 3 <= len(questions) <= 5
    assert questions[0].startswith("Should I repeat my glucose test")


def test_urgent_notice_only_when_far_out_of_range():
    text = build_explanation([_v("Fasting Glucose", 260, 70, 100)])
    assert text.startswith("URGENT CARE NOTICE")


def test_all_normal_is_reassuring():
    text = build_explanation([_v("TSH", 2.1, 0.4, 4.0, "mIU/L")])
    assert "all 1 results in this report sit inside their usual ranges" in text


async def test_streams_full_text():
    values = [_v("Vitamin D", 18, 30, 100, "ng/mL")]
    chunks = [t async for t in OfflineExplainer(delay=0).stream_explanation(values)]
    assert "".join(chunks) == build_explanation(values)
