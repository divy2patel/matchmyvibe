import pytest
from unittest.mock import AsyncMock, patch
from backend.app.services.ai.manager import AIProviderManager
from backend.app.core.errors import (
    AIProviderTimeoutError,
    AIProviderRateLimitError,
    AIProviderInvalidResponseError,
    AIProviderError,
)
from backend.app.schemas.match import UnderstoodVibe


@pytest.mark.asyncio
async def test_scenario_1_gemini_succeeds():
    """Test 1: Gemini succeeds -> returns Gemini output with no fallback."""
    manager = AIProviderManager()
    expected_vibe = UnderstoodVibe(
        interests=["photography", "video"],
        categories=["Creative"],
        activity_preferences=["hands-on"],
        social_preference="collaborative",
        experience_level="beginner",
        intent="Learn portrait framing",
        vibe_summary="📸 Creative • 🤝 Social",
        niche_flag=False,
    )

    with patch.object(manager.gemini, "extract_interests", new=AsyncMock(return_value=expected_vibe)):
        vibe, provider, fallback_triggered, reason = await manager.extract_interests("I love photography and reels")
        assert provider == "gemini"
        assert not fallback_triggered
        assert vibe.interests == ["photography", "video"]


@pytest.mark.asyncio
async def test_scenario_2_gemini_timeout_triggers_groq():
    """Test 2: Gemini times out -> seamlessly falls back to Groq."""
    manager = AIProviderManager()
    groq_vibe = UnderstoodVibe(
        interests=["coding", "hackathons"],
        categories=["Technology"],
        activity_preferences=["hackathons"],
        social_preference="collaborative",
        experience_level="all_levels",
        intent="Build apps with friends",
        vibe_summary="💻 Tech",
        niche_flag=False,
    )

    with patch.object(manager.gemini, "extract_interests", side_effect=AIProviderTimeoutError("gemini", 6.0)):
        with patch.object(manager.groq, "extract_interests", new=AsyncMock(return_value=groq_vibe)):
            vibe, provider, fallback_triggered, reason = await manager.extract_interests("I like hackathons and coding")
            assert provider == "groq"
            assert fallback_triggered is True
            assert "Gemini" in reason
            assert "coding" in vibe.interests


@pytest.mark.asyncio
async def test_scenario_3_gemini_rate_limit_triggers_groq():
    """Test 3: Gemini rate limited (429) -> seamlessly falls back to Groq."""
    manager = AIProviderManager()
    groq_vibe = UnderstoodVibe(
        interests=["acoustic guitar", "singing"],
        categories=["Performing Arts"],
        activity_preferences=["jams"],
        social_preference="low_pressure",
        experience_level="beginner",
        intent="Quiet music jams",
        vibe_summary="🎵 Music • 🌱 Gentle",
        niche_flag=False,
    )

    with patch.object(manager.gemini, "extract_interests", side_effect=AIProviderRateLimitError("gemini")):
        with patch.object(manager.groq, "extract_interests", new=AsyncMock(return_value=groq_vibe)):
            vibe, provider, fallback_triggered, reason = await manager.extract_interests("acoustic guitar, introverted")
            assert provider == "groq"
            assert fallback_triggered is True
            assert vibe.social_preference == "low_pressure"


@pytest.mark.asyncio
async def test_scenario_4_gemini_malformed_json_triggers_groq():
    """Test 4: Gemini returns malformed output -> Groq succeeds."""
    manager = AIProviderManager()
    groq_vibe = UnderstoodVibe(
        interests=["trekking", "camping"],
        categories=["Adventure"],
        activity_preferences=["hikes"],
        social_preference="collaborative",
        experience_level="beginner",
        intent="Weekend hill climbing",
        vibe_summary="🏔️ Explorer",
        niche_flag=False,
    )

    with patch.object(manager.gemini, "extract_interests", side_effect=AIProviderInvalidResponseError("gemini", "{bad json", "JSONDecodeError")):
        with patch.object(manager.groq, "extract_interests", new=AsyncMock(return_value=groq_vibe)):
            vibe, provider, fallback_triggered, reason = await manager.extract_interests("weekend hikes at pavagadh")
            assert provider == "groq"
            assert fallback_triggered is True
            assert "trekking" in vibe.interests


@pytest.mark.asyncio
async def test_scenario_5_both_providers_fail_triggers_deterministic():
    """Test 5: Both Gemini and Groq fail -> Deterministic safety net returns valid response without crashing."""
    manager = AIProviderManager()

    with patch.object(manager.gemini, "extract_interests", side_effect=AIProviderError("gemini", "Gemini total outage")):
        with patch.object(manager.groq, "extract_interests", side_effect=AIProviderError("groq", "Groq total outage")):
            vibe, provider, fallback_triggered, reason = await manager.extract_interests("Bhai coding ane gaming no shokh chhe")
            assert provider == "deterministic"
            assert fallback_triggered is True
            assert len(vibe.interests) > 0
            assert any(c in vibe.categories for c in ["Technology", "Creative", "Performing Arts"])
