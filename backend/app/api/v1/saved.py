import logging
from typing import List, Optional
from fastapi import APIRouter, Header, HTTPException, Depends
from backend.app.schemas.user import SavedItemCreate, SavedItemResponse
from backend.app.repositories.users import users_repo
from backend.app.repositories.groups import groups_repo
from backend.app.repositories.events import events_repo
from backend.app.core.auth import get_optional_user, AuthenticatedUser

logger = logging.getLogger("matchmyvibe.api.saved")

router = APIRouter(prefix="/saved", tags=["Saved Items"])


def get_effective_user_id(
    user: Optional[AuthenticatedUser],
    fallback_header: Optional[str],
    require_auth: bool = False,
) -> str:
    if user:
        return user.id
    if fallback_header and fallback_header != "anonymous":
        return fallback_header
    if require_auth:
        raise HTTPException(
            status_code=401,
            detail="Authentication required. Please log in to your student account.",
        )
    return "anonymous"


@router.get("", response_model=List[SavedItemResponse])
async def list_saved_items(
    user: Optional[AuthenticatedUser] = Depends(get_optional_user),
    x_user_id: Optional[str] = Header(default="anonymous"),
):
    """Get all saved groups and events for the current user."""
    uid = get_effective_user_id(user, x_user_id, require_auth=False)
    return users_repo.get_saved_items(uid)


@router.post("", response_model=SavedItemResponse)
async def save_item(
    payload: SavedItemCreate,
    user: Optional[AuthenticatedUser] = Depends(get_optional_user),
    x_user_id: Optional[str] = Header(default="anonymous"),
):
    """Save a community or event to student's account."""
    uid = get_effective_user_id(user, x_user_id, require_auth=True)

    title = "Campus Community"
    category = "Campus"
    image_url = None

    if payload.group_id:
        group = groups_repo.get_by_id(payload.group_id)
        if group:
            title = group["name"]
            category = group["category"]
            image_url = group.get("image_url")
    elif payload.event_id:
        event = events_repo.get_by_id(payload.event_id)
        if event:
            title = event["name"]
            category = event["category"]
            image_url = event.get("image_url")

    saved = users_repo.save_item(
        user_id=uid,
        group_id=payload.group_id,
        event_id=payload.event_id,
        title=title,
        category=category,
        image_url=image_url,
    )
    return saved


@router.delete("/{saved_id}")
async def delete_saved_item(
    saved_id: str,
    user: Optional[AuthenticatedUser] = Depends(get_optional_user),
    x_user_id: Optional[str] = Header(default="anonymous"),
):
    """Remove a saved item from user's bookmarks."""
    uid = get_effective_user_id(user, x_user_id, require_auth=True)
    success = users_repo.delete_saved_item(uid, saved_id)
    if not success:
        raise HTTPException(status_code=404, detail="Saved item not found.")
    return {"success": True, "message": "Item removed from bookmarks"}
