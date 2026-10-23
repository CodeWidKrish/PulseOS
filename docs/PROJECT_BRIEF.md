# PulseOS: Project Brief for the Coding Agent
Read this whole document before writing any code. It is the single source of truth for what we are building, why, and how. If something here conflicts with a later instruction, ask before proceeding.
1. Problem statement
People receive lab reports, prescriptions, and vital readings full of medical jargon, reference ranges, and abbreviations they cannot interpret. The result is anxiety, delayed follow-up, unnecessary clinic visits, and poor tracking of their own health over time. Existing patient portals store data but do not explain it, and health trackers show numbers without meaning or a clear next step.
PulseOS is an AI health companion that turns medical data into plain language and a clear next action. A user uploads a lab report, and PulseOS explains each value, flags what is outside the normal range, and suggests questions to ask a doctor. The user can also log vitals and see trends, describe symptoms and receive safe guidance, and book a doctor appointment, all in one calm, premium interface.
PulseOS does not diagnose. It explains, organizes, and routes people to real care.
2. Goals
1. Ship a working full-stack product with a live URL, as the flagship portfolio project of a final-year Computer Engineering diploma student targeting internships in Python development, full-stack, AI-powered apps, and healthcare tech.
2. Deliver a marketing site and app with Apple-level visual polish: scroll-driven storytelling, a 3D hero, restrained color, generous whitespace, 60fps motion.
3. Demonstrate real engineering: authentication, relational data, file processing, LLM integration with streaming, tests, CI/CD, Docker, accessibility, and performance budgets.
4. Be safe and honest: sample or synthetic data only, clear medical disclaimers, no diagnosis.
Non-goals: real patient data, HIPAA or DPDP certification, payments, native mobile apps, real doctor integrations.
3. Users
• Patient (primary): non-technical adult who just received a report and wants to understand it. Mobile-first.
• Doctor (secondary): views their appointments and manages availability.
• Admin (internal): manages doctors and sees basic usage analytics.
4. Scope
MVP (must ship):
• Marketing site with hero, pinned scroll story, interactive demo, dashboard preview, security section, FAQ
• Auth (register, login, logout, roles)
• Report upload and AI explainer with streaming output
• Vitals logging and charts
• Doctor directory and appointment booking with conflict checks
Later (only after MVP is stable): symptom chat, medication reminders, PDF export of summaries, command palette inside the app, admin analytics, dark/light toggle, testimonials, pricing page.
5. Features in detail
Report explainer
• Upload PDF or image (max 10 MB). Extract text with pdfplumber, falling back to Tesseract OCR for images and scans.
• Parse values into structured rows: test name, value, unit, reference range, status (normal, low, high).
• Send structured data to the LLM with a strict system prompt. Output: a short overall summary, a plain-language explanation per abnormal value, and 3 to 5 questions to ask a doctor.
• Stream the response to the browser over Server-Sent Events.
• Store the report, parsed values, and the generated explanation.
Vitals
• Log heart rate, blood pressure (systolic/diastolic), glucose, weight, with timestamp.
• Charts with 7-day and 30-day ranges, average, and trend badge.
• Health score (0 to 100) computed from recent readings with a simple documented rule, not an AI guess.
Appointments
• Doctors have a specialty and weekly availability slots.
• Patients pick a doctor and a free slot. Prevent double booking with a database constraint and a transactional check.
• Confirmation toast and a confirmation email (console or SMTP in development).
Symptom chat (later)
• LLM chat with a safety prompt. If the user mentions emergency symptoms (chest pain, trouble breathing, stroke signs, severe bleeding, suicidal thoughts), stop the normal flow and show an urgent-care message.
6. Tech stack
Layer
Choice
Frontend
Next.js (App Router), TypeScript, Tailwind CSS
Motion
GSAP + ScrollTrigger, Lenis (smooth scroll), Framer Motion (UI transitions)
3D
Three.js (a React Three Fiber wrapper is fine), custom GLSL point shader
Charts
Recharts
Backend
FastAPI (Python 3.11+), Pydantic v2, SQLAlchemy 2, Alembic
Database
PostgreSQL
Auth
JWT (access + refresh), bcrypt or argon2 password hashing, role-based access
AI
LLM API behind a single ai_service module so the provider can be swapped
File processing
pdfplumber, pytesseract
Testing
pytest, Playwright (one end-to-end flow), axe for accessibility
DevOps
Docker Compose, GitHub Actions, Vercel (web), Render or Railway (API + DB)
Reuse existing dependencies and patterns before adding new ones. Do not add a dependency without a one-line justification.
7. Repository structure
pulseos/
  web/                 # Next.js app
    app/               # routes: (marketing), (app)/dashboard, reports, vitals, appointments, auth
    components/        # ui/, marketing/, app/
    lib/               # api client, hooks, motion helpers
    public/
  api/                 # FastAPI app
    app/
      main.py
      core/            # config, security, deps
      models/          # SQLAlchemy models
      schemas/         # Pydantic schemas
      routers/         # auth, reports, vitals, doctors, appointments
      services/        # ai_service, report_parser, scoring, mailer
    alembic/
    tests/
  reference/           # pulseos-final.html design prototype (visual source of truth)
  docker-compose.yml
  .github/workflows/
  README.md
