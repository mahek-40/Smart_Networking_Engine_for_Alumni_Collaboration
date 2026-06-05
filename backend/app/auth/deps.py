"""
JWT authentication dependency for FastAPI route handlers.

Usage:
    from app.auth.deps import get_current_user
    current_user: UserResponse = Depends(get_current_user)
"""
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from bson import ObjectId

from app.auth.security import decode_access_token_with_reason
from app.config.settings import settings
from app.database.connection import get_collection
from app.models.user import UserResponse
from app.utils.logger import get_logger

logger = get_logger(__name__)

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")


async def get_current_user(token: str = Depends(oauth2_scheme)) -> UserResponse:
    """
    Validate the JWT bearer token and return the authenticated user.

    Raises HTTP 401 with a specific message for:
      - Expired tokens  → "Your session has expired. Please log in again."
      - Invalid tokens  → "Invalid authentication token. Please log in again."
      - Missing user    → "User account not found."
    """
    # ── Decode token ──────────────────────────────────────────────────────────
    payload, reason = decode_access_token_with_reason(token)

    if payload is None:
        if reason == "expired":
            detail = "Your session has expired. Please log in again."
        else:
            detail = "Invalid authentication token. Please log in again."
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=detail,
            headers={"WWW-Authenticate": "Bearer"},
        )

    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token payload is malformed — missing subject.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # ── Look up user in database ───────────────────────────────────────────────
    users_col = get_collection("users")
    try:
        user = await users_col.find_one({"_id": ObjectId(user_id)})
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication token.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if user is None:
        logger.warning("JWT refers to non-existent user_id=%s", user_id)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User account not found. Please register or contact support.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    return UserResponse(**user)
