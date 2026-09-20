import { NextRequest, NextResponse } from "next/server";
import { MatchRequestSchema } from "@/lib/types";
import type { MatchResponse, RecommendationItem } from "@/lib/types";
import { getAllCandidates, getCandidateById, logSearch } from "@/lib/db";
import { extractInterests, embedQuery, rerankAndExplain, isMockMode } from "@/lib/ai";
import { topK } from "@/lib/vector";

export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
    // ─── Parse & Validate Input ─────────────────────────────────────────
    const body = await request.json();
    const parsed = MatchRequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: parsed.error.issues[0]?.message || "Invalid input.",
        },
        { status: 400 }
      );
    }

    const { text } = parsed.data;

    // ─── Step 1: Extract Interests ──────────────────────────────────────
    const extraction = await extractInterests(text);

    // ─── Step 2: Generate Query Embedding & Vector Search ───────────────
    // REQUIREMENT: Embed description plus tags
    const queryText = `${extraction.interests.join(" ")} | ${text}`;
    const queryEmbedding = await embedQuery(queryText);

    // Filter upcoming candidates only (db.ts filters out past events)
    const candidates = getAllCandidates();
    const topCandidates = topK(
      queryEmbedding,
      candidates,
      (c) => c.embedding,
      10
    );

    // ─── Step 3: LLM Re-Rank & Icebreaker Generation ───────────────────
    const candidatesForRerank = topCandidates.map((sc) => ({
      id: sc.item.id,
      name: sc.item.name,
      category: sc.item.category,
      description: sc.item.description,
      tags: sc.item.tags,
      targetAudience: sc.item.targetAudience,
    }));

    const reranked = await rerankAndExplain(
      text,
      extraction.interests,
      candidatesForRerank
    );

    // ─── Build Response: Top 3 Groups + Top 2 Events ────────────────────
    const allRecommendations: RecommendationItem[] = [];

    for (const sel of reranked.selected) {
      const candidate = getCandidateById(sel.id);
      if (candidate) {
        allRecommendations.push({
          id: candidate.id,
          type: candidate.type,
          name: candidate.name,
          category: candidate.category,
          relevance_score: sel.relevance_score,
          explanation: sel.explanation,
          icebreakers: sel.icebreakers as [string, string, string],
          tags: candidate.tags,
          meetingTime: candidate.meetingTime,
          eventDate: candidate.eventDate,
          location: candidate.location,
          contactLead: candidate.contactLead,
          contactPerson: candidate.contactPerson,
          targetAudience: candidate.targetAudience,
          matchTier: sel.matchTier,
        });
      }
    }

    // REQUIREMENT: Return top 3 groups plus top 2 events
    const groups = allRecommendations.filter((r) => r.type === "group").slice(0, 3);
    const events = allRecommendations.filter((r) => r.type === "event").slice(0, 2);

    let finalRecommendations = [...groups, ...events];

    // If either is short, fill up to 5 with remaining candidates
    if (finalRecommendations.length < 5) {
      const existingIds = new Set(finalRecommendations.map((r) => r.id));
      for (const item of allRecommendations) {
        if (!existingIds.has(item.id)) {
          finalRecommendations.push(item);
          existingIds.add(item.id);
          if (finalRecommendations.length >= 5) break;
        }
      }
    }

    // ─── Log Search ─────────────────────────────────────────────────────
    logSearch(
      text,
      extraction.interests,
      finalRecommendations.map((r) => r.id),
      reranked.isFallback
    );

    // ─── Return Response ────────────────────────────────────────────────
    const response: MatchResponse = {
      success: true,
      interests: extraction.interests,
      recommendations: finalRecommendations,
      isFallback: reranked.isFallback,
      fallbackNotice: reranked.fallbackNotice,
      meta: {
        totalCandidatesEvaluated: candidates.length,
        processingTimeMs: Date.now() - startTime,
        mode: isMockMode() ? "mock" : "live",
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Match API error:", error);

    const fallbackResponse: MatchResponse = {
      success: true,
      interests: ["exploration"],
      recommendations: [],
      isFallback: true,
      fallbackNotice:
        "Something went wrong, but don't worry! Try rephrasing your interests and we'll find your tribe.",
      meta: {
        totalCandidatesEvaluated: 0,
        processingTimeMs: Date.now() - startTime,
        mode: isMockMode() ? "mock" : "live",
      },
    };

    return NextResponse.json(fallbackResponse, { status: 200 });
  }
}
