# PulseOS — Production Deployment Runbook & DevOps Guide

## 1. Environment Variable Reference Table

| Variable Name | Description & Purpose | Service | Scope | Example Placeholder |
| :--- | :--- | :--- | :--- | :--- |
| `NEXT_PUBLIC_API_URL` | Base public URL for the FastAPI backend | `web` | Public | `https://api.pulseos.health/api/v1` |
| `NEXT_PUBLIC_APP_NAME` | Public branding string | `web` | Public | `PulseOS` |
| `ENVIRONMENT` | Runtime mode (`development`, `staging`, `production`) | Both | Public | `production` |
| `DATABASE_URL` | Async PostgreSQL connection string | `api` | **Secret** | `postgresql+asyncpg://user:pass@host:5432/pulseos` |
| `JWT_SECRET_KEY` | 256-bit cryptographic key for Access Tokens | `api` | **Secret** | `generate-with-openssl-rand-hex-32` |
| `REFRESH_SECRET_KEY` | 256-bit cryptographic key for Refresh Tokens | `api` | **Secret** | `generate-with-openssl-rand-hex-32` |
| `GROQ_API_KEY` | Groq Cloud LPU API key for ultra-fast LLM inference | `api` | **Secret** | `gsk_placeholder_secret_key` |
| `CORS_ORIGINS` | Comma-separated list of permitted web origins | `api` | Public | `https://pulseos.health,http://localhost:3000` |
| `STORAGE_DRIVER` | Storage backend (`local` or `s3`) | `api` | Public | `local` |
| `UPLOAD_DIR` | Local disk upload mount path | `api` | Public | `/app/uploads` |
| `SMTP_HOST` | Transactional email provider host | `api` | Public | `smtp.resend.com` |
| `SMTP_PORT` | Transactional email port | `api` | Public | `587` |
| `SMTP_USER` | Transactional email username | `api` | **Secret** | `resend_api_user` |
| `SMTP_PASSWORD` | Transactional email password/token | `api` | **Secret** | `re_placeholder_secret_token` |
| `EMAIL_FROM` | Sender email address for appointment notices | `api` | Public | `noreply@pulseos.health` |

---

## 2. Local Environment Setup in Under 5 Commands

```bash
# 1. Clone repository
git clone https://github.com/your-username/pulseos.git && cd pulseos

# 2. Initialize environment variables
cp .env.example .env

# 3. Build and launch all services with Docker Compose
docker compose up --build -d

# 4. Apply database migrations
docker compose exec api alembic upgrade head

# 5. Seed synthetic sample data
docker compose exec api python -m app.core.seed
```
*Frontend running at `http://localhost:3000` | API running at `http://localhost:8000/docs`*

---

## 3. GitHub Actions Continuous Integration (CI) Pipeline

The workflow file `.github/workflows/ci.yml` triggers on every push and pull request to `main`:

```yaml
name: PulseOS CI Pipeline

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  lint-and-typecheck:
    name: Code Quality & Types
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js & Python
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'
          cache-dependency-path: web/package-lock.json
      - uses: actions/setup-python@v5
        with:
          python-version: '3.11'
          cache: 'pip'
          cache-dependency-path: api/requirements.txt

      - name: Lint & Type-Check Web
        run: |
          cd web
          npm ci
          npm run lint
          npx tsc --noEmit

      - name: Lint & Type-Check API
        run: |
          cd api
          pip install -r requirements.txt
          ruff check .
          mypy app

  api-tests:
    name: Pytest Unit & Integration
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:16-alpine
        env:
          POSTGRES_USER: test_user
          POSTGRES_PASSWORD: test_password
          POSTGRES_DB: pulseos_test
        ports:
          - 5432:5432
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with:
          python-version: '3.11'
          cache: 'pip'
          cache-dependency-path: api/requirements.txt
      - name: Run Test Suite
        env:
          DATABASE_URL: postgresql+asyncpg://test_user:test_password@localhost:5432/pulseos_test
          JWT_SECRET_KEY: test_jwt_secret_key_32_bytes_long!!
          GROQ_API_KEY: mock_key
        run: |
          cd api
          pip install -r requirements.txt
          pytest tests/ -v

  build-web:
    name: Next.js Production Build
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - name: Build Web Application
        env:
          NEXT_PUBLIC_API_URL: https://api.pulseos.health/api/v1
        run: |
          cd web
          npm ci
          npm run build
```

---

## 4. Step-by-Step Production Deployment

### 4.1 Backend & Database Deployment (Render / Railway)
1. **Provision Managed PostgreSQL**:
   - Create a PostgreSQL 16 database instance (e.g. on Render / Railway / Neon).
   - Copy the private connection string and convert scheme to `postgresql+asyncpg://...`.
