from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, Field, EmailStr
from app.utils.mongo import PyObjectId

class ProfileUpdate(BaseModel):
    full_name: Optional[str] = Field(None, description="Updated full name of the user")
    role: Optional[str] = Field(None, description="Role: e.g., 'Student', 'Alumni', 'Mentor'")
    skills: Optional[List[str]] = Field(None, description="List of technical/soft skills")
    interests: Optional[List[str]] = Field(None, description="List of professional/academic interests")
    industry: Optional[str] = Field(None, description="Industry sector: e.g., 'Software Development', 'Finance'")
    career_goals: Optional[str] = Field(None, description="Short summary of professional or collaboration goals")
    bio: Optional[str] = Field(None, description="Short personal/professional biography")
    graduation_year: Optional[int] = Field(None, description="Year of graduation")
    experience_years: Optional[int] = Field(None, description="Years of professional experience")

class ProfileResponse(BaseModel):
    id: PyObjectId = Field(alias="_id")
    user_id: PyObjectId
    email: EmailStr
    full_name: str
    role: str
    skills: List[str] = []
    interests: List[str] = []
    industry: str = ""
    career_goals: str = ""
    bio: str = ""
    graduation_year: Optional[int] = None
    experience_years: int = 0
    created_at: datetime
    updated_at: datetime

    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True

class ProfileInDB(BaseModel):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    user_id: PyObjectId
    email: EmailStr
    full_name: str
    role: str = "Alumni"
    skills: List[str] = []
    interests: List[str] = []
    industry: str = ""
    career_goals: str = ""
    bio: str = ""
    graduation_year: Optional[int] = None
    experience_years: int = 0
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
