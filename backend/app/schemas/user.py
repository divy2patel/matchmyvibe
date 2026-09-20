from typing import Optional, List, Literal, Any
from datetime import datetime
from pydantic import BaseModel, Field


class ProfileResponse(BaseModel):
    id: str
    user_id: str
    name: str
    full_name: Optional[str] = None
    email: Optional[str] = None
    avatar_url: Optional[str] = None
    bio: Optional[str] = None
    vibe_summary: Optional[str] = None
    batch: Optional[str] = None
    branch: Optional[str] = None
    student_id: Optional[str] = None
    role: Literal["student", "admin"] = "student"
    onboarding_completed: bool = True
    activity_preferences: List[str] = Field(default_factory=list)
    created_at: Optional[datetime] = None


class ProfileUpdate(BaseModel):
    name: Optional[str] = None
    full_name: Optional[str] = None
    batch: Optional[str] = None
    branch: Optional[str] = None
    bio: Optional[str] = None
    avatar_url: Optional[str] = None
    activity_preferences: Optional[List[str]] = None


class SavedItemCreate(BaseModel):
    group_id: Optional[str] = None
    event_id: Optional[str] = None


class SavedItemResponse(BaseModel):
    id: str
    user_id: str
    group_id: Optional[str] = None
    event_id: Optional[str] = None
    item_type: Literal["group", "event"]
    title: str
    category: str
    image_url: Optional[str] = None
    created_at: datetime


class SearchHistoryItem(BaseModel):
    id: str
    query: str
    understood_interests: List[str] = Field(default_factory=list)
    created_at: datetime


class FeedbackCreate(BaseModel):
    recommendation_id: Optional[str] = None
    group_id: Optional[str] = None
    event_id: Optional[str] = None
    feedback: Literal["positive", "negative"]
    user_id: Optional[str] = None
