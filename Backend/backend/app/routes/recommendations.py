"""
Recommendations Router — Day 8 enhanced version.

All endpoints are JWT-protected and support:
  - Filtering  : industry, role, min/max experience, skills, interests
  - Sorting    : score (default) | experience | industry_match
  - Pagination : page / page_size query params
"""
from typing import List, Optional
from fastapi import APIRouter, Depends, Query, status
from bson import ObjectId

from app.auth.deps import get_current_user
from app.models.user import UserResponse
from app.models.filters import RecommendationFilters
from app.services.recommendation_service import (
    get_connection_recommendations,
    get_mentor_recommendations,
    predict_collaboration_compatibility,
)
from app.utils.responses import paginated_response, success_response, error_response

router = APIRouter(prefix="/recommendations", tags=["AI Recommendations"])


# ─── Helper to parse comma-separated query string into a list ───────────────

def _parse_list(value: Optional[str]) -> Optional[List[str]]:
    if not value:
        return None
    return [v.strip() for v in value.split(",") if v.strip()]


# ─── Connection Recommendations ──────────────────────────────────────────────

@router.get(
    "/similar",
    summary="Get similar alumni connections",
    description=(
        "Returns AI-ranked alumni/student profiles most compatible with the current user, "
        "based on TF-IDF cosine similarity, shared skills, interests, and industry. "
        "Supports filtering, sorting, and pagination."
    ),
)
async def get_similar_connections(
    # Pagination
    page: int = Query(1, ge=1, description="Page number (1-indexed)"),
    page_size: int = Query(10, ge=1, le=50, description="Results per page (max 50)"),
    # Filters
    industry: Optional[str] = Query(None, description="Filter by industry (case-insensitive)"),
    role: Optional[str] = Query(None, description="Filter by role: Alumni | Student | Mentor"),
    min_experience: Optional[int] = Query(None, ge=0, description="Minimum years of experience"),
    max_experience: Optional[int] = Query(None, ge=0, description="Maximum years of experience"),
    skills: Optional[str] = Query(None, description="Comma-separated skill keywords (any match)"),
    interests: Optional[str] = Query(None, description="Comma-separated interest keywords (any match)"),
    # Sorting
    sort_by: Optional[str] = Query("score", description="Sort by: score | experience | industry_match"),
    current_user: UserResponse = Depends(get_current_user),
):
    filters = RecommendationFilters(
        industry=industry,
        role=role,
        min_experience=min_experience,
        max_experience=max_experience,
        skills=_parse_list(skills),
        interests=_parse_list(interests),
        sort_by=sort_by,
    )
    result = await get_connection_recommendations(
        user_id=ObjectId(current_user.id),
        filters=filters,
        page=page,
        page_size=page_size,
    )
    if result["total"] == 0:
        msg = (
            "No profiles match your current filters. Try relaxing the filter criteria."
            if any([industry, role, min_experience, max_experience, skills, interests])
            else "No other profiles found in the network yet. Try seeding demo data."
        )
        return paginated_response(data=[], total=0, page=page, page_size=page_size, message=msg)
    return paginated_response(
        data=result["items"],
        total=result["total"],
        page=page,
        page_size=page_size,
        message=f"Found {result['total']} compatible profiles",
    )


# ─── Mentor Recommendations ──────────────────────────────────────────────────

@router.get(
    "/mentors",
    summary="Get matched mentors",
    description=(
        "Returns profiles with role='Mentor' ranked by compatibility. "
        "Optionally filter by industry, skills, experience, and paginate results."
    ),
)
async def get_mentors(
    page: int = Query(1, ge=1, description="Page number (1-indexed)"),
    page_size: int = Query(10, ge=1, le=50, description="Results per page"),
    industry: Optional[str] = Query(None, description="Filter by industry"),
    min_experience: Optional[int] = Query(None, ge=0, description="Minimum experience (years)"),
    max_experience: Optional[int] = Query(None, ge=0, description="Maximum experience (years)"),
    skills: Optional[str] = Query(None, description="Comma-separated skill keywords"),
    sort_by: Optional[str] = Query("score", description="Sort by: score | experience | industry_match"),
    current_user: UserResponse = Depends(get_current_user),
):
    filters = RecommendationFilters(
        industry=industry,
        min_experience=min_experience,
        max_experience=max_experience,
        skills=_parse_list(skills),
        sort_by=sort_by,
    )
    result = await get_mentor_recommendations(
        user_id=ObjectId(current_user.id),
        filters=filters,
        page=page,
        page_size=page_size,
    )
    return paginated_response(
        data=result["items"],
        total=result["total"],
        page=page,
        page_size=page_size,
        message="Mentor recommendations generated successfully",
    )


# ─── Collaboration Prediction ────────────────────────────────────────────────

@router.get(
    "/collaborate/{candidate_id}",
    summary="Predict collaboration compatibility",
    description=(
        "Calculate pairwise compatibility score between the current user and a specific candidate. "
        "Returns a detailed score breakdown and explainable match reason."
    ),
)
async def get_collaboration_prediction(
    candidate_id: str,
    current_user: UserResponse = Depends(get_current_user),
):
    try:
        cand_obj_id = ObjectId(candidate_id)
    except Exception:
        return error_response(
            "Invalid candidate user ID format — must be a 24-character hex string",
            status_code=status.HTTP_400_BAD_REQUEST,
        )

    result = await predict_collaboration_compatibility(
        user_id=ObjectId(current_user.id),
        candidate_id=cand_obj_id,
    )
    if not result:
        return error_response(
            "Candidate profile or your own profile was not found",
            status_code=status.HTTP_404_NOT_FOUND,
        )

    return success_response(
        data=result,
        message="Collaboration compatibility prediction successful",
    )
