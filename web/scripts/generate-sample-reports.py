"""
Generates the synthetic sample lab reports served from web/public/samples/.

Synthetic data only — no real patient. Dev-only script: needs `reportlab`
(pip install reportlab), which is intentionally not an app dependency.

Run from the repo root:  python web/scripts/generate-sample-reports.py
"""
from pathlib import Path

from reportlab.lib.colors import HexColor
from reportlab.lib.pagesizes import A4
from reportlab.pdfgen import canvas

OUT = Path(__file__).resolve().parents[1] / "public" / "samples"

REPORTS = {
    "sample-metabolic-panel.pdf": (
        "Comprehensive Metabolic & Lipid Panel",
        [
            ("Fasting Glucose", "112", "mg/dL", "70-100"),
            ("Hemoglobin A1c", "5.9", "%", "4.0-5.6"),
            ("Total Cholesterol", "214", "mg/dL", "125-200"),
            ("LDL Cholesterol", "138", "mg/dL", "0-130"),
            ("HDL Cholesterol", "52", "mg/dL", "40-80"),
            ("Triglycerides", "148", "mg/dL", "0-150"),
            ("Hemoglobin", "13.9", "g/dL", "13.5-17.5"),
            ("TSH", "2.1", "mIU/L", "0.4-4.0"),
            ("Creatinine", "0.96", "mg/dL", "0.7-1.3"),
            ("Vitamin D", "18", "ng/mL", "30-100"),
        ],
    ),
    "sample-thyroid-panel.pdf": (
        "Thyroid & Blood Count Panel",
        [
            ("TSH", "2.4", "mIU/L", "0.4-4.0"),
            ("Free T4", "1.2", "ng/dL", "0.8-1.8"),
            ("Hemoglobin", "14.6", "g/dL", "13.5-17.5"),
            ("Platelets", "245", "K/uL", "150-400"),
            ("White Blood Cells", "6.8", "K/uL", "4.0-11.0"),
        ],
    ),
}


def draw(path: Path, title: str, rows: list[tuple[str, str, str, str]]) -> None:
    c = canvas.Canvas(str(path), pagesize=A4)
    w, h = A4
    c.setTitle(f"PulseOS sample — {title}")
    c.setFillColor(HexColor("#FF4D5E"))
    c.setFont("Helvetica-Bold", 10)
    c.drawString(50, h - 50, "SYNTHETIC SAMPLE REPORT - NOT A REAL PATIENT")
    c.setFillColor(HexColor("#0B0F15"))
    c.setFont("Helvetica-Bold", 18)
    c.drawString(50, h - 80, title)
    c.setFont("Helvetica", 10)
    c.drawString(50, h - 100, "PulseOS Demo Laboratory")
    c.drawString(50, h - 114, "Patient: Demo Patient    Sample type: Serum")

    y = h - 150
    c.setFont("Helvetica-Bold", 10)
    for x, label in ((50, "Test"), (260, "Result"), (330, "Unit"), (410, "Reference")):
        c.drawString(x, y, label)
    c.setStrokeColor(HexColor("#C9CFD9"))
    c.line(50, y - 6, w - 50, y - 6)
    c.setFont("Helvetica", 11)
    for name, value, unit, ref in rows:
        y -= 24
        c.drawString(50, y, name)
        c.drawString(260, y, value)
        c.drawString(330, y, unit)
        c.drawString(410, y, ref)

    c.setFont("Helvetica-Oblique", 8)
    c.drawString(50, 50, "Generated for demonstration with synthetic values. Not medical advice.")
    c.save()


if __name__ == "__main__":
    OUT.mkdir(parents=True, exist_ok=True)
    for filename, (title, rows) in REPORTS.items():
        draw(OUT / filename, title, rows)
        print("wrote", OUT / filename)