2. **Deploy FastAPI Web Service**:
   - Link repository to Render / Railway pointing to the `api/` root directory.
   - Set Build Command: `pip install -r requirements.txt`.
   - Set Start Command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`.
   - Set Pre-Deploy Command (Release Phase): `alembic upgrade head`.
3. **Configure Environment Variables**:
   - Populate `DATABASE_URL`, `JWT_SECRET_KEY`, `REFRESH_SECRET_KEY`, `GROQ_API_KEY`, and `CORS_ORIGINS`.

### 4.2 Frontend Deployment (Vercel)
1. **Import Git Repository**:
   - In Vercel dashboard, click **"Add New Project"** and select the PulseOS repository.
   - Configure **Root Directory**: `web`.
   - Framework Preset: **Next.js**.
2. **Configure Environment Variables**:
   - Set `NEXT_PUBLIC_API_URL` to `https://api.pulseos.health/api/v1` (Production) or backend service URL.
3. **Deploy & Deploy Hook**:
   - Click **Deploy**. Vercel compiles static assets, edge functions, and outputs a live URL.

---

## 5. Custom Domain & SSL/TLS Configuration

1. **DNS Records (Cloudflare / Namecheap / Route 53)**:
   - Marketing & Web App (`pulseos.health` / `www.pulseos.health`):
     - `CNAME` `@` -> `cname.vercel-dns.com`
     - `CNAME` `www` -> `cname.vercel-dns.com`
   - Backend API (`api.pulseos.health`):
     - `CNAME` `api` -> `pulseos-api.onrender.com` (or Railway edge domain)
2. **Automated SSL/TLS Issuance**:
   - Both Vercel and Render/Railway automatically issue and renew Let's Encrypt Wildcard certificates over HTTPS.
   - Force HTTPS redirect enabled across all routes.

---

## 6. Zero-Downtime Database Migration Procedure

1. **Additive Schema Rules**:
   - Never drop columns or rename active tables in a single release.
   - Step 1: Add new nullable columns or tables via Alembic.
   - Step 2: Deploy code writing to new structures.
   - Step 3: Deprecate and remove old columns in subsequent release.
2. **Release Execution**:
   - Alembic runs automatically as a **Pre-Deploy / Release Phase Command**:
     ```bash
     alembic upgrade head
     ```
   - If a migration fails, the platform aborts deployment immediately before routing user traffic to new containers.

---

## 7. Health Checks & Uptime Monitoring

1. **Probing Endpoint**:
   - Dedicated probe at `GET https://api.pulseos.health/api/v1/health`.
   - Executes an internal lightweight query (`SELECT 1`) to ensure active database connectivity.
2. **Uptime Automation**:
   - Configure BetterStack / UptimeRobot to ping `/api/v1/health` every **60 seconds**.
   - Alerting thresholds:
     - 2 consecutive failed probes (HTTP status ≠ 200) -> Immediate SMS / Discord webhook alert.
     - Response latency > 2,000ms -> Latency warning notification.

---

## 8. Backup & Disaster Recovery Rollback Runbook

### 8.1 Database Backup Strategy
- **Automated Snapshots**: Managed Postgres provider takes daily automated point-in-time recovery (PITR) backups with 7-day retention.
- **Manual Pre-Release Backup**:
  ```bash
  # Execute quick snapshot before major migration
  pg_dump -Fc --no-acl --no-owner -h <host> -U <user> -d <dbname> > backup_pre_release_$(date +%F).dump
  ```

### 8.2 Rollback Procedure
1. **Frontend Rollback**:
   - In Vercel dashboard: Navigate to **Deployments** -> locate previous stable deployment -> click **"Promote to Production"** (instant zero-downtime rollback).
2. **Backend API Rollback**:
   - In Render/Railway: Rollback to previous container image commit.
3. **Database Migration Downgrade**:
   ```bash
   # If database schema change must be reverted
   docker compose exec api alembic downgrade -1
   ```

---

## 9. Pre-Launch Production Checklist

- [ ] All 11 pre-implementation documents reviewed and committed in `docs/`.
- [ ] Passwords salted and hashed with Argon2id or Bcrypt.
- [ ] JWT secrets generated with high-entropy cryptographic strings (`openssl rand -hex 32`).
- [ ] Database credentials, Groq API keys, and email tokens stored strictly in platform environment variables.
- [ ] CORS headers restricted strictly to production domain (`https://pulseos.health`).
- [ ] Upload directory permissions secured and file size limit (10MB) verified.
- [ ] Alembic migrations run cleanly (`alembic upgrade head`).
- [ ] Synthetic seed data populated (`python -m app.core.seed`).
- [ ] SSL/TLS active with valid HTTPS certificates on web and API domains.
- [ ] Automated uptime monitor active on `/api/v1/health`.
- [ ] Mobile Lighthouse performance score verified ≥ 90 on production build.
- [ ] Emergency escalation disclaimer prominent on all report explanations.

---

## 10. Open Questions
1. Do you want to deploy on Render or Railway for the backend API and PostgreSQL?
2. Which email delivery provider (Resend, SendGrid, or standard SMTP) do you prefer for production appointment confirmations?
