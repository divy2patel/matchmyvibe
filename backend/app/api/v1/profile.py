import logging
from typing import Optional
from fastapi import APIRouter, Header, Depends
from backend.app.schemas.user import ProfileResponse, ProfileUpdate
from backend.app.core.database import get_supabase_client
from backend.app.core.auth import get_optional_user, AuthenticatedUser

logger = logging.getLogger("matchmyvibe.api.profile")

router = APIRouter(prefix="/profile", tags=["Profile"])

MOCK_PROFILE = {
    "id": "11111111-1111-1111-1111-111111111111",
    "user_id": "anonymous",
    "name": "DDU Student",
    "full_name": "DDU Student",
    "email": "student@ddu.ac.in",
    "avatar_url": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80",
    "bio": "Exploring DDU campus life, hackathons, robotics, acoustic jams, and campus trails.",
    "batch": "2026",
    "branch": "Computer Science & Engineering",
    "student_id": "TMV-7F29A1",
    "role": "student",
    "onboarding_completed": True,
    "vibe_summary": "💻 Tech • 🎵 Music • 🏔️ Nature",
    "activity_preferences": ["collaborative", "hands-on"],
}


@router.get("", response_model=ProfileResponse)
async def get_profile(
    user: Optional[AuthenticatedUser] = Depends(get_optional_user),
    x_user_id: Optional[str] = Header(default="anonymous"),
):
    """Get current student profile, role, batch, branch, student_id, and vibe summary."""
    effective_id = user.id if user else (x_user_id if x_user_id != "anonymous" else "anonymous")
    clean_uid = effective_id.replace("-", "")
    computed_student_id = f"TMV-{clean_uid[:6].upper()}" if clean_uid else "TMV-7F29A1"

    sb = get_supabase_client()
    if sb and effective_id != "anonymous":
        try:
            res = sb.table("profiles").select("*").eq("user_id", effective_id).execute()
            if res.data and len(res.data) > 0:
                p = res.data[0]
                return ProfileResponse(
                    id=str(p.get("id", effective_id)),
                    user_id=effective_id,
                    name=p.get("name") or p.get("full_name") or "DDU Student",
                    full_name=p.get("full_name") or p.get("name") or "DDU Student",
                    email=p.get("email") or (user.email if user else None),
                    avatar_url=p.get("avatar_url"),
                    bio=p.get("bio") or "Active DDU campus enthusiast.",
                    vibe_summary=p.get("vibe_summary") or "🌱 Creative • 🤝 Social",
                    batch=p.get("batch") or (user.batch if user else "2026"),
                    branch=p.get("branch") or (user.branch if user else "Computer Science"),
                    student_id=p.get("student_id") or computed_student_id,
                    role=p.get("role") or (user.role if user else "student"),
                    onboarding_completed=p.get("onboarding_completed", True),
                    activity_preferences=p.get("activity_preferences") or ["collaborative"],
                    created_at=p.get("created_at"),
                )
        except Exception as e:
            logger.warning("Supabase get profile error: %s", e)

    # Return profile with authenticated user's actual name/email if present
    if user:
        return ProfileResponse(
            id=user.id,
            user_id=user.id,
            name=user.name or user.full_name or "DDU Student",
            full_name=user.full_name or user.name or "DDU Student",
            email=user.email,
            avatar_url=MOCK_PROFILE["avatar_url"],
            bio=MOCK_PROFILE["bio"],
            batch=user.batch or "2026",
            branch=user.branch or "Computer Science",
            student_id=computed_student_id,
            role=user.role if user.role in ["student", "admin"] else "student",
            onboarding_completed=True,
            vibe_summary=MOCK_PROFILE["vibe_summary"],
            activity_preferences=MOCK_PROFILE["activity_preferences"],
        )

    return ProfileResponse(**MOCK_PROFILE)


@router.patch("", response_model=ProfileResponse)
async def update_profile(
    payload: ProfileUpdate,
    user: Optional[AuthenticatedUser] = Depends(get_optional_user),
    x_user_id: Optional[str] = Header(default="anonymous"),
):
    """Update profile bio, preferences, batch, branch, or avatar."""
    effective_id = user.id if user else (x_user_id if x_user_id != "anonymous" else "anonymous")

    sb = get_supabase_client()
    update_data = payload.model_dump(exclude_none=True)
    if "name" in update_data and "full_name" not in update_data:
        update_data["full_name"] = update_data["name"]

    if sb and effective_id != "anonymous":
        try:
            res = sb.table("profiles").update(update_data).eq("user_id", effective_id).execute()
            if res.data and len(res.data) > 0:
                p = res.data[0]
                return ProfileResponse(
                    id=str(p.get("id", effective_id)),
                    user_id=effective_id,
                    name=p.get("name") or p.get("full_name") or "Aatmoday Student",
                    full_name=p.get("full_name") or p.get("name"),
                    email=p.get("email"),
                    avatar_url=p.get("avatar_url"),
                    bio=p.get("bio"),
                    vibe_summary=p.get("vibe_summary"),
                    batch=p.get("batch"),
                    branch=p.get("branch"),
                    role=p.get("role", "student"),
                    onboarding_completed=p.get("onboarding_completed", True),
                    activity_preferences=p.get("activity_preferences") or [],
                    created_at=p.get("created_at"),
                )
        except Exception as e:
            logger.warning("Supabase update profile error: %s", e)

    updated = dict(MOCK_PROFILE)
    updated["user_id"] = effective_id
    if user:
        updated["email"] = user.email
        updated["role"] = user.role
    for k, v in update_data.items():
        updated[k] = v
    return ProfileResponse(**updated)
