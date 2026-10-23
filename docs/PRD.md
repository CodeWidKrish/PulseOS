# PulseOS — Product Requirements Document (PRD)

## 1. Problem Statement & Goals

### 1.1 Problem Statement
Patients receiving diagnostic laboratory reports, prescriptions, and vital readings are overwhelmed by impenetrable clinical jargon, complex reference intervals, and cryptic abbreviations. This friction triggers acute medical anxiety, delayed follow-up care, unnecessary clinic visits, and an inability to track longitudinal personal health metrics. Existing patient portals act as inert document repositories without contextual interpretation, while modern fitness trackers output raw numbers lacking clinical relevance or clear navigational guidance.

PulseOS functions as an intelligent, empathetic AI health companion that translates opaque diagnostic data into calm, plain-language explanations with actionable next steps. Users upload clinical reports to receive granular value interpretations, abnormal flag highlights, doctor discussion prompts, vitals tracking, and immediate doctor appointment scheduling within a unified, high-polish interface.

> **Core Axiom**: PulseOS explains, organizes, and routes users to certified human care. It strictly does not diagnose or prescribe treatment.

### 1.2 Product Goals
1. **Portfolio Flagship**: Deliver a production-grade full-stack healthtech application deployed at a public custom URL, showcasing modern Python, TypeScript, AI streaming, and distributed data integrity patterns.
2. **Apple-Caliber Visual Polish**: Provide an immersive, serene aesthetic featuring scroll-driven storytelling, an interactive 3D particle hero, restrained typography, and fluid 60fps animations.
3. **Robust Engineering**: Implement production-ready JWT authentication, ACID-compliant relational transactions, resilient OCR/PDF text extraction, SSE streaming, full test suites, containerized deployments, and strict accessibility standards.
4. **Clinical Safety & Transparency**: Guarantee safe operation using synthetic sample data, deterministic fallback thresholds, prominent non-diagnostic disclaimers, and zero PII logging.

### 1.3 Non-Goals
- Real clinical patient data storage or ingestion.
- Formal regulatory certification (HIPAA, HITECH, or DPDP compliance).
- Payment processing or insurance billing pipelines.
- Native mobile applications (iOS/Android) — mobile responsive web only.
- Direct Electronic Health Record (EHR) integrations (HL7 / FHIR live feeds).

---

## 2. Personas

### 2.1 Primary Persona: The Patient (Elena Rostova)
Elena is a 34-year-old marketing manager and non-technical adult who has just received routine bloodwork results as a PDF attachment. She views the report on her smartphone and feels immediately anxious seeing bolded numbers like "TSH 5.8 mIU/L" with flags she doesn't understand. Elena requires a calm, mobile-first interface that translates medical abbreviations into conversational 8th-grade language, clearly indicates whether a value requires urgent or routine follow-up, provides concrete questions to ask her physician, and lets her schedule an appointment directly without friction.

### 2.2 Secondary Persona: The Healthcare Provider (Dr. Marcus Vance)
Dr. Marcus Vance is an internal medicine physician who values patient engagement and organized clinical summaries. He uses PulseOS on his clinic tablet or desktop between appointments to view his daily schedule, set his recurring weekly availability slots, and access structured, pre-parsed lab metrics brought in by patients. He appreciates that PulseOS does not attempt to diagnose patients or alter treatment plans, but rather prepares patients with clear questions, saving consultation time.

### 2.3 Tertiary Persona: The Platform Administrator (Sarah Chen)
Sarah is an internal system operator responsible for maintaining system integrity, platform availability, and directory hygiene. She accesses the administrative interface on desktop to onboard verified physicians, update provider specialties and biographies, inspect aggregate platform usage metrics (upload volumes, booking completion rates, error trends), and audit synthetic system health without ever exposing personal health details or report contents.

---

## 3. User Stories & Acceptance Criteria

