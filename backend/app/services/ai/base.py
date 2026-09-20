from abc import ABC, abstractmethod
from typing import List, Dict, Any
from backend.app.schemas.match import UnderstoodVibe


class AIProvider(ABC):
    """Abstract Base Class for AI Providers (Gemini, Groq, Claude, etc.)"""

    name: str

    @abstractmethod
    async def extract_interests(self, user_text: str) -> UnderstoodVibe:
        """Extract structured interest keywords, category taxonomy, and vibe profile from user text."""
        pass

    @abstractmethod
    async def generate_explanation(
        self,
        user_query: str,
        vibe: UnderstoodVibe,
        candidate: Dict[str, Any],
    ) -> str:
        """Generate 1-2 personalized sentences explaining why the community/event matches."""
        pass

    @abstractmethod
    async def generate_icebreaker(
        self,
        item_name: str,
        category: str,
        contact_lead: str,
        style: str,
        user_context: str,
    ) -> str:
        """Generate a tone-specific, personalized icebreaker message."""
        pass
