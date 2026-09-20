import json
import logging
from typing import List, Dict, Any, Optional
from backend.app.core.database import get_supabase_client
from backend.app.services.ai.embeddings import generate_embedding

logger = logging.getLogger("matchmyvibe.repo.groups")

# Fallback in-memory catalog (from Aatmoday Seed)
DEFAULT_GROUPS: List[Dict[str, Any]] = [
    {
        "id": "22222222-0000-0000-0000-000000000001",
        "name": "Aatmoday Cultural & Dance Society",
        "slug": "cultural-dance-society",
        "category": "Performing Arts",
        "description": "The heart of classical dance, folk performances, stage hosting, and festival celebrations at Aatmoday. We organize major campus cultural nights, choreograph group dance pieces, and train hosts for stage events.",
        "tags": ["classical-dance", "cultural-events", "dance", "hosting", "stage-performance", "folk-dance"],
        "meeting_information": "Every Tuesday & Thursday at 6:30 PM",
        "location": "Student Activity Center (SAC Hall A)",
        "contact_lead": "Zara Khan",
        "contact_information": "Zara Khan (Lead), @zara_cultural, +91 98765 43210",
        "target_audience": "Dancers, stage hosts, and cultural event enthusiasts of all levels",
        "image_url": "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=800&auto=format&fit=crop&q=60",
        "is_active": True,
    },
    {
        "id": "22222222-0000-0000-0000-000000000002",
        "name": "Aatmoday Robotics & Hardware Hub",
        "slug": "robotics-hardware-hub",
        "category": "Technology",
        "description": "Building autonomous bots, drone systems, microcontrollers (Arduino/ESP32), and ROS-based software. We compete in national Robocon and hardware hackathons.",
        "tags": ["robotics", "coding", "hardware", "arduino", "drones", "embedded-systems"],
        "meeting_information": "Every Wednesday & Saturday at 5:00 PM",
        "location": "Robotics Lab (Engineering Block 3rd Floor)",
        "contact_lead": "Rohan Patel",
        "contact_information": "Rohan Patel (Lead), @rohan_robotics",
        "target_audience": "Coders, hardware geeks, and tech tinkerers",
        "image_url": "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800&auto=format&fit=crop&q=60",
        "is_active": True,
    },
    {
        "id": "22222222-0000-0000-0000-000000000003",
        "name": "Aatmoday Developers Club (ADC)",
        "slug": "developers-club-adc",
        "category": "Technology",
        "description": "Open source builders, full-stack engineers, AI tinkerers, and late-night competitive coders. We ship side projects, host 24-hour campus hackathons, and help each other ace internships.",
        "tags": ["coding", "programming", "web-development", "hackathons", "ai", "open-source"],
        "meeting_information": "Every Monday & Thursday at 7:00 PM",
        "location": "Computer Center Lab 4",
        "contact_lead": "Aditya Verma",
        "contact_information": "Aditya Verma (Lead), @aditya_adc",
        "target_audience": "Software developers, hackathon competitors, and curious coders",
        "image_url": "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&auto=format&fit=crop&q=60",
        "is_active": True,
    },
    {
        "id": "22222222-0000-0000-0000-000000000004",
        "name": "Unplugged (Music Club)",
        "slug": "unplugged-music-club",
        "category": "Performing Arts",
        "description": "Acoustic guitar sessions, vocal harmonies, gentle jams under campus lights, and open-mic evenings. Perfect for introverted musicians, shy singers, and guitar strummers looking for cozy vibes.",
        "tags": ["acoustic-guitar", "unplugged", "singing", "music", "gentle-jams", "vocals"],
        "meeting_information": "Every Friday at 7:00 PM",
        "location": "Cultural Center Garden & Amphitheater",
        "contact_lead": "Kabir Trivedi",
        "contact_information": "Kabir Trivedi (Head), @kabir_unplugged",
        "target_audience": "Musicians, vocalists, acoustic players, and gentle listeners",
        "image_url": "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&auto=format&fit=crop&q=60",
        "is_active": True,
    },
    {
        "id": "22222222-0000-0000-0000-000000000005",
        "name": "FragZone Esports & Gaming Guild",
        "slug": "fragzone-esports-gaming",
        "category": "Technology",
        "description": "Competitive and casual campus esports community. Late-night Valorant lobbies, BGMI campus scrims, FIFA console battles, and indie game development sprints.",
        "tags": ["gaming", "esports", "valorant", "bgmi", "lan-tournaments", "game-dev"],
        "meeting_information": "Every Wednesday & Friday at 9:30 PM",
        "location": "Recreation Hall & Discord Server",
        "contact_lead": "Dhruv Shah",
        "contact_information": "Dhruv Shah (Guild Captain), @dhruv_fragzone",
        "target_audience": "Casual and ranked gamers, streamers, and game designers",
        "image_url": "https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=800&auto=format&fit=crop&q=60",
        "is_active": True,
    },
    {
        "id": "22222222-0000-0000-0000-000000000006",
        "name": "Trekking Community",
        "slug": "trekking-community",
        "category": "Adventure",
        "description": "Weekend hikes, Pavagadh climbs, night treks, camping, and outdoor exploration. Designed for introverted nature lovers, photographers, and adventure seekers alike.",
        "tags": ["trekking", "hiking", "outdoors", "nature", "weekend-hikes", "camping"],
        "meeting_information": "Every Thursday at 8:00 PM for weekend planning",
        "location": "Sports Complex Lawn & WhatsApp Group",
        "contact_lead": "Arjun Nair",
        "contact_information": "Arjun Nair (Trek Lead), @arjun_treks",
        "target_audience": "Hikers, nature enthusiasts, and quiet outdoor lovers",
        "image_url": "https://images.unsplash.com/photo-1501555088652-021faa106b9b?w=800&auto=format&fit=crop&q=60",
        "is_active": True,
    },
    {
        "id": "22222222-0000-0000-0000-000000000007",
        "name": "Kartavya Voluntourism & Impact Drive",
        "slug": "kartavya-voluntourism",
        "category": "Social",
        "description": "Weekend educational outreach, village school teaching, cleanliness drives, and social impact camps. Travel with a purpose and bring real smiles to nearby communities.",
        "tags": ["volunteering", "teaching", "social-impact", "voluntourism", "community-service"],
        "meeting_information": "Every Saturday morning at 9:00 AM",
        "location": "Old Admin Block Room 102",
        "contact_lead": "Pooja Joshi",
        "contact_information": "Pooja Joshi (Coordinator), @pooja_kartavya",
        "target_audience": "Students who want to make a meaningful difference and give back",
        "image_url": "https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=800&auto=format&fit=crop&q=60",
        "is_active": True,
    },
    {
        "id": "22222222-0000-0000-0000-000000000008",
        "name": "Chhayachitra (Photography & Content Guild)",
        "slug": "chhayachitra-photography-guild",
        "category": "Creative",
        "description": "Photowalks, portraiture experiments, drone shots, and Instagram/Reel storytelling. Learn lighting, camera settings, and editing from peers.",
        "tags": ["photography", "content-creation", "reels", "cinematography", "editing"],
        "meeting_information": "Every Sunday morning at 8:00 AM (Photowalk)",
        "location": "Media Lab & Campus Central Fountain",
        "contact_lead": "Meera Desai",
        "contact_information": "Meera Desai (Lead), @meera_clicks",
        "target_audience": "Mobile photographers, DSLR shooters, and aesthetic content creators",
        "image_url": "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&auto=format&fit=crop&q=60",
        "is_active": True,
    },
    {
        "id": "22222222-0000-0000-0000-000000000009",
        "name": "Nukkad Natak (Street Theater Group)",
        "slug": "nukkad-natak-street-theater",
        "category": "Performing Arts",
        "description": "Street plays, social awareness performances, high-energy chants, and theatrical storytelling. We take burning social messages to campus courtyards and city squares.",
        "tags": ["nukkad-natak", "street-play", "drama", "acting", "social-awareness", "theater"],
        "meeting_information": "Every Monday & Friday at 6:00 PM",
        "location": "Amphitheater Steps & Campus Courtyard",
        "contact_lead": "Diya Kapoor",
        "contact_information": "Diya Kapoor (Convener), @diya_nukkad",
        "target_audience": "Passionate actors, scriptwriters, voice artists, and performers",
        "image_url": "https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?w=800&auto=format&fit=crop&q=60",
        "is_active": True,
    },
    {
        "id": "22222222-0000-0000-0000-000000000010",
        "name": "Aatmoday Turf Football League",
        "slug": "aatmoday-turf-football",
        "category": "Sports",
        "description": "Night matches under floodlights on the newly built campus turf. Casual 5-a-side friendlies, tactical passing drills, and inter-hostel weekend cups.",
        "tags": ["football", "turf", "sports", "5v5", "campus-league", "fitness"],
        "meeting_information": "Every Monday, Wednesday & Saturday at 9:00 PM",
        "location": "Campus Turf Arena (Near Hostel 4)",
        "contact_lead": "Varun Rao",
        "contact_information": "Varun Rao (Captain), @varun_turf",
        "target_audience": "Football fans, casual runners, and tournament contenders",
        "image_url": "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800&auto=format&fit=crop&q=60",
        "is_active": True,
    }
]


