from fastapi import APIRouter, Header
from typing import Optional
from backend.app.schemas.user import FeedbackCreate
from backend.app.repositories.users import users_repo

router = APIRouter(prefix="/feedback", tags=["Feedback"])


@router.post("")
async def submit_feedback(
    payload: FeedbackCreate,
    x_user_id: Optional[str] = Header(default="anonymous"),
):
    """
    Record student feedback (useful 👍 vs not really 👎) on recommendations.
    Helps tune future matching weights.
    """
    payload.user_id = x_user_id
    result = users_repo.record_feedback(payload)
    return {"success": True, "message": "Feedback recorded. Thank you!", "record": result}
