"use client";

import React, { useState } from "react";
import Link from "next/link";
import type { RecommendationItem } from "@/lib/types";

interface RecommendationCardProps {
  item: RecommendationItem;
  index: number;
  onSelect?: (item: RecommendationItem) => void;
  isBookmarked?: boolean;
  onToggleBookmark?: (id: string) => void;
}

const CATEGORY_ICONS: Record<string, string> = {
  Tech: "💻",
  Coding: "💻",
  Arts: "🎨",
  "Arts & Culture": "🎨",
  Sports: "⚽",
  Music: "🎵",
  "Music & Dance": "💃",
  Social: "🤝",
  Voluntourism: "🤝",
  Gaming: "🎮",
  "Academics & Careers": "📚",
};

const TIER_CONFIG = {
  high: {
    label: "High Match",
    color: "var(--tier-high)",
    bg: "rgba(34, 197, 94, 0.1)",
    border: "rgba(34, 197, 94, 0.2)",
  },
  moderate: {
    label: "Great Fit",
    color: "var(--tier-moderate)",
    bg: "rgba(59, 130, 246, 0.1)",
    border: "rgba(59, 130, 246, 0.2)",
  },
  exploratory: {
    label: "Exploratory",
    color: "var(--tier-exploratory)",
    bg: "rgba(245, 158, 11, 0.1)",
    border: "rgba(245, 158, 11, 0.2)",
  },
};

