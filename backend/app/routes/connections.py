"""
Connections Router — send, accept, reject, and query connection requests.

Endpoints:
  POST /api/connections/request/{target_user_id}   — send a connection request
  PUT  /api/connections/accept/{connection_id}      — accept a pending request
  PUT  /api/connections/reject/{connection_id}      — reject a pending request
  GET  /api/connections/my-connections              — list all accepted connections
  GET  /api/connections/pending                     — sent + received pending requests
  GET  /api/connections/status/{target_user_id}     — status with a specific user
"""
from datetime import datetime

from bson import ObjectId
from fastapi import APIRouter, Depends, status

from app.auth.deps import get_current_user
from app.database.connection import get_collection
from app.models.user import UserResponse
from app.utils.logger import get_logger
from app.utils.responses import success_response, error_response

logger = get_logger(__name__)

router = APIRouter(prefix="/connections", tags=["Connections"])


def _serialize(doc: dict) -> dict:
    """Convert ObjectId fields in a MongoDB document to strings."""
    return {
        "id": str(doc["_id"]),
        "from_user_id": str(doc["from_user_id"]),
        "to_user_id": str(doc["to_user_id"]),
        "status": doc["status"],
        "created_at": doc.get("created_at", datetime.utcnow()).isoformat(),
        "updated_at": doc.get("updated_at", datetime.utcnow()).isoformat(),
    }


# ─── Send Request ─────────────────────────────────────────────────────────────

@router.post(
    "/request/{target_user_id}",
    status_code=status.HTTP_201_CREATED,
    summary="Send a connection request",
)
async def send_request(
    target_user_id: str,
    current_user: UserResponse = Depends(get_current_user),
):
    # Validate target ID
    try:
        target_obj_id = ObjectId(target_user_id)
    except Exception:
        return error_response("Invalid user ID format", status_code=400)

    me = ObjectId(current_user.id)

    if me == target_obj_id:
        return error_response("You cannot connect with yourself", status_code=400)

    col = get_collection("connections")

    # Check if a connection already exists in either direction
    existing = await col.find_one({
        "$or": [
            {"from_user_id": me, "to_user_id": target_obj_id},
            {"from_user_id": target_obj_id, "to_user_id": me},
        ]
    })
    if existing:
        return error_response(
            f"A connection request already exists (status: {existing['status']})",
            status_code=409,
        )

    # Verify target user exists
    users_col = get_collection("users")
    target_user = await users_col.find_one({"_id": target_obj_id})
    if not target_user:
        return error_response("Target user not found", status_code=404)

    now = datetime.utcnow()
    doc = {
        "_id": ObjectId(),
        "from_user_id": me,
        "to_user_id": target_obj_id,
        "status": "pending",
        "created_at": now,
        "updated_at": now,
    }
    await col.insert_one(doc)
    logger.info("Connection request | from=%s → to=%s", current_user.id, target_user_id)

    return success_response(
        data=_serialize(doc),
        message="Connection request sent",
        status_code=status.HTTP_201_CREATED,
    )


# ─── Accept ───────────────────────────────────────────────────────────────────

@router.put("/accept/{connection_id}", summary="Accept a connection request")
async def accept_request(
    connection_id: str,
    current_user: UserResponse = Depends(get_current_user),
):
    try:
        conn_obj_id = ObjectId(connection_id)
    except Exception:
        return error_response("Invalid connection ID format", status_code=400)

    col = get_collection("connections")
    conn = await col.find_one({"_id": conn_obj_id})

    if not conn:
        return error_response("Connection request not found", status_code=404)
    if str(conn["to_user_id"]) != current_user.id:
        return error_response("You are not the recipient of this request", status_code=403)
    if conn["status"] != "pending":
        return error_response(f"Request is already {conn['status']}", status_code=409)

    now = datetime.utcnow()
    await col.update_one(
        {"_id": conn_obj_id},
        {"$set": {"status": "accepted", "updated_at": now}},
    )
    conn["status"] = "accepted"
    conn["updated_at"] = now
    logger.info("Connection accepted | id=%s", connection_id)

    return success_response(data=_serialize(conn), message="Connection accepted")


# ─── Reject ───────────────────────────────────────────────────────────────────

@router.put("/reject/{connection_id}", summary="Reject a connection request")
async def reject_request(
    connection_id: str,
    current_user: UserResponse = Depends(get_current_user),
):
    try:
        conn_obj_id = ObjectId(connection_id)
    except Exception:
        return error_response("Invalid connection ID format", status_code=400)

    col = get_collection("connections")
    conn = await col.find_one({"_id": conn_obj_id})

    if not conn:
        return error_response("Connection request not found", status_code=404)
    if str(conn["to_user_id"]) != current_user.id:
        return error_response("You are not the recipient of this request", status_code=403)
    if conn["status"] != "pending":
        return error_response(f"Request is already {conn['status']}", status_code=409)

    now = datetime.utcnow()
    await col.update_one(
        {"_id": conn_obj_id},
        {"$set": {"status": "rejected", "updated_at": now}},
    )
    conn["status"] = "rejected"
    conn["updated_at"] = now
    logger.info("Connection rejected | id=%s", connection_id)

    return success_response(data=_serialize(conn), message="Connection rejected")


# ─── My Connections ───────────────────────────────────────────────────────────

@router.get("/my-connections", summary="Get all accepted connections")
async def get_my_connections(
    current_user: UserResponse = Depends(get_current_user),
):
    me = ObjectId(current_user.id)
    col = get_collection("connections")

    cursor = col.find({
        "$or": [
            {"from_user_id": me, "status": "accepted"},
            {"to_user_id": me, "status": "accepted"},
        ]
    })
    docs = await cursor.to_list(length=200)
    return success_response(
        data=[_serialize(d) for d in docs],
        message=f"Found {len(docs)} connections",
    )


# ─── Pending ──────────────────────────────────────────────────────────────────

@router.get("/pending", summary="Get pending connection requests")
async def get_pending(
    current_user: UserResponse = Depends(get_current_user),
):
    me = ObjectId(current_user.id)
    col = get_collection("connections")

    received_cursor = col.find({"to_user_id": me, "status": "pending"})
    sent_cursor = col.find({"from_user_id": me, "status": "pending"})

    received = await received_cursor.to_list(length=100)
    sent = await sent_cursor.to_list(length=100)

    return success_response(
        data={
            "received": [_serialize(d) for d in received],
            "sent": [_serialize(d) for d in sent],
        },
        message="Pending requests fetched",
    )


# ─── Status with a specific user ──────────────────────────────────────────────

@router.get("/status/{target_user_id}", summary="Get connection status with a user")
async def get_status(
    target_user_id: str,
    current_user: UserResponse = Depends(get_current_user),
):
    try:
        target_obj_id = ObjectId(target_user_id)
    except Exception:
        return error_response("Invalid user ID format", status_code=400)

    me = ObjectId(current_user.id)
    col = get_collection("connections")

    conn = await col.find_one({
        "$or": [
            {"from_user_id": me, "to_user_id": target_obj_id},
            {"from_user_id": target_obj_id, "to_user_id": me},
        ]
    })

    if not conn:
        return success_response(data={"status": "none"}, message="No connection found")

    return success_response(
        data={
            "status": conn["status"],
            "connection_id": str(conn["_id"]),
            "initiated_by_me": str(conn["from_user_id"]) == current_user.id,
        },
        message=f"Connection status: {conn['status']}",
    )
