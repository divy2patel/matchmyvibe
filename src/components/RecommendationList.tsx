"use client";

import React, { useState } from "react";
import type { RecommendationItem } from "@/lib/types";
import RecommendationCard from "./RecommendationCard";

interface RecommendationListProps {
  interests: string[];
  recommendations: RecommendationItem[];
  isFallback: boolean;
  fallbackNotice?: string;
  meta: {
    totalCandidatesEvaluated: number;
    processingTimeMs: number;
    mode: "live" | "mock";
  };
  onSelectCard?: (item: RecommendationItem) => void;
  bookmarks: string[];
  onToggleBookmark: (id: string) => void;
}

export default function RecommendationList({
  interests,
  recommendations,
  isFallback,
  fallbackNotice,
  meta,
  onSelectCard,
  bookmarks,
  onToggleBookmark,
}: RecommendationListProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [selectedType, setSelectedType] = useState<string>("All");

  // Filter categories
  const categories = [
    "All",
    ...Array.from(new Set(recommendations.map((r) => r.category))),
  ];

  const filteredRecommendations = recommendations.filter((item) => {
    const matchesCat =
      selectedCategory === "All" || item.category === selectedCategory;
    const matchesType =
      selectedType === "All" ||
      (selectedType === "Clubs" && item.type === "group") ||
      (selectedType === "Events" && item.type === "event") ||
      (selectedType === "Saved" && bookmarks.includes(item.id));
    return matchesCat && matchesType;
  });

  return (
    <div style={{ marginTop: "32px" }}>
      {/* Extracted Interests Pills */}
      {interests.length > 0 && (
        <div
          className="slide-up"
          style={{
            marginBottom: "20px",
            display: "flex",
            alignItems: "center",
            gap: "10px",
            flexWrap: "wrap",
          }}
        >
          <span
            style={{
              fontSize: "12px",
              color: "var(--text-muted)",
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              fontWeight: 600,
            }}
          >
            Extracted Vibe:
          </span>
          {interests.map((interest, i) => (
            <span
              key={i}
              style={{
                padding: "5px 14px",
                borderRadius: "20px",
                background: "rgba(99, 102, 241, 0.15)",
                border: "1px solid rgba(99, 102, 241, 0.3)",
                color: "var(--primary-300)",
                fontSize: "13px",
                fontWeight: 600,
                display: "inline-flex",
                alignItems: "center",
                gap: "4px",
              }}
            >
              #{interest}
            </span>
          ))}
        </div>
      )}

      {/* Fallback Notice Banner */}
      {isFallback && (
        <div
          className="slide-up"
          style={{
            padding: "16px 20px",
            borderRadius: "14px",
            background: "rgba(245, 158, 11, 0.1)",
            border: "1px solid rgba(245, 158, 11, 0.3)",
            color: "var(--accent-400)",
            fontSize: "14px",
            lineHeight: 1.6,
            marginBottom: "24px",
            display: "flex",
            alignItems: "flex-start",
            gap: "12px",
          }}
        >
          <span style={{ fontSize: "20px" }}>💡</span>
          <div>
            <strong style={{ display: "block", marginBottom: "2px" }}>
              Niche or Exploratory Query
            </strong>
            {fallbackNotice ||
              "We couldn't find an exact club for your specific request, but based on your creative hands-on vibe, here are vibrant campus communities!"}
          </div>
        </div>
      )}

      {/* Filter Chips Bar */}
      <div
        style={{
          display: "flex",
          gap: "12px",
          marginBottom: "16px",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        {/* Type Filter Pills */}
        <div
          style={{
            display: "flex",
            gap: "6px",
            background: "var(--bg-card)",
            padding: "4px",
            borderRadius: "12px",
            border: "1px solid var(--border-subtle)",
          }}
        >
          {["All", "Clubs", "Events", "Saved"].map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setSelectedType(t)}
              style={{
                padding: "4px 12px",
                borderRadius: "8px",
                border: "none",
                background: selectedType === t ? "var(--primary-600)" : "transparent",
                color: selectedType === t ? "#fff" : "var(--text-muted)",
                fontSize: "12px",
                fontWeight: 600,
                cursor: "pointer",
                transition: "all 0.2s",
              }}
            >
              {t === "Saved" ? `★ Saved (${bookmarks.length})` : t}
            </button>
          ))}
        </div>

        {/* Category Dropdown/Pills */}
        {categories.length > 2 && (
          <div style={{ display: "flex", gap: "6px", overflowX: "auto" }}>
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                style={{
                  padding: "4px 10px",
                  borderRadius: "14px",
                  border: "1px solid var(--border-subtle)",
                  background:
                    selectedCategory === cat
                      ? "rgba(99, 102, 241, 0.2)"
                      : "var(--bg-secondary)",
                  color:
                    selectedCategory === cat
                      ? "var(--primary-300)"
                      : "var(--text-muted)",
                  fontSize: "11px",
                  fontWeight: 600,
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                }}
              >
                {cat}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Results Header & Meta */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "16px",
          flexWrap: "wrap",
          gap: "8px",
        }}
      >
        <h3
          style={{
            fontSize: "18px",
            fontWeight: 700,
            fontFamily: "'Space Grotesk', sans-serif",
            color: "var(--text-primary)",
          }}
        >
          Top Matches for You ({filteredRecommendations.length})
        </h3>
        <span
          style={{
            fontSize: "12px",
            color: "var(--text-muted)",
          }}
        >
          Evaluated {meta.totalCandidatesEvaluated} candidates in{" "}
          <strong style={{ color: "var(--primary-300)" }}>
            {meta.processingTimeMs}ms
          </strong>{" "}
          ({meta.mode === "mock" ? "Demo mode" : "Gemini AI"})
        </span>
      </div>

      {/* Recommendation Cards */}
      {filteredRecommendations.length > 0 ? (
        filteredRecommendations.map((item, index) => (
          <RecommendationCard
            key={item.id}
            item={item}
            index={index}
            onSelect={onSelectCard}
            isBookmarked={bookmarks.includes(item.id)}
            onToggleBookmark={onToggleBookmark}
          />
        ))
      ) : (
        <div
          className="glass"
          style={{
            padding: "40px 20px",
            borderRadius: "16px",
            textAlign: "center",
            color: "var(--text-muted)",
          }}
        >
          <p style={{ fontSize: "16px", marginBottom: "8px" }}>
            No matches found for this filter.
          </p>
          <p style={{ fontSize: "13px" }}>
            Try resetting your filter or searching for different hobbies!
          </p>
        </div>
      )}
    </div>
  );
}
