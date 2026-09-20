import logging
from typing import List
from fastapi import APIRouter, Depends, HTTPException
from backend.app.core.auth import get_current_user, AuthenticatedUser
from backend.app.schemas.chat import (
    Conversation,
    ConversationCreate,
    ConversationUpdate,
    SendMessageRequest,
    ChatCompletionResponse,
    ChatMessage,
)
from backend.app.repositories.chat import chat_repo
from backend.app.services.ai.chat import chat_service

logger = logging.getLogger("matchmyvibe.api.chat")

router = APIRouter(prefix="/chat", tags=["AI Chat"])


@router.get("/conversations", response_model=List[Conversation])
async def list_conversations(user: AuthenticatedUser = Depends(get_current_user)):
    """List all AI conversations belonging to the authenticated student."""
    return chat_repo.list_conversations(user.id)


@router.post("/conversations", response_model=Conversation)
async def create_conversation(
    payload: ConversationCreate,
    user: AuthenticatedUser = Depends(get_current_user),
):
    """Start a new empty AI conversation."""
    return chat_repo.create_conversation(user.id, title=payload.title or "New Conversation")


@router.get("/conversations/{conversation_id}", response_model=Conversation)
async def get_conversation(
    conversation_id: str,
    user: AuthenticatedUser = Depends(get_current_user),
):
    """Get conversation details and full message history."""
    conv = chat_repo.get_conversation(user.id, conversation_id)
    if not conv:
        raise HTTPException(status_code=404, detail="Conversation not found.")
    messages = chat_repo.get_messages(user.id, conversation_id)
    return {**conv, "messages": messages}


@router.patch("/conversations/{conversation_id}", response_model=Conversation)
async def update_conversation(
    conversation_id: str,
    payload: ConversationUpdate,
    user: AuthenticatedUser = Depends(get_current_user),
):
    """Rename a conversation title."""
    updated = chat_repo.update_conversation_title(user.id, conversation_id, payload.title)
    if not updated:
        raise HTTPException(status_code=404, detail="Conversation not found.")
    return updated


@router.delete("/conversations/{conversation_id}")
async def delete_conversation(
    conversation_id: str,
    user: AuthenticatedUser = Depends(get_current_user),
):
    """Delete a conversation and its messages."""
    success = chat_repo.delete_conversation(user.id, conversation_id)
    if not success:
        raise HTTPException(status_code=404, detail="Conversation not found.")
    return {"success": True, "message": "Conversation deleted successfully."}


@router.post("/message", response_model=ChatCompletionResponse)
async def send_message(
    payload: SendMessageRequest,
    user: AuthenticatedUser = Depends(get_current_user),
):
    """
    Send a message to MatchMyVibe AI.
    Executes project-only guardrails, grounded retrieval, and multi-provider failover.
    """
    user_info = {
        "id": user.id,
        "name": user.name,
        "full_name": user.full_name,
        "branch": user.branch,
        "batch": user.batch,
    }
    return await chat_service.process_chat(
        user_id=user.id,
        query=payload.content,
        conversation_id=payload.conversation_id,
        user_info=user_info,
    )