export default function RecommendationCard({
  item,
  index,
  onSelect,
  isBookmarked = false,
  onToggleBookmark,
}: RecommendationCardProps) {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [icebreakerToneIndex, setIcebreakerToneIndex] = useState<number>(0);
  const [feedback, setFeedback] = useState<"positive" | "negative" | null>(null);

  const handleFeedback = (e: React.MouseEvent, type: "positive" | "negative") => {
    e.stopPropagation();
    setFeedback(type);
  };

  const tier = TIER_CONFIG[item.matchTier];
  const icon = CATEGORY_ICONS[item.category] || "🌟";
  const scorePercent = Math.round(item.relevance_score * 100);

  const displayIcebreaker =
    item.icebreakers && item.icebreakers[icebreakerToneIndex]
      ? item.icebreakers[icebreakerToneIndex]
      : item.icebreakers?.[0] || "";

  const handleCopyIcebreaker = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(displayIcebreaker);
      setCopiedIndex(icebreakerToneIndex);
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch {
      const textarea = document.createElement("textarea");
      textarea.value = displayIcebreaker;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setCopiedIndex(icebreakerToneIndex);
      setTimeout(() => setCopiedIndex(null), 2000);
    }
  };

  return (
    <div
      className="slide-up glass"
      style={{
        animationDelay: `${index * 0.08}s`,
        borderRadius: "18px",
        padding: "24px",
        marginBottom: "16px",
        transition: "all 0.3s var(--ease-smooth)",
        borderColor: isHovered ? "var(--border-accent)" : undefined,
        transform: isHovered ? "translateY(-2px)" : undefined,
        boxShadow: isHovered
          ? "0 14px 44px rgba(0, 0, 0, 0.35)"
          : "0 4px 20px rgba(0, 0, 0, 0.15)",
        cursor: onSelect ? "pointer" : "default",
        position: "relative",
      }}
      onClick={() => onSelect && onSelect(item)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* ─── Header Row ───────────────────────────────────────── */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          gap: "12px",
          marginBottom: "14px",
        }}
      >
        {/* Category Icon */}
        <div
          style={{
            width: "46px",
            height: "46px",
            borderRadius: "14px",
            background: `linear-gradient(135deg, ${tier.bg}, rgba(99, 102, 241, 0.1))`,
            border: `1px solid ${tier.border}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "22px",
            flexShrink: 0,
          }}
        >
          {icon}
        </div>

        {/* Name & Type */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <h3
            style={{
              fontSize: "17px",
              fontWeight: 700,
              fontFamily: "'Space Grotesk', sans-serif",
              color: "var(--text-primary)",
              lineHeight: 1.3,
              marginBottom: "3px",
            }}
          >
            {item.name}
          </h3>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              fontSize: "12px",
              color: "var(--text-muted)",
            }}
          >
            <span
              style={{
                padding: "2px 8px",
                borderRadius: "6px",
                background:
                  item.type === "event"
                    ? "rgba(168, 85, 247, 0.12)"
                    : "rgba(99, 102, 241, 0.12)",
                color:
                  item.type === "event"
                    ? "#c084fc"
                    : "var(--primary-300)",
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                fontSize: "10px",
              }}
            >
              {item.type === "event" ? "📅 Upcoming Event" : "👥 Campus Club"}
            </span>
            <span>{item.category}</span>
          </div>
        </div>

        {/* Confidence Score & Bookmark */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          {onToggleBookmark && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onToggleBookmark(item.id);
              }}
              style={{
                background: "transparent",
                border: "none",
                color: isBookmarked ? "#fbbf24" : "var(--text-muted)",
                fontSize: "18px",
                cursor: "pointer",
                padding: "2px",
              }}
              title={isBookmarked ? "Bookmarked" : "Bookmark"}
            >
              {isBookmarked ? "★" : "☆"}
            </button>
          )}

          <div
            style={{
              padding: "4px 12px",
              borderRadius: "20px",
              background: tier.bg,
              border: `1px solid ${tier.border}`,
              color: tier.color,
              fontSize: "12px",
              fontWeight: 700,
              whiteSpace: "nowrap",
              flexShrink: 0,
            }}
          >
            {tier.label} {scorePercent}%
          </div>
        </div>
      </div>

      {/* ─── Match Signal Progress Bar ───────────────────── */}
      <div style={{ marginBottom: "14px" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontSize: "11px",
            color: "var(--text-muted)",
            marginBottom: "4px",
            textTransform: "uppercase",
            letterSpacing: "0.06em",
            fontWeight: 700,
          }}
        >
          <span style={{ color: "var(--accent-amber)" }}>Match Signal</span>
          <strong style={{ color: tier.color }}>{scorePercent}% Interest Fit</strong>
        </div>
        <div
          style={{
            width: "100%",
            height: "5px",
            borderRadius: "3px",
            background: "var(--bg-secondary)",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              width: `${scorePercent}%`,
              height: "100%",
              borderRadius: "3px",
              background: `linear-gradient(90deg, ${tier.color}, var(--primary-400))`,
              transition: "width 0.5s var(--ease-smooth)",
            }}
          />
        </div>
      </div>

      {/* ─── Explanation / Why This Fits with Evidence Tags ─────── */}
      <div
        style={{
          padding: "14px 18px",
          borderRadius: "14px",
          background: "rgba(91, 85, 245, 0.06)",
          border: "1px solid rgba(124, 92, 255, 0.18)",
          borderLeft: `3px solid ${tier.color}`,
          marginBottom: "14px",
          fontSize: "13.5px",
          color: "var(--text-secondary)",
          lineHeight: 1.6,
        }}
      >
        <span
          style={{
            fontSize: "11px",
            fontWeight: 700,
            color: "var(--primary-300)",
            textTransform: "uppercase",
            letterSpacing: "0.06em",
            display: "block",
            marginBottom: "4px",
          }}
        >
          ✦ Why this fits your vibe
        </span>
        <p style={{ marginBottom: "8px" }}>{item.explanation}</p>

        {/* Evidence highlights */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginTop: "6px" }}>
          {item.tags.slice(0, 3).map((tag, i) => (
            <span
              key={i}
              style={{
                fontSize: "10.5px",
                padding: "2px 8px",
                borderRadius: "6px",
                background: "rgba(16, 185, 129, 0.12)",
                color: "var(--tier-high)",
                fontWeight: 600,
                display: "inline-flex",
                alignItems: "center",
                gap: "3px",
              }}
            >
              ✓ {tag.replace("-", " ")}
            </span>
          ))}
        </div>
      </div>

      {/* ─── Tags ──────────────────────────────────────────── */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "6px",
          marginBottom: "14px",
        }}
      >
        {item.tags.slice(0, 5).map((tag, i) => (
          <span
            key={i}
            style={{
              padding: "3px 10px",
              borderRadius: "12px",
              background: "var(--bg-secondary)",
              border: "1px solid var(--border-subtle)",
              fontSize: "11px",
              color: "var(--primary-300)",
              fontWeight: 500,
            }}
          >
            #{tag}
          </span>
        ))}
      </div>

      {/* ─── Info Chips (Meeting/Event, Location, Contact) ─── */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "10px",
          marginBottom: "16px",
          fontSize: "12px",
          color: "var(--text-secondary)",
        }}
      >
        {(item.meetingTime || item.eventDate) && (
          <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
            🕐 {item.meetingTime || item.eventDate}
          </span>
        )}
        <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
          📍 {item.location}
        </span>
        <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
          👤 {item.contactPerson || item.contactLead}
        </span>
      </div>

      {/* ─── Icebreaker Box (3 Options) ──────────────────────── */}
      <div
        style={{
          padding: "12px 16px",
          borderRadius: "12px",
          background: "var(--bg-secondary)",
          border: "1px solid var(--border-subtle)",
          display: "flex",
          flexDirection: "column",
          gap: "8px",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <span
            style={{
              fontSize: "11px",
              fontWeight: 700,
              color: "var(--accent-400)",
              textTransform: "uppercase",
              letterSpacing: "0.06em",
            }}
          >
            💬 Ready-to-send icebreakers (3 options)
          </span>

          {/* Tone Switcher */}
          <div style={{ display: "flex", gap: "3px" }}>
            {(
              [
                { index: 0, label: "Casual" },
                { index: 1, label: "Direct" },
                { index: 2, label: "Gentle" },
              ] as const
            ).map((t) => (
              <button
                key={t.index}
                type="button"
                onClick={() => setIcebreakerToneIndex(t.index)}
                style={{
                  padding: "2px 8px",
                  borderRadius: "5px",
                  border: "none",
                  background:
                    icebreakerToneIndex === t.index
                      ? "var(--primary-600)"
                      : "transparent",
                  color:
                    icebreakerToneIndex === t.index ? "#fff" : "var(--text-muted)",
                  fontSize: "10px",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
          }}
        >
          <p
            style={{
              flex: 1,
              fontSize: "13px",
              color: "var(--text-secondary)",
              lineHeight: 1.5,
              fontStyle: "italic",
            }}
          >
            &ldquo;{displayIcebreaker}&rdquo;
          </p>

          <button
            id={`copy-icebreaker-${item.id}`}
            onClick={handleCopyIcebreaker}
            style={{
              padding: "6px 14px",
              borderRadius: "8px",
              border: "1px solid var(--border-accent)",
              background:
                copiedIndex === icebreakerToneIndex
                  ? "rgba(34, 197, 94, 0.15)"
                  : "rgba(99, 102, 241, 0.1)",
              color:
                copiedIndex === icebreakerToneIndex
                  ? "var(--tier-high)"
                  : "var(--primary-300)",
              fontSize: "12px",
              fontWeight: 600,
              fontFamily: "'Inter', sans-serif",
              cursor: "pointer",
              transition: "all 0.2s var(--ease-smooth)",
              whiteSpace: "nowrap",
              flexShrink: 0,
            }}
          >
            {copiedIndex === icebreakerToneIndex ? "✓ Copied!" : "📋 Copy"}
          </button>
        </div>
      </div>

      {/* ─── Feedback & Page Link Footer ────────────────────────── */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginTop: "14px",
          paddingTop: "12px",
          borderTop: "1px solid var(--border-subtle)",
          fontSize: "12px",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{ color: "var(--text-muted)" }}>Useful match?</span>
          <button
            type="button"
            onClick={(e) => handleFeedback(e, "positive")}
            style={{
              background: feedback === "positive" ? "rgba(34, 197, 94, 0.2)" : "transparent",
              border: "1px solid " + (feedback === "positive" ? "var(--tier-high)" : "var(--border-subtle)"),
              borderRadius: "6px",
              padding: "3px 8px",
              cursor: "pointer",
              fontSize: "11px",
              color: feedback === "positive" ? "var(--tier-high)" : "var(--text-secondary)",
            }}
          >
            👍 Yes
          </button>
          <button
            type="button"
            onClick={(e) => handleFeedback(e, "negative")}
            style={{
              background: feedback === "negative" ? "rgba(239, 68, 68, 0.2)" : "transparent",
              border: "1px solid " + (feedback === "negative" ? "#ef4444" : "var(--border-subtle)"),
              borderRadius: "6px",
              padding: "3px 8px",
              cursor: "pointer",
              fontSize: "11px",
              color: feedback === "negative" ? "#fca5a5" : "var(--text-secondary)",
            }}
          >
            👎 Not really
          </button>
          {feedback && <span style={{ color: "var(--primary-300)", fontSize: "11px" }}>Recorded!</span>}
        </div>

        <Link
          href={item.type === "event" ? `/events/${item.id}` : `/groups/${item.id}`}
          style={{
            color: "var(--primary-300)",
            textDecoration: "none",
            fontWeight: 600,
            display: "inline-flex",
            alignItems: "center",
            gap: "4px",
          }}
        >
          View Full Page →
        </Link>
      </div>
    </div>
  );
}