### Feature Area 1: Marketing Site & Public Landing
#### US-001: 3D Particle Hero & Value Proposition (MVP)
*As a visitor, I want to experience an interactive 3D visual hero and concise value proposition, so that I immediately understand PulseOS's calm approach to health insights.*
- **AC-1.1**: Given an unauthenticated visitor navigating to `/`, when the page loads, then an interactive 3D particle heart composed of ~8,000 particles renders smoothly without blocking initial content paint.
- **AC-1.2**: Given the 3D canvas is active, when the user moves their cursor (or touches on mobile), then particles dynamically repel from the pointer and fluidly return to form.
- **AC-1.3**: Given a visitor whose browser or device lacks WebGL capability, when accessing the landing page, then a performant SVG/CSS glowing gradient pulse heart gracefully renders as a fallback.
- **AC-1.4**: Given a visitor with `prefers-reduced-motion: reduce` enabled in system settings, when viewing the hero, then 3D rotation, scaling pulse, and cursor repulsion animations are disabled.

#### US-002: Pinned Scroll-Driven Storytelling (MVP)
*As a visitor, I want to scroll through a smooth, pinned visual narrative, so that I comprehend how PulseOS simplifies chaotic medical documents step-by-step.*
- **AC-2.1**: Given a user scrolling past the hero, when reaching the story section, then the viewport pins for approximately 300vh while 3 sequential explanatory panels cycle into view.
- **AC-2.2**: Given the pinned sequence is active, when panels transition, then the 3D heart transitions position, performs a smooth rotation, and dynamically shifts colors across Red (`#FF4D5E`), Teal (`#5EE1D2`), and Amber (`#FFB86B`).
- **AC-2.3**: Given a mobile viewport (<768px), when scrolling the story, then the 3D element remains centered above the narrative cards to prevent content obstruction.

#### US-003: Interactive Product Demo & FAQ (MVP)
*As a prospective user, I want to test an interactive lab report explainer preview and review FAQs, so that I can evaluate the product before creating an account.*
- **AC-3.1**: Given a visitor in the interactive demo section, when clicking "Run Sample Report", then structured sample biomarkers (CBC / Lipid Panel) render sequentially into a diagnostic preview card.
- **AC-3.2**: Given the demo biomarkers are populated, when the simulation triggers, then a streamed synthetic explanation displays word-by-word alongside doctor discussion prompts.
- **AC-3.3**: Given an inquiry regarding privacy or clinical scope, when the user clicks an accordion item in the FAQ section, then the item smoothly expands with accessible ARIA attributes (`aria-expanded`).

---

### Feature Area 2: Authentication & Role-Based Access Control
#### US-004: User Registration & Validation (MVP)
*As a new user, I want to register for a PulseOS account with email and password, so that I can securely log in and access my health records.*
- **AC-4.1**: Given a new user on the `/register` screen, when submitting a valid email, full name, role (`patient` default), and password meeting complexity standards (min 8 chars, 1 number, 1 symbol), then an account is created in PostgreSQL with an Argon2id/bcrypt hashed password.
- **AC-4.2**: Given a user submitting an already registered email, when registration is processed, then the API returns `409 Conflict` with a generic user-safe error message.
- **AC-4.3**: Given successful registration, when the response is returned, then the user receives JWT access and refresh tokens, and is redirected to `/dashboard`.

#### US-005: User Login, Token Refresh & Logout (MVP)
*As a registered user, I want to log in, maintain a persistent session, and securely log out, so that my account remains protected across sessions.*
- **AC-5.1**: Given valid credentials submitted to `/api/v1/auth/login`, when authenticated, then the server issues a short-lived access token (15 mins) and an HTTP-only refresh token (7 days).
- **AC-5.2**: Given an expired access token, when the frontend sends the refresh token to `/api/v1/auth/refresh`, then a new access token is returned silently without interrupting the user.
- **AC-5.3**: Given an active user session, when the user clicks "Log Out", then tokens are invalidated, client storage is cleared, and the user is redirected to `/login`.

---

