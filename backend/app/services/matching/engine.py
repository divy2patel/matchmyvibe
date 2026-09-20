import time
import logging
from typing import List, Dict, Any, Tuple
from datetime import datetime, timezone
from backend.app.core.config import settings
from backend.app.schemas.match import (
    MatchRequest,
    MatchResponse,
    MatchResponseMeta,
    RecommendationItem,
    UnderstoodVibe,
)
from backend.app.services.ai.manager import ai_manager
from backend.app.services.ai.embeddings import generate_embedding
from backend.app.repositories.groups import groups_repo
from backend.app.repositories.events import events_repo
from backend.app.repositories.users import users_repo

logger = logging.getLogger("matchmyvibe.matching.engine")


class HybridMatchingEngine:
    def calculate_hybrid_score(
        self,
        semantic_sim: float,
        vibe: UnderstoodVibe,
        candidate: Dict[str, Any],
        is_event: bool = False,
    ) -> Tuple[float, Dict[str, Any]]:
        """
        Calculates hybrid score combining:
        - semantic_similarity (0.45)
        - interest_overlap (0.20)
        - category_match (0.15)
        - activity_match (0.10)
        - social_fit (0.05)
        - freshness (0.05)
        """
        cand_tags = [t.lower() for t in candidate.get("tags", [])]
        cand_category = candidate.get("category", "")
        cand_desc = candidate.get("description", "").lower()

        # 1. Interest Tag Overlap
        overlap_count = sum(
            1 for interest in vibe.interests
            if any(interest.lower() in tag or tag in interest.lower() for tag in cand_tags)
        )
        interest_overlap = min(1.0, overlap_count / max(1, len(vibe.interests)))

        # 2. Category Match
        category_match = 1.0 if cand_category in vibe.categories else (
            0.5 if any(c.lower() in cand_desc for c in vibe.categories) else 0.2
        )

        # 3. Activity Match
        activity_match = 0.5
        for pref in vibe.activity_preferences:
            if pref.lower() in cand_desc or any(pref.lower() in t for t in cand_tags):
                activity_match = 1.0
                break

        # 4. Social Fit (introverted vs energetic)
        social_fit = 0.7
        is_introvert = vibe.social_preference == "low_pressure"
        if is_introvert:
            if any(w in cand_desc for w in ["gentle", "introverted", "quiet", "acoustic", "nature"]):
                social_fit = 1.0
            elif any(w in cand_desc for w in ["intense", "high-energy", "crowd", "shouting"]):
                social_fit = 0.3
        else:
            if any(w in cand_desc for w in ["competitive", "high-energy", "tournament", "hackathon"]):
                social_fit = 1.0

        # 5. Freshness / Proximity (for events)
        freshness = 0.8
        if is_event and "event_date" in candidate:
            try:
                event_dt = datetime.fromisoformat(candidate["event_date"].replace("Z", "+00:00"))
                now = datetime.now(timezone.utc)
                days_away = (event_dt - now).days
                if 0 <= days_away <= 14:
                    freshness = 1.0  # Within next 2 weeks is prime
                elif days_away <= 30:
                    freshness = 0.85
                else:
                    freshness = 0.6
            except Exception:
                freshness = 0.7

        # Weighted calculation
        raw_score = (
            (semantic_sim * settings.WEIGHT_SEMANTIC) +
            (interest_overlap * settings.WEIGHT_INTEREST_OVERLAP) +
            (category_match * settings.WEIGHT_CATEGORY) +
            (activity_match * settings.WEIGHT_ACTIVITY) +
            (social_fit * settings.WEIGHT_SOCIAL_FIT) +
            (freshness * settings.WEIGHT_FRESHNESS)
        )

        final_score = round(max(0.1, min(0.99, raw_score)), 3)

        signals = {
            "semantic_sim": round(semantic_sim, 3),
            "interest_overlap": round(interest_overlap, 3),
            "category_match": round(category_match, 3),
            "activity_match": round(activity_match, 3),
            "social_fit": round(social_fit, 3),
            "freshness": round(freshness, 3),
        }

        return final_score, signals

    async def match(self, request: MatchRequest, user_id: str = "anonymous") -> MatchResponse:
        start_time = time.time()

        # Step 1: Extract Interests & Vibe with AI Provider Failover
        vibe, provider_used, fallback_triggered, fallback_reason = await ai_manager.extract_interests(request.text)

        # Step 2: Generate Vector Embedding & Retrieve Candidates
        query_vector_text = f"{' '.join(vibe.interests)} | {' '.join(vibe.categories)} | {request.text}"
        query_embedding = await generate_embedding(query_vector_text)

        # Retrieve top candidates via vector search
        group_candidates = groups_repo.search_vector(query_embedding, match_threshold=0.0, limit=10)
        event_candidates = events_repo.search_vector(query_embedding, match_threshold=0.0, limit=10)

        # Step 3: Hybrid Scoring
        scored_groups = []
        for g in group_candidates:
            sim = g.get("similarity", 0.5)
            score, signals = self.calculate_hybrid_score(sim, vibe, g, is_event=False)
            scored_groups.append((score, g, signals))

        scored_events = []
        for e in event_candidates:
            sim = e.get("similarity", 0.5)
            score, signals = self.calculate_hybrid_score(sim, vibe, e, is_event=True)
            scored_events.append((score, e, signals))

        # Sort descending by hybrid score
        scored_groups.sort(key=lambda x: x[0], reverse=True)
        scored_events.sort(key=lambda x: x[0], reverse=True)

        # Guarantee Top 3 Groups + Top 2 Events
        top_groups = scored_groups[:3]
        top_events = scored_events[:2]

        total_evaluated = len(group_candidates) + len(event_candidates)
        recommendations: List[RecommendationItem] = []

        # Process Groups
        for score, g, signals in top_groups:
            tier = "high" if score >= 0.78 else ("moderate" if score >= 0.55 else "exploratory")
            explanation = await ai_manager.generate_explanation(request.text, vibe, g)

            # Generate 3 styles of icebreakers [Casual, Direct, Gentle]
            casual_ice = await ai_manager.generate_icebreaker(g["name"], g["category"], g["contact_lead"], "casual", vibe.interests[0] if vibe.interests else g["category"])
            direct_ice = await ai_manager.generate_icebreaker(g["name"], g["category"], g["contact_lead"], "short", vibe.interests[0] if vibe.interests else g["category"])
            gentle_ice = await ai_manager.generate_icebreaker(g["name"], g["category"], g["contact_lead"], "introvert", vibe.interests[0] if vibe.interests else g["category"])

            recommendations.append(
                RecommendationItem(
                    id=g["id"],
                    type="group",
                    name=g["name"],
                    slug=g.get("slug"),
                    category=g["category"],
                    description=g["description"],
                    image_url=g.get("image_url"),
                    match_score=score,
                    match_tier=tier,
                    match_reason=explanation,
                    match_signals=signals,
                    location=g["location"],
                    meeting_information=g.get("meeting_information"),
                    contact_lead=g["contact_lead"],
                    contact_information=g.get("contact_information"),
                    target_audience=g.get("target_audience", "All interested students"),
                    tags=g.get("tags", []),
                    icebreakers=[casual_ice, direct_ice, gentle_ice],
                )
            )

        # Process Events
        for score, cand, signals in top_events:
            tier = "high" if score >= 0.78 else ("moderate" if score >= 0.55 else "exploratory")
            explanation = await ai_manager.generate_explanation(request.text, vibe, cand)

            casual_ice = await ai_manager.generate_icebreaker(cand["name"], cand["category"], cand["contact_lead"], "friendly", cand["name"])
            direct_ice = await ai_manager.generate_icebreaker(cand["name"], cand["category"], cand["contact_lead"], "short", cand["name"])
            gentle_ice = await ai_manager.generate_icebreaker(cand["name"], cand["category"], cand["contact_lead"], "introvert", cand["name"])

            recommendations.append(
                RecommendationItem(
                    id=cand["id"],
                    type="event",
                    name=cand["name"],
                    category=cand["category"],
                    description=cand["description"],
                    image_url=cand.get("image_url"),
                    match_score=score,
                    match_tier=tier,
                    match_reason=explanation,
                    match_signals=signals,
                    location=cand["location"],
                    event_date=cand.get("event_date"),
                    contact_lead=cand["contact_lead"],
                    contact_information=cand.get("contact_information"),
                    target_audience=cand.get("target_audience", "Campus students"),
                    tags=cand.get("tags", []),
                    icebreakers=[casual_ice, direct_ice, gentle_ice],
                )
            )

        # Log search query
        users_repo.log_search(user_id, request.text, vibe.interests)

        elapsed_ms = int((time.time() - start_time) * 1000)

        fallback_notice = None
        if vibe.niche_flag or len(vibe.categories) == 0:
            fallback_notice = (
                "You mentioned an exploratory or niche interest! Here are vibrant, welcoming campus communities "
                "with hands-on members ready to explore it with you."
            )

        return MatchResponse(
            success=True,
            vibe=vibe,
            recommendations=recommendations,
            is_fallback=fallback_triggered,
            fallback_notice=fallback_notice,
            meta=MatchResponseMeta(
                provider_used=provider_used,
                fallback_triggered=fallback_triggered,
                fallback_reason=fallback_reason or None,
                total_candidates_evaluated=total_evaluated,
                processing_time_ms=elapsed_ms,
            ),
        )


matching_engine = HybridMatchingEngine()
