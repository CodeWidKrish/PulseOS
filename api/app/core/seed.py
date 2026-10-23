"""
Seed script for PulseOS: creates synthetic doctors, availability slots, demo vitals, and demo patient.
Strictly synthetic data only — NO real patient or clinical data.
Run with: python -m app.core.seed
"""
import asyncio
import random
from datetime import UTC, datetime, timedelta

from sqlalchemy import select

from app.core.database import AsyncSessionLocal
from app.core.security import hash_password
from app.models.appointment import Appointment, AppointmentStatus, AvailabilitySlot, Doctor
from app.models.user import User, UserRole
from app.models.vital import Vital, VitalType


async def seed(session_factory=None) -> None:
    maker = session_factory or AsyncSessionLocal
    async with maker() as db:
        print("[*] Checking for existing seed data...")
        result = await db.execute(
            select(User).where(User.email == "elena.rostova@sample.pulseos.health")
        )
        existing_patient = result.scalar_one_or_none()
        if existing_patient:
            print("[+] Seed data already exists. Skipping insertion.")
            return

        print("[*] Creating synthetic users...")
        default_password = hash_password("PulseOS2026!")

        # 1. Patient User
        patient = User(
            email="elena.rostova@sample.pulseos.health",
            password_hash=default_password,
            full_name="Elena Rostova",
            role=UserRole.patient,
        )
        db.add(patient)

        # 2. Doctor User
        doctor_user = User(
            email="dr.marcus.vance@sample.pulseos.health",
            password_hash=default_password,
            full_name="Dr. Marcus Vance",
            role=UserRole.doctor,
        )
        db.add(doctor_user)

        # 3. Admin User
        admin_user = User(
            email="admin@sample.pulseos.health",
            password_hash=default_password,
            full_name="PulseOS Administrator",
            role=UserRole.admin,
        )
        db.add(admin_user)
        await db.flush()

        print("[*] Creating synthetic doctors...")
        # 4. Doctor Profiles
        doc_vance = Doctor(
            user_id=doctor_user.id,
            name="Dr. Marcus Vance, MD",
            specialty="Cardiology & Preventative Health",
            bio="Board-certified cardiologist specializing in early detection, metabolic cardiovascular health, and preventative lifestyle management.",
        )
        db.add(doc_vance)

        doc_patel = Doctor(
            name="Dr. Ayesha Patel, DO",
            specialty="Endocrinology & Metabolic Health",
            bio="Endocrinologist focused on glycemic regulation, hormone optimization, and personalized metabolic tracking.",
        )
        db.add(doc_patel)
        await db.flush()

        print("[*] Creating availability slots...")
        now = datetime.now(UTC)
        # Create availability slots for the upcoming 7 days
        vance_slots: list[AvailabilitySlot] = []
        for day in range(1, 8):
            day_base = (now + timedelta(days=day)).replace(hour=9, minute=0, second=0, microsecond=0)
            # Two slots per day: 09:00 - 10:00 and 14:00 - 15:00
            s1 = AvailabilitySlot(
                doctor_id=doc_vance.id,
                starts_at=day_base,
                ends_at=day_base + timedelta(hours=1),
                is_booked=False,
            )
            s2 = AvailabilitySlot(
                doctor_id=doc_vance.id,
                starts_at=day_base.replace(hour=14),
                ends_at=day_base.replace(hour=15),
                is_booked=False,
            )
            db.add_all([s1, s2])
            vance_slots.extend([s1, s2])

            # Slots for Dr. Patel: 10:30 and 15:30
            p1 = AvailabilitySlot(
                doctor_id=doc_patel.id,
                starts_at=day_base.replace(hour=10, minute=30),
                ends_at=day_base.replace(hour=11, minute=30),
                is_booked=False,
            )
            p2 = AvailabilitySlot(
                doctor_id=doc_patel.id,
                starts_at=day_base.replace(hour=15, minute=30),
                ends_at=day_base.replace(hour=16, minute=30),
                is_booked=False,
            )
            db.add_all([p1, p2])

        await db.flush()

        # Mark 1 slot as booked for demonstration
        if vance_slots:
            demo_slot = vance_slots[0]
            demo_slot.is_booked = True
            booked_appt = Appointment(
                patient_id=patient.id,
                doctor_id=doc_vance.id,
                slot_id=demo_slot.id,
                status=AppointmentStatus.confirmed,
            )
            db.add(booked_appt)

        print("[*] Creating 30-day synthetic vitals trajectory for Elena Rostova...")
        # 30-day blood pressure & heart rate readings
        rng = random.Random(42)  # Deterministic seed for reproducible tests
        for day_offset in range(30, -1, -1):
            reading_time = (now - timedelta(days=day_offset)).replace(
                hour=8, minute=rng.randint(10, 50), second=0, microsecond=0
            )

            # BP (Systolic 118-124, Diastolic 76-82)
            systolic = round(118 + rng.uniform(-2.0, 5.0), 1)
            diastolic = round(77 + rng.uniform(-2.0, 4.0), 1)
            bp_vital = Vital(
                user_id=patient.id,
                type=VitalType.bp,
                value_1=systolic,
                value_2=diastolic,
                recorded_at=reading_time,
            )
            db.add(bp_vital)

            # HR (68-74 bpm)
            hr = round(71 + rng.uniform(-3.0, 4.0), 1)
            hr_vital = Vital(
                user_id=patient.id,
                type=VitalType.heart_rate,
                value_1=hr,
                value_2=None,
                recorded_at=reading_time,
            )
            db.add(hr_vital)

            # Fasting Glucose every 3 days (88-98 mg/dL)
            if day_offset % 3 == 0:
                glucose = round(92 + rng.uniform(-4.0, 5.0), 1)
                glucose_vital = Vital(
                    user_id=patient.id,
                    type=VitalType.glucose,
                    value_1=glucose,
                    value_2=None,
                    recorded_at=reading_time,
                )
                db.add(glucose_vital)

        await db.commit()
        print("[+] Synthetic database seed completed successfully!")
        print("    - Patient: elena.rostova@sample.pulseos.health (Password: PulseOS2026!)")
        print("    - Doctor:  dr.marcus.vance@sample.pulseos.health (Password: PulseOS2026!)")
        print("    - Admin:   admin@sample.pulseos.health (Password: PulseOS2026!)")
        print("    - Doctors seeded: 2, Availability slots: 28, Vitals: ~70 readings")


if __name__ == "__main__":
    asyncio.run(seed())