class GroupsRepository:
    def get_all(self, category: Optional[str] = None) -> List[Dict[str, Any]]:
        sb = get_supabase_client()
        if sb:
            try:
                query = sb.table("groups").select("*").eq("is_active", True)
                if category and category != "All":
                    query = query.eq("category", category)
                res = query.execute()
                if res.data:
                    return res.data
            except Exception as e:
                logger.warning("Supabase groups fetch error: %s. Using local store.", e)

        groups = [g for g in DEFAULT_GROUPS if g["is_active"]]
        if category and category != "All":
            groups = [g for g in groups if g["category"].lower() == category.lower()]
        return groups

    def get_by_id(self, group_id: str) -> Optional[Dict[str, Any]]:
        sb = get_supabase_client()
        if sb:
            try:
                res = sb.table("groups").select("*").eq("id", group_id).single().execute()
                if res.data:
                    return res.data
            except Exception:
                pass
        for g in DEFAULT_GROUPS:
            if g["id"] == group_id or g["slug"] == group_id:
                return g
        return None

    def search_vector(self, embedding: List[float], match_threshold: float = 0.0, limit: int = 10) -> List[Dict[str, Any]]:
        sb = get_supabase_client()
        if sb:
            try:
                # Call Supabase RPC match_groups
                res = sb.rpc("match_groups", {
                    "query_embedding": embedding,
                    "match_threshold": match_threshold,
                    "match_count": limit
                }).execute()
                if res.data:
                    return res.data
            except Exception as e:
                logger.warning("Supabase RPC match_groups error: %s. Falling back to in-memory cosine.", e)

        # In-memory cosine calculation fallback
        def cosine(a: List[float], b: List[float]) -> float:
            dot = sum(x * y for x, y in zip(a, b))
            mag_a = sum(x * x for x in a) ** 0.5
            mag_b = sum(x * x for x in b) ** 0.5
            return dot / (mag_a * mag_b) if (mag_a and mag_b) else 0.0

        candidates = []
        for g in DEFAULT_GROUPS:
            # Generate deterministic vector from text
            text = f"{g['name']} {g['category']} {g['description']} {' '.join(g['tags'])}"
            dim = len(embedding)
            vec = [0.0] * dim
            for i, c in enumerate(text.lower()):
                code = ord(c)
                for d in range(dim):
                    vec[d] += (code + i) * (d + 1) * 0.001
            sim = cosine(embedding, vec)
            item = dict(g)
            item["similarity"] = round(sim, 4)
            candidates.append(item)

        candidates.sort(key=lambda x: x["similarity"], reverse=True)
        return candidates[:limit]


groups_repo = GroupsRepository()
