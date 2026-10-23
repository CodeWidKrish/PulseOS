# PulseOS — Task Backlog & Execution Milestones

## 1. Global Definition of Done (DoD)
A task is considered **Done** only when all of the following conditions are met:
1. **Targeted Implementation**: Code satisfies all referenced User Story acceptance criteria without touching unrelated files.
2. **Type Safety & Linting**: Zero errors reported by `mypy app` (API) and `npx tsc --noEmit` + `npm run lint` (Web).
3. **Automated Verification**: The exact verification command specified in the task passes successfully.
4. **Git Hygiene**: Changes are staged and committed using the Conventional Commits format (`type(scope): message`).
5. **Zero Dead Code & Secrets**: No unhandled warnings, commented-out dead code, or exposed sensitive credentials.

---

## 2. Early Risk Spikes (High-Risk Technical Proofs)

### SPIKE-001: 3D Particle Canvas & WebGL Fallback Performance
- **Goal**: Validate that 8,000 heart particles render at steady 60 FPS on mobile and fallback gracefully when WebGL is absent.
- **Files Likely Touched**: `web/components/marketing/HeartCanvas.tsx`, `web/components/marketing/FallbackHeart.tsx`
- **Dependencies**: None
- **Acceptance Criteria**: US-001 (AC-1.1, AC-1.3, AC-1.4)
- **Verification Command**: `cd web && npm run build`

### SPIKE-002: Server-Sent Events (SSE) Streaming Pipeline
- **Goal**: Prove end-to-end SSE token streaming from FastAPI `StreamingResponse` to Next.js `ReadableStream` reader.
- **Files Likely Touched**: `api/app/routers/reports.py`, `api/app/services/ai_service.py`, `web/lib/sse.ts`
- **Dependencies**: None
- **Acceptance Criteria**: US-007 (AC-7.1, AC-7.2)
- **Verification Command**: `cd api && pytest tests/test_sse_stream.py -v`

### SPIKE-003: Double-Booking Prevention & Row Locking
- **Goal**: Validate PostgreSQL `SELECT ... FOR UPDATE` isolation under simulated concurrent booking load.
- **Files Likely Touched**: `api/app/services/booking.py`, `api/tests/test_concurrency.py`
- **Dependencies**: None
- **Acceptance Criteria**: US-011 (AC-11.1, AC-11.2)
- **Verification Command**: `cd api && pytest tests/test_concurrency.py -v`

---

## 3. Milestone 1: Monorepo Scaffolding & DevOps Skeleton
*Build Order Step 1: Establish foundational project structure, Docker containers, and CI pipeline.*

### TASK-001: Monorepo Foundation & Configuration
- **Goal**: Configure root workspace, scripts, `.gitignore`, and shared environment templates.
- **Files Likely Touched**: `package.json`, `.gitignore`, `.env.example`, `docker-compose.yml`
- **Dependencies**: None
- **Acceptance Criteria**: US-001 through US-011 (System Setup)
- **Verification Command**: `docker compose config`

### TASK-002: GitHub Actions CI Matrix
- **Goal**: Setup automated GitHub Actions workflow to lint, type-check, and run test suites on push.
- **Files Likely Touched**: `.github/workflows/ci.yml`
- **Dependencies**: TASK-001
- **Acceptance Criteria**: NFR Compliance (CI Gates)
- **Verification Command**: `git log -1 --stat`

---

## 4. Milestone 2: Marketing Experience & 3D Narrative
*Build Order Step 2: Port visual prototypes into high-performance Next.js marketing components.*

### TASK-003: Design Tokens & Typography Setup
- **Goal**: Configure Tailwind CSS with Ink, Card, Mist, Pulse, Teal, and Amber tokens with Geist font.
- **Files Likely Touched**: `web/tailwind.config.ts`, `web/app/globals.css`, `web/app/layout.tsx`
- **Dependencies**: TASK-001
- **Acceptance Criteria**: US-001, US-002 (Foundations)
- **Verification Command**: `cd web && npm run build`

