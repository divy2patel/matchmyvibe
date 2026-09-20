import json
import asyncio
import logging
from typing import Dict, Any
from groq import AsyncGroq
from backend.app.core.config import settings
from backend.app.core.errors import (
    AIProviderError,
    AIProviderTimeoutError,
    AIProviderRateLimitError,
    AIProviderAuthError,
    AIProviderInvalidResponseError,
)
from backend.app.services.ai.base import AIProvider
from backend.app.schemas.match import UnderstoodVibe

logger = logging.getLogger("matchmyvibe.ai.groq")


class GroqProvider(AIProvider):
    name = "groq"

    def __init__(self):
        self.api_key = settings.GROQ_API_KEY
        self.model = settings.GROQ_MODEL
        self._client = None
        if self.api_key and not self.api_key.startswith("your_"):
            self._client = AsyncGroq(api_key=self.api_key)

    def _ensure_client(self):
        if not self._client:
            if not self.api_key or self.api_key.startswith("your_"):
                raise AIProviderAuthError("groq", "Groq API key is not configured")
            self._client = AsyncGroq(api_key=self.api_key)
        return self._client

    async def extract_interests(self, user_text: str) -> UnderstoodVibe:
        client = self._ensure_client()

        system_msg = """You are an empathetic student advisor at Aatmoday University.
Analyze the student query and return ONLY valid JSON matching this schema:
{
  "interests": ["2-5 standardized interest keywords"],
  "categories": ["Technology", "Creative", "Performing Arts", "Sports", "Adventure", "Social"],
  "activity_preferences": ["collaborative", "hands-on"],
  "social_preference": "low_pressure" | "collaborative" | "energetic",
  "experience_level": "beginner" | "intermediate" | "advanced" | "all_levels",
  "intent": "1 sentence describing what student wants",
  "vibe_summary": "Short 3-badge vibe summary e.g. 📸 Creative • 🤝 Social",
  "niche_flag": true | false
}"""

        try:
            response = await asyncio.wait_for(
                client.chat.completions.create(
                    model=self.model,
                    messages=[
                        {"role": "system", "content": system_msg},
                        {"role": "user", "content": user_text},
                    ],
                    response_format={"type": "json_object"},
                    temperature=0.3,
                ),
                timeout=settings.AI_REQUEST_TIMEOUT_SECONDS,
            )

            raw_text = response.choices[0].message.content or ""
            parsed = json.loads(raw_text)
            return UnderstoodVibe(**parsed)

        except asyncio.TimeoutError:
            raise AIProviderTimeoutError("groq", settings.AI_REQUEST_TIMEOUT_SECONDS)
        except json.JSONDecodeError as e:
            raise AIProviderInvalidResponseError("groq", str(e), "Failed to parse JSON")
        except Exception as e:
            err_str = str(e).lower()
            if "429" in err_str or "rate limit" in err_str:
                raise AIProviderRateLimitError("groq", str(e))
            if "api_key" in err_str or "401" in err_str:
                raise AIProviderAuthError("groq", str(e))
            raise AIProviderError("groq", str(e))

    async def generate_explanation(
        self,
        user_query: str,
        vibe: UnderstoodVibe,
        candidate: Dict[str, Any],
    ) -> str:
        client = self._ensure_client()
        name = candidate.get("name", "")
        category = candidate.get("category", "")
        desc = candidate.get("description", "")
        tags = ", ".join(candidate.get("tags", []))

        prompt = f"""Student Query: "{user_query}"
Interests: {', '.join(vibe.interests)}
Social Preference: {vibe.social_preference}

Community / Event:
Name: {name} ({category})
Description: {desc}
Tags: {tags}

Write 1-2 conversational sentences explaining why this fits the student. Ground strictly in facts. No preamble."""

        try:
            response = await asyncio.wait_for(
                client.chat.completions.create(
                    model=self.model,
                    messages=[{"role": "user", "content": prompt}],
                    temperature=0.4,
                ),
                timeout=settings.AI_REQUEST_TIMEOUT_SECONDS,
            )
            return (response.choices[0].message.content or "").strip()
        except asyncio.TimeoutError:
            raise AIProviderTimeoutError("groq", settings.AI_REQUEST_TIMEOUT_SECONDS)
        except Exception as e:
            raise AIProviderError("groq", str(e))

    async def generate_icebreaker(
        self,
        item_name: str,
        category: str,
        contact_lead: str,
        style: str,
        user_context: str,
    ) -> str:
        client = self._ensure_client()

        prompt = f"""Generate a single friendly icebreaker message for an Aatmoday student reaching out to a campus club.
Recipient: {contact_lead} ({item_name}, {category})
Style: {style}
Student Interest: {user_context}

Return ONLY the message without quotes."""

        try:
            response = await asyncio.wait_for(
                client.chat.completions.create(
                    model=self.model,
                    messages=[{"role": "user", "content": prompt}],
                    temperature=0.5,
                ),
                timeout=settings.AI_REQUEST_TIMEOUT_SECONDS,
            )
            return (response.choices[0].message.content or "").strip().strip('"')
        except asyncio.TimeoutError:
            raise AIProviderTimeoutError("groq", settings.AI_REQUEST_TIMEOUT_SECONDS)
        except Exception as e:
            raise AIProviderError("groq", str(e))
