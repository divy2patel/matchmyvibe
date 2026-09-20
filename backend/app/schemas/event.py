from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel, Field


class EventBase(BaseModel):
    name: str = Field(..., min_length=2)
    group_id: Optional[str] = None
    description: str
    event_type: str = "meetup"
    event_date: datetime
    location: str
    image_url: Optional[str] = None
    registration_url: Optional[str] = None
    contact_lead: str
    contact_information: Optional[str] = None
    target_audience: str
    is_active: bool = True


class EventCreate(EventBase):
    tags: List[str] = Field(default_factory=list)


class EventUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    event_type: Optional[str] = None
    event_date: Optional[datetime] = None
    location: Optional[str] = None
    image_url: Optional[str] = None
    registration_url: Optional[str] = None
    contact_lead: Optional[str] = None
    contact_information: Optional[str] = None
    target_audience: Optional[str] = None
    is_active: Optional[bool] = None


class EventResponse(EventBase):
    id: str
    tags: List[str] = Field(default_factory=list)
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
