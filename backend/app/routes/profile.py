"""
Profile Router — Day 8/11 enhanced version.

Changes from original:
  - /search now supports pagination (page / page_size)
  - /search returns paginated_response with meta block
"""
import re
from datetime import datetime
from typing import List, Optional

from bson import ObjectId
from fastapi import APIRouter, Depends, Query, status

from app.auth.deps import get_current_user
from app.database.connection import get_collection
from app.models.profile import ProfileUpdate, ProfileResponse
from app.models.user import UserResponse
from app.utils.responses import success_response, error_response, paginated_response
from app.utils.logger import get_logger

logger = get_logger(__name__)

router = APIRouter(prefix="/profile", tags=["Profiles"])


@router.get(
    "/me",
    summary="Get my profile",
    description="Retrieve the current logged-in user's profile.",
)
async def get_my_profile(current_user: UserResponse = Depends(get_current_user)):
    profiles_col = get_collection("profiles")
    profile = await profiles_col.find_one({"user_id": ObjectId(current_user.id)})
    if not profile:
        return error_response("Profile not found", status_code=status.HTTP_404_NOT_FOUND)
    return success_response(ProfileResponse(**profile).model_dump(by_alias=True))


@router.put(
    "/me",
    summary="Update my profile",
    description="Update the current user's profile. Syncs full_name to the users collection.",
)
async def update_my_profile(
    profile_data: ProfileUpdate,
    current_user: UserResponse = Depends(get_current_user),
):
    profiles_col = get_collection("profiles")
    users_col = get_collection("users")

    profile = await profiles_col.find_one({"user_id": ObjectId(current_user.id)})
    if not profile:
        return error_response("Profile not found", status_code=status.HTTP_404_NOT_FOUND)

    update_dict = {k: v for k, v in profile_data.model_dump().items() if v is not None}
    update_dict["updated_at"] = datetime.utcnow()

    if "full_name" in update_dict:
        await users_col.update_one(
            {"_id": ObjectId(current_user.id)},
            {"$set": {"full_name": update_dict["full_name"], "updated_at": update_dict["updated_at"]}},
        )

    await profiles_col.update_one(
        {"user_id": ObjectId(current_user.id)},
        {"$set": update_dict},
    )

    updated_profile = await profiles_col.find_one({"user_id": ObjectId(current_user.id)})
    logger.info("Profile updated | user_id=%s", current_user.id)
    return success_response(
        data=ProfileResponse(**updated_profile).model_dump(by_alias=True),
        message="Profile updated successfully",
    )


@router.get(
    "/search",
    summary="Search profiles",
    description=(
        "Search and filter alumni/student profiles. "
        "Supports skills, interests, industry, role filters and pagination."
    ),
)
async def search_profiles(
    skills: Optional[str] = Query(None, description="Comma-separated skills (any match)"),
    interests: Optional[str] = Query(None, description="Comma-separated interests (any match)"),
    industry: Optional[str] = Query(None, description="Industry (case-insensitive)"),
    role: Optional[str] = Query(None, description="Role: Student | Alumni | Mentor"),
    page: int = Query(1, ge=1, description="Page number (1-indexed)"),
    page_size: int = Query(10, ge=1, le=100, description="Results per page (max 100)"),
    current_user: UserResponse = Depends(get_current_user),
):
    profiles_col = get_collection("profiles")
    query = {"user_id": {"$ne": ObjectId(current_user.id)}}

    if skills:
        skill_list = [s.strip() for s in skills.split(",") if s.strip()]
        query["skills"] = {"$in": [re.compile(re.escape(s), re.IGNORECASE) for s in skill_list]}

    if interests:
        interest_list = [i.strip() for i in interests.split(",") if i.strip()]
        query["interests"] = {"$in": [re.compile(re.escape(i), re.IGNORECASE) for i in interest_list]}

    if industry:
        query["industry"] = {"$regex": re.escape(industry), "$options": "i"}

    if role:
        query["role"] = {"$regex": f"^{re.escape(role)}$", "$options": "i"}

    total = await profiles_col.count_documents(query)
    skip = (page - 1) * page_size
    cursor = profiles_col.find(query).skip(skip).limit(page_size)
    profiles = await cursor.to_list(length=page_size)

    results = [ProfileResponse(**p).model_dump(by_alias=True) for p in profiles]

    logger.info(
        "Profile search | user_id=%s | filters=%s | total=%d | page=%d",
        current_user.id,
        {"skills": skills, "industry": industry, "role": role},
        total,
        page,
    )

    return paginated_response(
        data=results,
        total=total,
        page=page,
        page_size=page_size,
        message=f"Found {total} profiles matching your search",
    )


@router.get(
    "/{user_id}",
    summary="Get profile by user ID",
    description="Fetch another user's profile by their user_id.",
)
async def get_profile_by_user_id(
    user_id: str,
    current_user: UserResponse = Depends(get_current_user),
):
    profiles_col = get_collection("profiles")
    try:
        profile = await profiles_col.find_one({"user_id": ObjectId(user_id)})
    except Exception:
        return error_response("Invalid user ID format", status_code=status.HTTP_400_BAD_REQUEST)

    if not profile:
        return error_response("Profile not found", status_code=status.HTTP_404_NOT_FOUND)

    return success_response(ProfileResponse(**profile).model_dump(by_alias=True))
