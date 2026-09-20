from typing import Optional, List
from fastapi import APIRouter, HTTPException, Query
from backend.app.schemas.group import GroupResponse
from backend.app.repositories.groups import groups_repo

router = APIRouter(prefix="/groups", tags=["Groups"])


@router.get("", response_model=List[GroupResponse])
async def list_groups(category: Optional[str] = Query(default=None)):
    """List all active campus communities with optional category filter."""
    return groups_repo.get_all(category=category)


@router.get("/{id_or_slug}", response_model=GroupResponse)
async def get_group_detail(id_or_slug: str):
    """Retrieve full detail for a campus community by ID or slug."""
    group = groups_repo.get_by_id(id_or_slug)
    if not group:
        raise HTTPException(status_code=404, detail="Campus community not found.")
    return group
