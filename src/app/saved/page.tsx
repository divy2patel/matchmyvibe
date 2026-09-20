"use client";

import React, { useState, useEffect } from "react";
import Header from "@/components/Header";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { apiClient, SavedItemRecord } from "@/lib/api-client";

export default function SavedPage() {
  const { user } = useAuth();
  const [savedItems, setSavedItems] = useState<SavedItemRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"all" | "group" | "event">("all");

  useEffect(() => {
    async function loadSaved() {
      setLoading(true);
      try {
        const items = await apiClient.getSavedItems();
        if (items && items.length > 0) {
          setSavedItems(items);
        } else {
          // Fallback check from local cache if any
          const stored = localStorage.getItem("matchmyvibe_bookmarks");
          if (stored) {
            const ids: string[] = JSON.parse(stored);
            if (ids.length > 0) {
              const allGroups = await apiClient.getGroups().catch(() => []);
              const allEvents = await apiClient.getEvents().catch(() => []);

              const resolved: SavedItemRecord[] = ids.map((id) => {
                const grp = allGroups.find((g) => g.id === id || g.slug === id);
                const evt = allEvents.find((e) => e.id === id);

                if (grp) {
                  return {
                    id: grp.id,
                    user_id: user?.id || "local",
                    group_id: grp.id,
                    item_type: "group",
                    title: grp.name,
                    category: grp.category,
                    image_url: grp.image_url,
                    created_at: new Date().toISOString(),
                  };
                }
                if (evt) {
                  return {
                    id: evt.id,
                    user_id: user?.id || "local",
                    event_id: evt.id,
                    item_type: "event",
                    title: evt.name,
                    category: evt.category,
                    image_url: evt.image_url,
                    created_at: new Date().toISOString(),
                  };
                }
                return {
                  id,
                  user_id: user?.id || "local",
                  item_type: "group",
                  title: "DDU Campus Community",
                  category: "Campus",
                  created_at: new Date().toISOString(),
                };
              });
              setSavedItems(resolved);
            }
          }
        }
      } catch (err) {
        console.warn("Failed to load saved items:", err);
      } finally {
        setLoading(false);
      }
    }

    loadSaved();
  }, [user]);

  const handleRemove = async (id: string) => {
    await apiClient.removeSavedItem(id);
    setSavedItems((prev) => {
      const updated = prev.filter((item) => item.id !== id);
      const remainingIds = updated.map((u) => u.id);
      localStorage.setItem("matchmyvibe_bookmarks", JSON.stringify(remainingIds));
      return updated;
    });
  };

  const communityCount = savedItems.filter((i) => i.item_type === "group").length;
  const eventCount = savedItems.filter((i) => i.item_type === "event").length;

  const filteredItems = savedItems.filter((item) => {
    if (activeTab === "all") return true;
    return item.item_type === activeTab;
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <Header />
      <main
        style={{
          flex: 1,
          width: "100%",
          maxWidth: "840px",
          margin: "0 auto",
          padding: "36px 20px 80px 20px",
        }}
      >
        <div style={{ marginBottom: "28px" }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              padding: "4px 10px",
              borderRadius: "10px",
              background: "rgba(91, 85, 245, 0.1)",
              border: "1px solid rgba(91, 85, 245, 0.25)",
              color: "var(--accent-secondary)",
              fontSize: "12px",
              fontWeight: 600,
              marginBottom: "10px",
            }}
          >
            <span>⭐</span>
            <span>Personal Bookmarks</span>
          </div>
          <h1
            style={{
              fontSize: "30px",
              fontWeight: 800,
              fontFamily: "'Space Grotesk', sans-serif",
              letterSpacing: "-0.02em",
              marginBottom: "6px",
            }}
          >
            Your <span className="gradient-text">Campus Shelf</span>
          </h1>
          <p style={{ fontSize: "14px", color: "var(--text-secondary)" }}>
            Communities and events you want to come back to.
          </p>
        </div>

        {/* Filter Tabs */}
        <div
          style={{
            display: "flex",
            gap: "8px",
            marginBottom: "24px",
            padding: "4px",
            background: "rgba(255, 255, 255, 0.03)",
            borderRadius: "14px",
            border: "1px solid var(--border-subtle)",
            width: "fit-content",
          }}
        >
          <button
            onClick={() => setActiveTab("all")}
            style={{
              padding: "8px 16px",
              borderRadius: "10px",
              border: "none",
              background: activeTab === "all" ? "var(--accent-primary)" : "transparent",
              color: activeTab === "all" ? "#fff" : "var(--text-secondary)",
              fontWeight: activeTab === "all" ? 700 : 500,
              fontSize: "13px",
              cursor: "pointer",
              transition: "all 0.2s",
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            <span>All</span>
            <span
              style={{
                fontSize: "11px",
                padding: "1px 6px",
                borderRadius: "8px",
                background: activeTab === "all" ? "rgba(255, 255, 255, 0.25)" : "rgba(255, 255, 255, 0.08)",
              }}
            >
              {savedItems.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("group")}
            style={{
              padding: "8px 16px",
              borderRadius: "10px",
              border: "none",
              background: activeTab === "group" ? "var(--accent-primary)" : "transparent",
              color: activeTab === "group" ? "#fff" : "var(--text-secondary)",
              fontWeight: activeTab === "group" ? 700 : 500,
              fontSize: "13px",
              cursor: "pointer",
              transition: "all 0.2s",
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            <span>👥 Communities</span>
            <span
              style={{
                fontSize: "11px",
                padding: "1px 6px",
                borderRadius: "8px",
                background: activeTab === "group" ? "rgba(255, 255, 255, 0.25)" : "rgba(255, 255, 255, 0.08)",
              }}
            >
              {communityCount}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("event")}
            style={{
              padding: "8px 16px",
              borderRadius: "10px",
              border: "none",
              background: activeTab === "event" ? "var(--accent-primary)" : "transparent",
              color: activeTab === "event" ? "#fff" : "var(--text-secondary)",
              fontWeight: activeTab === "event" ? 700 : 500,
              fontSize: "13px",
              cursor: "pointer",
              transition: "all 0.2s",
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            <span>📅 Events</span>
            <span
              style={{
                fontSize: "11px",
                padding: "1px 6px",
                borderRadius: "8px",
                background: activeTab === "event" ? "rgba(255, 255, 255, 0.25)" : "rgba(255, 255, 255, 0.08)",
              }}
            >
              {eventCount}
            </span>
          </button>
        </div>

        {loading ? (
          <div style={{ textAlign: "center", padding: "60px 20px", color: "var(--text-muted)", fontSize: "14px" }}>
            <span style={{ display: "inline-block", animation: "spin 1.5s linear infinite", marginRight: "8px" }}>✦</span>
            Curating your campus shelf...
          </div>
        ) : filteredItems.length === 0 ? (
          <div
            className="glass"
            style={{
              borderRadius: "20px",
              padding: "52px 24px",
              textAlign: "center",
              border: "1px solid var(--border-subtle)",
              background: "rgba(14, 13, 36, 0.6)",
            }}
          >
            <div style={{ fontSize: "44px", marginBottom: "14px" }}>
              {activeTab === "event" ? "📅" : activeTab === "group" ? "👥" : "⭐"}
            </div>
            <h3 style={{ fontSize: "18px", fontWeight: 700, marginBottom: "8px" }}>
              {activeTab === "event"
                ? "No saved events yet"
                : activeTab === "group"
                ? "No saved communities yet"
                : "Your campus shelf is empty"}
            </h3>
            <p style={{ fontSize: "14px", color: "var(--text-secondary)", maxWidth: "420px", margin: "0 auto 24px auto", lineHeight: 1.5 }}>
              Explore DDU campus matches, discover exciting clubs or upcoming hackathons, and star them to keep track.
            </p>
            <Link
              href="/"
              style={{
                padding: "11px 26px",
                borderRadius: "12px",
                background: "linear-gradient(135deg, var(--accent-primary), #9333ea)",
                color: "#fff",
                fontWeight: 700,
                fontSize: "14px",
                textDecoration: "none",
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                boxShadow: "0 4px 16px rgba(91, 85, 245, 0.35)",
              }}
            >
              <span>✨</span>
              <span>Discover on Campus</span>
            </Link>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "12px" }}>
            {filteredItems.map((item) => (
              <div
                key={item.id}
                className="glass"
                style={{
                  borderRadius: "18px",
                  padding: "16px 20px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: "16px",
                  border: "1px solid var(--border-subtle)",
                  background: "rgba(14, 13, 36, 0.6)",
                  transition: "all 0.2s ease",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "16px", minWidth: 0 }}>
                  {item.image_url ? (
                    <img
                      src={item.image_url}
                      alt={item.title}
                      style={{
                        width: "56px",
                        height: "56px",
                        borderRadius: "14px",
                        objectFit: "cover",
                        flexShrink: 0,
                        border: "1px solid var(--border-subtle)",
                      }}
                    />
                  ) : (
                    <div
                      style={{
                        width: "56px",
                        height: "56px",
                        borderRadius: "14px",
                        background: "linear-gradient(135deg, rgba(91, 85, 245, 0.2), rgba(168, 85, 247, 0.15))",
                        border: "1px solid rgba(91, 85, 245, 0.3)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "24px",
                        flexShrink: 0,
                      }}
                    >
                      {item.item_type === "event" ? "📅" : "👥"}
                    </div>
                  )}

                  <div style={{ minWidth: 0 }}>
                    <h4
                      style={{
                        fontSize: "16px",
                        fontWeight: 700,
                        marginBottom: "4px",
                        color: "var(--text-primary)",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {item.title}
                    </h4>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                      <span
                        style={{
                          fontSize: "11px",
                          padding: "2px 8px",
                          borderRadius: "6px",
                          background: "rgba(91, 85, 245, 0.15)",
                          border: "1px solid rgba(91, 85, 245, 0.3)",
                          color: "var(--accent-secondary)",
                          fontWeight: 600,
                        }}
                      >
                        {item.category}
                      </span>
                      <span
                        style={{
                          fontSize: "11px",
                          color: "var(--text-muted)",
                          textTransform: "uppercase",
                          letterSpacing: "0.04em",
                          fontWeight: 500,
                        }}
                      >
                        {item.item_type === "event" ? "Campus Event" : "Student Club"}
                      </span>
                    </div>
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "8px", flexShrink: 0 }}>
                  <Link
                    href={
                      item.item_type === "event"
                        ? `/events/${item.event_id || item.id}`
                        : `/groups/${item.group_id || item.id}`
                    }
                    style={{
                      padding: "7px 14px",
                      borderRadius: "10px",
                      background: "rgba(91, 85, 245, 0.12)",
                      border: "1px solid rgba(91, 85, 245, 0.25)",
                      color: "var(--accent-secondary)",
                      fontSize: "12px",
                      fontWeight: 600,
                      textDecoration: "none",
                      transition: "all 0.15s",
                    }}
                  >
                    View Details
                  </Link>

                  <button
                    onClick={() => handleRemove(item.id)}
                    title="Remove from Campus Shelf"
                    style={{
                      padding: "7px 12px",
                      borderRadius: "10px",
                      border: "1px solid rgba(239, 68, 68, 0.25)",
                      background: "rgba(239, 68, 68, 0.08)",
                      color: "#fca5a5",
                      fontSize: "12px",
                      fontWeight: 600,
                      cursor: "pointer",
                      transition: "all 0.15s",
                    }}
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
