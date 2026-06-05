"""
User convenience routes.

  GET    /api/me        — Returns current user info + their full profile in one call.
  DELETE /api/me        — Permanently deletes the current user account and profile.
  GET    /api/version   — Returns app name, version, and current environment.
"""
from bson import ObjectId
from fastapi import APIRouter, Depends, status
from fastapi.encoders import jsonable_encoder

from app.auth.deps import get_current_user
from app.config.settings import settings
from app.database.connection import get_collection
from app.models.user import UserResponse
from app.utils.responses import success_response, error_response
from app.utils.logger import get_logger

logger = get_logger(__name__)

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


@router.delete(
    "/me",
    status_code=status.HTTP_200_OK,
    summary="Delete current user account",
    description=(
        "Permanently deletes the authenticated user's account, profile, and all "
        "connection records. **This action cannot be undone.**"
    ),
)
async def delete_current_user(
    current_user: UserResponse = Depends(get_current_user),
):
    user_obj_id = ObjectId(current_user.id)

    users_col = get_collection("users")
    profiles_col = get_collection("profiles")
    connections_col = get_collection("connections")

    # Delete in order: connections → profile → user
    await connections_col.delete_many({
        "$or": [
            {"from_user_id": user_obj_id},
            {"to_user_id": user_obj_id},
        ]
    })
    await profiles_col.delete_one({"user_id": user_obj_id})
    result = await users_col.delete_one({"_id": user_obj_id})

    if result.deleted_count == 0:
        return error_response("User not found", status_code=404)

    logger.info("Account deleted | user_id=%s | email=%s", current_user.id, current_user.email)
    return success_response(message="Account permanently deleted")


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
