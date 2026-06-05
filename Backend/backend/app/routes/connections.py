"""
Connections Router — Network management endpoints.
"""
from datetime import datetime
from typing import Optional
from bson import ObjectId
from fastapi import APIRouter, Depends, Query, status

from app.auth.deps import get_current_user
from app.database.connection import get_collection
from app.models.user import UserResponse
from app.utils.responses import success_response, error_response, paginated_response
from app.utils.logger import get_logger

logger = get_logger(__name__)

router = APIRouter(prefix="/connections", tags=["Connections"])


@router.post(
    "/request/{target_user_id}",
    summary="Send connection request",
    description="Send a connection request to another user",
)
async def send_connection_request(
    target_user_id: str,
    current_user: UserResponse = Depends(get_current_user),
):
    connections_col = get_collection("connections")
    
    try:
        target_obj_id = ObjectId(target_user_id)
        current_obj_id = ObjectId(current_user.id)
    except Exception:
        return error_response("Invalid user ID format", status_code=status.HTTP_400_BAD_REQUEST)
    
    if target_obj_id == current_obj_id:
        return error_response("Cannot connect with yourself", status_code=status.HTTP_400_BAD_REQUEST)
    
    # Check if connection already exists
    existing = await connections_col.find_one({
        "$or": [
            {"requester_id": current_obj_id, "target_id": target_obj_id},
            {"requester_id": target_obj_id, "target_id": current_obj_id},
        ]
    })
    
    if existing:
        return error_response(
            f"Connection already exists with status: {existing.get('status')}",
            status_code=status.HTTP_400_BAD_REQUEST
        )
    
    # Create connection request
    connection = {
        "requester_id": current_obj_id,
        "target_id": target_obj_id,
        "status": "pending",
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow(),
    }
    
    result = await connections_col.insert_one(connection)
    
    # Create notification for target user
    notifications_col = get_collection("notifications")
    notification = {
        "user_id": target_obj_id,
        "type": "connection_request",
        "from_user_id": current_obj_id,
        "message": f"{current_user.full_name} sent you a connection request",
        "read": False,
        "created_at": datetime.utcnow(),
    }
    await notifications_col.insert_one(notification)
    
    logger.info("Connection request sent | from=%s | to=%s", current_user.id, target_user_id)
    return success_response(
        data={"connection_id": str(result.inserted_id), "status": "pending"},
        message="Connection request sent successfully"
    )


@router.put(
    "/accept/{connection_id}",
    summary="Accept connection request",
    description="Accept a pending connection request",
)
async def accept_connection(
    connection_id: str,
    current_user: UserResponse = Depends(get_current_user),
):
    connections_col = get_collection("connections")
    
    try:
        conn_obj_id = ObjectId(connection_id)
    except Exception:
        return error_response("Invalid connection ID format", status_code=status.HTTP_400_BAD_REQUEST)
    
    connection = await connections_col.find_one({"_id": conn_obj_id})
    
    if not connection:
        return error_response("Connection not found", status_code=status.HTTP_404_NOT_FOUND)
    
    if str(connection["target_id"]) != current_user.id:
        return error_response("You can only accept requests sent to you", status_code=status.HTTP_403_FORBIDDEN)
    
    await connections_col.update_one(
        {"_id": conn_obj_id},
        {"$set": {"status": "accepted", "updated_at": datetime.utcnow()}}
    )
    
    # Create notification for requester
    notifications_col = get_collection("notifications")
    notification = {
        "user_id": connection["requester_id"],
        "type": "connection_accepted",
        "from_user_id": ObjectId(current_user.id),
        "message": f"{current_user.full_name} accepted your connection request",
        "read": False,
        "created_at": datetime.utcnow(),
    }
    await notifications_col.insert_one(notification)
    
    logger.info("Connection accepted | connection_id=%s", connection_id)
    return success_response(message="Connection accepted successfully")


@router.put(
    "/reject/{connection_id}",
    summary="Reject connection request",
    description="Reject a pending connection request",
)
async def reject_connection(
    connection_id: str,
    current_user: UserResponse = Depends(get_current_user),
):
    connections_col = get_collection("connections")
    
    try:
        conn_obj_id = ObjectId(connection_id)
    except Exception:
        return error_response("Invalid connection ID format", status_code=status.HTTP_400_BAD_REQUEST)
    
    connection = await connections_col.find_one({"_id": conn_obj_id})
    
    if not connection:
        return error_response("Connection not found", status_code=status.HTTP_404_NOT_FOUND)
    
    if str(connection["target_id"]) != current_user.id:
        return error_response("You can only reject requests sent to you", status_code=status.HTTP_403_FORBIDDEN)
    
    await connections_col.update_one(
        {"_id": conn_obj_id},
        {"$set": {"status": "rejected", "updated_at": datetime.utcnow()}}
    )
    
    logger.info("Connection rejected | connection_id=%s", connection_id)
    return success_response(message="Connection rejected successfully")