### TASK-004: 3D Heart Hero & Dynamic Interaction
- **Goal**: Implement Three.js/R3F heart point mesh with repulsion shader and word-by-word title reveal.
- **Files Likely Touched**: `web/components/marketing/Hero.tsx`, `web/components/marketing/HeartCanvas.tsx`
- **Dependencies**: SPIKE-001, TASK-003
- **Acceptance Criteria**: US-001 (AC-1.1, AC-1.2, AC-1.4)
- **Verification Command**: `cd web && npx tsc --noEmit`

### TASK-005: Pinned Scroll-Driven Storytelling Section
- **Goal**: Implement Lenis smooth scroll and GSAP ScrollTrigger 300vh narrative sequence.
- **Files Likely Touched**: `web/components/marketing/StorySection.tsx`, `web/lib/motion.ts`
- **Dependencies**: TASK-004
- **Acceptance Criteria**: US-002 (AC-2.1, AC-2.2, AC-2.3)
- **Verification Command**: `cd web && npx tsc --noEmit`

### TASK-006: Interactive Demo & FAQ Accordion
- **Goal**: Build interactive sample report explainer card and accessible FAQ accordion.
- **Files Likely Touched**: `web/components/marketing/DemoSection.tsx`, `web/components/marketing/FAQ.tsx`
- **Dependencies**: TASK-003
- **Acceptance Criteria**: US-003 (AC-3.1, AC-3.2, AC-3.3)
- **Verification Command**: `cd web && npx tsc --noEmit`

---

## 5. Milestone 3: Backend Core, Database & JWT Auth
*Build Order Step 3: Establish database schemas, Alembic migrations, and role-based authentication.*

### TASK-007: Database Models & Alembic Migrations
- **Goal**: Implement SQLAlchemy 2 async models for users, reports, vitals, doctors, and appointments.
- **Files Likely Touched**: `api/app/models/*.py`, `api/alembic/versions/*.py`
- **Dependencies**: TASK-001
- **Acceptance Criteria**: Data Model Specification
- **Verification Command**: `cd api && alembic check`

### TASK-008: Password Hashing & JWT Security Module
- **Goal**: Build Argon2id/Bcrypt password hashing and access/refresh token generator with rotation.
- **Files Likely Touched**: `api/app/core/security.py`, `api/tests/test_security.py`
- **Dependencies**: TASK-007
- **Acceptance Criteria**: US-004, US-005 (AC-4.1, AC-5.1)
- **Verification Command**: `cd api && pytest tests/test_security.py -v`

### TASK-009: Auth Endpoints & Role Authorization
- **Goal**: Expose `/auth/register`, `/auth/login`, `/auth/refresh`, and `/auth/me` with ownership checks.
- **Files Likely Touched**: `api/app/routers/auth.py`, `api/app/schemas/auth.py`
- **Dependencies**: TASK-008
- **Acceptance Criteria**: US-004, US-005 (AC-4.2, AC-5.2, AC-5.3)
- **Verification Command**: `cd api && pytest tests/test_auth_routes.py -v`

### TASK-010: Web Client Auth State & Silent Token Interceptor
- **Goal**: Build frontend auth provider with Axios interceptor for silent token refresh.
- **Files Likely Touched**: `web/lib/auth.ts`, `web/lib/api.ts`, `web/app/(auth)/login/page.tsx`
- **Dependencies**: TASK-009
- **Acceptance Criteria**: US-004, US-005
- **Verification Command**: `cd web && npx tsc --noEmit`

---

## 6. Milestone 4: Diagnostic Reports & AI Explainer
*Build Order Step 4: Implement document upload, PDF parsing, OCR fallback, and streaming AI explainer.*

### TASK-011: File Ingestion & Magic-Byte Validation
- **Goal**: Implement secure multipart file upload with 10MB limit and signature sniffing.
- **Files Likely Touched**: `api/app/services/storage.py`, `api/app/routers/reports.py`
- **Dependencies**: TASK-009
- **Acceptance Criteria**: US-006 (AC-6.1, AC-6.4)
- **Verification Command**: `cd api && pytest tests/test_upload_security.py -v`

### TASK-012: PDF & OCR Biomarker Extraction Engine
- **Goal**: Extract clinical values using `pdfplumber` with automatic fallback to `pytesseract` OCR.
- **Files Likely Touched**: `api/app/services/report_parser.py`, `api/tests/test_parser.py`
- **Dependencies**: TASK-011
- **Acceptance Criteria**: US-006 (AC-6.2, AC-6.3)
- **Verification Command**: `cd api && pytest tests/test_parser.py -v`

