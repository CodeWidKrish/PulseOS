# PulseOS — Next Phase Plan

> Written 2026-11-12, after the app redesign, heartbeat sound and smooth theme switch
> (main @ `367a7c2`). Work happens directly on `main`; each milestone ends green on
> `ruff`, `mypy`, `pytest`, `tsc`, `npm run lint` and `npm run build`.

## Where we are

**Done:** P0 security/booking fixes · every app page wired to the real API · premium
redesign of dashboard, reports, report detail, vitals, appointments, login and register ·
design tokens and component kit · realistic heartbeat sound · flash-free circular theme
switch · review fixes.

**Not done yet:** the homepage sections still use old hard-coded colours, and the homepage
has no light theme (its toggle was removed on purpose). The error page, 404 page and
`components/nav.tsx` are not redesigned. Several backend issues remain open (Milestone 2).
There are no end-to-end tests and the site isn't deployed.

## Goal

A live, recruiter-ready PulseOS: every page premium in both themes, the AI explainer
working end to end, tested, and deployed with a public demo link.

---

## Milestone 1 — Finish the premium UI (homepage and remaining pages)

1. **Move homepage sections onto design tokens.** Hero, story, how-it-works, numbers,
   who-it-is-for, before/after, demo, bento, security, FAQ, closing CTA and footer: replace
   hex classes with `bg-canvas` / `text-fg` / `.tile` / `.btn-*`.
2. **Design a real light homepage.** Light hero (heart and glow tuned for a light
   background), keep the dark/light section rhythm, then restore the theme toggle in
   `marketing-nav.tsx`. Remove the `html.marketing` lock and the old `html.light .text-[#…]`
   override hacks in `globals.css`.
3. **Redesign `app/not-found.tsx`, `app/error.tsx` and `components/nav.tsx`** with the kit
   (EmptyState, icons, tokens).
4. **Motion and media.** Short muted looping product clips (WebM/MP4, lazy-loaded) or
   SVG/Lottie in the bento and demo sections instead of GIFs; scroll reveals with
   reduced-motion fallbacks.
5. **Heartbeat polish.** Volume/tone presets (headphones vs laptop speakers) and an
   optional "pulse" haptic on mobile; keep the first-interaction start and mute memory.
6. **Remove debug routes** `/design` and `/heart-test` from production (or gate them behind
   a dev-only check).

**Done when:** every route looks intentional in light and dark at 390 / 768 / 1440 px, with
no hex colours left in app or homepage components.

## Milestone 2 — Backend hardening

1. **AI explainer end to end.** Document installing Tesseract and setting `GROQ_API_KEY`.
   Return structured JSON (summary, per-value notes, 3–5 `questions`) and save `questions`
   instead of `[]`. Add a "Regenerate" path. Make sure every failure returns a clean error
   (never an unhandled 500).
2. **Rate limiting.** Apply `slowapi` to login, register and report upload (the limiter is
   set up but never used).
3. **Refuse to start in production with the default `SECRET_KEY`.**
4. **Upload safety.** Check the real file type with `python-magic` (already in
   requirements, unused); stream the size check instead of reading the whole file first.
5. **Health score.** Don't award the 25 weight points when there is no data; score only on
   the vitals that exist.
6. **Alembic.** Create the first migration from the models, including the partial unique
   index `uq_appointments_slot_confirmed`, and stop relying on `create_all` at startup.
7. **Doctor role.** Endpoints for doctors to see their own schedule and appointments, plus
   a simple doctor view in the app.

**Done when:** a report uploaded locally streams a real explanation with saved questions,
and the new tests cover each item.

## Milestone 3 — Testing and quality gates

1. **Playwright end-to-end flow:** register → upload a synthetic report → explanation
   streams → log a vital → book → cancel → rebook.
2. **axe accessibility checks** on every route; fix anything they flag.
3. **API tests:** report upload and SSE with a fake AI service; ownership (user A cannot
   read user B's data); rate limits; secret-key guard.
4. **Visual regression:** reuse the headless screenshot script at three widths and both
   themes, and attach the screenshots to CI runs.
5. **Lighthouse budgets:** mobile score ≥ 90, CLS < 0.1, LCP < 2.5 s (DESIGN.md §10).

## Milestone 4 — Deploy and showcase

1. **Deploy.** Website on Vercel; API and Postgres on Render or Railway; set
   `CORS_ORIGINS`, `NEXT_PUBLIC_API_URL`, `SECRET_KEY` and `GROQ_API_KEY`; run migrations
   and the seed for the demo accounts.
2. **README.** Live link, demo login, a short screen-recording GIF, an architecture
   diagram, and a "how the heartbeat is synthesized" note.
3. **Social preview.** OG image check, favicon and manifest polish.

## Milestone 5 — Post-MVP features (pick after deploy)

- Symptom chat with an emergency-keyword stop and urgent-care message (brief §5).
- Plain-language glossary hovers on medical terms in explanations.
- PDF export of the doctor visit sheet.
- Medication reminders.
- Admin analytics page.

---

## Suggested order

M1.1 → M1.3 → M2.1 → M2.2–M2.5 → M2.6 → M3.1–M3.3 → M4 → M1.2 (light homepage) →
M1.4–M1.6 → M3.4–M3.5 → M5.

**Why this order:** the explainer and backend safety are what reviewers try first, and
deploying early gives you a shareable link sooner. The light homepage is the largest pure
design task, so it comes after the site is live.