@router.get(
    "/my-connections",
    summary="Get my connections",
    description="Get all accepted connections for the current user",
)
async def get_my_connections(
    page: int = Query(1, ge=1),
    page_size: int = Query(50, ge=1, le=100),
    current_user: UserResponse = Depends(get_current_user),
):
    connections_col = get_collection("connections")
    profiles_col = get_collection("profiles")
    
    current_obj_id = ObjectId(current_user.id)
    
    query = {
        "$or": [
            {"requester_id": current_obj_id, "status": "accepted"},
            {"target_id": current_obj_id, "status": "accepted"},
        ]
    }
    
    total = await connections_col.count_documents(query)
    skip = (page - 1) * page_size
    
    cursor = connections_col.find(query).skip(skip).limit(page_size)
    connections = await cursor.to_list(length=page_size)
    
    # Fetch profiles for connected users
    result = []
    for conn in connections:
        other_user_id = conn["target_id"] if conn["requester_id"] == current_obj_id else conn["requester_id"]
        profile = await profiles_col.find_one({"user_id": other_user_id})
        
        if profile:
            profile["_id"] = str(profile["_id"])
            profile["user_id"] = str(profile["user_id"])
            if "created_at" in profile and hasattr(profile["created_at"], "isoformat"):
                profile["created_at"] = profile["created_at"].isoformat()
            if "updated_at" in profile and hasattr(profile["updated_at"], "isoformat"):
                profile["updated_at"] = profile["updated_at"].isoformat()
            result.append(profile)
    
    return paginated_response(
        data=result,
        total=total,
        page=page,
        page_size=page_size,
        message=f"Found {total} connections"
    )


@router.get(
    "/pending",
    summary="Get pending connection requests",
    description="Get all pending connection requests (sent and received)",
)
async def get_pending_connections(
    current_user: UserResponse = Depends(get_current_user),
):
    connections_col = get_collection("connections")
    profiles_col = get_collection("profiles")
    
    current_obj_id = ObjectId(current_user.id)
    
    # Requests received by me
    received_cursor = connections_col.find({
        "target_id": current_obj_id,
        "status": "pending"
    })
    received = await received_cursor.to_list(length=100)
    
    # Requests sent by me
    sent_cursor = connections_col.find({
        "requester_id": current_obj_id,
        "status": "pending"
    })
    sent = await sent_cursor.to_list(length=100)
    
    # Fetch profiles
    received_profiles = []
    for conn in received:
        profile = await profiles_col.find_one({"user_id": conn["requester_id"]})
        if profile:
            profile["_id"] = str(profile["_id"])
            profile["user_id"] = str(profile["user_id"])
            profile["connection_id"] = str(conn["_id"])
            received_profiles.append(profile)
    
    sent_profiles = []
    for conn in sent:
        profile = await profiles_col.find_one({"user_id": conn["target_id"]})
        if profile:
            profile["_id"] = str(profile["_id"])
            profile["user_id"] = str(profile["user_id"])
            profile["connection_id"] = str(conn["_id"])
            sent_profiles.append(profile)
    
    return success_response(
        data={
            "received": received_profiles,
            "sent": sent_profiles,
        },
        message="Pending connections retrieved successfully"
    )


@router.get(
    "/status/{target_user_id}",
    summary="Get connection status with a user",
    description="Check connection status with a specific user",
)
async def get_connection_status(
    target_user_id: str,
    current_user: UserResponse = Depends(get_current_user),
):
    connections_col = get_collection("connections")
    
    try:
        target_obj_id = ObjectId(target_user_id)
        current_obj_id = ObjectId(current_user.id)
    except Exception:
        return error_response("Invalid user ID format", status_code=status.HTTP_400_BAD_REQUEST)
    
    connection = await connections_col.find_one({
        "$or": [
            {"requester_id": current_obj_id, "target_id": target_obj_id},
            {"requester_id": target_obj_id, "target_id": current_obj_id},
        ]
    })
    
    if not connection:
        return success_response(data={"status": "none"}, message="No connection exists")
    
    return success_response(
        data={
            "status": connection["status"],
            "connection_id": str(connection["_id"]),
            "is_requester": str(connection["requester_id"]) == current_user.id,
        },
        message="Connection status retrieved"
    )