### TASK-013: AI Service Provider & Critical Pre-Flight Engine
- **Goal**: Implement `GroqAIService` with strict system prompt and deterministic critical value detector.
- **Files Likely Touched**: `api/app/services/ai_service.py`, `api/app/services/scoring.py`
- **Dependencies**: SPIKE-002, TASK-012
- **Acceptance Criteria**: US-007 (AC-7.3, AC-7.4)
- **Verification Command**: `cd api && pytest tests/test_ai_safety.py -v`

### TASK-014: SSE Streaming Explainer Endpoint & UI Consumer
- **Goal**: Connect `/reports/{id}/explain` SSE stream to real-time animated frontend markdown card.
- **Files Likely Touched**: `api/app/routers/reports.py`, `web/app/(app)/reports/[id]/page.tsx`
- **Dependencies**: TASK-013
- **Acceptance Criteria**: US-007 (AC-7.1, AC-7.2)
- **Verification Command**: `cd web && npm run build`

---

## 7. Milestone 5: Longitudinal Vitals & Clinical Health Scoring
*Build Order Step 5: Implement vitals logging, timeseries charts, and deterministic health score.*

### TASK-015: Vitals Logging & Physiological Bounds Validation
- **Goal**: Implement `POST /api/v1/vitals` and time-windowed retrieval (`7d`/`30d`).
- **Files Likely Touched**: `api/app/routers/vitals.py`, `api/app/schemas/vitals.py`
- **Dependencies**: TASK-009
- **Acceptance Criteria**: US-008 (AC-8.1, AC-8.2)
- **Verification Command**: `cd api && pytest tests/test_vitals.py -v`

### TASK-016: Deterministic Health Scoring Algorithm
- **Goal**: Calculate 0–100 Health Score and 7d/30d metrics averages via `/vitals/summary`.
- **Files Likely Touched**: `api/app/services/scoring.py`, `api/tests/test_scoring.py`
- **Dependencies**: TASK-015
- **Acceptance Criteria**: US-009 (AC-9.2)
- **Verification Command**: `cd api && pytest tests/test_scoring.py -v`

### TASK-017: Interactive Vitals Charts & Dashboard Hub
- **Goal**: Build Recharts time-series graphs and circular SVG health score gauge with 7d/30d toggles.
- **Files Likely Touched**: `web/app/(app)/vitals/page.tsx`, `web/components/app/VitalsChart.tsx`
- **Dependencies**: TASK-016
- **Acceptance Criteria**: US-009 (AC-9.1, AC-9.3)
- **Verification Command**: `cd web && npx tsc --noEmit`

---

## 8. Milestone 6: Doctor Directory & Conflict-Safe Booking
*Build Order Step 6: Physician roster, slot scheduling, and atomic booking transactions.*

### TASK-018: Doctor Directory & Availability Slots API
- **Goal**: Expose `/doctors` and `/doctors/{id}/slots` filtering out past or booked slots.
- **Files Likely Touched**: `api/app/routers/doctors.py`, `api/app/schemas/doctors.py`
- **Dependencies**: TASK-009
- **Acceptance Criteria**: US-010 (AC-10.1, AC-10.2, AC-10.3)
- **Verification Command**: `cd api && pytest tests/test_doctors.py -v`

### TASK-019: Atomic Slot Booking & Email Notification
- **Goal**: Implement row-locked appointment reservation with email dispatch and cancellation support.
- **Files Likely Touched**: `api/app/routers/appointments.py`, `api/app/services/mailer.py`
- **Dependencies**: SPIKE-003, TASK-018
- **Acceptance Criteria**: US-011 (AC-11.1, AC-11.3, AC-11.4)
- **Verification Command**: `cd api && pytest tests/test_appointments.py -v`

### TASK-020: Frontend Appointment Scheduling Flow
- **Goal**: Build provider directory, calendar slot picker, and booking confirmation toast modal.
- **Files Likely Touched**: `web/app/(app)/appointments/page.tsx`, `web/components/app/BookingModal.tsx`
- **Dependencies**: TASK-019
- **Acceptance Criteria**: US-010, US-011
- **Verification Command**: `cd web && npm run build`

