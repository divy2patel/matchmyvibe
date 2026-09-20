from fastapi import APIRouter, HTTPException, Header
from typing import Optional
from backend.app.schemas.match import MatchRequest, MatchResponse
from backend.app.services.matching.engine import matching_engine

router = APIRouter(prefix="/match", tags=["Match"])


@router.post("", response_model=MatchResponse)
async def match_hobbies(
    request: MatchRequest,
    x_user_id: Optional[str] = Header(default="anonymous"),
):
    """
    Main matching endpoint. Takes unstructured student text, extracts interests,
    retrieves vector candidates, applies hybrid scoring, and returns top 3 groups + top 2 events.
    """
    try:
        return await matching_engine.match(request, user_id=x_user_id)
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail="Something went wrong while finding your matches. Please try again.",
        )
