from typing import List, Dict, Any
from fastapi import APIRouter
from backend.app.core.database import get_supabase_client

router = APIRouter(prefix="/interests", tags=["Interests"])

DEFAULT_CATEGORIES = [
    {
        "category": "Technology",
        "icon": "💻",
        "interests": ["Artificial Intelligence", "Coding & Hackathons", "Robotics & Hardware", "Gaming & Esports"]
    },
    {
        "category": "Creative",
        "icon": "🎨",
        "interests": ["Photography & Framing", "Content Creation & Reels", "UI/UX & Visual Design"]
    },
    {
        "category": "Performing Arts",
        "icon": "🎭",
        "interests": ["Classical & Folk Dance", "Acoustic Guitar & Vocals", "Street Theater & Nukkad Natak"]
    },
    {
        "category": "Sports",
        "icon": "⚽",
        "interests": ["Campus Football Turf", "Cricket Club", "Badminton & Court Sports"]
    },
    {
        "category": "Adventure",
        "icon": "🏔️",
        "interests": ["Trekking & Outdoor Adventure", "Camping", "Weekend Hikes"]
    },
    {
        "category": "Social",
        "icon": "🤝",
        "interests": ["Voluntourism & Teaching", "Leadership & Public Speaking"]
    }
]


@router.get("")
async def get_interests_taxonomy() -> List[Dict[str, Any]]:
    """Returns database-driven interests taxonomy grouped by categories."""
    sb = get_supabase_client()
    if sb:
        try:
            res = sb.table("interests").select("*").execute()
            if res.data:
                return res.data
        except Exception:
            pass
    return DEFAULT_CATEGORIES
