from app.services.report_parser import parse_lab_values

SAMPLE = """PULSEOS SAMPLE LABORATORY - SYNTHETIC DEMO REPORT
Patient: Demo Patient   Collected: 2026-11-20
Test Result Unit Reference Range
Fasting Glucose 112 mg/dL 70-100
Hemoglobin: 14.2 g/dL (13.5-17.5)
TSH 3.5 mIU/L [0.4-4.0] H
Vitamin D 18 ng/mL 30-100
Glucose   95   mg/dL   70-100
"""


def test_parses_common_formats():
    values = {v.test_name: v for v in parse_lab_values(SAMPLE)}
    assert set(values) == {"Fasting Glucose", "Hemoglobin", "TSH", "Vitamin D", "Glucose"}
    assert values["Fasting Glucose"].status == "high"
    assert values["Fasting Glucose"].unit == "mg/dL"
    assert values["Hemoglobin"].ref_low == 13.5
    assert values["TSH"].status == "normal"
    assert values["Vitamin D"].status == "low"


def test_ignores_headers_and_dates():
    names = [v.test_name for v in parse_lab_values(SAMPLE)]
    assert not any("Patient" in n or "Collected" in n or "Range" in n for n in names)


def test_skips_duplicates_and_invalid_ranges():
    text = "Glucose 90 mg/dL 70-100\nglucose 91 mg/dL 70-100\nBroken 5 mg/dL 10-2\n"
    values = parse_lab_values(text)
    assert [v.test_name for v in values] == ["Glucose"]