### Feature Area 3: Lab Report Upload & AI Streaming Explainer
#### US-006: Diagnostic Document Upload & Extraction (MVP)
*As a patient, I want to upload a lab report PDF or image, so that PulseOS can automatically extract and structure my biomarker results.*
- **AC-6.1**: Given an authenticated patient on `/reports`, when dragging or selecting a PDF, PNG, or JPEG file under 10 MB, then the file is uploaded to `/api/v1/reports`.
- **AC-6.2**: Given an uploaded PDF, when processing begins, then `pdfplumber` extracts text content; if text density is below threshold (<20 words), it falls back seamlessly to `pytesseract` OCR.
- **AC-6.3**: Given extracted text, when parsed by the regex/rule engine, then individual biomarkers are saved with `test_name`, `value`, `unit`, `ref_low`, `ref_high`, and `status` (`normal`, `low`, `high`).
- **AC-6.4**: Given an uploaded file exceeding 10 MB or having an invalid MIME type (e.g., `.exe`, `.zip`), when validated, then the upload is rejected immediately with a `413 Payload Too Large` or `422 Unprocessable Entity` response.

#### US-007: Real-Time SSE Streaming AI Report Explanation (MVP)
*As a patient, I want to receive a streamed, plain-language explanation of my report with doctor discussion questions, so that I can understand my health status without waiting.*
- **AC-7.1**: Given a parsed report, when the patient triggers `/api/v1/reports/{id}/explain`, then the server opens a `text/event-stream` Server-Sent Events connection.
- **AC-7.2**: Given an active stream, when tokens are generated by the LLM, then events with payload `{"chunk": "..."}` are streamed in real time and displayed with `aria-live="polite"`.
- **AC-7.3**: Given completion of the generation, when the final payload arrives, then a structured summary, individual abnormal value explanations, 3–5 doctor questions, and a mandatory disclaimer ("PulseOS explains information and does not provide medical advice") are persisted to `report_explanations`.
- **AC-7.4**: Given an extraction with critically abnormal values (e.g., Potassium > 6.2 mmol/L), when evaluating data prior to LLM call, then an urgent care escalation alert banner is deterministically appended to the top of the explanation.

---

### Feature Area 4: Vitals Tracking & Clinical Health Scoring
#### US-008: Vitals Logging (MVP)
*As a patient, I want to log my vital health metrics (heart rate, blood pressure, glucose, weight), so that I can track my biometrics over time.*
- **AC-8.1**: Given an authenticated patient on `/vitals`, when submitting a reading for `heart_rate`, `bp` (systolic/diastolic), `glucose`, or `weight` with timestamp, then the record is persisted in `vitals`.
- **AC-8.2**: Given numerical vitals input, when values fall outside physiological sanity ranges (e.g., Heart Rate < 30 or > 260 bpm), then the client and API reject the submission with actionable field-level validation errors.
- **AC-8.3**: Given a vital entry, when saved successfully, then the UI updates optimistically and displays a success confirmation toast.

#### US-009: Longitudinal Charts & Deterministic Health Score (MVP)
*As a patient, I want to view 7-day and 30-day interactive vital trend charts and a clear health score, so that I can monitor my health progress.*
- **AC-9.1**: Given the `/vitals` view, when toggling between "7 Days" and "30 Days", then Recharts graphs re-render with the corresponding date range, computed metric average, and trend direction indicator (`improving`, `stable`, `attention`).
- **AC-9.2**: Given recent vitals data across logged categories, when `/api/v1/vitals/summary` is requested, then an overall Health Score (0–100) is calculated using a transparent, deterministic weighted formula (not an AI estimate).
- **AC-9.3**: Given an account with zero logged vitals, when viewing the vitals tab, then a clean, branded empty state illustrates how to record an initial reading.

---

