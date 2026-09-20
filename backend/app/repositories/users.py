import uuid
import logging
from datetime import datetime, timezone
from typing import List, Dict, Any, Optional
from backend.app.core.database import get_supabase_client
from backend.app.schemas.user import FeedbackCreate

logger = logging.getLogger("matchmyvibe.repo.users")

# In-memory stores for local session
_saved_items: List[Dict[str, Any]] = []
_search_history: List[Dict[str, Any]] = []
_feedback_store: List[Dict[str, Any]] = []


class UsersRepository:
    def get_saved_items(self, user_id: str) -> List[Dict[str, Any]]:
        from backend.app.repositories.groups import groups_repo
        from backend.app.repositories.events import events_repo

        raw_items: List[Dict[str, Any]] = []
        sb = get_supabase_client()
        if sb and user_id != "anonymous":
            try:
                res = sb.table("saved_items").select("*, groups(*), events(*)").eq("user_id", user_id).execute()
                if res.data:
                    raw_items = res.data
            except Exception as e:
                logger.warning("Supabase saved items error: %s", e)

        if not raw_items:
            raw_items = [item for item in _saved_items if item.get("user_id") == user_id]

        normalized: List[Dict[str, Any]] = []
        for item in raw_items:
            group_obj = item.get("groups")
            event_obj = item.get("events")
            group_id = item.get("group_id")
            event_id = item.get("event_id")

            # Resolve group if missing
            if group_id and not group_obj:
                group_obj = groups_repo.get_by_id(group_id)
            # Resolve event if missing
            if event_id and not event_obj:
                event_obj = events_repo.get_by_id(event_id)

            item_type = "group" if group_id else "event"
            title = item.get("title")
            category = item.get("category", "Campus")
            image_url = item.get("image_url")

            if group_obj:
                item_type = "group"
                title = group_obj.get("name", title or "Campus Community")
                category = group_obj.get("category", category)
                image_url = group_obj.get("image_url", image_url)
            elif event_obj:
                item_type = "event"
                title = event_obj.get("name", title or "Campus Event")
                category = event_obj.get("category", category)
                image_url = event_obj.get("image_url", image_url)

            # Guard against raw UUIDs being displayed as titles
            if not title or (len(title) == 36 and "-" in title) or title.startswith("22222222"):
                title = "Aatmoday Community" if item_type == "group" else "Campus Meetup"

            normalized.append({
                "id": str(item["id"]),
                "user_id": str(item.get("user_id", user_id)),
                "group_id": group_id,
                "event_id": event_id,
                "item_type": item_type,
                "title": title,
                "category": category,
                "image_url": image_url,
                "created_at": item.get("created_at") or datetime.now(timezone.utc),
            })
        return normalized

    def save_item(self, user_id: str, group_id: Optional[str], event_id: Optional[str], title: str, category: str, image_url: Optional[str]) -> Dict[str, Any]:
        sb = get_supabase_client()
        if sb and user_id != "anonymous":
            try:
                payload = {"user_id": user_id, "group_id": group_id, "event_id": event_id}
                res = sb.table("saved_items").insert(payload).execute()
                if res.data and len(res.data) > 0:
                    item = res.data[0]
                    return {
                        "id": str(item["id"]),
                        "user_id": user_id,
                        "group_id": group_id,
                        "event_id": event_id,
                        "item_type": "group" if group_id else "event",
                        "title": title,
                        "category": category,
                        "image_url": image_url,
                        "created_at": item.get("created_at") or datetime.now(timezone.utc),
                    }
            except Exception as e:
                logger.warning("Supabase save item error: %s", e)

        # In-memory save
        saved_id = str(uuid.uuid4())
        record = {
            "id": saved_id,
            "user_id": user_id,
            "group_id": group_id,
            "event_id": event_id,
            "item_type": "group" if group_id else "event",
            "title": title,
            "category": category,
            "image_url": image_url,
            "created_at": datetime.now(timezone.utc),
        }
        _saved_items.append(record)
        return record

    def delete_saved_item(self, user_id: str, saved_id: str) -> bool:
        sb = get_supabase_client()
        if sb and user_id != "anonymous":
            try:
                sb.table("saved_items").delete().eq("id", saved_id).eq("user_id", user_id).execute()
                return True
            except Exception as e:
                logger.warning("Supabase delete saved error: %s", e)

        global _saved_items
        initial_len = len(_saved_items)
        _saved_items = [s for s in _saved_items if not (s["id"] == saved_id and s["user_id"] == user_id)]
        return len(_saved_items) < initial_len

    def log_search(self, user_id: Optional[str], query: str, understood_interests: List[str]):
        sb = get_supabase_client()
        if sb and user_id and user_id != "anonymous":
            try:
                sb.table("search_history").insert({
                    "user_id": user_id,
                    "query": query,
                    "understood_interests": understood_interests,
                }).execute()
                return
            except Exception as e:
                logger.warning("Supabase search history error: %s", e)

        _search_history.append({
            "id": str(uuid.uuid4()),
            "user_id": user_id or "anonymous",
            "query": query,
            "understood_interests": understood_interests,
            "created_at": datetime.now(timezone.utc),
        })

    def get_search_history(self, user_id: str) -> List[Dict[str, Any]]:
        sb = get_supabase_client()
        if sb and user_id != "anonymous":
            try:
                res = sb.table("search_history").select("*").eq("user_id", user_id).order("created_at", desc=True).limit(20).execute()
                if res.data:
                    return res.data
            except Exception as e:
                logger.warning("Supabase get history error: %s", e)

        return [h for h in _search_history if h.get("user_id") == user_id]

    def record_feedback(self, feedback: FeedbackCreate) -> Dict[str, Any]:
        sb = get_supabase_client()
        if sb and feedback.user_id and feedback.user_id != "anonymous":
            try:
                res = sb.table("recommendation_feedback").insert(feedback.model_dump(exclude_none=True)).execute()
                if res.data:
                    return res.data[0]
            except Exception as e:
                logger.warning("Supabase feedback error: %s", e)

        record = {
            "id": str(uuid.uuid4()),
            **feedback.model_dump(),
            "created_at": datetime.now(timezone.utc),
        }
        _feedback_store.append(record)
        return record


users_repo = UsersRepository()
