from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field


class ScoreBreakdown(BaseModel):
    tfidf_similarity: float = Field(..., description="TF-IDF cosine similarity score (0-100)")
    skill_overlap_score: float = Field(..., description="Skill overlap contribution (0-100)")
    interest_overlap_score: float = Field(..., description="Interest overlap contribution (0-100)")
    industry_match_score: float = Field(..., description="Industry match contribution (0-100)")


class RecommendationItem(BaseModel):
    compatibility_score: float = Field(..., description="Overall compatibility score 0-100")
    label: str = Field(..., description="Match quality label: Excellent/Strong/Good/Moderate")
    match_reason: str = Field(..., description="Human-readable explanation of the match")
    score_breakdown: ScoreBreakdown
    skill_overlap: List[str] = Field(default_factory=list)
    interest_overlap: List[str] = Field(default_factory=list)
    profile: Dict[str, Any] = Field(..., description="Candidate's profile data")


class PaginationMeta(BaseModel):
    page: int
    page_size: int
    total: int
    total_pages: int


class RecommendationResponse(BaseModel):
    success: bool = True
    message: str
    data: List[RecommendationItem]
    pagination: PaginationMeta
