import re
from typing import Dict, Any, List
from backend.app.services.ai.base import AIProvider
from backend.app.schemas.match import UnderstoodVibe

TAXONOMY_KEYWORDS = {
    "Technology": ["code", "coding", "python", "javascript", "ai", "robot", "robotics", "hackathon", "web", "app", "hardware", "arduino", "esp32", "tech", "gaming", "valorant", "esports"],
    "Creative": ["photo", "photography", "camera", "reel", "video", "editing", "design", "figma", "art", "drawing", "content", "aesthetic"],
    "Performing Arts": ["dance", "classical", "garba", "music", "guitar", "sing", "singing", "acoustic", "vocals", "drama", "theater", "acting", "nukkad", "natak", "stage"],
    "Sports": ["football", "turf", "cricket", "badminton", "fitness", "gym", "run", "running", "match", "tournament"],
    "Adventure": ["trek", "trekking", "hike", "hiking", "pavagadh", "camp", "camping", "outdoor", "explore", "nature"],
    "Social": ["volunteer", "volunteering", "teach", "teaching", "impact", "social", "lead", "leadership", "community", "ngo", "help"],
}

INTROVERT_TERMS = ["introvert", "introverted", "quiet", "gentle", "shy", "low-key", "solo", "silent"]


class DeterministicProvider(AIProvider):
    """
    100% deterministic, offline rule-based provider.
    Guarantees that when both Gemini and Groq are unavailable, MatchMyVibe
    still returns useful, high-quality, non-crashing results.
    """
    name = "deterministic"

    async def extract_interests(self, user_text: str) -> UnderstoodVibe:
        lower = user_text.lower()
        matched_categories = set()
        matched_interests = []

        for category, keywords in TAXONOMY_KEYWORDS.items():
            for kw in keywords:
                if re.search(r'\b' + re.escape(kw) + r'\b', lower):
                    matched_categories.add(category)
                    matched_interests.append(kw)

        if not matched_interests:
            matched_interests = ["campus community", "creative exploration"]
            matched_categories.add("Creative")
            matched_categories.add("Social")

        # Deduplicate and limit to 5
        interests = list(dict.fromkeys(matched_interests))[:5]
        categories = list(matched_categories)[:3]

        is_introvert = any(term in lower for term in INTROVERT_TERMS)
        social_pref = "low_pressure" if is_introvert else ("energetic" if "competitive" in lower else "collaborative")

        # Create structured vibe summary
        icons = {
            "Technology": "💻 Tech",
            "Creative": "📸 Creative",
            "Performing Arts": "💃 Arts",
            "Sports": "⚽ Active",
            "Adventure": "🏔️ Explorer",
            "Social": "🤝 Impact",
        }
        badge_parts = [icons.get(c, c) for c in categories]
        if is_introvert:
            badge_parts.append("🌱 Gentle Pace")

        vibe_summary = " • ".join(badge_parts) if badge_parts else "✨ Campus Explorer"

        return UnderstoodVibe(
            interests=interests,
            categories=categories,
            activity_preferences=["hands-on", "peer-driven"],
            social_preference=social_pref,
            experience_level="all_levels",
            intent="Connect with welcoming students around shared hobbies",
            vibe_summary=vibe_summary,
            niche_flag=len(matched_categories) == 0,
        )

    async def generate_explanation(
        self,
        user_query: str,
        vibe: UnderstoodVibe,
        candidate: Dict[str, Any],
    ) -> str:
        name = candidate.get("name", "This community")
        category = candidate.get("category", "")
        lead = candidate.get("contact_lead", "the team")

        first_interest = vibe.interests[0] if vibe.interests else "your interests"
        is_introvert = vibe.social_preference == "low_pressure"

        if is_introvert:
            return f"Based on your gentle, low-pressure vibe, {name} offers a welcoming, cozy environment where you can connect over {first_interest} without overwhelming pressure."
        return f"{name} is an active campus hub for {category} that directly aligns with your note on {first_interest}, led by {lead}."

    async def generate_icebreaker(
        self,
        item_name: str,
        category: str,
        contact_lead: str,
        style: str,
        user_context: str,
    ) -> str:
        lead_first_name = contact_lead.split()[0] if contact_lead else "there"
        topic = user_context or category.lower()

        if style == "introvert":
            return (
                f"Hi {lead_first_name}, I'm a bit quiet/introverted, but I'm really keen on {topic} at Aatmoday. "
                f"Would it be okay if I come observe a session at {item_name}?"
            )
        elif style == "friendly":
            return (
                f"Hey {lead_first_name}! 👋 I came across {item_name} on MatchMyVibe and love that you focus on {topic}. "
                f"Would love to drop by and say hi at the next meetup!"
            )
        elif style == "professional":
            return (
                f"Hello {lead_first_name}, I am an Aatmoday student interested in participating with {item_name} ({category}). "
                f"Could you kindly share the upcoming schedule and orientation details? Thank you."
            )
        elif style == "short":
            return f"Hey {lead_first_name}, interested in {item_name}! When's your next meetup?"
        elif style == "in_person":
            return f"Hey! Are you part of {item_name}? I'm really into {topic} and wanted to ask how to get involved."
        else: # casual
            return (
                f"Hey {lead_first_name}! Saw {item_name} on MatchMyVibe. I'm really into {topic} "
                f"and would love to join in for the next session. When's the best time to drop by?"
            )
