from datetime import datetime
from typing import Dict, Any, Optional
from pydantic import BaseModel, Field
from app.utils.mongo import PyObjectId

class ActivityInDB(BaseModel):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    user_id: PyObjectId
    action: str = Field(..., description="Action name: e.g., 'view_recommendations', 'search_profiles', 'login'")
    details: Optional[Dict[str, Any]] = Field(default_factory=dict, description="Metadata associated with the action")
    timestamp: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True

class RecommendationLogInDB(BaseModel):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    user_id: PyObjectId
    recommended_user_id: PyObjectId
    compatibility_score: float
    match_reason: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
