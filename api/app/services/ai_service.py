"""
AI Service — Provider-swappable LLM abstraction.
Current implementation: Groq (llama-3.3-70b-versatile)
To swap: implement a new class conforming to AIService protocol, update get_ai_service().
"""
from typing import AsyncGenerator

from groq import AsyncGroq

from app.core.config import settings
from app.services.report_parser import LabValue

# ── System Prompt ──────────────────────────────────────────────────────────────
# Enforces all safety rules from Section 10 of the brief.
EXPLAINER_SYSTEM_PROMPT = """You are PulseOS, a medical data explainer. You help patients understand their lab results.

RULES YOU MUST FOLLOW WITHOUT EXCEPTION:
1. Explain in plain language at an 8th-grade reading level. No medical jargon.
2. NEVER state or imply a diagnosis of any kind.
3. NEVER recommend medication changes, dosages, or supplements.
4. Always state that a doctor should confirm any concern.
5. End your response with a section called "Questions to Ask Your Doctor" containing 3 to 5 specific questions.
6. If any value is flagged as critically abnormal (e.g., dangerously high or low), include an URGENT CARE NOTICE in bold at the top.
7. Use ONLY the values provided to you. Do not invent, estimate, or assume any numbers.
8. Keep your tone calm, clear, and reassuring.

DISCLAIMER TO INCLUDE: End every response with: "⚕️ PulseOS explains information and does not provide medical advice. Always consult your doctor."
"""

def _build_user_prompt(values: list[LabValue]) -> str:
    lines = ["Here are the lab values from this report:\n"]
    for v in values:
        ref = f"{v.ref_low}–{v.ref_high}" if v.ref_low and v.ref_high else "N/A"
        flag = f" ⚠️ {v.status.upper()}" if v.status != "normal" else ""
        lines.append(
            f"- {v.test_name}: {v.value} {v.unit or ''} (Reference: {ref}){flag}"
        )
    lines.append(
        "\nPlease provide: 1) A brief overall summary, "
        "2) A plain-language explanation of any abnormal values, "
        "3) Questions to ask the doctor."
    )
    return "\n".join(lines)


# ── Groq Implementation ────────────────────────────────────────────────────────

class GroqAIService:
    def __init__(self):
        self._client = AsyncGroq(api_key=settings.groq_api_key)
        self._model = settings.groq_model

    async def stream_explanation(
        self, values: list[LabValue]
    ) -> AsyncGenerator[str, None]:
        """Stream token-by-token explanation from Groq."""
        stream = await self._client.chat.completions.create(
            model=self._model,
            messages=[
                {"role": "system", "content": EXPLAINER_SYSTEM_PROMPT},
                {"role": "user", "content": _build_user_prompt(values)},
            ],
            stream=True,
            temperature=0.3,   # Low temperature = consistent, factual output
            max_tokens=1500,
        )
        async for chunk in stream:
            delta = chunk.choices[0].delta.content
            if delta:
                yield delta

    async def generate_explanation(self, values: list[LabValue]) -> str:
        """Non-streaming version for storage."""
        response = await self._client.chat.completions.create(
            model=self._model,
            messages=[
                {"role": "system", "content": EXPLAINER_SYSTEM_PROMPT},
                {"role": "user", "content": _build_user_prompt(values)},
            ],
            temperature=0.3,
            max_tokens=1500,
        )
        return response.choices[0].message.content or ""


# ── Factory ────────────────────────────────────────────────────────────────────

def get_ai_service() -> GroqAIService:
    """Return the configured AI service. Swap provider here."""
    if settings.llm_provider == "groq":
        return GroqAIService()
    raise ValueError(f"Unknown LLM provider: {settings.llm_provider}")
