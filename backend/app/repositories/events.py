import logging
from datetime import datetime, timezone, timedelta
from typing import List, Dict, Any, Optional
from backend.app.core.database import get_supabase_client

logger = logging.getLogger("matchmyvibe.repo.events")

now = datetime.now(timezone.utc)

DEFAULT_EVENTS: List[Dict[str, Any]] = [
    {
        "id": "33333333-0000-0000-0000-000000000001",
        "group_id": "22222222-0000-0000-0000-000000000001",
        "name": "Aatmoday Cultural Night & Garba Fusion",
        "category": "Performing Arts",
        "description": "An electric evening of classical fusion, live dhol, stage anchoring auditions, and campus Garba night. Free entry for all students.",
        "event_type": "cultural_night",
        "event_date": (now + timedelta(days=7)).isoformat(),
        "location": "University Main Amphitheater",
        "contact_lead": "Zara Khan",
        "contact_information": "Zara Khan (Lead), @zara_cultural",
        "target_audience": "All campus students, dancers, and stage hosts",
        "image_url": "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&auto=format&fit=crop&q=60",
        "registration_url": "https://aatmoday.edu/events/cultural-night-2026",
        "tags": ["cultural-night", "garba", "classical-dance", "hosting", "stage-performance"],
        "is_active": True,
    },
    {
        "id": "33333333-0000-0000-0000-000000000002",
        "group_id": "22222222-0000-0000-0000-000000000003",
        "name": "AatmoHacks 2026 — 24H AI & Web Hackathon",
        "category": "Technology",
        "description": "24-hour campus hackathon building real-world AI, Web3, and mobile apps. Free food, red bull, sponsor swag, and prizes worth 1.5 Lakhs.",
        "event_type": "hackathon",
        "event_date": (now + timedelta(days=14)).isoformat(),
        "location": "Engineering Building Labs 301-305",
        "contact_lead": "Aditya Verma",
        "contact_information": "Aditya Verma (Lead), @aditya_adc",
        "target_audience": "Coders, designers, product minds, and enthusiastic beginners",
        "image_url": "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800&auto=format&fit=crop&q=60",
        "registration_url": "https://aatmohacks.dev",
        "tags": ["hackathon", "coding", "ai", "web-development", "open-source"],
        "is_active": True,
    },
    {
        "id": "33333333-0000-0000-0000-000000000003",
        "group_id": "22222222-0000-0000-0000-000000000004",
        "name": "Acoustic Sunset Open-Mic",
        "category": "Performing Arts",
        "description": "Gentle outdoor acoustic guitars, indie vocals, poetry readings, and chai under the campus banyan tree. Super warm and beginner-friendly.",
        "event_type": "open_mic",
        "event_date": (now + timedelta(days=5)).isoformat(),
        "location": "Cultural Garden Lawn",
        "contact_lead": "Kabir Trivedi",
        "contact_information": "Kabir Trivedi (Head), @kabir_unplugged",
        "target_audience": "Acoustic musicians, poets, and gentle listeners",
        "image_url": "https://images.unsplash.com/photo-1465847899084-d164df4dedc6?w=800&auto=format&fit=crop&q=60",
        "registration_url": "https://aatmoday.edu/events/acoustic-sunset",
        "tags": ["acoustic-guitar", "unplugged", "singing", "open-mic", "gentle-jams"],
        "is_active": True,
    },
    {
        "id": "33333333-0000-0000-0000-000000000004",
        "group_id": "22222222-0000-0000-0000-000000000006",
        "name": "Sunrise Pavagadh Trail Trek",
        "category": "Adventure",
        "description": "Early morning sunrise climb up Pavagadh hills, breakfast at scenic ridge, and landscape photography session. Bus departs at 5:00 AM.",
        "event_type": "trek",
        "event_date": (now + timedelta(days=12)).isoformat(),
        "location": "Pavagadh Base (Bus pickup at Main Gate)",
        "contact_lead": "Arjun Nair",
        "contact_information": "Arjun Nair (Trek Lead), @arjun_treks",
        "target_audience": "Nature lovers, photographers, and hikers",
        "image_url": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&auto=format&fit=crop&q=60",
        "registration_url": "https://aatmoday.edu/treks/pavagadh-sunrise",
        "tags": ["trekking", "hiking", "outdoors", "nature", "photography"],
        "is_active": True,
    },
    {
        "id": "33333333-0000-0000-0000-000000000005",
        "group_id": "22222222-0000-0000-0000-000000000010",
        "name": "Midnight Campus Turf 5v5 Championship",
        "category": "Sports",
        "description": "High-octane 5-a-side floodlight football tournament. 16 hostel teams, knockout format, trophies, and midnight pizza for all participants.",
        "event_type": "tournament",
        "event_date": (now + timedelta(days=18)).isoformat(),
        "location": "Campus Turf Arena",
        "contact_lead": "Varun Rao",
        "contact_information": "Varun Rao (Captain), @varun_turf",
        "target_audience": "Football lovers, hostel squads, and sports fans",
        "image_url": "https://images.unsplash.com/photo-1529900241450-482a8740523d?w=800&auto=format&fit=crop&q=60",
        "registration_url": "https://aatmoday.edu/sports/midnight-turf-cup",
        "tags": ["football", "turf", "sports", "tournament", "fitness"],
        "is_active": True,
    }
]


