import pytest
from sqlalchemy import select

from app.core.seed import seed
from app.models.appointment import AvailabilitySlot, Doctor
from app.models.user import User, UserRole
from app.models.vital import Vital
from tests.conftest import TestSessionLocal


@pytest.mark.asyncio
async def test_seed_creates_synthetic_data_and_is_idempotent():
    # 1. First run creates all data
    await seed(session_factory=TestSessionLocal)

    async with TestSessionLocal() as db:
        # Check users
        patient_res = await db.execute(
            select(User).where(User.email == "elena.rostova@sample.pulseos.health")
        )
        patient = patient_res.scalar_one_or_none()
        assert patient is not None
        assert patient.full_name == "Elena Rostova"
        assert patient.role == UserRole.patient

        doctor_res = await db.execute(
            select(User).where(User.email == "dr.marcus.vance@sample.pulseos.health")
        )
        doc_user = doctor_res.scalar_one_or_none()
        assert doc_user is not None
        assert doc_user.role == UserRole.doctor

        admin_res = await db.execute(
            select(User).where(User.email == "admin@sample.pulseos.health")
        )
        admin = admin_res.scalar_one_or_none()
        assert admin is not None
        assert admin.role == UserRole.admin

        # Check doctors
        docs_res = await db.execute(select(Doctor))
        doctors = docs_res.scalars().all()
        assert len(doctors) == 2
        assert any("Marcus Vance" in d.name for d in doctors)
        assert any("Ayesha Patel" in d.name for d in doctors)

        # Check availability slots
        slots_res = await db.execute(select(AvailabilitySlot))
        slots = slots_res.scalars().all()
        assert len(slots) >= 20

        # Check vitals trajectory
        vitals_res = await db.execute(select(Vital).where(Vital.user_id == patient.id))
        vitals = vitals_res.scalars().all()
        assert len(vitals) >= 60

    # 2. Second run is idempotent (does not duplicate or raise)
    await seed(session_factory=TestSessionLocal)
