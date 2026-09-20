"use client";

import React, { useState, useEffect } from "react";

const STAGES = [
  { label: "Understanding your interests & colloquial nuances", icon: "✨" },
  { label: "Building your campus vibe profile", icon: "🧠" },
  { label: "Searching DDU communities via pgvector", icon: "🔎" },
  { label: "Checking upcoming scheduled events", icon: "📅" },
  { label: "Ranking matches with Gemini & Groq fallback", icon: "🎯" },
];

export default function LoadingSkeleton() {
  const [activeStage, setActiveStage] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStage((prev) => (prev < STAGES.length - 1 ? prev + 1 : prev));
    }, 850);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fade-in" style={{ marginTop: "32px", width: "100%", maxWidth: "860px", margin: "32px auto 0 auto" }}>
      {/* Meaningful Multi-Stage Pipeline Tracker */}
      <div
        className="glass-elevated"
        style={{
          borderRadius: "20px",
          padding: "24px",
          marginBottom: "24px",
          borderColor: "var(--border-accent)",
          boxShadow: "0 8px 32px rgba(91, 85, 245, 0.18)",
        }}
      >
        <div
          style={{
            fontSize: "11px",
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            color: "var(--accent-amber)",
            marginBottom: "14px",
            display: "flex",
            alignItems: "center",
            gap: "8px",
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
          Discovery Pipeline Active
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {STAGES.map((stage, idx) => {
            const isCompleted = idx < activeStage;
            const isCurrent = idx === activeStage;

            return (
              <div
                key={idx}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  fontSize: "13.5px",
                  color: isCurrent
                    ? "#fff"
                    : isCompleted
                    ? "var(--text-secondary)"
                    : "var(--text-muted)",
                  fontWeight: isCurrent ? 700 : 500,
                  transition: "all 0.3s ease",
                }}
              >
                <div
                  style={{
                    width: "24px",
                    height: "24px",
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "12px",
                    background: isCompleted
                      ? "rgba(16, 185, 129, 0.2)"
                      : isCurrent
                      ? "rgba(91, 85, 245, 0.3)"
                      : "rgba(255, 255, 255, 0.05)",
                    border: isCompleted
                      ? "1px solid var(--tier-high)"
                      : isCurrent
                      ? "1px solid var(--primary-500)"
                      : "1px solid var(--border-subtle)",
                    color: isCompleted ? "var(--tier-high)" : "#fff",
                    flexShrink: 0,
                  }}
                >
                  {isCompleted ? "✓" : stage.icon}
                </div>

                <span style={{ flex: 1 }}>{stage.label}</span>

                {isCurrent && (
                  <span
                    style={{
                      fontSize: "11px",
                      color: "var(--primary-300)",
                      fontWeight: 600,
                      animation: "pulse-glow 1.5s infinite",
                    }}
                  >
                    Processing...
                  </span>
                )}
                {isCompleted && (
                  <span style={{ fontSize: "11px", color: "var(--tier-high)", fontWeight: 600 }}>
                    Done
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Shimmer Placeholder Skeletons */}
      {[0, 1].map((i) => (
        <div
          key={i}
          className="glass"
          style={{
            borderRadius: "18px",
            padding: "24px",
            marginBottom: "16px",
          }}
        >
          <div style={{ display: "flex", gap: "14px", marginBottom: "16px" }}>
            <div className="shimmer" style={{ width: "48px", height: "48px", borderRadius: "14px" }} />
            <div style={{ flex: 1 }}>
              <div className="shimmer" style={{ width: "50%", height: "20px", borderRadius: "6px", marginBottom: "8px" }} />
              <div className="shimmer" style={{ width: "30%", height: "14px", borderRadius: "6px" }} />
            </div>
            <div className="shimmer" style={{ width: "80px", height: "30px", borderRadius: "14px" }} />
          </div>
          <div className="shimmer" style={{ width: "100%", height: "14px", borderRadius: "6px", marginBottom: "8px" }} />
          <div className="shimmer" style={{ width: "75%", height: "14px", borderRadius: "6px" }} />
        </div>
      ))}
    </div>
  );
}
