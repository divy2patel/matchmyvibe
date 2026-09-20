"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Header from "@/components/Header";
import Link from "next/link";
import { apiClient } from "@/lib/api-client";

export default function EventDetailPage() {
  const params = useParams();
  const eventId = params.id as string;

  const [event, setEvent] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await apiClient.getEventDetail(eventId);
        setEvent(data);
      } catch {
        setEvent({
          name: "Campus Meetup & Showcase",
          category: "Technology",
          description: "Hands-on student gathering with open networking, demonstrations, and community discussions.",
          event_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          }),
          location: "University Main Amphitheater",
          contact_lead: "Event Coordinator",
          registration_url: "https://aatmoday.edu/events",
          tags: ["events", "networking", "meetup"],
        });
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [eventId]);

  if (loading) {
    return (
      <div>
        <Header />
        <div style={{ textAlign: "center", padding: "60px", color: "var(--text-muted)" }}>
          Loading event details...
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <Header />
      <main
        style={{
          flex: 1,
          width: "100%",
          maxWidth: "760px",
          margin: "0 auto",
          padding: "32px 20px 60px 20px",
        }}
      >
        <Link
          href="/"
          style={{
            fontSize: "13px",
            color: "var(--primary-300)",
            textDecoration: "none",
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            marginBottom: "20px",
          }}
        >
          ← Back to Discovery
        </Link>

        {/* Event Detail Card */}
        <div className="glass" style={{ borderRadius: "24px", padding: "32px", marginBottom: "24px" }}>
          <span
            style={{
              padding: "4px 12px",
              borderRadius: "20px",
              background: "rgba(168, 85, 247, 0.15)",
              color: "#c084fc",
              fontSize: "12px",
              fontWeight: 700,
              textTransform: "uppercase",
              display: "inline-block",
              marginBottom: "12px",
            }}
          >
            📅 Upcoming Campus Event
          </span>
          <h1
            style={{
              fontSize: "28px",
              fontWeight: 800,
              fontFamily: "'Space Grotesk', sans-serif",
              marginBottom: "12px",
              lineHeight: 1.2,
            }}
          >
            {event.name}
          </h1>
          <p style={{ fontSize: "15px", color: "var(--text-secondary)", lineHeight: 1.6, marginBottom: "24px" }}>
            {event.description}
          </p>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "12px",
              fontSize: "13px",
              marginBottom: "28px",
            }}
          >
            <div style={{ padding: "12px", borderRadius: "10px", background: "var(--bg-secondary)" }}>
              <span style={{ color: "var(--text-muted)", display: "block", fontSize: "11px" }}>Date & Time</span>
              <strong style={{ color: "#c084fc" }}>{event.event_date}</strong>
            </div>
            <div style={{ padding: "12px", borderRadius: "10px", background: "var(--bg-secondary)" }}>
              <span style={{ color: "var(--text-muted)", display: "block", fontSize: "11px" }}>Location</span>
              <strong>{event.location}</strong>
            </div>
            <div style={{ padding: "12px", borderRadius: "10px", background: "var(--bg-secondary)" }}>
              <span style={{ color: "var(--text-muted)", display: "block", fontSize: "11px" }}>Event Lead</span>
              <strong>{event.contact_lead}</strong>
            </div>
            <div style={{ padding: "12px", borderRadius: "10px", background: "var(--bg-secondary)" }}>
              <span style={{ color: "var(--text-muted)", display: "block", fontSize: "11px" }}>Audience</span>
              <strong>{event.target_audience || "Campus Students"}</strong>
            </div>
          </div>

          <div style={{ display: "flex", gap: "12px" }}>
            {event.registration_url && (
              <a
                href={event.registration_url}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  padding: "12px 24px",
                  borderRadius: "12px",
                  background: "linear-gradient(135deg, var(--primary-500), #a855f7)",
                  color: "#fff",
                  fontWeight: 700,
                  fontSize: "14px",
                  textDecoration: "none",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                🚀 Register for Event
              </a>
            )}

            <a
              href={`https://wa.me/?text=${encodeURIComponent(
                `Hey ${event.contact_lead}! I saw ${event.name} on MatchMyVibe and would love to attend. Could you share orientation/registration details?`
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                padding: "12px 20px",
                borderRadius: "12px",
                background: "#25D366",
                color: "#fff",
                fontWeight: 700,
                fontSize: "14px",
                textDecoration: "none",
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              💬 WhatsApp Lead
            </a>
          </div>
        </div>
      </main>
    </div>
  );
}
