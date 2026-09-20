from typing import List, Optional, Literal, Dict, Any
from pydantic import BaseModel, Field


class MatchRequest(BaseModel):
    text: str = Field(
        ...,
        min_length=2,
        max_length=1000,
        description="Natural language hobby, interest, or query from student",
    )


class UnderstoodVibe(BaseModel):
    interests: List[str] = Field(default_factory=list, description="Canonical 2-5 interest keywords")
    categories: List[str] = Field(default_factory=list, description="Broader campus categories")
    activity_preferences: List[str] = Field(default_factory=list, description="E.g. collaborative, hands-on")
    social_preference: str = Field(default="low_pressure", description="E.g. introverted, low_pressure, energetic")
    experience_level: str = Field(default="all_levels", description="beginner, intermediate, advanced, all_levels")
    intent: str = Field(default="", description="Understood student intent")
    vibe_summary: str = Field(default="", description="Short badge-style summary e.g. 📸 Creative • 🤝 Social")
    niche_flag: bool = Field(default=False, description="True if student query is unusually specialized")


class RecommendationItem(BaseModel):
    id: str
    type: Literal["group", "event"]
    name: str
    slug: Optional[str] = None
    category: str
    description: str
    image_url: Optional[str] = None
    match_score: float = Field(ge=0.0, le=1.0)
    match_tier: Literal["high", "moderate", "exploratory"]
    match_reason: str
    match_signals: Dict[str, Any] = Field(default_factory=dict)
    location: str
    meeting_information: Optional[str] = None
    event_date: Optional[str] = None
    contact_lead: str
    contact_information: Optional[str] = None
    target_audience: str
    tags: List[str] = Field(default_factory=list)
    icebreakers: List[str] = Field(default_factory=list, description="[Casual, Direct, Gentle]")


class MatchResponseMeta(BaseModel):
    provider_used: str
    fallback_triggered: bool
    fallback_reason: Optional[str] = None
    total_candidates_evaluated: int
    processing_time_ms: int


class MatchResponse(BaseModel):
    success: bool = True
    vibe: UnderstoodVibe
    recommendations: List[RecommendationItem]
    is_fallback: bool = False
    fallback_notice: Optional[str] = None
    meta: MatchResponseMeta