### Feature Area 5: Doctor Directory & Conflict-Safe Appointments
#### US-010: Doctor Directory & Availability Exploration (MVP)
*As a patient, I want to browse available healthcare providers and inspect their open consultation slots, so that I can choose the right doctor.*
- **AC-10.1**: Given an authenticated patient on `/appointments`, when navigating to the booking tab, then a list of doctors displays with their name, medical specialty, and biography.
- **AC-10.2**: Given a selected doctor, when inspecting availability, then only unclaimed weekly slots (`is_booked = FALSE` and `starts_at > NOW()`) are presented in chronological order.
- **AC-10.3**: Given a doctor with no remaining slots in the selected week, when viewed, then a helpful "No available slots this week" indicator is shown.

#### US-011: Transactional, Conflict-Safe Slot Reservation (MVP)
*As a patient, I want to book an appointment slot without the risk of double booking, so that my scheduled consultation is guaranteed.*
- **AC-11.1**: Given a patient selecting an open slot, when submitting `POST /api/v1/appointments`, then the backend executes an atomic transaction utilizing `SELECT ... FOR UPDATE` row-locking on the slot.
- **AC-11.2**: Given two concurrent requests targeting the same slot, when the first transaction commits, then the second transaction fails immediately with `409 Conflict ("This appointment slot has just been reserved")`.
- **AC-11.3**: Given a successful appointment booking, when committed, then `availability_slots.is_booked` is set to `TRUE`, an appointment row is created with status `confirmed`, a confirmation email is dispatched (console/SMTP), and the patient sees a confirmation toast.
- **AC-11.4**: Given an upcoming appointment, when the patient requests cancellation (`DELETE /api/v1/appointments/{id}`), then the appointment status updates to `cancelled` and the slot is reverted to `is_booked = FALSE`.

---

### Feature Area 6: Post-MVP & Later Enhancements
#### US-012: Safe Symptom Triage Chat (Later)
*As a patient, I want to describe symptoms to an AI assistant, so that I receive calm triage suggestions and urgent warnings if red flags occur.*
- **AC-12.1**: Given an active symptom chat session, when the patient enters input containing acute danger signals (e.g., crushing chest pain, facial drooping, suicidal ideation), then normal generative response is aborted and an immediate emergency dispatch card (911/emergency room advice) is displayed.

#### US-013: PDF Summary Export & Patient Reminders (Later)
*As a patient, I want to export an executive summary of my health trends and set medication reminders, so that I can share them during clinical visits.*
- **AC-13.1**: Given a user on `/reports/{id}`, when clicking "Export Clinical Summary", then a formatted PDF compiles biomarker tables, AI plain-language notes, and physician questions.

---

## 4. Non-Functional Requirements (NFRs)

| Domain | Metric / Requirement | Target Standard | Verification Method |
| :--- | :--- | :--- | :--- |
| **Performance** | Mobile Lighthouse Performance | Score **≥ 90** on simulated mid-tier mobile | Google Lighthouse CI |
| **Performance** | Largest Contentful Paint (LCP) | **< 2.5 seconds** on 4G network profile | Chrome DevTools Performance |
| **Performance** | Cumulative Layout Shift (CLS) | **< 0.1** | Web Vitals Audit |
| **Performance** | 3D Hero Framerate | Steady **60 FPS** on mid-range devices | Chrome FPS Meter |
| **Accessibility** | WCAG 2.1 Standard | Level **AA** compliance across all pages | Automated Axe-core & manual keyboard tab |
| **Accessibility** | Color Contrast Ratio | **≥ 4.5:1** for normal text; **≥ 3:0:1** for large | Axe audit / Contrast Checker |
| **Accessibility** | Screen Reader Output | `aria-live="polite"` on all SSE streaming tokens | VoiceOver / NVDA manual check |
| **Security** | Password Cryptography | Argon2id or Bcrypt (cost factor **≥ 12**) | Unit test hash verification |
| **Security** | Access Token Expiry | Short-lived: **15 minutes** | Token decode check |
| **Security** | Refresh Token Expiry | Rotation-enabled: **7 days** | Token lifecycle test |
| **Security** | File Upload Restrictions | Max **10 MB**, strict magic-byte MIME sniff | API security test suite |
| **Reliability** | Double Booking Concurrency | **0% error rate / 100% isolation** under load | Concurrent parallel execution script |