8. Data model
• users: id, email (unique), password_hash, full_name, role (patient | doctor | admin), created_at
• reports: id, user_id, filename, storage_path, extracted_text, status, created_at
• report_values: id, report_id, test_name, value, unit, ref_low, ref_high, status
• report_explanations: id, report_id, summary, details (JSON), questions (JSON), model, created_at
• vitals: id, user_id, type (heart_rate | bp | glucose | weight), value_1, value_2 (nullable), recorded_at
• doctors: id, user_id (nullable), name, specialty, bio
• availability_slots: id, doctor_id, starts_at, ends_at, is_booked
• appointments: id, patient_id, doctor_id, slot_id (unique), status, created_at
Add indexes on foreign keys and on vitals(user_id, recorded_at).
9. API surface (REST, JSON, /api/v1)
• POST /auth/register, POST /auth/login, POST /auth/refresh, GET /auth/me
• POST /reports (multipart upload), GET /reports, GET /reports/{id}, GET /reports/{id}/explain (SSE stream)
• POST /vitals, GET /vitals?type=&range=7d|30d, GET /vitals/summary
• GET /doctors, GET /doctors/{id}/slots
• POST /appointments, GET /appointments, DELETE /appointments/{id}
• GET /health for uptime checks
All routes except register, login, and health require a valid token. Enforce ownership: a patient can only read their own data.
10. AI behavior and safety rules
The system prompt for the explainer must require that the model:
• explains in plain language at roughly an 8th-grade reading level,
• never states a diagnosis, never recommends medication or dosage changes,
• always says that a doctor should confirm any concern,
• lists questions for the doctor,
• escalates to urgent care wording when values are critically abnormal,
• uses only the provided values and does not invent numbers.
Show this disclaimer in the UI wherever AI output appears: PulseOS explains information and does not provide medical advice.
Use only demo or synthetic data in development, tests, screenshots, and the live deployment. Never commit real reports. Never log report contents.
11. Design system
The visual reference is reference/pulseos-final.html. Match it.
Color tokens
• Ink (page background): #07090D
• Card (dark surfaces): #12161D
• Mist (light sections): #F4F5F7
• Text: #F2F4F7, muted text: #8B93A1
• Pulse (primary accent, red): #FF4D5E
• Teal (positive, calm): #5EE1D2
• Amber (caution): #FFB86B
Typography: Geist (fallback: system UI stack). Very large, tight headings (weight 600, letter-spacing about -0.04em), light-weight body text, generous line height.
Layout: alternate dark and light sections, wide margins, large radii (24 to 28px on cards), bento-style grids, one clear call to action per section.
Tone of copy: calm, plain, confident. Short sentences. No jargon, no hype.
12. Motion and 3D specification
• Hero: about 8,000 particles forming a heart, with a custom shader. Particles repel from the cursor and re-form. A heartbeat pulse scales the heart slightly. Headline reveals word by word on load.
• Pinned story: a pinned section lasting about 300% of viewport height. The heart moves to the right (centered above the text on mobile), rotates once, and shifts color red, teal, amber while three text panels swap.
• Dashboard: health ring and chart line draw in when scrolled into view. Numbers count up.
• Demo: values appear one by one, then the explanation streams word by word.
• Smooth scrolling with Lenis, wired into ScrollTrigger.
• Rules: animate only transform and opacity where possible, respect prefers-reduced-motion (disable rotation, pulse, and smooth scroll), lazy-load the 3D canvas, cap pixel ratio at 2, and keep a steady 60fps on a mid-range phone.
13. Quality bars
• Performance: Lighthouse 90+ on mobile for the marketing page. LCP under 2.5 s. 3D scene must not block first paint.
• Accessibility: WCAG AA contrast, full keyboard navigation, visible focus, labels on all inputs, aria-live on streaming output, no motion-only information.
• Security: hashed passwords, input validation with Pydantic, file type and size checks, CORS restricted to the web origin, secrets only in environment variables, rate limiting on auth and upload routes.
• Responsive: design at 375px first, then scale up.
14. Testing, CI/CD, deployment
• pytest for services (parser, scoring, booking conflicts) and key routes.
• One Playwright flow: register, upload sample report, see explanation, log a vital, book an appointment.
• GitHub Actions: lint, type-check, test, build on every push; deploy on merge to main.
• Docker Compose runs web, api, and Postgres with one command.
• Deploy web to Vercel and API plus database to Render or Railway, with a custom domain and environment variables set in the platform dashboard.
• README must include: one-paragraph pitch, screenshot or GIF, architecture diagram, setup in under 5 commands, env var table, and the Lighthouse score.
15. Build order
1. Scaffold monorepo, Docker Compose, CI skeleton.
2. Port the marketing site from the reference prototype into Next.js components (hero, story, demo, dashboard preview, security, FAQ).
3. Backend foundation: config, database, migrations, auth with roles.
4. Reports: upload, parsing, AI explainer with SSE streaming, connect to the demo UI.
5. Vitals: CRUD, summary endpoint, charts, health score.
6. Doctors and appointments with conflict-safe booking.
7. Polish: loading and empty states, toasts, error pages, accessibility pass, performance pass.
8. Tests, README, demo video script, deploy.
Finish and verify each step before starting the next.
16. Working rules for the agent
• Work autonomously on clear tasks. Ask the owner only when a decision is genuinely ambiguous or needs approval.
• Make the smallest correct change. Do not modify unrelated files.
• Inspect only the files relevant to the current task. Search strategically instead of scanning the whole repo.
• After each change, run the smallest relevant test, build, lint, or type-check, and fix real failures before moving on.
• Keep messages short. Report only blockers, significant errors, decisions needed, and completion. At completion, state what changed, what was verified, and any remaining issue.
• Prefer correctness over completeness, and completeness over explanation.
• Never commit secrets, real health data, or large binary files.
• Write clear commit messages, one logical change per commit.
17. Definition of done
The project is done when:
• A visitor can open the live URL, experience the full scroll story, and run the demo without errors.
• A new user can register, upload a sample report, read a streamed plain-language explanation, log vitals, see charts, and book an appointment.
• Tests and CI pass, Lighthouse is 90+ on mobile, and the accessibility check has no critical issues.
• The README, architecture diagram, and demo video are complete.
18. Resume line the project should earn
Built PulseOS, a full-stack AI health companion (Next.js, FastAPI, PostgreSQL) with a 3D scroll-driven UI, streaming LLM report explanations, JWT role-based auth, and conflict-safe appointment booking; deployed with CI/CD, 90+ Lighthouse.
