from typing import Optional, List
from fastapi import APIRouter, HTTPException, Query
from backend.app.schemas.event import EventResponse
from backend.app.repositories.events import events_repo

router = APIRouter(prefix="/events", tags=["Events"])


@router.get("", response_model=List[EventResponse])
async def list_upcoming_events(category: Optional[str] = Query(default=None)):
    """List all upcoming active campus events (strictly future dates >= NOW())."""
    return events_repo.get_upcoming(category=category)


@router.get("/{event_id}", response_model=EventResponse)
async def get_event_detail(event_id: str):
    """Retrieve full detail for a campus event."""
    event = events_repo.get_by_id(event_id)
    if not event:
        raise HTTPException(status_code=404, detail="Event not found.")
    return event
