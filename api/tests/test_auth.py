import pytest
from httpx import AsyncClient

from app.core.deps import get_db
from app.core.security import hash_password
from app.main import app
from app.models.user import User, UserRole


@pytest.mark.asyncio
async def test_register_success(client: AsyncClient):
    resp = await client.post("/api/v1/auth/register", json={
        "email": "new@example.com",
        "password": "password123",
        "full_name": "New User",
    })
    assert resp.status_code == 201
    data = resp.json()
    assert "access_token" in data
    assert "refresh_token" in data


@pytest.mark.asyncio
async def test_register_duplicate_email(client: AsyncClient):
    payload = {"email": "dup@example.com", "password": "pass1234", "full_name": "Dup"}
    await client.post("/api/v1/auth/register", json=payload)
    resp = await client.post("/api/v1/auth/register", json=payload)
    assert resp.status_code == 409


@pytest.mark.asyncio
async def test_register_weak_password(client: AsyncClient):
    resp = await client.post("/api/v1/auth/register", json={
        "email": "weak@example.com", "password": "123", "full_name": "Weak"
    })
    assert resp.status_code == 422


@pytest.mark.asyncio
async def test_login_success(client: AsyncClient, auth_headers: dict):
    resp = await client.get("/api/v1/auth/me", headers=auth_headers)
    assert resp.status_code == 200
    assert resp.json()["email"] == "test@example.com"


@pytest.mark.asyncio
async def test_login_wrong_password(client: AsyncClient):
    await client.post("/api/v1/auth/register", json={
        "email": "x@example.com", "password": "rightpass", "full_name": "X"
    })
    resp = await client.post("/api/v1/auth/login", json={
        "email": "x@example.com", "password": "wrongpass"
    })
    assert resp.status_code == 401


@pytest.mark.asyncio
async def test_me_no_token(client: AsyncClient):
    resp = await client.get("/api/v1/auth/me")
    assert resp.status_code in (401, 403)


@pytest.mark.asyncio
async def test_refresh_token(client: AsyncClient):
    reg = await client.post("/api/v1/auth/register", json={
        "email": "ref@example.com", "password": "password1", "full_name": "Ref"
    })
    refresh_token = reg.json()["refresh_token"]
    resp = await client.post("/api/v1/auth/refresh", json={"refresh_token": refresh_token})
    assert resp.status_code == 200
    assert "access_token" in resp.json()


@pytest.mark.asyncio
async def test_health(client: AsyncClient):
    resp = await client.get("/api/v1/health")
    assert resp.status_code == 200
    assert resp.json()["status"] == "ok"


@pytest.mark.asyncio
async def test_role_guard_patient_cannot_access_admin(client: AsyncClient, auth_headers: dict):
    # auth_headers is a 'patient' role
    resp = await client.get("/api/v1/auth/admin/users", headers=auth_headers)
    assert resp.status_code == 403
    assert resp.json()["detail"] == "Insufficient permissions"


@pytest.mark.asyncio
async def test_register_cannot_self_assign_admin(client: AsyncClient):
    reg = await client.post("/api/v1/auth/register", json={
        "email": "sneaky@example.com",
        "password": "sneakypassword123",
        "full_name": "Sneaky User",
        "role": "admin",
    })
    assert reg.status_code == 201
    headers = {"Authorization": f"Bearer {reg.json()['access_token']}"}

    me = await client.get("/api/v1/auth/me", headers=headers)
    assert me.json()["role"] == "patient"
    resp = await client.get("/api/v1/auth/admin/users", headers=headers)
    assert resp.status_code == 403


@pytest.mark.asyncio
async def test_role_guard_admin_access_allowed(client: AsyncClient):
    # Admins are created out-of-band (seed script), never via /register
    async for db in app.dependency_overrides[get_db]():
        db.add(User(
            email="admin@example.com",
            password_hash=hash_password("adminpassword123"),
            full_name="Admin User",
            role=UserRole.admin,
        ))
        await db.commit()
        break

    login = await client.post("/api/v1/auth/login", json={
        "email": "admin@example.com",
        "password": "adminpassword123",
    })
    assert login.status_code == 200
    admin_headers = {"Authorization": f"Bearer {login.json()['access_token']}"}

    resp = await client.get("/api/v1/auth/admin/users", headers=admin_headers)
    assert resp.status_code == 200
    assert isinstance(resp.json(), list)