---

## 9. Milestone 7: Polish, Accessibility & Performance
*Build Order Step 7: Refine micro-interactions, responsive states, accessibility, and Lighthouse budgets.*

### TASK-021: Global Empty, Loading & Error States
- **Goal**: Add skeleton loaders, calm empty illustrations, and accessible toast notifications.
- **Files Likely Touched**: `web/components/ui/Skeleton.tsx`, `web/components/ui/Toast.tsx`
- **Dependencies**: TASK-014, TASK-017, TASK-020
- **Acceptance Criteria**: NFR Compliance (UX Edge Cases)
- **Verification Command**: `cd web && npx tsc --noEmit`

### TASK-022: Accessibility Pass & Keyboard Navigation
- **Goal**: Audit focus management, ARIA live regions, and contrast ratios using Axe-core.
- **Files Likely Touched**: `web/app/**/*.tsx`, `web/components/**/*.tsx`
- **Dependencies**: TASK-021
- **Acceptance Criteria**: NFR Compliance (WCAG AA)
- **Verification Command**: `cd web && npm run lint`

### TASK-023: Mobile Performance & Bundle Optimization
- **Goal**: Tune Three.js particle density, lazy load 3D bundles, and optimize images for Lighthouse 90+.
- **Files Likely Touched**: `web/next.config.ts`, `web/components/marketing/HeartCanvas.tsx`
- **Dependencies**: TASK-022
- **Acceptance Criteria**: NFR Compliance (Lighthouse 90+, LCP < 2.5s)
- **Verification Command**: `cd web && npm run build`

---

## 10. Milestone 8: Comprehensive Tests, Deployment & Documentation
*Build Order Step 8: Playwright E2E suite, production deployment runbook, and portfolio README.*

### TASK-024: Playwright End-to-End Suite
- **Goal**: Automate single complete patient journey from landing to upload, vital log, and booking.
- **Files Likely Touched**: `web/tests/e2e.spec.ts`, `web/playwright.config.ts`
- **Dependencies**: TASK-023
- **Acceptance Criteria**: PRD Section 4 (Single E2E Flow)
- **Verification Command**: `cd web && npx playwright test`

### TASK-025: Production Deployment & Platform Setup
- **Goal**: Deploy web to Vercel and API + DB to Render/Railway with production environment configuration.
- **Files Likely Touched**: `render.yaml`, `vercel.json`
- **Dependencies**: TASK-024
- **Acceptance Criteria**: Goal 1 (Live Public URL)
- **Verification Command**: `curl -f https://api.pulseos.health/api/v1/health`

### TASK-026: Portfolio README, Architecture Diagrams & Demo Script
- **Goal**: Complete top-tier README with problem statement, architecture diagrams, Lighthouse badge, and 60s demo script.
- **Files Likely Touched**: `README.md`, `docs/DEMO_SCRIPT.md`
- **Dependencies**: TASK-025
- **Acceptance Criteria**: Goal 1, Goal 2
- **Verification Command**: `git status`

---

## 11. Technical Risks & Open Questions

### Key Technical Risks
1. **Groq Upstream Rate Limits**: High concurrency on demo day could trigger 429 errors.
   - *Mitigation*: Cache common sample explanations in memory and provide immediate mock fallback.
2. **WebGL Context Loss on Mobile**: Low-memory mobile devices might crash Three.js canvases.
   - *Mitigation*: SPIKE-001 enforces memory capping, pixel ratio limitation (≤2.0), and unmount cleanup.
3. **OCR Latency on Low-Spec Hardware**: Tesseract on scanned photos can take 2–4 seconds.
   - *Mitigation*: Synchronous fast-path for PDF vector text; async threadpool for image OCR with UI loading animation.

### Open Questions Before Backlog Approval
1. Are you satisfied with prioritizing the 3 spikes (`SPIKE-001`, `SPIKE-002`, `SPIKE-003`) immediately before general component implementation?
2. Should the Playwright E2E test in CI execute against local Docker containers or against the live deployed staging environment?
