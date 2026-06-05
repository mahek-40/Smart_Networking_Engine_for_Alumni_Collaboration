"""
Notifications Router — User notification management.
"""
from datetime import datetime
from bson import ObjectId
from fastapi import APIRouter, Depends, Query, status

from app.auth.deps import get_current_user
from app.database.connection import get_collection
from app.models.user import UserResponse
from app.utils.responses import success_response, error_response, paginated_response
from app.utils.logger import get_logger

logger = get_logger(__name__)

router = APIRouter(prefix="/notifications", tags=["Notifications"])


@router.get(
    "/",
    summary="Get my notifications",
    description="Get all notifications for the current user with pagination",
)
async def get_notifications(
    page: int = Query(1, ge=1),
    page_size: int = Query(50, ge=1, le=100),
    unread_only: bool = Query(False, description="Filter for unread notifications only"),
    current_user: UserResponse = Depends(get_current_user),
):
    notifications_col = get_collection("notifications")
    profiles_col = get_collection("profiles")
    
    current_obj_id = ObjectId(current_user.id)
    
    query = {"user_id": current_obj_id}
    if unread_only:
        query["read"] = False
    
    total = await notifications_col.count_documents(query)
    skip = (page - 1) * page_size
    
    cursor = notifications_col.find(query).sort("created_at", -1).skip(skip).limit(page_size)
    notifications = await cursor.to_list(length=page_size)
    
    # Enrich with profile data
    result = []
    for notif in notifications:
        notif["_id"] = str(notif["_id"])
        notif["user_id"] = str(notif["user_id"])
        
        if "from_user_id" in notif and notif["from_user_id"]:
            notif["from_user_id"] = str(notif["from_user_id"])
            # Fetch sender profile
            sender_profile = await profiles_col.find_one({"user_id": ObjectId(notif["from_user_id"])})
            if sender_profile:
                notif["from_user_name"] = sender_profile.get("full_name", "Unknown")
                notif["from_user_avatar"] = f"https://api.dicebear.com/8.x/avataaars/svg?seed={sender_profile.get('full_name', 'user')}"
        
        if "created_at" in notif and hasattr(notif["created_at"], "isoformat"):
            notif["created_at"] = notif["created_at"].isoformat()
        
        result.append(notif)
    
    unread_count = await notifications_col.count_documents({"user_id": current_obj_id, "read": False})
    
    return paginated_response(
        data=result,
        total=total,
        page=page,
        page_size=page_size,
        message=f"Found {total} notifications ({unread_count} unread)"
    )


@router.put(
    "/mark-read/{notification_id}",
    summary="Mark notification as read",
    description="Mark a specific notification as read",
)
async def mark_notification_read(
    notification_id: str,
    current_user: UserResponse = Depends(get_current_user),
):
    notifications_col = get_collection("notifications")
    
    try:
        notif_obj_id = ObjectId(notification_id)
    except Exception:
        return error_response("Invalid notification ID format", status_code=status.HTTP_400_BAD_REQUEST)
    
    notification = await notifications_col.find_one({"_id": notif_obj_id})
    
    if not notification:
        return error_response("Notification not found", status_code=status.HTTP_404_NOT_FOUND)
    
    if str(notification["user_id"]) != current_user.id:
        return error_response("Unauthorized", status_code=status.HTTP_403_FORBIDDEN)
    
    await notifications_col.update_one(
        {"_id": notif_obj_id},
        {"$set": {"read": True}}
    )
    
    logger.info("Notification marked as read | notification_id=%s", notification_id)
    return success_response(message="Notification marked as read")


@router.put(
    "/mark-all-read",
    summary="Mark all notifications as read",
    description="Mark all notifications for the current user as read",
)
async def mark_all_notifications_read(
    current_user: UserResponse = Depends(get_current_user),
):
    notifications_col = get_collection("notifications")
    
    current_obj_id = ObjectId(current_user.id)
    
    result = await notifications_col.update_many(
        {"user_id": current_obj_id, "read": False},
        {"$set": {"read": True}}
    )
    
    logger.info("All notifications marked as read | user_id=%s | count=%d", current_user.id, result.modified_count)
    return success_response(
        data={"marked_count": result.modified_count},
        message=f"Marked {result.modified_count} notifications as read"
    )


@router.delete(
    "/{notification_id}",
    summary="Delete notification",
    description="Delete a specific notification",
)
async def delete_notification(
    notification_id: str,
    current_user: UserResponse = Depends(get_current_user),
):
    notifications_col = get_collection("notifications")
    
    try:
        notif_obj_id = ObjectId(notification_id)
    except Exception:
        return error_response("Invalid notification ID format", status_code=status.HTTP_400_BAD_REQUEST)
    
    notification = await notifications_col.find_one({"_id": notif_obj_id})
    
    if not notification:
        return error_response("Notification not found", status_code=status.HTTP_404_NOT_FOUND)
    
    if str(notification["user_id"]) != current_user.id:
        return error_response("Unauthorized", status_code=status.HTTP_403_FORBIDDEN)
    
    await notifications_col.delete_one({"_id": notif_obj_id})
    
    logger.info("Notification deleted | notification_id=%s", notification_id)
    return success_response(message="Notification deleted successfully")


@router.get(
    "/unread-count",
    summary="Get unread notification count",
    description="Get the count of unread notifications for the current user",
)
async def get_unread_count(
    current_user: UserResponse = Depends(get_current_user),
):
    notifications_col = get_collection("notifications")
    
    current_obj_id = ObjectId(current_user.id)
    count = await notifications_col.count_documents({"user_id": current_obj_id, "read": False})
    
    return success_response(
        data={"unread_count": count},
        message=f"You have {count} unread notifications"
    )
