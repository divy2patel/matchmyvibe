from fastapi import APIRouter, Header
from typing import List, Optional
from backend.app.schemas.user import SearchHistoryItem
from backend.app.repositories.users import users_repo

router = APIRouter(prefix="/history", tags=["Search History"])


@router.get("", response_model=List[SearchHistoryItem])
async def get_search_history(x_user_id: Optional[str] = Header(default="anonymous")):
    """Get recent search history for student."""
    return users_repo.get_search_history(x_user_id)
