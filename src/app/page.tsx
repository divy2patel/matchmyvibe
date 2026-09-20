"use client";

import React, { useState, useEffect } from "react";
import Header from "@/components/Header";
import MatchForm from "@/components/MatchForm";
import LoadingSkeleton from "@/components/LoadingSkeleton";
import RecommendationList from "@/components/RecommendationList";
import DetailModal from "@/components/DetailModal";
import type { MatchResponse, RecommendationItem } from "@/lib/types";
import { apiClient } from "@/lib/api-client";
import { useAuth } from "@/context/AuthContext";

export default function Home() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<MatchResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<RecommendationItem | null>(null);
  const [bookmarks, setBookmarks] = useState<string[]>([]);

  // Load bookmarks from backend and local cache
  useEffect(() => {
    async function loadBookmarks() {
      try {
        if (user) {
          const items = await apiClient.getSavedItems();
          const ids = items.map((i) => i.group_id || i.event_id || i.id);
          if (ids.length > 0) {
            setBookmarks(ids);
            return;
          }
        }
        const saved = localStorage.getItem("matchmyvibe_bookmarks");
        if (saved) {
          setBookmarks(JSON.parse(saved));
        }
      } catch {}
    }
    loadBookmarks();
  }, [user]);

  const handleToggleBookmark = async (id: string) => {
    const isSaved = bookmarks.includes(id);
    const updated = isSaved ? bookmarks.filter((b) => b !== id) : [...bookmarks, id];
    setBookmarks(updated);
    try {
      localStorage.setItem("matchmyvibe_bookmarks", JSON.stringify(updated));
    } catch {}

    // Persist to backend if user is logged in
    if (user) {
      try {
        if (isSaved) {
          await apiClient.removeSavedItem(id);
        } else {
          const recItem = result?.recommendations.find((r) => r.id === id);
          const isGroup = !recItem || recItem.type === "group";
          await apiClient.saveItem({
            groupId: isGroup ? id : undefined,
            eventId: !isGroup ? id : undefined,
          });
        }
      } catch (err) {
        console.warn("Backend bookmark sync:", err);
      }
    }
  };

  const handleMatch = async (text: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await apiClient.match(text);
      if (!data.success) {
        setError(data.fallback_notice || (data as any).fallbackNotice || "Failed to process match request.");
      } else {
        const normalizedData: any = {
          ...data,
          interests: data.vibe?.interests || (data as any).interests || [],
          isFallback: data.is_fallback !== undefined ? data.is_fallback : (data as any).isFallback,
          fallbackNotice: data.fallback_notice || (data as any).fallbackNotice,
          recommendations: (data.recommendations || []).map((r: any) => ({
            ...r,
            relevance_score: r.match_score !== undefined ? r.match_score : r.relevance_score,
            explanation: r.match_reason || r.explanation,
            meetingTime: r.meeting_information || r.meetingTime,
            eventDate: r.event_date || r.eventDate,
            contactPerson: r.contact_information || r.contactPerson || r.contact_lead,
            matchTier: r.match_tier || r.matchTier || "high",
          })),
        };
        setResult(normalizedData);
      }
    } catch (err: any) {
      console.error("Match error:", err);
      setError(err.message || "Network error. Please check your connection and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <Header />

      <main
        style={{
          flex: 1,
          width: "100%",
          maxWidth: "680px",
          margin: "0 auto",
          padding: "32px 20px 60px 20px",
        }}
      >
        <MatchForm onSubmit={handleMatch} isLoading={isLoading} />

        {isLoading && <LoadingSkeleton />}

        {error && (
          <div
            className="slide-up"
            style={{
              marginTop: "24px",
              padding: "16px 20px",
              borderRadius: "14px",
              background: "rgba(239, 68, 68, 0.1)",
              border: "1px solid rgba(239, 68, 68, 0.3)",
              color: "#fca5a5",
              fontSize: "14px",
              textAlign: "center",
            }}
          >
            ❌ {error}
          </div>
        )}

        {!isLoading && result && (
          <RecommendationList
            interests={result.interests}
            recommendations={result.recommendations}
            isFallback={result.isFallback}
            fallbackNotice={result.fallbackNotice}
            meta={result.meta}
            onSelectCard={(item) => setSelectedItem(item)}
            bookmarks={bookmarks}
            onToggleBookmark={handleToggleBookmark}
          />
        )}
      </main>

      {/* Detail Modal */}
      {selectedItem && (
        <DetailModal
          item={selectedItem}
          onClose={() => setSelectedItem(null)}
          isBookmarked={bookmarks.includes(selectedItem.id)}
          onToggleBookmark={handleToggleBookmark}
        />
      )}

      <footer
        style={{
          padding: "36px 20px 80px 20px",
          borderTop: "1px solid var(--border-subtle)",
          textAlign: "center",
          fontSize: "13px",
          color: "var(--text-muted)",
          background: "rgba(10, 10, 24, 0.7)",
          backdropFilter: "blur(12px)",
          lineHeight: 1.6,
        }}
      >
        <p style={{ fontWeight: 700, color: "var(--text-primary)", fontSize: "14px", letterSpacing: "-0.01em" }}>
          MatchMyVibe
        </p>
        <p style={{ color: "var(--text-secondary)", marginTop: "2px" }}>
          Find your people. Find your communities. Find your campus vibe.
        </p>
        <p style={{ marginTop: "8px", fontWeight: 600, color: "var(--accent-primary)", fontSize: "12px", letterSpacing: "0.04em", textTransform: "uppercase" }}>
          DDU Campus • GDG Hackathon
        </p>
        <p style={{ marginTop: "4px", fontSize: "11px", color: "var(--text-muted)" }}>
          Built with Next.js • FastAPI • Supabase • pgvector • Gemini + Groq
        </p>
      </footer>
    </div>
  );
}
