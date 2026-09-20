"use client";

import React, { useState } from "react";
import Header from "@/components/Header";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

export default function AdminPage() {
  const { user, isAdmin, isLoading, loginAsDemo } = useAuth();
  const [activeTab, setActiveTab] = useState<"metrics" | "groups" | "events">("metrics");

  if (!isLoading && !isAdmin) {
    return (
      <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
        <Header />
        <main
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "40px 20px",
          }}
        >
          <div
            className="glass glow"
            style={{
              maxWidth: "500px",
              width: "100%",
              borderRadius: "24px",
              padding: "40px 32px",
              textAlign: "center",
              border: "1px solid rgba(239, 68, 68, 0.3)",
            }}
          >
            <div style={{ fontSize: "44px", marginBottom: "16px" }}>🔒</div>
            <h2
              style={{
                fontSize: "22px",
                fontWeight: 800,
                fontFamily: "'Space Grotesk', sans-serif",
                marginBottom: "8px",
                color: "#fca5a5",
              }}
            >
              Administrator Access Required
            </h2>
            <p style={{ fontSize: "14px", color: "var(--text-secondary)", marginBottom: "24px" }}>
              This management console is restricted to DDU campus administrators. Your current student account does not have admin permissions.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <button
                onClick={() => loginAsDemo("admin")}
                style={{
                  padding: "12px 20px",
                  borderRadius: "12px",
                  background: "linear-gradient(135deg, rgba(168, 85, 247, 0.3), rgba(99, 102, 241, 0.3))",
                  border: "1px solid rgba(168, 85, 247, 0.5)",
                  color: "#d8b4fe",
                  fontWeight: 700,
                  fontSize: "14px",
                  cursor: "pointer",
                }}
              >
                ⚙ Switch to Admin Demo Account
              </button>
              <Link
                href="/"
                style={{
                  padding: "12px 20px",
                  borderRadius: "12px",
                  background: "rgba(255, 255, 255, 0.05)",
                  border: "1px solid var(--border-subtle)",
                  color: "#fff",
                  fontWeight: 600,
                  fontSize: "14px",
                  textDecoration: "none",
                }}
              >
                ← Return to Discover
              </Link>
            </div>
          </div>
        </main>
      </div>
    );
  }

  const metrics = [
    { title: "Campus Communities", value: "10", change: "+2 this month", icon: "👥" },
    { title: "Upcoming Events", value: "6", change: "Strictly future dates", icon: "📅" },
    { title: "Student Matches", value: "1,420", change: "99.8% AI uptime", icon: "🎯" },
    { title: "Saved Bookmarks", value: "389", change: "High engagement", icon: "★" },
  ];

  const popularInterests = [
    { name: "Artificial Intelligence & Coding", count: 420 },
    { name: "Classical & Folk Dance", count: 310 },
    { name: "Acoustic Music & Unplugged", count: 280 },
    { name: "Pavagadh Trail Treks", count: 245 },
    { name: "Campus Turf Football", count: 215 },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <Header />
      <main
        style={{
          flex: 1,
          width: "100%",
          maxWidth: "900px",
          margin: "0 auto",
          padding: "32px 20px 60px 20px",
        }}
      >
        <div style={{ marginBottom: "28px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
            <span
              style={{
                padding: "2px 8px",
                borderRadius: "6px",
                background: "rgba(239, 68, 68, 0.15)",
                color: "#f87171",
                fontSize: "11px",
                fontWeight: 700,
                textTransform: "uppercase",
              }}
            >
              Admin Center
            </span>
            <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>DDU Campus Community Matchmaker</span>
          </div>
          <h1
            style={{
              fontSize: "28px",
              fontWeight: 800,
              fontFamily: "'Space Grotesk', sans-serif",
            }}
          >
            Campus Community <span className="gradient-text">Analytics & Management</span>
          </h1>
        </div>

        {/* Tab Buttons */}
        <div
          style={{
            display: "flex",
            gap: "8px",
            marginBottom: "24px",
            background: "var(--bg-secondary)",
            padding: "4px",
            borderRadius: "12px",
            width: "fit-content",
          }}
        >
          {(
            [
              { id: "metrics", label: "📊 Overview Metrics" },
              { id: "groups", label: "👥 Communities" },
              { id: "events", label: "📅 Upcoming Events" },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: "8px 16px",
                borderRadius: "8px",
                border: "none",
                background: activeTab === tab.id ? "var(--primary-600)" : "transparent",
                color: activeTab === tab.id ? "#fff" : "var(--text-muted)",
                fontSize: "13px",
                fontWeight: 600,
                cursor: "pointer",
                transition: "all 0.2s",
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Metrics Overview Tab */}
        {activeTab === "metrics" && (
          <div>
            {/* Stat Cards Grid */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                gap: "14px",
                marginBottom: "28px",
              }}
            >
              {metrics.map((m, i) => (
                <div
                  key={i}
                  className="glass"
                  style={{
                    borderRadius: "16px",
                    padding: "20px",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
                    <span style={{ fontSize: "12px", color: "var(--text-muted)", fontWeight: 600 }}>{m.title}</span>
                    <span style={{ fontSize: "20px" }}>{m.icon}</span>
                  </div>
                  <div style={{ fontSize: "28px", fontWeight: 800, fontFamily: "'Space Grotesk', sans-serif", marginBottom: "4px" }}>
                    {m.value}
                  </div>
                  <div style={{ fontSize: "11px", color: "var(--tier-high)", fontWeight: 600 }}>{m.change}</div>
                </div>
              ))}
            </div>

            {/* Popular Interests Bar */}
            <div className="glass" style={{ borderRadius: "20px", padding: "24px" }}>
              <h3 style={{ fontSize: "16px", fontWeight: 700, fontFamily: "'Space Grotesk', sans-serif", marginBottom: "16px" }}>
                🔥 Most Searched Student Hobbies
              </h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {popularInterests.map((interest, idx) => (
                  <div key={idx}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", marginBottom: "4px" }}>
                      <span style={{ fontWeight: 600 }}>{interest.name}</span>
                      <span style={{ color: "var(--primary-300)" }}>{interest.count} queries</span>
                    </div>
                    <div style={{ width: "100%", height: "6px", borderRadius: "3px", background: "var(--bg-secondary)", overflow: "hidden" }}>
                      <div
                        style={{
                          width: `${(interest.count / 450) * 100}%`,
                          height: "100%",
                          borderRadius: "3px",
                          background: "linear-gradient(90deg, var(--primary-500), #a855f7)",
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Groups Tab */}
        {activeTab === "groups" && (
          <div className="glass" style={{ borderRadius: "20px", padding: "24px" }}>
            <h3 style={{ fontSize: "16px", fontWeight: 700, marginBottom: "16px" }}>Registered Campus Clubs (10)</h3>
            <p style={{ fontSize: "13px", color: "var(--text-muted)", marginBottom: "16px" }}>
              All 10 campus communities are active with precomputed 768-dim vector embeddings.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {[
                "Aatmoday Cultural & Dance Society (Arts)",
                "Aatmoday Robotics & Hardware Hub (Tech)",
                "Aatmoday Developers Club (Tech)",
                "Unplugged Music Club (Music)",
                "FragZone Esports & Gaming Guild (Tech)",
                "Trekking Community (Adventure)",
                "Kartavya Voluntourism (Social)",
                "Chhayachitra Photography (Creative)",
                "Nukkad Natak Street Theater (Drama)",
                "Aatmoday Turf Football League (Sports)",
              ].map((g, i) => (
                <div
                  key={i}
                  style={{
                    padding: "12px 16px",
                    borderRadius: "10px",
                    background: "var(--bg-secondary)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    fontSize: "13.5px",
                  }}
                >
                  <span>{g}</span>
                  <span style={{ color: "var(--tier-high)", fontSize: "12px", fontWeight: 600 }}>● Active</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Events Tab */}
        {activeTab === "events" && (
          <div className="glass" style={{ borderRadius: "20px", padding: "24px" }}>
            <h3 style={{ fontSize: "16px", fontWeight: 700, marginBottom: "16px" }}>Scheduled Upcoming Events (6)</h3>
            <p style={{ fontSize: "13px", color: "var(--text-muted)", marginBottom: "16px" }}>
              Enforced constraint: Past events are filtered out automatically (<code>event_date &gt;= NOW()</code>).
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {[
                "Aatmoday Cultural Night & Garba Fusion — In 7 Days",
                "AatmoHacks 2026 (24H Hackathon) — In 14 Days",
                "Acoustic Sunset Open-Mic — In 5 Days",
                "Sunrise Pavagadh Trail Trek — In 12 Days",
                "Midnight Campus Turf 5v5 Championship — In 18 Days",
                "Golden Hour Campus Photowalk — In 9 Days",
              ].map((e, i) => (
                <div
                  key={i}
                  style={{
                    padding: "12px 16px",
                    borderRadius: "10px",
                    background: "var(--bg-secondary)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    fontSize: "13.5px",
                  }}
                >
                  <span>{e}</span>
                  <span style={{ color: "var(--accent-400)", fontSize: "12px", fontWeight: 600 }}>Upcoming</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
