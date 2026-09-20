from typing import Optional, Literal
from pydantic import BaseModel, Field


IcebreakerStyle = Literal[
    "casual",
    "friendly",
    "professional",
    "short",
    "introvert",
    "in_person",
]

ChannelType = Literal["whatsapp", "discord", "slack", "plain"]


class IcebreakerRequest(BaseModel):
    item_id: str = Field(..., description="ID of the group or event")
    item_type: Literal["group", "event"] = Field(..., description="'group' or 'event'")
    item_name: str
    category: str
    contact_lead: str
    style: IcebreakerStyle = "casual"
    channel: ChannelType = "whatsapp"
    user_context: Optional[str] = None


class IcebreakerResponse(BaseModel):
    icebreaker: str
    style: IcebreakerStyle
    channel: ChannelType
    formatted_text: str
    whatsapp_share_url: Optional[str] = None
