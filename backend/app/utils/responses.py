"""
Unified JSON response helpers for all API endpoints.

All responses follow the shape:
  {
    "success": true | false,
    "message": "Human-readable message",
    "timestamp": "2026-06-04T10:00:00Z",
    "data": { ... },            # success only
    "pagination": { ... },      # paginated endpoints only
    "details": { ... }          # error only (validation details etc.)
  }
"""
import math
from datetime import datetime, timezone
from typing import Any, Dict, Optional

from bson import ObjectId
from fastapi.encoders import jsonable_encoder
from fastapi.responses import JSONResponse


def _encode(data: Any) -> Any:
    """Recursively JSON-encode data, converting ObjectId → str."""
    return jsonable_encoder(data, custom_encoder={ObjectId: str})


def _now_iso() -> str:
    """Return the current UTC time as an ISO-8601 string."""
    return datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")


def success_response(
    data: Any = None,
    message: str = "Success",
    status_code: int = 200,
    pagination: Optional[Dict[str, Any]] = None,
) -> JSONResponse:
    """
    Return a standard success JSON response.

    Example:
      {
        "success": true,
        "message": "Login successful",
        "timestamp": "2026-06-04T10:00:00Z",
        "data": { "access_token": "...", "user": {...} }
      }
    """
    content: Dict[str, Any] = {
        "success": True,
        "message": message,
        "timestamp": _now_iso(),
    }
    if data is not None:
        content["data"] = _encode(data)
    if pagination is not None:
        content["pagination"] = _encode(pagination)

    return JSONResponse(status_code=status_code, content=content)


def error_response(
    message: str = "An error occurred",
    status_code: int = 400,
    details: Any = None,
) -> JSONResponse:
    """
    Return a standard error JSON response.

    Example:
      {
        "success": false,
        "message": "Invalid email or password",
        "timestamp": "2026-06-04T10:00:00Z"
      }
    """
    content: Dict[str, Any] = {
        "success": False,
        "message": message,
        "timestamp": _now_iso(),
    }
    if details is not None:
        content["details"] = _encode(details)

    return JSONResponse(status_code=status_code, content=content)


def paginated_response(
    data: Any,
    total: int,
    page: int,
    page_size: int,
    message: str = "Success",
    status_code: int = 200,
) -> JSONResponse:
    """
    Return a success response with a pagination metadata block.

    Example pagination block:
      {
        "page": 1,
        "page_size": 10,
        "total": 47,
        "total_pages": 5
      }
    """
    total_pages = math.ceil(total / page_size) if page_size > 0 else 1
    pagination = {
        "page": page,
        "page_size": page_size,
        "total": total,
        "total_pages": total_pages,
    }
    return success_response(
        data=data,
        message=message,
        status_code=status_code,
        pagination=pagination,
    )
