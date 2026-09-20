"use client";

import React, { useState, useRef, useEffect } from "react";

interface MatchFormProps {
  onSubmit: (text: string) => void;
  isLoading: boolean;
}

const CATEGORY_CHIPS = [
  { label: "💻 Tech & Coding", query: "Competitive programming, hackathons, and software engineering" },
  { label: "🤖 Robotics & AI", query: "Autonomous bots, Arduino, drones, and AI hardware" },
  { label: "📸 Photography", query: "Golden hour photowalks, street photography, and visual storytelling" },
  { label: "🎵 Acoustic Music", query: "Acoustic guitar jams, songwriting, and indie campus sessions" },
  { label: "💃 Dance & Culture", query: "Classical dance, folk performances, and cultural celebrations" },
  { label: "⚽ Turf Sports", query: "Midnight football on the campus turf, badminton, and fitness" },
  { label: "🏔️ Nature & Treks", query: "Weekend hikes, mountain trails, and outdoor exploration" },
  { label: "🤝 Social Impact", query: "Community volunteering, teaching kids, and social service" },
];

export default function MatchForm({ onSubmit, isLoading }: MatchFormProps) {
  const [text, setText] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const el = textareaRef.current;
    if (el) {
      el.style.height = "auto";
      el.style.height = `${Math.min(el.scrollHeight, 180)}px`;
    }
  }, [text]);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (text.trim().length >= 2 && !isLoading) {
      onSubmit(text.trim());
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleChipClick = (query: string) => {
    setText(query);
    onSubmit(query);
  };

  return (
    <div className="slide-up" style={{ width: "100%", maxWidth: "860px", margin: "0 auto" }}>
      {/* Hero Header */}
      <div style={{ textAlign: "center", marginBottom: "32px" }}>
        {/* Eyebrow Badge */}
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            padding: "5px 14px",
            borderRadius: "20px",
            background: "rgba(91, 85, 245, 0.12)",
            border: "1px solid rgba(124, 92, 255, 0.3)",
            fontSize: "12px",
            fontWeight: 700,
            color: "var(--accent-amber)",
            letterSpacing: "0.06em",
            textTransform: "uppercase",
            marginBottom: "16px",
          }}
        >
          <span
            className="live-pulse"
            style={{
              width: "6px",
              height: "6px",
              borderRadius: "50%",
              background: "var(--accent-amber)",
              display: "inline-block",
            }}
          />
          ✦ DDU Campus Discovery
        </div>

        {/* Main Headline */}
        <h1
          style={{
            fontSize: "clamp(32px, 5.5vw, 56px)",
            fontWeight: 800,
            fontFamily: "'Space Grotesk', sans-serif",
            lineHeight: 1.12,
            letterSpacing: "-0.03em",
            marginBottom: "14px",
          }}
        >
          Find Your Tribe.{" "}
          <span className="gradient-text-accent">Campus Vibe.</span>
        </h1>

        <p
          style={{
            fontSize: "15px",
            color: "var(--text-secondary)",
            maxWidth: "540px",
            margin: "0 auto",
            lineHeight: 1.6,
          }}
        >
          Tell us what you love, what you want to build, or the kind of people you want to meet.
          We&apos;ll find the DDU communities that feel like you.
        </p>
      </div>

      {/* AI Command Surface */}
      <form onSubmit={handleSubmit} style={{ marginBottom: "24px" }}>
        <div className="command-surface" style={{ padding: "16px 20px" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: "8px",
              fontSize: "12px",
              color: "var(--text-muted)",
              fontWeight: 600,
            }}
          >
            <span style={{ color: "var(--primary-300)" }}>✨ Describe your vibe & hobbies...</span>
            <span>{text.length}/1000</span>
          </div>

          <textarea
            ref={textareaRef}
            id="match-input"
            value={text}
            onChange={(e) => setText(e.target.value.slice(0, 1000))}
            onKeyDown={handleKeyDown}
            placeholder="I love building autonomous bots, late-night hackathons, acoustic music jams, and meeting creative peers at DDU..."
            disabled={isLoading}
            rows={3}
            style={{
              width: "100%",
              background: "transparent",
              border: "none",
              color: "#fff",
              fontSize: "15px",
              lineHeight: 1.5,
              outline: "none",
              resize: "none",
              fontFamily: "inherit",
            }}
          />

          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              paddingTop: "12px",
              marginTop: "8px",
              borderTop: "1px solid var(--border-subtle)",
              flexWrap: "wrap",
              gap: "10px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", color: "var(--text-muted)" }}>
              <kbd
                style={{
                  padding: "2px 6px",
                  borderRadius: "5px",
                  background: "rgba(255, 255, 255, 0.08)",
                  border: "1px solid var(--border-subtle)",
                  fontSize: "11px",
                  fontFamily: "monospace",
                }}
              >
                ⌘ Enter
              </kbd>
              <span>to match</span>
            </div>

            <button
              type="submit"
              disabled={isLoading || text.trim().length < 2}
              style={{
                padding: "10px 24px",
                borderRadius: "12px",
                border: "none",
                background:
                  isLoading || text.trim().length < 2
                    ? "rgba(91, 85, 245, 0.3)"
                    : "linear-gradient(135deg, #5B55F5, #7C5CFF)",
                color: "#fff",
                fontWeight: 700,
                fontSize: "14px",
                cursor: isLoading || text.trim().length < 2 ? "not-allowed" : "pointer",
                boxShadow:
                  isLoading || text.trim().length < 2
                    ? "none"
                    : "0 4px 16px rgba(91, 85, 245, 0.4)",
                transition: "all 0.2s ease",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              {isLoading ? (
                <>
                  <span
                    style={{
                      width: "12px",
                      height: "12px",
                      border: "2px solid rgba(255,255,255,0.3)",
                      borderTopColor: "#fff",
                      borderRadius: "50%",
                      display: "inline-block",
                      animation: "live-pulse 1s infinite",
                    }}
                  />
                  <span>Understanding your vibe...</span>
                </>
              ) : (
                <>
                  <span>✨ Find My Tribe</span>
                  <span>→</span>
                </>
              )}
            </button>
          </div>
        </div>
      </form>

      {/* Horizontal Flowing Quick Prompt Chips */}
      <div style={{ marginBottom: "28px" }}>
        <div
          style={{
            fontSize: "11px",
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            color: "var(--text-muted)",
            marginBottom: "10px",
            textAlign: "center",
          }}
        >
          ✦ Try a Campus Vibe
        </div>

        <div
          style={{
            display: "flex",
            gap: "8px",
            flexWrap: "wrap",
            justifyContent: "center",
          }}
        >
          {CATEGORY_CHIPS.map((chip, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleChipClick(chip.query)}
              disabled={isLoading}
              style={{
                padding: "6px 14px",
                borderRadius: "20px",
                background: "rgba(255, 255, 255, 0.04)",
                border: "1px solid var(--border-subtle)",
                color: "var(--text-secondary)",
                fontSize: "12.5px",
                fontWeight: 500,
                cursor: "pointer",
                transition: "all 0.2s ease",
                whiteSpace: "nowrap",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "var(--accent-purple)";
                e.currentTarget.style.color = "#fff";
                e.currentTarget.style.background = "rgba(124, 92, 255, 0.15)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "var(--border-subtle)";
                e.currentTarget.style.color = "var(--text-secondary)";
                e.currentTarget.style.background = "rgba(255, 255, 255, 0.04)";
              }}
            >
              {chip.label}
            </button>
          ))}
        </div>
      </div>

      {/* Live Discovery Signal Bar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "10px",
          padding: "10px 18px",
          borderRadius: "14px",
          background: "rgba(14, 13, 36, 0.6)",
          border: "1px solid var(--border-subtle)",
          fontSize: "12px",
          color: "var(--text-muted)",
        }}
      >
        <span
          style={{
            width: "7px",
            height: "7px",
            borderRadius: "50%",
            background: "var(--tier-high)",
            display: "inline-block",
            animation: "pulse-glow 2s ease-in-out infinite",
          }}
        />
        <span style={{ fontWeight: 600, color: "var(--text-secondary)" }}>Popular on DDU campus:</span>
        <span>AI Hackathons • Classical Arts • Robotics • Acoustic Jams • Turf Sports</span>
      </div>
    </div>
  );
}
