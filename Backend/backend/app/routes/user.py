"""
User convenience routes.

  GET /api/me        — Returns current user info + their full profile in one call.
  GET /api/version   — Returns app name, version, and current environment.
"""
from bson import ObjectId
from fastapi import APIRouter, Depends
from fastapi.encoders import jsonable_encoder

from app.auth.deps import get_current_user
from app.config.settings import settings
from app.database.connection import get_collection
from app.models.user import UserResponse
from app.utils.responses import success_response

router = APIRouter(tags=["User"])


@router.get(
    "/me",
    summary="Get current user + profile",
    description=(
        "Returns a combined payload of the authenticated user's account information "
        "and their alumni/student profile. Useful as a single bootstrap call for frontends."
    ),
)
async def get_current_user_with_profile(
    current_user: UserResponse = Depends(get_current_user),
):
    profiles_col = get_collection("profiles")
    profile = await profiles_col.find_one({"user_id": ObjectId(current_user.id)})

    # Serialize ObjectId fields inside profile
    if profile:
        profile["_id"] = str(profile["_id"])
        profile["user_id"] = str(profile["user_id"])
        if "created_at" in profile and hasattr(profile["created_at"], "isoformat"):
            profile["created_at"] = profile["created_at"].isoformat()
        if "updated_at" in profile and hasattr(profile["updated_at"], "isoformat"):
            profile["updated_at"] = profile["updated_at"].isoformat()

    return success_response(
        data={
            "user": jsonable_encoder(current_user),
            "profile": profile,
        },
        message="Current user data retrieved successfully",
    )


@router.get(
    "/version",
    summary="App version info",
    description="Returns application name, version, and runtime environment.",
    tags=["Health"],
)
async def get_version():
    return success_response(
        data={
            "name": settings.PROJECT_NAME,
            "version": settings.APP_VERSION,
            "environment": settings.APP_ENV,
        },
        message="Version info",
    )
