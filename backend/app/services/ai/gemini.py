import json
import asyncio
import logging
from typing import Dict, Any
from google import genai
from google.genai import types
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

logger = logging.getLogger("matchmyvibe.ai.gemini")


class GeminiProvider(AIProvider):
    name = "gemini"

    def __init__(self):
        self.api_key = settings.GEMINI_API_KEY
        self.model = settings.GEMINI_MODEL
        self._client = None
        if self.api_key and not self.api_key.startswith("your_"):
            self._client = genai.Client(api_key=self.api_key)

    def _ensure_client(self):
        if not self._client:
            if not self.api_key or self.api_key.startswith("your_"):
                raise AIProviderAuthError("gemini", "Gemini API key is not configured")
            self._client = genai.Client(api_key=self.api_key)
        return self._client

    async def extract_interests(self, user_text: str) -> UnderstoodVibe:
        client = self._ensure_client()

        prompt = f"""You are an empathetic student advisor at Aatmoday University.
Analyze this student's query (including Hinglish, Gujarati idioms, colloquial slang, or quiet notes):
"{user_text}"

Extract structured information and return ONLY valid JSON matching this schema:
{{
  "interests": ["2-5 standardized interest keywords"],
  "categories": ["Technology", "Creative", "Performing Arts", "Sports", "Adventure", "Social"],
  "activity_preferences": ["e.g. collaborative, hands-on, hackathons, jams, hikes"],
  "social_preference": "low_pressure" | "collaborative" | "energetic",
  "experience_level": "beginner" | "intermediate" | "advanced" | "all_levels",
  "intent": "1 sentence describing what student wants",
  "vibe_summary": "Short 3-badge vibe summary e.g. 📸 Creative • 🤝 Social • 🌱 Gentle",
  "niche_flag": true | false
}}"""

        try:
            # Run in thread with strict timeout
            response = await asyncio.wait_for(
                asyncio.to_thread(
                    client.models.generate_content,
                    model=self.model,
                    contents=prompt,
                    config=types.GenerateContentConfig(
                        response_mime_type="application/json",
                        temperature=0.3,
                    ),
                ),
                timeout=settings.AI_REQUEST_TIMEOUT_SECONDS,
            )

            raw_text = response.text or ""
            parsed = json.loads(raw_text)
            return UnderstoodVibe(**parsed)

        except asyncio.TimeoutError:
            raise AIProviderTimeoutError("gemini", settings.AI_REQUEST_TIMEOUT_SECONDS)
        except json.JSONDecodeError as e:
            raise AIProviderInvalidResponseError("gemini", str(e), "Failed to parse JSON")
        except Exception as e:
            err_str = str(e).lower()
            if "429" in err_str or "quota" in err_str or "rate limit" in err_str:
                raise AIProviderRateLimitError("gemini", str(e))
            if "api_key" in err_str or "401" in err_str or "403" in err_str:
                raise AIProviderAuthError("gemini", str(e))
            raise AIProviderError("gemini", str(e))

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
Understood Interests: {', '.join(vibe.interests)}
Social Preference: {vibe.social_preference}

Campus Community / Event:
Name: {name} ({category})
Description: {desc}
Tags: {tags}

Write 1-2 warm, conversational sentences explaining directly to the student why this community/event matches their interests and vibe.
Ground the explanation strictly on these facts. Do not invent details."""

        try:
            response = await asyncio.wait_for(
                asyncio.to_thread(
                    client.models.generate_content,
                    model=self.model,
                    contents=prompt,
                    config=types.GenerateContentConfig(temperature=0.4),
                ),
                timeout=settings.AI_REQUEST_TIMEOUT_SECONDS,
            )
            return (response.text or "").strip()
        except asyncio.TimeoutError:
            raise AIProviderTimeoutError("gemini", settings.AI_REQUEST_TIMEOUT_SECONDS)
        except Exception as e:
            raise AIProviderError("gemini", str(e))

    async def generate_icebreaker(
        self,
        item_name: str,
        category: str,
        contact_lead: str,
        style: str,
        user_context: str,
    ) -> str:
        client = self._ensure_client()

        lead_first_name = contact_lead.split()[0] if contact_lead else "there"
        prompt = f"""Generate a single ready-to-send icebreaker message for an Aatmoday student reaching out to a campus club/event.
Recipient: {contact_lead} (lead of {item_name}, category: {category})
Style: {style} (Options: casual, friendly, professional, short, introvert, in_person)
Student Interest Context: {user_context}

Return ONLY the message text without quotes or preamble."""

        try:
            response = await asyncio.wait_for(
                asyncio.to_thread(
                    client.models.generate_content,
                    model=self.model,
                    contents=prompt,
                    config=types.GenerateContentConfig(temperature=0.5),
                ),
                timeout=settings.AI_REQUEST_TIMEOUT_SECONDS,
            )
            return (response.text or "").strip().strip('"')
        except asyncio.TimeoutError:
            raise AIProviderTimeoutError("gemini", settings.AI_REQUEST_TIMEOUT_SECONDS)
        except Exception as e:
            raise AIProviderError("gemini", str(e))
