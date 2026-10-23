from datetime import UTC, datetime, timedelta

import pytest
from httpx import AsyncClient

from app.core.deps import get_db
from app.main import app
from app.models.appointment import AvailabilitySlot, Doctor


@pytest.mark.asyncio
async def test_double_booking_prevention(client: AsyncClient, auth_headers: dict):
    # 1. Setup a doctor and an open slot directly in the database
    override_fn = app.dependency_overrides[get_db]
    async for db in override_fn():
        doc = Doctor(
            name="Dr. Marcus Vance",
            specialty="Cardiology",
            bio="Preventative cardiology expert",
        )
        db.add(doc)
        await db.flush()

        slot = AvailabilitySlot(
            doctor_id=doc.id,
            starts_at=datetime.now(UTC) + timedelta(days=1),
            ends_at=datetime.now(UTC) + timedelta(days=1, hours=1),
            is_booked=False,
        )
        db.add(slot)
        await db.commit()
        await db.refresh(doc)
        await db.refresh(slot)

        doctor_id = str(doc.id)
        slot_id = str(slot.id)
        break

    # 2. Patient 1 (via auth_headers) books the slot -> 201 Created
    booking_payload = {
        "doctor_id": doctor_id,
        "slot_id": slot_id,
    }
    resp1 = await client.post("/api/v1/appointments", json=booking_payload, headers=auth_headers)
    assert resp1.status_code == 201, f"Expected 201, got {resp1.status_code}: {resp1.text}"
    data1 = resp1.json()
    assert data1["slot_id"] == slot_id
    assert data1["status"] == "confirmed"

    # 3. Patient 2 registers, logs in, and tries to book the EXACT SAME slot -> 409 Conflict
    reg2 = await client.post("/api/v1/auth/register", json={
        "email": "patient2@example.com",
        "password": "patient2password123",
        "full_name": "Patient Two",
    })
    assert reg2.status_code == 201
    token2 = reg2.json()["access_token"]
    headers2 = {"Authorization": f"Bearer {token2}"}

    resp2 = await client.post("/api/v1/appointments", json=booking_payload, headers=headers2)
    assert resp2.status_code == 409, f"Expected 409 Conflict, got {resp2.status_code}: {resp2.text}"
    assert "no longer available" in resp2.json()["detail"].lower()
