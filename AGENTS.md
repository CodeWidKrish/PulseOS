# AGENTS.md — Working Rules for PulseOS Agent

## 1. Project Summary
PulseOS is an AI health companion that turns medical lab reports, vitals, and health readings into calm, plain-language explanations with actionable next steps. It features an Apple-caliber 3D marketing site, streaming AI report analysis, vitals tracking, and conflict-safe doctor appointment booking. PulseOS explains, organizes, and routes users to medical care, strictly never providing medical diagnoses.

## 2. Repository Layout
- `web/`: Next.js (App Router), TypeScript, Tailwind CSS, Three.js/R3F, GSAP, Lenis, Recharts
- `api/`: FastAPI (Python 3.11+), Pydantic v2, SQLAlchemy 2, Alembic, pdfplumber/pytesseract
- `docs/`: Canonical specifications (`PROJECT_BRIEF.md`, `PRD.md`, `ARCHITECTURE.md`, etc.)
- `reference/`: Visual prototypes and design assets (`pulseos-final.html`)

## 3. Exact Commands
| Task | Web (`web/`) | API (`api/`) |
| :--- | :--- | :--- |
| **Install** | `npm install` | `pip install -r requirements.txt` |
| **Run** | `npm run dev` | `uvicorn app.main:app --reload --port 8000` |
| **Lint** | `npm run lint` | `ruff check .` |
| **Type-check** | `npx tsc --noEmit` | `mypy app` |
| **Test** | `TODO: npm test (Playwright/Vitest pending)` | `pytest` |

## 4. Coding Conventions
- **TypeScript**: Strict mode enabled; explicit interface/type definitions; no `any`; functional React components.
- **Python**: Python 3.11+ type hints on every function signature; Pydantic v2 schemas for all IO validation.
- **Naming**: `kebab-case` for file/dir names; `PascalCase` for React components/types; `snake_case` for Python and database columns.
- **Folder rules**: Keep route pages lean in `app/`; place pure UI in `components/ui/` and domain logic in `services/`.

## 5. Working Rules
- **Smallest Correct Change**: Make minimal focused edits. Never refactor or touch files unrelated to the active task.
- **Design Authority**: Read `DESIGN.md` before every UI task. Every visual decision must be traceable to it.
- **Immediate Verification**: After every file modification, run the smallest relevant check (lint, type-check, or unit test) and fix failures before proceeding.
- **Commit Format**: Conventional Commits: `<type>(<scope>): <short description>` (e.g., `feat(reports): add pdfplumber parser`).
- **Never Do**:
  1. Never commit secrets, API keys, or `.env` files.
  2. Never use or commit real patient/health data (use synthetic/demo data only).
  3. Never log full raw report contents or PII to console or logs.
  4. Never install any dependency without a one-line justification in the commit/doc.
- **Stop and Ask When**:
  1. Business or clinical logic is ambiguous or contradicts `docs/PROJECT_BRIEF.md`.
  2. Database schema migrations require destructive table drops or data loss.
  3. AI safety boundaries or medical disclaimer policies are uncertain.

## 6. Open Questions
1. Where should the visual prototype `reference/pulseos-final.html` be copied from, or will it be provided as the design baseline?
2. Which specific mailer backend (console logging vs. Mailgun/SendGrid/SMTP) will be standard for production deployment?
