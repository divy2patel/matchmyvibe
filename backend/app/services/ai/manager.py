import logging
from typing import Dict, Any, Tuple
from backend.app.core.config import settings
from backend.app.core.errors import (
    AIProviderError,
    AIProviderTimeoutError,
    AIProviderRateLimitError,
    AIProviderAuthError,
)
from backend.app.services.ai.base import AIProvider
from backend.app.services.ai.gemini import GeminiProvider
from backend.app.services.ai.groq import GroqProvider
from backend.app.services.ai.deterministic import DeterministicProvider
from backend.app.schemas.match import UnderstoodVibe

logger = logging.getLogger("matchmyvibe.ai.manager")


class AIProviderManager:
    """
    Centralized AI Provider Orchestration Layer.
    Executes primary provider (Gemini) with timeouts & controlled retry.
    Automatically catches errors (timeout, rate limit, auth, invalid schema) and fails over to Groq.
    If Groq fails, gracefully fails over to DeterministicProvider without crashing.
    """

    def __init__(self):
        self.gemini = GeminiProvider()
        self.groq = GroqProvider()
        self.deterministic = DeterministicProvider()

    async def extract_interests(self, user_text: str) -> Tuple[UnderstoodVibe, str, bool, str]:
        """
        Returns: (vibe, provider_used, fallback_triggered, fallback_reason)
        """
        # 1. Try Primary Provider (Gemini)
        try:
            logger.info("Calling primary AI provider (Gemini) for interest extraction...")
            vibe = await self.gemini.extract_interests(user_text)
            return vibe, "gemini", False, ""
        except (AIProviderError, Exception) as e_gemini:
            logger.warning("Gemini extraction failed (%s). Triggering Groq fallback...", e_gemini)

        # 2. Try Fallback Provider (Groq)
        try:
            logger.info("Calling fallback AI provider (Groq) for interest extraction...")
            vibe = await self.groq.extract_interests(user_text)
            return vibe, "groq", True, "Gemini failed/timed out"
        except (AIProviderError, Exception) as e_groq:
            logger.warning("Groq extraction also failed (%s). Triggering deterministic fallback...", e_groq)

        # 3. Deterministic Safety Net (Never fails)
        vibe = await self.deterministic.extract_interests(user_text)
        return vibe, "deterministic", True, "Gemini and Groq unavailable"

    async def generate_explanation(
        self,
        user_query: str,
        vibe: UnderstoodVibe,
        candidate: Dict[str, Any],
    ) -> str:
        # Try Gemini
        try:
            return await self.gemini.generate_explanation(user_query, vibe, candidate)
        except Exception as e_gemini:
            logger.debug("Gemini explanation failed (%s), trying Groq...", e_gemini)

        # Try Groq
        try:
            return await self.groq.generate_explanation(user_query, vibe, candidate)
        except Exception as e_groq:
            logger.debug("Groq explanation failed (%s), using deterministic fallback...", e_groq)

        # Deterministic
        return await self.deterministic.generate_explanation(user_query, vibe, candidate)

    async def generate_icebreaker(
        self,
        item_name: str,
        category: str,
        contact_lead: str,
        style: str,
        user_context: str,
    ) -> str:
        # Try Gemini
        try:
            return await self.gemini.generate_icebreaker(item_name, category, contact_lead, style, user_context)
        except Exception:
            pass

        # Try Groq
        try:
            return await self.groq.generate_icebreaker(item_name, category, contact_lead, style, user_context)
        except Exception:
            pass

        # Deterministic
        return await self.deterministic.generate_icebreaker(item_name, category, contact_lead, style, user_context)


ai_manager = AIProviderManager()
