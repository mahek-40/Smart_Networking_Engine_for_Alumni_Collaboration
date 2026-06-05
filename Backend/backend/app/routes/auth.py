"""
Auth Router — Registration and Login.
"""
from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, status

from app.auth.security import hash_password, verify_password, create_access_token
from app.config.settings import settings
from app.database.connection import get_collection
from app.models.user import UserRegister, UserLogin, UserInDB, UserResponse
from app.utils.logger import get_logger
from app.utils.responses import success_response, error_response

logger = get_logger(__name__)

router = APIRouter(prefix="/auth", tags=["Auth"])


@router.post(
    "/register",
    status_code=status.HTTP_201_CREATED,
    summary="Register a new user",
    description=(
        "Create a new user account. An empty profile stub is automatically created. "
        "Returns the new user object (password excluded)."
    ),
)
async def register(user_data: UserRegister):
    users_col = get_collection("users")

    existing_user = await users_col.find_one({"email": user_data.email})
    if existing_user:
        logger.warning("Registration with already-taken email: %s", user_data.email)
        return error_response(
            message="A user with this email is already registered",
            status_code=status.HTTP_400_BAD_REQUEST,
        )

    hashed_pwd = hash_password(user_data.password)
    user_db = UserInDB(
        email=user_data.email,
        hashed_password=hashed_pwd,
        full_name=user_data.full_name,
    )
    user_dict = user_db.model_dump(by_alias=True)
    await users_col.insert_one(user_dict)

    profiles_col = get_collection("profiles")
    now = datetime.utcnow()
    profile_stub = {
        "user_id": user_dict["_id"],
        "email": user_data.email,
        "full_name": user_data.full_name,
        "role": "Alumni",
        "skills": [],
        "interests": [],
        "industry": "",
        "career_goals": "",
        "bio": "",
        "graduation_year": None,
        "experience_years": 0,
        "created_at": now,
        "updated_at": now,
    }
    await profiles_col.insert_one(profile_stub)

    logger.info("New user registered | email=%s | id=%s", user_data.email, user_dict["_id"])
    return success_response(
        data=UserResponse(**user_dict).model_dump(by_alias=True),
        message="Registration successful. Please update your profile to get recommendations.",
        status_code=status.HTTP_201_CREATED,
    )


@router.post(
    "/login",
    summary="Login and receive a JWT access token",
    description=(
        "Authenticate with email and password. Returns a JWT bearer token, "
        "the token expiry timestamp, and basic user information."
    ),
)
async def login(credentials: UserLogin):
    users_col = get_collection("users")

    user = await users_col.find_one({"email": credentials.email})
    if not user or not verify_password(credentials.password, user["hashed_password"]):
        logger.warning("Failed login attempt | email=%s", credentials.email)
        return error_response(
            message="Invalid email or password",
            status_code=status.HTTP_401_UNAUTHORIZED,
        )

    token = create_access_token(subject=str(user["_id"]))
    expires_at = (
        datetime.now(timezone.utc)
        + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    ).strftime("%Y-%m-%dT%H:%M:%SZ")

    user_response = UserResponse(**user)
    logger.info("Login success | email=%s | id=%s", credentials.email, user["_id"])

    return success_response(
        data={
            "access_token": token,
            "token_type": "bearer",
            "expires_at": expires_at,
            "user": user_response.model_dump(by_alias=True),
        },
        message="Login successful",
    )
