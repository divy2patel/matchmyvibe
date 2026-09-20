from typing import Optional, List, Literal
from datetime import datetime
from pydantic import BaseModel, Field


MessageRole = Literal["user", "assistant", "system"]


class ChatMessage(BaseModel):
    id: str
    conversation_id: str
    user_id: str
    role: MessageRole
    content: str
    provider: Optional[str] = None
    created_at: datetime


class Conversation(BaseModel):
    id: str
    user_id: str
    title: str
    created_at: datetime
    updated_at: datetime
    messages: Optional[List[ChatMessage]] = None


class ConversationCreate(BaseModel):
    title: Optional[str] = "New Conversation"


class ConversationUpdate(BaseModel):
    title: str = Field(..., min_length=1, max_length=100)


class SendMessageRequest(BaseModel):
    content: str = Field(..., min_length=1, max_length=2000)
    conversation_id: Optional[str] = None


class ChatCompletionResponse(BaseModel):
    conversation_id: str
    message: ChatMessage
    title: Optional[str] = None
    provider: Optional[str] = "gemini"
    is_fallback: bool = False
