# pyrefly: ignore [missing-import]
import jwt
import bcrypt
from datetime import datetime, timedelta
from typing import Any, Union, Optional, Tuple

from app.config.settings import settings
from app.utils.logger import get_logger

logger = get_logger(__name__)


def hash_password(password: str) -> str:
    """Hash a plain-text password using bcrypt."""
    password_bytes = password.encode("utf-8")
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password_bytes, salt)
    return hashed.decode("utf-8")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a plain password against a stored bcrypt hash."""
    try:
        return bcrypt.checkpw(
            plain_password.encode("utf-8"),
            hashed_password.encode("utf-8"),
        )
    except Exception as exc:
        logger.warning("Password verification error: %s", exc)
        return False


def create_access_token(subject: Union[str, Any], expires_delta: Optional[timedelta] = None) -> str:
    """Generate a signed JWT access token for the given subject (user_id)."""
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)

    to_encode = {
        "exp": expire,
        "sub": str(subject),
        "iat": datetime.utcnow(),
    }
    encoded_jwt = jwt.encode(to_encode, settings.JWT_SECRET_KEY, algorithm=settings.ALGORITHM)
    logger.debug("Access token created | subject=%s | expires=%s", subject, expire.isoformat())
    return encoded_jwt


def decode_access_token(token: str) -> Optional[dict]:
    """
    Decode and validate a JWT access token.

    Returns the decoded payload dict on success, or None on any failure.
    Use decode_access_token_with_reason() if you need specific error messages.
    """
    payload, _ = decode_access_token_with_reason(token)
    return payload


def decode_access_token_with_reason(token: str) -> Tuple[Optional[dict], Optional[str]]:
    """
    Decode a JWT access token and return (payload, error_reason).

    Returns:
      (payload_dict, None)   — on success
      (None, "expired")      — when the token has expired
      (None, "invalid")      — when the token is malformed or has a bad signature
    """
    try:
        decoded = jwt.decode(token, settings.JWT_SECRET_KEY, algorithms=[settings.ALGORITHM])
        return decoded, None
    except jwt.ExpiredSignatureError:
        logger.warning("JWT token expired")
        return None, "expired"
    except jwt.InvalidTokenError as exc:
        logger.warning("JWT decode error: %s", exc)
        return None, "invalid"
