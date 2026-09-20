import uuid
import logging
from datetime import datetime, timezone
from typing import List, Dict, Any, Optional
from backend.app.core.database import get_supabase_client

logger = logging.getLogger("matchmyvibe.repo.chat")

# In-memory stores for fallback
_in_memory_conversations: List[Dict[str, Any]] = []
_in_memory_messages: List[Dict[str, Any]] = []


class ChatRepository:
    def list_conversations(self, user_id: str) -> List[Dict[str, Any]]:
        sb = get_supabase_client()
        if sb and user_id != "anonymous":
            try:
                res = (
                    sb.table("conversations")
                    .select("*")
                    .eq("user_id", user_id)
                    .order("updated_at", desc=True)
                    .execute()
                )
                if res.data is not None:
                    return res.data
            except Exception as e:
                logger.warning("Supabase list conversations error: %s", e)

        user_convs = [c for c in _in_memory_conversations if c["user_id"] == user_id]
        return sorted(user_convs, key=lambda x: x["updated_at"], reverse=True)

    def get_conversation(self, user_id: str, conversation_id: str) -> Optional[Dict[str, Any]]:
        sb = get_supabase_client()
        if sb and user_id != "anonymous":
            try:
                res = (
                    sb.table("conversations")
                    .select("*")
                    .eq("id", conversation_id)
                    .eq("user_id", user_id)
                    .execute()
                )
                if res.data and len(res.data) > 0:
                    return res.data[0]
            except Exception as e:
                logger.warning("Supabase get conversation error: %s", e)

        for c in _in_memory_conversations:
            if c["id"] == conversation_id and c["user_id"] == user_id:
                return c
        return None

    def create_conversation(self, user_id: str, title: str = "New Conversation") -> Dict[str, Any]:
        now = datetime.now(timezone.utc)
        conv_id = str(uuid.uuid4())
        record = {
            "id": conv_id,
            "user_id": user_id,
            "title": title,
            "created_at": now.isoformat(),
            "updated_at": now.isoformat(),
        }

        sb = get_supabase_client()
        if sb and user_id != "anonymous":
            try:
                res = sb.table("conversations").insert(record).execute()
                if res.data and len(res.data) > 0:
                    return res.data[0]
            except Exception as e:
                logger.warning("Supabase create conversation error: %s", e)

        _in_memory_conversations.append(record)
        return record

    def update_conversation_title(self, user_id: str, conversation_id: str, title: str) -> Optional[Dict[str, Any]]:
        now = datetime.now(timezone.utc)
        sb = get_supabase_client()
        if sb and user_id != "anonymous":
            try:
                res = (
                    sb.table("conversations")
                    .update({"title": title, "updated_at": now.isoformat()})
                    .eq("id", conversation_id)
                    .eq("user_id", user_id)
                    .execute()
                )
                if res.data and len(res.data) > 0:
                    return res.data[0]
            except Exception as e:
                logger.warning("Supabase update conversation title error: %s", e)

        for c in _in_memory_conversations:
            if c["id"] == conversation_id and c["user_id"] == user_id:
                c["title"] = title
                c["updated_at"] = now.isoformat()
                return c
        return None

    def delete_conversation(self, user_id: str, conversation_id: str) -> bool:
        sb = get_supabase_client()
        if sb and user_id != "anonymous":
            try:
                sb.table("conversations").delete().eq("id", conversation_id).eq("user_id", user_id).execute()
                return True
            except Exception as e:
                logger.warning("Supabase delete conversation error: %s", e)

        global _in_memory_conversations, _in_memory_messages
        initial_len = len(_in_memory_conversations)
        _in_memory_conversations = [
            c for c in _in_memory_conversations
            if not (c["id"] == conversation_id and c["user_id"] == user_id)
        ]
        _in_memory_messages = [
            m for m in _in_memory_messages
            if m["conversation_id"] != conversation_id
        ]
        return len(_in_memory_conversations) < initial_len

    def add_message(
        self,
        conversation_id: str,
        user_id: str,
        role: str,
        content: str,
        provider: Optional[str] = None,
    ) -> Dict[str, Any]:
        now = datetime.now(timezone.utc)
        msg_id = str(uuid.uuid4())
        record = {
            "id": msg_id,
            "conversation_id": conversation_id,
            "user_id": user_id,
            "role": role,
            "content": content,
            "provider": provider,
            "created_at": now.isoformat(),
        }

        sb = get_supabase_client()
        if sb and user_id != "anonymous":
            try:
                res = sb.table("messages").insert(record).execute()
                # Touch conversation updated_at
                sb.table("conversations").update({"updated_at": now.isoformat()}).eq("id", conversation_id).execute()
                if res.data and len(res.data) > 0:
                    return res.data[0]
            except Exception as e:
                logger.warning("Supabase add message error: %s", e)

        _in_memory_messages.append(record)
        for c in _in_memory_conversations:
            if c["id"] == conversation_id:
                c["updated_at"] = now.isoformat()
                break
        return record

    def get_messages(self, user_id: str, conversation_id: str, limit: int = 50) -> List[Dict[str, Any]]:
        sb = get_supabase_client()
        if sb and user_id != "anonymous":
            try:
                res = (
                    sb.table("messages")
                    .select("*")
                    .eq("conversation_id", conversation_id)
                    .eq("user_id", user_id)
                    .order("created_at", desc=False)
                    .limit(limit)
                    .execute()
                )
                if res.data is not None:
                    return res.data
            except Exception as e:
                logger.warning("Supabase get messages error: %s", e)

        msgs = [
            m for m in _in_memory_messages
            if m["conversation_id"] == conversation_id and m["user_id"] == user_id
        ]
        return sorted(msgs, key=lambda x: x["created_at"])[:limit]


chat_repo = ChatRepository()
