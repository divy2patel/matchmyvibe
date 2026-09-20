"use client";

import React, { useState } from "react";
import type { RecommendationItem } from "@/lib/types";

interface DetailModalProps {
  item: RecommendationItem;
  onClose: () => void;
  isBookmarked: boolean;
  onToggleBookmark: (id: string) => void;
}

type ChannelType = "whatsapp" | "discord" | "slack";

export default function DetailModal({
  item,
  onClose,
  isBookmarked,
  onToggleBookmark,
}: DetailModalProps) {
  const [toneIndex, setToneIndex] = useState<number>(0); // 0: Casual, 1: Direct, 2: Gentle
  const [channel, setChannel] = useState<ChannelType>("whatsapp");
  const [copied, setCopied] = useState(false);

  const baseIcebreaker =
    item.icebreakers && item.icebreakers[toneIndex]
      ? item.icebreakers[toneIndex]
      : item.icebreakers?.[0] || "";

  // Channel-specific formatting
  const formatChannelText = (text: string, chan: ChannelType): string => {
    switch (chan) {
      case "discord":
        return `Hey **${item.contactPerson || item.contactLead}**! 🚀\n> ${text}\n(Found via MatchMyVibe)`;
      case "slack":
        return `*Hey ${item.contactPerson || item.contactLead}!*\n_${text}_\n\`MatchMyVibe Campus Match\``;
      case "whatsapp":
      default:
        return text;
    }
  };

  const formattedMessage = formatChannelText(baseIcebreaker, channel);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(formattedMessage);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const textarea = document.createElement("textarea");
      textarea.value = formattedMessage;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(formattedMessage)}`;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: "rgba(10, 10, 26, 0.85)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        zIndex: 100,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
      }}
      onClick={onClose}
    >
      <div
        className="slide-up glass"
        style={{
          width: "100%",
          maxWidth: "560px",
          maxHeight: "90vh",
          overflowY: "auto",
          borderRadius: "24px",
          padding: "28px",
          borderColor: "var(--border-accent)",
          boxShadow: "0 20px 60px rgba(0, 0, 0, 0.5)",
          position: "relative",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close & Bookmark buttons */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "20px",
          }}
        >
          <span
            style={{
              padding: "4px 12px",
              borderRadius: "20px",
              background:
                item.type === "event"
                  ? "rgba(168, 85, 247, 0.15)"
                  : "rgba(99, 102, 241, 0.15)",
              color:
                item.type === "event" ? "#c084fc" : "var(--primary-300)",
              fontSize: "12px",
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "0.05em",
            }}
          >
            {item.type === "event" ? "📅 Upcoming Event" : "👥 Campus Club"}
          </span>

          <div style={{ display: "flex", gap: "8px" }}>
            <button
              type="button"
              onClick={() => onToggleBookmark(item.id)}
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "50%",
                border: "1px solid var(--border-subtle)",
                background: isBookmarked
                  ? "rgba(245, 158, 11, 0.2)"
                  : "var(--bg-secondary)",
                color: isBookmarked ? "#fbbf24" : "var(--text-muted)",
                fontSize: "16px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
              title={isBookmarked ? "Remove Bookmark" : "Save to Bookmarks"}
            >
              {isBookmarked ? "★" : "☆"}
            </button>

            <button
              type="button"
              onClick={onClose}
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "50%",
                border: "1px solid var(--border-subtle)",
                background: "var(--bg-secondary)",
                color: "var(--text-secondary)",
                fontSize: "18px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              ✕
            </button>
          </div>
        </div>

        {/* Title & Category */}
        <h2
          style={{
            fontSize: "22px",
            fontWeight: 800,
            fontFamily: "'Space Grotesk', sans-serif",
            color: "var(--text-primary)",
            lineHeight: 1.2,
            marginBottom: "8px",
          }}
        >
          {item.name}
        </h2>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            marginBottom: "16px",
            fontSize: "13px",
          }}
        >
          <span style={{ color: "var(--text-muted)" }}>
            Category: <strong style={{ color: "var(--primary-300)" }}>{item.category}</strong>
          </span>
          <span
            style={{
              padding: "2px 10px",
              borderRadius: "10px",
              background: "rgba(34, 197, 94, 0.15)",
              color: "var(--tier-high)",
              fontWeight: 700,
              fontSize: "12px",
            }}
          >
            Match: {Math.round(item.relevance_score * 100)}% ({item.relevance_score.toFixed(2)})
          </span>
        </div>

        {/* Why this fits */}
        <div
          style={{
            padding: "14px 18px",
            borderRadius: "12px",
            background: "rgba(99, 102, 241, 0.08)",
            borderLeft: "4px solid var(--primary-500)",
            marginBottom: "20px",
            fontSize: "14px",
            lineHeight: 1.6,
            color: "var(--text-primary)",
          }}
        >
          <strong
            style={{
              display: "block",
              fontSize: "11px",
              color: "var(--primary-300)",
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              marginBottom: "4px",
            }}
          >
            Match Explanation
          </strong>
          {item.explanation}
        </div>

        {/* Key Info Grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "12px",
            marginBottom: "20px",
            fontSize: "13px",
          }}
        >
          <div
            style={{
              padding: "12px",
              borderRadius: "10px",
              background: "var(--bg-secondary)",
              border: "1px solid var(--border-subtle)",
            }}
          >
            <span style={{ color: "var(--text-muted)", display: "block", fontSize: "11px" }}>
              Time / Schedule
            </span>
            <strong style={{ color: "var(--text-primary)" }}>
              {item.meetingTime || item.eventDate || "Flexible"}
            </strong>
          </div>

          <div
            style={{
              padding: "12px",
              borderRadius: "10px",
              background: "var(--bg-secondary)",
              border: "1px solid var(--border-subtle)",
            }}
          >
            <span style={{ color: "var(--text-muted)", display: "block", fontSize: "11px" }}>
              Location
            </span>
            <strong style={{ color: "var(--text-primary)" }}>{item.location}</strong>
          </div>

          <div
            style={{
              padding: "12px",
              borderRadius: "10px",
              background: "var(--bg-secondary)",
              border: "1px solid var(--border-subtle)",
            }}
          >
            <span style={{ color: "var(--text-muted)", display: "block", fontSize: "11px" }}>
              Contact Lead
            </span>
            <strong style={{ color: "var(--text-primary)" }}>
              {item.contactPerson || item.contactLead}
            </strong>
          </div>

          <div
            style={{
              padding: "12px",
              borderRadius: "10px",
              background: "var(--bg-secondary)",
              border: "1px solid var(--border-subtle)",
            }}
          >
            <span style={{ color: "var(--text-muted)", display: "block", fontSize: "11px" }}>
              Target Audience
            </span>
            <strong style={{ color: "var(--text-primary)" }}>{item.targetAudience}</strong>
          </div>
        </div>

        {/* Channel-Specific Icebreaker Generator Section */}
        <div
          style={{
            padding: "18px",
            borderRadius: "16px",
            background: "var(--bg-secondary)",
            border: "1px solid var(--border-subtle)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: "12px",
              flexWrap: "wrap",
              gap: "8px",
            }}
          >
            <span
              style={{
                fontSize: "12px",
                fontWeight: 700,
                color: "var(--accent-400)",
                textTransform: "uppercase",
                letterSpacing: "0.06em",
              }}
            >
              💬 Channel-Specific Icebreaker
            </span>

            {/* Tone Selector */}
            <div
              style={{
                display: "flex",
                gap: "4px",
                background: "var(--bg-primary)",
                padding: "3px",
                borderRadius: "10px",
              }}
            >
              {(
                [
                  { idx: 0, label: "Casual" },
                  { idx: 1, label: "Direct" },
                  { idx: 2, label: "Gentle" },
                ] as const
              ).map((t) => (
                <button
                  key={t.idx}
                  type="button"
                  onClick={() => setToneIndex(t.idx)}
                  style={{
                    padding: "4px 10px",
                    borderRadius: "7px",
                    border: "none",
                    background: toneIndex === t.idx ? "var(--primary-600)" : "transparent",
                    color: toneIndex === t.idx ? "#fff" : "var(--text-muted)",
                    fontSize: "11px",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Channel Selector */}
          <div
            style={{
              display: "flex",
              gap: "8px",
              marginBottom: "14px",
            }}
          >
            {(
              [
                { id: "whatsapp", label: "💬 WhatsApp", bg: "#25D366" },
                { id: "discord", label: "👾 Discord", bg: "#5865F2" },
                { id: "slack", label: "⚡ Slack", bg: "#4A154B" },
              ] as const
            ).map((ch) => (
              <button
                key={ch.id}
                type="button"
                onClick={() => setChannel(ch.id)}
                style={{
                  padding: "6px 14px",
                  borderRadius: "8px",
                  border: channel === ch.id ? `1px solid ${ch.bg}` : "1px solid var(--border-subtle)",
                  background: channel === ch.id ? `${ch.bg}25` : "var(--bg-primary)",
                  color: channel === ch.id ? "#fff" : "var(--text-muted)",
                  fontSize: "12px",
                  fontWeight: 600,
                  cursor: "pointer",
                  transition: "all 0.2s",
                }}
              >
                {ch.label}
              </button>
            ))}
          </div>

          {/* Formatted Preview Box */}
          <pre
            style={{
              fontSize: "13px",
              color: "var(--text-primary)",
              lineHeight: 1.5,
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
              marginBottom: "14px",
              padding: "12px",
              borderRadius: "10px",
              background: "rgba(10, 10, 26, 0.6)",
              border: "1px dashed var(--border-subtle)",
              fontFamily: channel === "discord" || channel === "slack" ? "monospace" : "inherit",
            }}
          >
            {formattedMessage}
          </pre>

          {/* Actions */}
          <div style={{ display: "flex", gap: "10px" }}>
            <button
              type="button"
              onClick={handleCopy}
              style={{
                flex: 1,
                padding: "10px",
                borderRadius: "10px",
                border: "none",
                background: copied
                  ? "rgba(34, 197, 94, 0.2)"
                  : "linear-gradient(135deg, var(--primary-500), #a855f7)",
                color: copied ? "var(--tier-high)" : "#fff",
                fontSize: "13px",
                fontWeight: 600,
                cursor: "pointer",
                transition: "all 0.2s",
              }}
            >
              {copied ? `✓ Copied for ${channel.toUpperCase()}!` : `📋 Copy for ${channel.toUpperCase()}`}
            </button>

            {channel === "whatsapp" && (
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  padding: "10px 16px",
                  borderRadius: "10px",
                  background: "#25D366",
                  color: "#fff",
                  fontSize: "13px",
                  fontWeight: 600,
                  textDecoration: "none",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                💬 Open WhatsApp
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
