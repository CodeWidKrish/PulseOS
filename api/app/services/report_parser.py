"""
Report Parser Service
Extracts text from PDF/image files using pdfplumber with pytesseract fallback.
Parses lab values into structured data rows.
"""
import re
from dataclasses import dataclass
from pathlib import Path

import pdfplumber
import pytesseract
from PIL import Image


@dataclass
class LabValue:
    test_name: str
    value: float | None
    unit: str | None
    ref_low: float | None
    ref_high: float | None
    status: str  # "normal" | "low" | "high"


def extract_text(file_path: str) -> str:
    """
    Extract text from a PDF or image file.
    - PDF: pdfplumber (fast, accurate for digital PDFs)
    - Image / scanned PDF: pytesseract OCR fallback
    """
    path = Path(file_path)
    suffix = path.suffix.lower()

    if suffix == ".pdf":
        text = _extract_pdf(file_path)
        if text.strip():
            return text
        # Scanned PDF — try OCR on each page image
        return _ocr_pdf(file_path)

    # Image file
    return _ocr_image(file_path)


def _extract_pdf(file_path: str) -> str:
    pages = []
    with pdfplumber.open(file_path) as pdf:
        for page in pdf.pages:
            page_text = page.extract_text()
            if page_text:
                pages.append(page_text)
    return "\n".join(pages)


def _ocr_pdf(file_path: str) -> str:
    """Convert PDF pages to images then OCR."""
    try:
        import pdf2image  # optional; only imported if needed
        images = pdf2image.convert_from_path(file_path, dpi=300)
        return "\n".join(pytesseract.image_to_string(img) for img in images)
    except ImportError:
        # pdf2image not installed — return empty, will surface as parse error
        return ""


def _ocr_image(file_path: str) -> str:
    img = Image.open(file_path)
    return pytesseract.image_to_string(img)


# ── Lab Value Parser ───────────────────────────────────────────────────────────
# Handles common patterns like:
#   "Glucose   95   mg/dL   70-100"
#   "Hemoglobin: 14.2 g/dL (13.5-17.5)"
#   "TSH 3.5 mIU/L [0.4-4.0] H"

# One result per line. The test name may not contain ":" or digits-only words,
# which keeps headers ("Patient: ...", "Collected: 2026-11-20") out of the results.
_VALUE_PATTERN = re.compile(
    r"^\s*(?P<test>[A-Za-z][A-Za-z0-9 ,()/%.\-]*?[A-Za-z0-9)])"  # test name
    r"\s*:?\s+"
    r"(?P<value>\d+(?:\.\d+)?)"                                  # numeric value
    r"(?:\s*(?P<unit>[A-Za-zµμ%][\w/%µμ.^]*))?"                  # unit (optional)
    r"\s*[\[(]?\s*"
    r"(?P<ref_low>\d+(?:\.\d+)?)\s*[-–]\s*(?P<ref_high>\d+(?:\.\d+)?)"  # reference range
    r"\s*[\])]?"
    r"(?:\s+[HL])?\s*$"                                          # optional lab flag
)


def parse_lab_values(text: str) -> list[LabValue]:
    """Parse extracted text into structured LabValue rows (one result per line)."""
    results: list[LabValue] = []
    seen: set[str] = set()

    for line in text.splitlines():
        match = _VALUE_PATTERN.match(line)
        if not match:
            continue
        test_name = " ".join(match.group("test").split())
        key = test_name.lower()
        if key in seen or len(test_name) < 2:
            continue

        value = float(match.group("value"))
        ref_low = float(match.group("ref_low"))
        ref_high = float(match.group("ref_high"))
        if ref_high <= ref_low:
            continue
        seen.add(key)

        if value < ref_low:
            status = "low"
        elif value > ref_high:
            status = "high"
        else:
            status = "normal"

        results.append(LabValue(
            test_name=test_name,
            value=value,
            unit=match.group("unit"),
            ref_low=ref_low,
            ref_high=ref_high,
            status=status,
        ))

    return results
