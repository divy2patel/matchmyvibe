import pytest
from datetime import datetime, timezone, timedelta
from backend.app.services.matching.engine import matching_engine
from backend.app.schemas.match import MatchRequest, UnderstoodVibe
from backend.app.repositories.events import events_repo


def test_hybrid_scoring_formula():
    """Verify the 6-factor scoring formula behaves as expected."""
    vibe = UnderstoodVibe(
        interests=["coding", "ai"],
        categories=["Technology"],
        activity_preferences=["hands-on"],
        social_preference="collaborative",
        experience_level="beginner",
        intent="Learn coding",
        vibe_summary="💻 Tech",
        niche_flag=False,
    )

    candidate = {
        "name": "Aatmoday Developers Club",
        "category": "Technology",
        "description": "hands-on coding and hackathons",
        "tags": ["coding", "ai", "web-dev"],
    }

    score, signals = matching_engine.calculate_hybrid_score(
        semantic_sim=0.9,
        vibe=vibe,
        candidate=candidate,
        is_event=False,
    )

    assert 0.0 <= score <= 1.0
    assert score >= 0.8  # Strong match due to full category and tag overlap
    assert signals["semantic_sim"] == 0.9
    assert signals["category_match"] == 1.0
    assert signals["activity_match"] == 1.0


def test_expired_events_filtered_out():
    """Verify that events with event_date in the past are NEVER recommended."""
    now = datetime.now(timezone.utc)
    upcoming_events = events_repo.get_upcoming()

    for event in upcoming_events:
        event_dt = datetime.fromisoformat(event["event_date"].replace("Z", "+00:00"))
        assert event_dt >= now, f"Expired event found: {event['name']} with date {event['event_date']}"


@pytest.mark.asyncio
async def test_end_to_end_match_composition():
    """Verify top 3 groups + top 2 events guarantee in response."""
    request = MatchRequest(text="I love competitive gaming and late-night coding")
    response = await matching_engine.match(request)

    assert response.success is True
    groups = [r for r in response.recommendations if r.type == "group"]
    events = [r for r in response.recommendations if r.type == "event"]

    assert len(groups) == 3, f"Expected 3 groups, got {len(groups)}"
    assert len(events) == 2, f"Expected 2 events, got {len(events)}"
    assert len(response.recommendations) == 5

    # Check that each item has 3 icebreakers
    for rec in response.recommendations:
        assert len(rec.icebreakers) == 3
        assert rec.match_score > 0.0
        assert rec.match_tier in ["high", "moderate", "exploratory"]
        assert len(rec.match_reason) > 10