class EventsRepository:
    def get_upcoming(self, category: Optional[str] = None) -> List[Dict[str, Any]]:
        sb = get_supabase_client()
        if sb:
            try:
                now_iso = datetime.now(timezone.utc).isoformat()
                query = sb.table("events").select("*").eq("is_active", True).gte("event_date", now_iso)
                if category and category != "All":
                    query = query.eq("category", category)
                res = query.order("event_date").execute()
                if res.data:
                    return res.data
            except Exception as e:
                logger.warning("Supabase events fetch error: %s. Using local store.", e)

        current_time = datetime.now(timezone.utc)
        events = []
        for e in DEFAULT_EVENTS:
            if not e["is_active"]:
                continue
            event_dt = datetime.fromisoformat(e["event_date"])
            # STRICT FILTER: event_date >= NOW() (Never recommend expired events)
            if event_dt >= current_time:
                if not category or category == "All" or e["category"].lower() == category.lower():
                    events.append(e)

        events.sort(key=lambda x: x["event_date"])
        return events

    def get_by_id(self, event_id: str) -> Optional[Dict[str, Any]]:
        sb = get_supabase_client()
        if sb:
            try:
                res = sb.table("events").select("*").eq("id", event_id).single().execute()
                if res.data:
                    return res.data
            except Exception:
                pass
        for e in DEFAULT_EVENTS:
            if e["id"] == event_id:
                return e
        return None

    def search_vector(self, embedding: List[float], match_threshold: float = 0.0, limit: int = 10) -> List[Dict[str, Any]]:
        sb = get_supabase_client()
        if sb:
            try:
                # Call Supabase RPC match_events (enforces event_date >= NOW())
                res = sb.rpc("match_events", {
                    "query_embedding": embedding,
                    "match_threshold": match_threshold,
                    "match_count": limit
                }).execute()
                if res.data:
                    return res.data
            except Exception as e:
                logger.warning("Supabase RPC match_events error: %s. Using local cosine.", e)

        def cosine(a: List[float], b: List[float]) -> float:
            dot = sum(x * y for x, y in zip(a, b))
            mag_a = sum(x * x for x in a) ** 0.5
            mag_b = sum(x * x for x in b) ** 0.5
            return dot / (mag_a * mag_b) if (mag_a and mag_b) else 0.0

        candidates = []
        upcoming = self.get_upcoming()
        for e in upcoming:
            text = f"{e['name']} {e['category']} {e['description']} {' '.join(e['tags'])}"
            dim = len(embedding)
            vec = [0.0] * dim
            for i, c in enumerate(text.lower()):
                code = ord(c)
                for d in range(dim):
                    vec[d] += (code + i) * (d + 1) * 0.001
            sim = cosine(embedding, vec)
            item = dict(e)
            item["similarity"] = round(sim, 4)
            candidates.append(item)

        candidates.sort(key=lambda x: x["similarity"], reverse=True)
        return candidates[:limit]


events_repo = EventsRepository()
