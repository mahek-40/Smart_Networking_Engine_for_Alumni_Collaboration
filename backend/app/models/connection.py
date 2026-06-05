"""
Connection Model — represents a connection request between two users.

Status flow:  pending → accepted | rejected
"""
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field
from app.utils.mongo import PyObjectId


class ConnectionInDB(BaseModel):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    from_user_id: PyObjectId       # user who sent the request
    to_user_id: PyObjectId         # user who received the request
    status: str = "pending"        # pending | accepted | rejected
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True


class ConnectionResponse(BaseModel):
    id: str
    from_user_id: str
    to_user_id: str
    status: str
    created_at: datetime
    updated_at: datetime
