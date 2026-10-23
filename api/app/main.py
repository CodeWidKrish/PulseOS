"""
PulseOS FastAPI Application
"""
import contextlib
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from slowapi.util import get_remote_address

from app.core.config import settings
from app.core.database import Base, engine
from app.routers import appointments, auth, doctors, reports, vitals


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: create tables (alembic handles migrations in prod)
    try:
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
    except Exception as e:
        print(f"[!] Note: Database startup ping deferred: {e}")
    yield
    # Shutdown: dispose engine
    with contextlib.suppress(Exception):
        await engine.dispose()


limiter = Limiter(key_func=get_remote_address)

app = FastAPI(
    title="PulseOS API",
    description="AI health companion — explains, organises, and routes people to real care.",
    version=settings.app_version,
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    openapi_url="/api/openapi.json",
    lifespan=lifespan,
)

# Rate limiting
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)  # type: ignore[arg-type]

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
API_PREFIX = "/api/v1"
app.include_router(auth.router, prefix=f"{API_PREFIX}/auth", tags=["auth"])
app.include_router(reports.router, prefix=f"{API_PREFIX}/reports", tags=["reports"])
app.include_router(vitals.router, prefix=f"{API_PREFIX}/vitals", tags=["vitals"])
app.include_router(doctors.router, prefix=f"{API_PREFIX}/doctors", tags=["doctors"])
app.include_router(appointments.router, prefix=f"{API_PREFIX}/appointments", tags=["appointments"])


@app.get("/api/v1/health", tags=["health"])
async def health_check():
    return {"status": "ok", "version": settings.app_version}
