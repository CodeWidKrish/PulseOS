"""
Mailer Service
Development: prints to console (stdout)
Production: aiosmtplib SMTP
"""
import logging
from datetime import datetime

from app.core.config import settings

logger = logging.getLogger(__name__)


async def send_appointment_confirmation(
    patient_email: str,
    patient_name: str,
    doctor_name: str,
    slot_starts_at: datetime,
) -> None:
    subject = "PulseOS — Appointment Confirmed"
    body = f"""Hi {patient_name},

Your appointment has been confirmed.

Doctor: {doctor_name}
Date & Time: {slot_starts_at.strftime("%A, %B %d %Y at %I:%M %p")}

If you need to cancel, please log in to PulseOS at least 24 hours before your appointment.

—
PulseOS Team
"""
    if settings.mail_backend == "console":
        logger.info("📧 [CONSOLE MAIL]\nTo: %s\nSubject: %s\n\n%s", patient_email, subject, body)
        print(f"\n📧 EMAIL TO: {patient_email}\nSUBJECT: {subject}\n{body}\n")
    else:
        await _send_smtp(patient_email, subject, body)


async def _send_smtp(to: str, subject: str, body: str) -> None:
    from email.mime.text import MIMEText

    import aiosmtplib

    message = MIMEText(body)
    message["From"] = settings.mail_from
    message["To"] = to
    message["Subject"] = subject

    await aiosmtplib.send(
        message,
        hostname=settings.mail_host,
        port=settings.mail_port,
        username=settings.mail_username,
        password=settings.mail_password,
        start_tls=True,
    )
