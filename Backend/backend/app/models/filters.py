from typing import Optional, List
from pydantic import BaseModel, Field


class RecommendationFilters(BaseModel):
    """Query filters that can be applied to recommendation endpoints."""
    industry: Optional[str] = Field(None, description="Filter by industry (case-insensitive)")
    role: Optional[str] = Field(None, description="Filter by role: Alumni, Student, Mentor")
    min_experience: Optional[int] = Field(None, ge=0, description="Minimum years of experience")
    max_experience: Optional[int] = Field(None, ge=0, description="Maximum years of experience")
    skills: Optional[List[str]] = Field(None, description="Require at least one of these skills")
    interests: Optional[List[str]] = Field(None, description="Require at least one of these interests")
    sort_by: Optional[str] = Field(
        "score",
        description="Sort field: 'score' (default), 'experience', 'industry_match'",
    )
