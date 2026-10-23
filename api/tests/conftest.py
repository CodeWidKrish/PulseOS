"""
Pytest configuration and shared fixtures for PulseOS API tests.
Uses an in-memory SQLite database to avoid needing PostgreSQL during CI.
"""
import asyncio
from typing import AsyncGenerator

import pytest
import pytest_asyncio
from httpx import ASGITransport, AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

from app.core.database import Base
from app.core.deps import get_db
from app.main import app

# In-memory SQLite for tests (no PostgreSQL needed in CI)
TEST_DATABASE_URL = "sqlite+aiosqlite:///:memory:"

test_engine = create_async_engine(TEST_DATABASE_URL, echo=False)
TestSessionLocal = async_sessionmaker(test_engine, class_=AsyncSession, expire_on_commit=False)


@pytest.fixture(scope="session")
def event_loop():
    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close()


@pytest_asyncio.fixture(scope="function", autouse=True)
async def setup_db():
    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield
    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)


async def override_get_db() -> AsyncGenerator[AsyncSession, None]:
    async with TestSessionLocal() as session:
        yield session


app.dependency_overrides[get_db] = override_get_db


@pytest_asyncio.fixture
async def client() -> AsyncGenerator[AsyncClient, None]:
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        yield ac


@pytest_asyncio.fixture
async def auth_headers(client: AsyncClient) -> dict:
    """Register + login, return auth headers for a patient user."""
    await client.post("/api/v1/auth/register", json={
        "email": "test@example.com",
        "password": "testpass123",
        "full_name": "Test Patient",
    })
    resp = await client.post("/api/v1/auth/login", json={
        "email": "test@example.com",
        "password": "testpass123",
    })
    token = resp.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}
