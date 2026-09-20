"use client";

import React, { useState, useEffect } from "react";
import Header from "@/components/Header";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { apiClient } from "@/lib/api-client";

interface VibeNode {
  id: string;
  name: string;
  icon: string;
  strength: number; // percentage
  x: number; // percentage pos
  y: number;
  color: string;
}

export default function ProfilePage() {
  const { user, profile, refreshProfile, signOut } = useAuth();

  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [batch, setBatch] = useState("2026");
  const [branch, setBranch] = useState("Computer Science & Engineering");
  const [saving, setSaving] = useState(false);
  const [savedCount, setSavedCount] = useState(0);
  const [chatCount, setChatCount] = useState(0);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [selectedNode, setSelectedNode] = useState<VibeNode | null>(null);

  // Student ID from backend or deterministic fallback
  const studentId =
    (profile as any)?.student_id ||
    (user as any)?.student_id ||
    (user?.id ? `TMV-${user.id.replace(/-/g, "").slice(0, 6).toUpperCase()}` : "TMV-7F29A1");

  useEffect(() => {
    if (user || profile) {
      setName(profile?.full_name || profile?.name || user?.name || "DDU Student");
      setBio(profile?.bio || user?.bio || "Active DDU campus explorer & builder.");
      setBatch(profile?.batch || user?.batch || "2026");
      setBranch(profile?.branch || user?.branch || "Computer Science & Engineering");
    }
  }, [user, profile]);

  useEffect(() => {
    async function loadStats() {
      try {
        const saved = await apiClient.getSavedItems();
        setSavedCount(saved.length);
        const chats = await apiClient.listConversations();
        setChatCount(chats.length);
      } catch {}
    }
    loadStats();
  }, [user]);

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await apiClient.updateProfile({
        name,
        full_name: name,
        bio,
        batch,
        branch,
      });
      await refreshProfile();
      setIsEditing(false);
      showToast("✓ Profile updated successfully!", "success");
    } catch {
      showToast("❌ Failed to update profile. Please try again.", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleCopyId = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(studentId);
      showToast(`Copied Student ID: ${studentId}`, "success");
    }
  };

  // Vibe Map Nodes
  const vibeNodes: VibeNode[] = [
    { id: "ai", name: "AI & ML", icon: "🤖", strength: 96, x: 22, y: 25, color: "#7c5cff" },
    { id: "robotics", name: "Robotics", icon: "⚙️", strength: 88, x: 78, y: 24, color: "#9b6cff" },
    { id: "hackathons", name: "GDG Hackathons", icon: "⚡", strength: 94, x: 50, y: 15, color: "#ffaa2b" },
    { id: "creative", name: "Creative Arts", icon: "🎨", strength: 79, x: 18, y: 75, color: "#ec4899" },
    { id: "music", name: "Acoustic Jams", icon: "🎵", strength: 84, x: 82, y: 72, color: "#38bdf8" },
    { id: "leadership", name: "Campus Community", icon: "🤝", strength: 91, x: 50, y: 85, color: "#34d399" },
  ];

  const recentSearches = [
    "Machine Learning & Hackathon teams at DDU",
    "Acoustic music sessions and cultural societies",
    "Weekend robotics workshops and hardware lab",
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <Header />

      {/* Floating Toast Notification */}
      {toast && (
        <div
          style={{
            position: "fixed",
            top: "24px",
            right: "24px",
            zIndex: 9999,
            padding: "12px 20px",
            borderRadius: "14px",
            background:
              toast.type === "success"
                ? "rgba(16, 185, 129, 0.95)"
                : "rgba(239, 68, 68, 0.95)",
            color: "#fff",
            fontSize: "13px",
            fontWeight: 700,
            boxShadow: "0 10px 30px rgba(0, 0, 0, 0.5)",
            backdropFilter: "blur(8px)",
            animation: "slide-down 0.25s cubic-bezier(0.16, 1, 0.3, 1)",
          }}
        >
          {toast.message}
        </div>
      )}

      <main
        style={{
          flex: 1,
          width: "100%",
          maxWidth: "860px",
          margin: "0 auto",
          padding: "36px 20px 80px 20px",
        }}
      >
        {/* Profile Header Card */}
        <div
          className="glass glow"
          style={{
            borderRadius: "24px",
            padding: "32px",
            marginBottom: "28px",
            border: "1px solid var(--border-subtle)",
            background: "rgba(14, 13, 36, 0.75)",
            backdropFilter: "blur(16px)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "space-between",
              gap: "20px",
              flexWrap: "wrap",
              marginBottom: "24px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
              <div
                style={{
                  width: "80px",
                  height: "80px",
                  borderRadius: "22px",
                  background: "linear-gradient(135deg, var(--accent-primary), #9333ea)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "36px",
                  boxShadow: "0 8px 24px rgba(91, 85, 245, 0.4)",
                  border: "2px solid rgba(255, 255, 255, 0.15)",
                }}
              >
                🎓
              </div>

              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px", flexWrap: "wrap" }}>
                  <h2
                    style={{
                      fontSize: "26px",
                      fontWeight: 800,
                      fontFamily: "'Space Grotesk', sans-serif",
                      letterSpacing: "-0.02em",
                    }}
                  >
                    {name}
                  </h2>
                  <span
                    style={{
                      padding: "3px 10px",
                      borderRadius: "12px",
                      background:
                        user?.role === "admin"
                          ? "rgba(168, 85, 247, 0.2)"
                          : "rgba(52, 211, 153, 0.15)",
                      border:
                        user?.role === "admin"
                          ? "1px solid rgba(168, 85, 247, 0.4)"
                          : "1px solid rgba(52, 211, 153, 0.3)",
                      color: user?.role === "admin" ? "#d8b4fe" : "#34d399",
                      fontSize: "11px",
                      fontWeight: 700,
                      textTransform: "uppercase",
                    }}
                  >
                    {user?.role === "admin" ? "Campus Admin" : "DDU Student"}
                  </span>

                  {/* Official Student ID Chip */}
                  <button
                    onClick={handleCopyId}
                    title="Click to copy Student ID"
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "6px",
                      padding: "3px 10px",
                      borderRadius: "10px",
                      background: "rgba(255, 170, 43, 0.12)",
                      border: "1px solid rgba(255, 170, 43, 0.3)",
                      color: "var(--accent-warm)",
                      fontSize: "12px",
                      fontWeight: 700,
                      fontFamily: "monospace",
                      cursor: "pointer",
                      transition: "all 0.15s",
                    }}
                  >
                    <span>ID: {studentId}</span>
                    <span style={{ fontSize: "10px" }}>📋</span>
                  </button>
                </div>

                <p style={{ fontSize: "13px", color: "var(--text-secondary)" }}>
                  {user?.email || "student@ddu.ac.in"} • Batch of {batch} • {branch}
                </p>
              </div>
            </div>

            <div style={{ display: "flex", gap: "8px" }}>
              <button
                onClick={() => setIsEditing(!isEditing)}
                style={{
                  padding: "8px 16px",
                  borderRadius: "10px",
                  background: isEditing ? "rgba(255, 255, 255, 0.1)" : "rgba(91, 85, 245, 0.15)",
                  border: "1px solid rgba(91, 85, 245, 0.3)",
                  color: "var(--accent-secondary)",
                  fontSize: "13px",
                  fontWeight: 600,
                  cursor: "pointer",
                  transition: "all 0.15s",
                }}
              >
                {isEditing ? "Cancel" : "✏️ Edit Profile"}
              </button>

              <button
                onClick={() => signOut()}
                style={{
                  padding: "8px 14px",
                  borderRadius: "10px",
                  background: "rgba(239, 68, 68, 0.1)",
                  border: "1px solid rgba(239, 68, 68, 0.25)",
                  color: "#fca5a5",
                  fontSize: "13px",
                  fontWeight: 600,
                  cursor: "pointer",
                  transition: "all 0.15s",
                }}
              >
                Sign Out
              </button>
            </div>
          </div>

          {/* Edit Form */}
          {isEditing ? (
            <form
              onSubmit={handleSave}
              style={{
                background: "rgba(10, 10, 24, 0.6)",
                padding: "20px",
                borderRadius: "18px",
                border: "1px solid var(--border-subtle)",
                marginBottom: "24px",
                display: "flex",
                flexDirection: "column",
                gap: "14px",
              }}
            >
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "12px", color: "var(--text-muted)", marginBottom: "4px" }}>
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "9px 12px",
                      borderRadius: "10px",
                      background: "var(--bg-secondary)",
                      color: "#fff",
                      border: "1px solid var(--border-subtle)",
                      fontSize: "13px",
                      outline: "none",
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "12px", color: "var(--text-muted)", marginBottom: "4px" }}>
                    Graduation Batch
                  </label>
                  <select
                    value={batch}
                    onChange={(e) => setBatch(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "9px 12px",
                      borderRadius: "10px",
                      background: "var(--bg-secondary)",
                      color: "#fff",
                      border: "1px solid var(--border-subtle)",
                      fontSize: "13px",
                      outline: "none",
                    }}
                  >
                    <option value="2025">Batch 2025</option>
                    <option value="2026">Batch 2026</option>
                    <option value="2027">Batch 2027</option>
                    <option value="2028">Batch 2028</option>
                    <option value="2029">Batch 2029</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "12px", color: "var(--text-muted)", marginBottom: "4px" }}>
                  Branch / Department
                </label>
                <input
                  type="text"
                  value={branch}
                  onChange={(e) => setBranch(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "9px 12px",
                    borderRadius: "10px",
                    background: "var(--bg-secondary)",
                    color: "#fff",
                    border: "1px solid var(--border-subtle)",
                    fontSize: "13px",
                    outline: "none",
                  }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "12px", color: "var(--text-muted)", marginBottom: "4px" }}>
                  Bio / Interests Note
                </label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={2}
                  style={{
                    width: "100%",
                    padding: "9px 12px",
                    borderRadius: "10px",
                    background: "var(--bg-secondary)",
                    color: "#fff",
                    border: "1px solid var(--border-subtle)",
                    fontSize: "13px",
                    outline: "none",
                  }}
                />
              </div>

              <button
                type="submit"
                disabled={saving}
                style={{
                  alignSelf: "flex-end",
                  padding: "9px 24px",
                  borderRadius: "10px",
                  background: "linear-gradient(135deg, var(--accent-primary), #9333ea)",
                  color: "#fff",
                  fontWeight: 700,
                  fontSize: "13px",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                {saving ? "Saving Changes..." : "Save Profile"}
              </button>
            </form>
          ) : (
            <p style={{ fontSize: "14px", color: "var(--text-secondary)", marginBottom: "20px", lineHeight: 1.6 }}>
              &ldquo;{bio}&rdquo;
            </p>
          )}

          {/* Quick Metrics Bar */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: "12px",
              padding: "16px",
              borderRadius: "16px",
              background: "rgba(10, 10, 24, 0.45)",
              border: "1px solid var(--border-subtle)",
              marginBottom: "24px",
            }}
          >
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: "22px", fontWeight: 800, color: "var(--accent-secondary)" }}>{savedCount}</div>
              <div style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "2px" }}>Saved on Shelf</div>
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: "22px", fontWeight: 800, color: "#c084fc" }}>{chatCount}</div>
              <div style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "2px" }}>AI Discussions</div>
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: "22px", fontWeight: 800, color: "var(--tier-high)" }}>96%</div>
              <div style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "2px" }}>Campus Affinity Fit</div>
            </div>
          </div>

          {/* Vibe Map Visual Constellation */}
          <div style={{ marginTop: "28px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
              <div>
                <span
                  style={{
                    fontSize: "11px",
                    fontWeight: 700,
                    color: "var(--accent-warm)",
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                    display: "block",
                  }}
                >
                  ✦ Vibe Map Constellation
                </span>
                <h3 style={{ fontSize: "17px", fontWeight: 700, color: "var(--text-primary)", marginTop: "2px" }}>
                  Your Multidimensional Campus Affinity
                </h3>
              </div>
              <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>Interactive Network</span>
            </div>

            <div
              style={{
                position: "relative",
                height: "260px",
                borderRadius: "20px",
                background: "radial-gradient(ellipse at center, #18153d 0%, #0a0a18 75%)",
                border: "1px solid rgba(91, 85, 245, 0.25)",
                overflow: "hidden",
                boxShadow: "inset 0 0 40px rgba(91, 85, 245, 0.12)",
              }}
            >
              {/* SVG Connecting Lines */}
              <svg
                style={{
                  position: "absolute",
                  inset: 0,
                  width: "100%",
                  height: "100%",
                  pointerEvents: "none",
                }}
              >
                {/* Center point is 50%, 50% */}
                {vibeNodes.map((node) => (
                  <line
                    key={node.id}
                    x1="50%"
                    y1="50%"
                    x2={`${node.x}%`}
                    y2={`${node.y}%`}
                    stroke={node.color}
                    strokeWidth="1.5"
                    strokeOpacity={selectedNode?.id === node.id ? "0.8" : "0.3"}
                    strokeDasharray="4 4"
                  />
                ))}
              </svg>

              {/* Center Student Core Node */}
              <div
                style={{
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                  width: "58px",
                  height: "58px",
                  borderRadius: "50%",
                  background: "radial-gradient(circle, var(--accent-primary) 0%, #4338ca 100%)",
                  border: "2px solid rgba(255, 255, 255, 0.3)",
                  boxShadow: "0 0 24px rgba(91, 85, 245, 0.6)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#fff",
                  fontSize: "20px",
                  zIndex: 10,
                  cursor: "default",
                }}
                title="Your Central Vibe Identity"
              >
                🎯
              </div>

              {/* Surrounding Vibe Nodes */}
              {vibeNodes.map((node) => {
                const isSelected = selectedNode?.id === node.id;
                return (
                  <div
                    key={node.id}
                    onClick={() => setSelectedNode(node)}
                    style={{
                      position: "absolute",
                      top: `${node.y}%`,
                      left: `${node.x}%`,
                      transform: "translate(-50%, -50%)",
                      cursor: "pointer",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: "4px",
                      zIndex: 20,
                      transition: "all 0.2s ease",
                    }}
                  >
                    <div
                      style={{
                        width: isSelected ? "44px" : "38px",
                        height: isSelected ? "44px" : "38px",
                        borderRadius: "50%",
                        background: "rgba(14, 13, 36, 0.9)",
                        border: `2px solid ${node.color}`,
                        boxShadow: `0 0 16px ${node.color}66`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "16px",
                        transition: "all 0.2s",
                      }}
                    >
                      {node.icon}
                    </div>
                    <div
                      style={{
                        padding: "2px 8px",
                        borderRadius: "8px",
                        background: isSelected ? node.color : "rgba(10, 10, 24, 0.75)",
                        border: `1px solid ${node.color}55`,
                        color: isSelected ? "#fff" : "var(--text-secondary)",
                        fontSize: "11px",
                        fontWeight: 700,
                        whiteSpace: "nowrap",
                        backdropFilter: "blur(6px)",
                      }}
                    >
                      {node.name} • {node.strength}%
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Search History */}
        <div>
          <h3
            style={{
              fontSize: "18px",
              fontWeight: 700,
              fontFamily: "'Space Grotesk', sans-serif",
              marginBottom: "14px",
            }}
          >
            Recent Campus Queries
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {recentSearches.map((q, idx) => (
              <div
                key={idx}
                className="glass"
                style={{
                  borderRadius: "14px",
                  padding: "14px 18px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  fontSize: "14px",
                  color: "var(--text-primary)",
                  border: "1px solid var(--border-subtle)",
                  background: "rgba(14, 13, 36, 0.5)",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <span style={{ color: "var(--accent-primary)" }}>🔍</span>
                  <span>&ldquo;{q}&rdquo;</span>
                </div>
                <Link
                  href={`/?q=${encodeURIComponent(q)}`}
                  style={{
                    fontSize: "12px",
                    color: "var(--accent-secondary)",
                    textDecoration: "none",
                    fontWeight: 600,
                  }}
                >
                  Re-explore →
                </Link>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
