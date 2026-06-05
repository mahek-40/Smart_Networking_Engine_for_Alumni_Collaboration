"""
Analytics Router — Dashboard metrics and aggregations.

Endpoints:
  GET /api/analytics/overview              — platform counts + recent activity
  GET /api/analytics/skills                — top 10 skills across all profiles
  GET /api/analytics/industries            — top 10 industries across all profiles
  GET /api/analytics/recommendations-summary — recommendation generation stats
  GET /api/analytics/top-mentors           — highest-recommended mentors
"""
from fastapi import APIRouter, Depends

from app.auth.deps import get_current_user
from app.database.connection import get_collection
from app.models.user import UserResponse
from app.utils.responses import success_response
from app.utils.logger import get_logger

logger = get_logger(__name__)

router = APIRouter(prefix="/analytics", tags=["Dashboard & Analytics"])


@router.get(
    "/overview",
    summary="Platform overview metrics",
    description="Returns user counts by role, total recommendations generated, activity counts, and the 5 most recent activity logs.",
)
async def get_overview(current_user: UserResponse = Depends(get_current_user)):
    users_col = get_collection("users")
    profiles_col = get_collection("profiles")
    recommendations_col = get_collection("recommendations")
    activities_col = get_collection("activities")

    total_users = await users_col.count_documents({})
    total_students = await profiles_col.count_documents({"role": "Student"})
    total_alumni = await profiles_col.count_documents({"role": "Alumni"})
    total_mentors = await profiles_col.count_documents({"role": "Mentor"})
    total_recs = await recommendations_col.count_documents({})
    total_activities = await activities_col.count_documents({})

    recent_activities_cursor = activities_col.find().sort("timestamp", -1).limit(5)
    recent_activities = await recent_activities_cursor.to_list(length=5)
    for act in recent_activities:
        act["_id"] = str(act["_id"])
        act["user_id"] = str(act["user_id"])
        if "timestamp" in act and hasattr(act["timestamp"], "isoformat"):
            act["timestamp"] = act["timestamp"].isoformat()

    data = {
        "metrics": {
            "total_users": total_users,
            "roles": {
                "students": total_students,
                "alumni": total_alumni,
                "mentors": total_mentors,
            },
            "recommendations_generated": total_recs,
            "activities_logged": total_activities,
        },
        "recent_activities": recent_activities,
    }

    logger.info("Analytics overview requested | user=%s", current_user.id)
    return success_response(data=data, message="Dashboard overview data compiled successfully")


@router.get(
    "/skills",
    summary="Top 10 skills across all profiles",
    description="Aggregates all profile skill tags and returns the 10 most common ones with counts.",
)
async def get_top_skills(current_user: UserResponse = Depends(get_current_user)):
    profiles_col = get_collection("profiles")

    pipeline = [
        {"$unwind": "$skills"},
        {"$group": {"_id": "$skills", "count": {"$sum": 1}}},
        {"$sort": {"count": -1}},
        {"$limit": 10},
        {"$project": {"_id": 0, "skill": "$_id", "count": 1}},
    ]

    cursor = profiles_col.aggregate(pipeline)
    results = await cursor.to_list(length=10)
    return success_response(data=results, message="Top 10 skills aggregated successfully")


@router.get(
    "/industries",
    summary="Top 10 industries across all profiles",
    description="Aggregates profile industry fields and returns the 10 most common industries with user counts.",
)
async def get_top_industries(current_user: UserResponse = Depends(get_current_user)):
    profiles_col = get_collection("profiles")

    pipeline = [
        {"$match": {"industry": {"$nin": ["", None]}}},
        {"$group": {"_id": "$industry", "count": {"$sum": 1}}},
        {"$sort": {"count": -1}},
        {"$limit": 10},
        {"$project": {"_id": 0, "industry": "$_id", "count": 1}},
    ]

    cursor = profiles_col.aggregate(pipeline)
    results = await cursor.to_list(length=10)
    return success_response(data=results, message="Top 10 industries aggregated successfully")


@router.get(
    "/recommendations-summary",
    summary="Recommendation engine usage statistics",
    description=(
        "Returns aggregate recommendation metrics: total generated, "
        "unique users who received recommendations, and average compatibility score."
    ),
)
async def get_recommendations_summary(current_user: UserResponse = Depends(get_current_user)):
    recommendations_col = get_collection("recommendations")

    total = await recommendations_col.count_documents({})

    # Count distinct users who have received at least one recommendation
    unique_users_pipeline = [
        {"$group": {"_id": "$user_id"}},
        {"$count": "unique_users"},
    ]
    unique_cursor = recommendations_col.aggregate(unique_users_pipeline)
    unique_result = await unique_cursor.to_list(length=1)
    unique_users = unique_result[0]["unique_users"] if unique_result else 0

    # Average compatibility score
    avg_pipeline = [
        {"$group": {"_id": None, "avg_score": {"$avg": "$compatibility_score"}}},
    ]
    avg_cursor = recommendations_col.aggregate(avg_pipeline)
    avg_result = await avg_cursor.to_list(length=1)
    avg_score = round(avg_result[0]["avg_score"], 1) if avg_result and avg_result[0]["avg_score"] else 0.0

    data = {
        "total_recommendations_generated": total,
        "unique_users_with_recommendations": unique_users,
        "average_compatibility_score": avg_score,
    }
    return success_response(data=data, message="Recommendation summary compiled successfully")


@router.get(
    "/top-mentors",
    summary="Top recommended mentors",
    description=(
        "Returns the top 5 mentors ranked by how frequently they appear "
        "in recommendation results, with their average compatibility scores."
    ),
)
async def get_top_mentors(current_user: UserResponse = Depends(get_current_user)):
    recommendations_col = get_collection("recommendations")
    profiles_col = get_collection("profiles")

    # Aggregate the most-recommended users
    pipeline = [
        {
            "$group": {
                "_id": "$recommended_user_id",
                "times_recommended": {"$sum": 1},
                "avg_score": {"$avg": "$compatibility_score"},
            }
        },
        {"$sort": {"times_recommended": -1}},
        {"$limit": 5},
    ]

    cursor = recommendations_col.aggregate(pipeline)
    top_users = await cursor.to_list(length=5)

    # Enrich with profile data and filter to Mentors only
    result = []
    for entry in top_users:
        profile = await profiles_col.find_one(
            {"user_id": entry["_id"], "role": "Mentor"},
            {"full_name": 1, "industry": 1, "skills": 1, "experience_years": 1, "_id": 0},
        )
        if profile:
            result.append({
                "full_name": profile.get("full_name"),
                "industry": profile.get("industry"),
                "skills": profile.get("skills", [])[:5],
                "experience_years": profile.get("experience_years", 0),
                "times_recommended": entry["times_recommended"],
                "avg_compatibility_score": round(entry["avg_score"], 1),
            })

    return success_response(data=result, message="Top mentors by recommendation frequency")
