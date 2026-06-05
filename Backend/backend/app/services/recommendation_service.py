"""
Recommendation service layer.

Responsible for:
  - Fetching and pre-filtering candidate profiles from MongoDB
  - Invoking the ML engine (TF-IDF + weighted cosine similarity)
  - Applying post-filtering sorts
  - Logging activities and persisting recommendation history
"""
import re
from bson import ObjectId
from typing import List, Dict, Any, Optional

from app.database.connection import get_collection
from app.ml.engine import calculate_recommendations
from app.models.filters import RecommendationFilters
from app.services.activity_service import log_activity, log_recommendation_history
from app.utils.logger import get_logger

logger = get_logger(__name__)


def _build_candidate_query(
    exclude_user_id: ObjectId,
    filters: Optional[RecommendationFilters] = None,
    require_mentor_role: bool = False,
) -> Dict[str, Any]:
    """Build a MongoDB query dict for candidate profile lookups."""
    query: Dict[str, Any] = {"user_id": {"$ne": exclude_user_id}}

    if require_mentor_role:
        query["role"] = "Mentor"
    elif filters and filters.role:
        query["role"] = {"$regex": f"^{re.escape(filters.role)}$", "$options": "i"}

    if filters:
        if filters.industry:
            query["industry"] = {"$regex": re.escape(filters.industry), "$options": "i"}

        if filters.min_experience is not None or filters.max_experience is not None:
            exp_range: Dict[str, int] = {}
            if filters.min_experience is not None:
                exp_range["$gte"] = filters.min_experience
            if filters.max_experience is not None:
                exp_range["$lte"] = filters.max_experience
            query["experience_years"] = exp_range

        if filters.skills:
            query["skills"] = {
                "$in": [re.compile(re.escape(s), re.IGNORECASE) for s in filters.skills]
            }

        if filters.interests:
            query["interests"] = {
                "$in": [re.compile(re.escape(i), re.IGNORECASE) for i in filters.interests]
            }

    return query


def _sort_recommendations(
    recommendations: List[Dict[str, Any]],
    sort_by: Optional[str] = "score",
) -> List[Dict[str, Any]]:
    """Sort recommendation list after ML scoring.

    Supported sort_by values:
      - "score"           → by compatibility_score DESC (default)
      - "experience"      → by candidate's experience_years DESC
      - "industry_match"  → by industry_match_score DESC, then score DESC
    """
    if sort_by == "experience":
        return sorted(
            recommendations,
            key=lambda r: r["profile"].get("experience_years", 0),
            reverse=True,
        )
    if sort_by == "industry_match":
        return sorted(
            recommendations,
            key=lambda r: (
                r["score_breakdown"]["industry_match_score"],
                r["compatibility_score"],
            ),
            reverse=True,
        )
    # Default: by overall compatibility score
    return sorted(recommendations, key=lambda r: r["compatibility_score"], reverse=True)


def _paginate(items: List[Any], page: int, page_size: int) -> List[Any]:
    """Return a slice of items for the requested page (1-indexed)."""
    start = (page - 1) * page_size
    return items[start: start + page_size]


async def get_connection_recommendations(
    user_id: ObjectId,
    top_n: int = 5,
    filters: Optional[RecommendationFilters] = None,
    page: int = 1,
    page_size: int = 10,
) -> Dict[str, Any]:
    """
    Return paginated AI-generated connection recommendations for a user.

    Returns a dict with keys:
      - items   : list of recommendation dicts (this page only)
      - total   : total number of matches (before pagination)
    """
    profiles_col = get_collection("profiles")

    target_profile = await profiles_col.find_one({"user_id": user_id})
    if not target_profile:
        logger.warning("No profile found for user_id=%s – returning empty recommendations", user_id)
        return {"items": [], "total": 0}

    query = _build_candidate_query(user_id, filters)
    cursor = profiles_col.find(query)
    candidates = await cursor.to_list(length=500)

    logger.info(
        "Recommendation generation | user_id=%s | candidates_found=%d | top_n=%d",
        user_id, len(candidates), top_n,
    )

    # Run ML engine (returns up to top_n=500 so we can paginate afterwards)
    all_recs = calculate_recommendations(target_profile, candidates, top_n=len(candidates) or 1)

    sort_by = filters.sort_by if filters else "score"
    all_recs = _sort_recommendations(all_recs, sort_by)

    total = len(all_recs)
    page_items = _paginate(all_recs, page, page_size)

    # Log activity and persist recommendation history
    await log_activity(
        user_id=user_id,
        action="view_recommendations",
        details={"count": total, "filters": str(filters)},
    )
    for rec in page_items:
        await log_recommendation_history(
            user_id=user_id,
            recommended_user_id=rec["profile"]["user_id"],
            compatibility_score=rec["compatibility_score"],
            match_reason=rec["match_reason"],
        )

    return {"items": page_items, "total": total}


async def get_mentor_recommendations(
    user_id: ObjectId,
    top_n: int = 5,
    filters: Optional[RecommendationFilters] = None,
    page: int = 1,
    page_size: int = 10,
) -> Dict[str, Any]:
    """Return paginated mentor recommendations (only users with role=='Mentor')."""
    profiles_col = get_collection("profiles")

    target_profile = await profiles_col.find_one({"user_id": user_id})
    if not target_profile:
        logger.warning("No profile for user_id=%s – skipping mentor recommendations", user_id)
        return {"items": [], "total": 0}

    query = _build_candidate_query(user_id, filters, require_mentor_role=True)
    cursor = profiles_col.find(query)
    candidates = await cursor.to_list(length=200)

    logger.info(
        "Mentor recommendation | user_id=%s | mentor_candidates=%d",
        user_id, len(candidates),
    )

    all_recs = calculate_recommendations(target_profile, candidates, top_n=len(candidates) or 1)

    sort_by = filters.sort_by if filters else "score"
    all_recs = _sort_recommendations(all_recs, sort_by)

    total = len(all_recs)
    page_items = _paginate(all_recs, page, page_size)

    await log_activity(
        user_id=user_id,
        action="get_mentor_matches",
        details={"count": total},
    )
    for rec in page_items:
        await log_recommendation_history(
            user_id=user_id,
            recommended_user_id=rec["profile"]["user_id"],
            compatibility_score=rec["compatibility_score"],
            match_reason=rec["match_reason"],
        )

    return {"items": page_items, "total": total}


async def predict_collaboration_compatibility(
    user_id: ObjectId,
    candidate_id: ObjectId,
) -> Optional[Dict[str, Any]]:
    """Calculate pairwise collaboration compatibility score between two users."""
    profiles_col = get_collection("profiles")

    target_profile = await profiles_col.find_one({"user_id": user_id})
    candidate_profile = await profiles_col.find_one({"user_id": candidate_id})

    if not target_profile or not candidate_profile:
        logger.warning(
            "Collaboration predict failed: missing profile | user=%s | candidate=%s",
            user_id, candidate_id,
        )
        return None

    recs = calculate_recommendations(target_profile, [candidate_profile], top_n=1)
    if not recs:
        return None

    rec = recs[0]

    await log_activity(
        user_id=user_id,
        action="predict_collaboration",
        details={
            "candidate_user_id": str(candidate_id),
            "compatibility_score": rec["compatibility_score"],
        },
    )

    logger.info(
        "Collaboration prediction | user=%s | candidate=%s | score=%.1f | label=%s",
        user_id, candidate_id, rec["compatibility_score"], rec.get("label", ""),
    )

    return rec
