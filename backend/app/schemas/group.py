from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel, Field


class GroupBase(BaseModel):
    name: str = Field(..., min_length=2)
    slug: str
    description: str
    category: str
    image_url: Optional[str] = None
    location: str
    meeting_information: str
    contact_lead: str
    contact_information: Optional[str] = None
    target_audience: str
    is_active: bool = True


class GroupCreate(GroupBase):
    tags: List[str] = Field(default_factory=list)


class GroupUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    image_url: Optional[str] = None
    location: Optional[str] = None
    meeting_information: Optional[str] = None
    contact_lead: Optional[str] = None
    contact_information: Optional[str] = None
    target_audience: Optional[str] = None
    is_active: Optional[bool] = None


class GroupResponse(GroupBase):
    id: str
    tags: List[str] = Field(default_factory=list)
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
