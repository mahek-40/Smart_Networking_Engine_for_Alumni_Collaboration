"""
Activity service — logs user actions and recommendation history to MongoDB.
"""
from datetime import datetime
from bson import ObjectId

from app.database.connection import get_collection
from app.models.activity import ActivityInDB, RecommendationLogInDB
from app.utils.logger import get_logger

logger = get_logger(__name__)


async def log_activity(user_id: ObjectId, action: str, details: dict = None) -> None:
    """Insert a user activity record into the activities collection."""
    try:
        activities_col = get_collection("activities")
        activity = ActivityInDB(
            user_id=user_id,
            action=action,
            details=details or {},
            timestamp=datetime.utcnow(),
        )
        await activities_col.insert_one(activity.model_dump(by_alias=True))
    except Exception as exc:
        logger.error("Failed to log activity | user=%s | action=%s | error=%s", user_id, action, exc)


async def log_recommendation_history(
    user_id: ObjectId,
    recommended_user_id: ObjectId,
    compatibility_score: float,
    match_reason: str,
) -> None:
    """Persist a single recommendation result to the recommendations history collection."""
    try:
        recommendations_col = get_collection("recommendations")
        rec_log = RecommendationLogInDB(
            user_id=user_id,
            recommended_user_id=recommended_user_id,
            compatibility_score=compatibility_score,
            match_reason=match_reason,
            timestamp=datetime.utcnow(),
        )
        await recommendations_col.insert_one(rec_log.model_dump(by_alias=True))
    except Exception as exc:
        logger.error(
            "Failed to log recommendation history | user=%s | error=%s", user_id, exc
        )
