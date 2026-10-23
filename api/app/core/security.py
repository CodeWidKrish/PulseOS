from datetime import datetime, timedelta, timezone
from typing import Any

from argon2 import PasswordHasher
from argon2.exceptions import VerifyMismatchError
from jose import JWTError, jwt

from app.core.config import settings

ph = PasswordHasher()


def hash_password(password: str) -> str:
    return ph.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    try:
        return ph.verify(hashed_password, plain_password)
    except VerifyMismatchError:
        return False


def create_access_token(data: dict[str, Any]) -> str:
    expire = datetime.now(timezone.utc) + timedelta(
        minutes=settings.access_token_expire_minutes
    )
    return jwt.encode(
        {**data, "exp": expire, "type": "access"},
        settings.secret_key,
        algorithm=settings.algorithm,
    )


def create_refresh_token(data: dict[str, Any]) -> str:
    expire = datetime.now(timezone.utc) + timedelta(
        days=settings.refresh_token_expire_days
    )
    return jwt.encode(
        {**data, "exp": expire, "type": "refresh"},
        settings.secret_key,
        algorithm=settings.algorithm,
    )


def decode_token(token: str) -> dict[str, Any]:
    """Raises JWTError on invalid/expired tokens."""
    return jwt.decode(token, settings.secret_key, algorithms=[settings.algorithm])