---

## 5. Edge Cases & Error Handling Matrix

| Feature | Scenario / Trigger | System Behavior & User Experience | Recovery Action |
| :--- | :--- | :--- | :--- |
| **Auth** | Expired access token during interaction | API responds with `401 Unauthorized` | Frontend axios interceptor silently calls `/auth/refresh` and replays request; redirects to `/login` if refresh fails |
| **Auth** | Inactive / deactivated user account | Authentication fails with `403 Forbidden` | UI displays "Account is inactive. Contact support." |
| **Reports** | Empty state (new user, 0 uploads) | `/reports` shows calm illustration with "No lab reports yet" | Prominent "Upload your first report" button with sample file download |
| **Reports** | Corrupted / unreadable PDF file | Extraction yields 0 structured biomarker rows | UI displays "We couldn't detect readable text. Please upload a clearer scan or photo." Report status marked `failed`. |
| **Reports** | Upload exceeds 10 MB limit | Client dropzone blocks file; API returns `413 Payload Too Large` | Toast notification: "File exceeds 10 MB limit. Please select a compressed file." |
| **Reports** | Malicious file payload disguised as PDF | Backend magic-byte inspection flags invalid MIME signature | Immediate upload rejection (`422 Unprocessable Entity`); temporary file unlinked |
| **Reports** | LLM API downtime or rate limit | Stream drops midway or upstream returns 5xx | SSE emits `error` event; UI pauses stream and displays "AI explanation temporarily paused. Stored data is safe." |
| **Vitals** | Physiological outlier submitted | Systolic BP > 300 or Heart Rate < 25 entered | Form displays inline validation: "Please verify value — falls outside physiological bounds." |
| **Vitals** | Insufficient data for 30d chart | Fewer than 2 entries recorded in 30 days | Chart renders available dots with a dashed connector and "Log more readings to unlock full trend analysis." |
| **Appointments** | Simultaneous double-booking collision | Two users click "Confirm" on the identical slot simultaneously | Transaction 1 succeeds; Transaction 2 catches constraint error and returns `409 Conflict`. User 2 receives "Slot was just reserved. Please pick another." |
| **Appointments** | Doctor cancels or deletes slot | Patient attempts to book a previously visible slot | API returns `404 Not Found` or `409 Conflict`; slots list refreshes automatically |

---

## 6. Glossary

- **Biomarker**: A measurable medical indicator of a biological state (e.g., Hemoglobin, Fasting Glucose, TSH).
- **Reference Range**: The normal physiological interval (low to high thresholds) established by diagnostic laboratories for a given demographic.
- **pdfplumber**: A Python library specialized in extracting structured tabular and text data from PDF documents.
- **Tesseract OCR**: An open-source optical character recognition engine utilized for extracting text from scanned documents and images.
- **Server-Sent Events (SSE)**: A lightweight, unidirectional HTTP-based streaming protocol allowing the server to push text chunks to the client over an open connection.
- **Argon2id / Bcrypt**: Modern, cryptographically secure key derivation functions designed to resist GPU-based brute-force attacks on passwords.
- **Row-Level Locking (`SELECT FOR UPDATE`)**: A database transaction lock preventing concurrent transactions from modifying or booking a specific record until the active transaction completes.
- **Health Score**: A deterministic 0–100 composite index calculated from recent vital measurements against clinical guidelines, used for motivational tracking.

---

## 7. Open Questions
1. Should social authentication (e.g., Google OAuth2) be supported in MVP, or should we remain strictly email/password until Post-MVP?
2. When an uploaded PDF contains multiple panels (e.g., both Hematology and Lipid panels), should the UI display them as tabs or a single unified scrollable list?
3. For doctor appointment confirmations, should email dispatch fall back to console logging silently in staging/dev environments?
