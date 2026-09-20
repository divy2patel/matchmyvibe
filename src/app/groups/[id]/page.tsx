"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Header from "@/components/Header";
import Link from "next/link";
import { apiClient } from "@/lib/api-client";

export default function GroupDetailPage() {
  const params = useParams();
  const idOrSlug = params.id as string;

  const [group, setGroup] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [icebreakerStyle, setIcebreakerStyle] = useState("casual");
  const [channel, setChannel] = useState("whatsapp");
  const [icebreakerText, setIcebreakerText] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const data = await apiClient.getGroupDetail(idOrSlug);
        setGroup(data);
      } catch {
        // Fallback representation if backend not yet running
        setGroup({
          name: idOrSlug.replace(/[-_]/g, " ").toUpperCase(),
          category: "Campus Community",
          description: "An active DDU student community connecting peers with shared hobbies, projects, and meetups.",
          location: "Student Activity Center",
          meeting_information: "Weekly evening meetups",
          contact_lead: "Community Lead",
          contact_information: "@community_ddu",
          target_audience: "All interested students",
          tags: ["community", "ddu", "networking"],
        });
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [idOrSlug]);

  useEffect(() => {
    if (group) {
      updateIcebreaker();
    }
  }, [group, icebreakerStyle, channel]);

  const updateIcebreaker = async () => {
    if (!group) return;
    const res = await apiClient.generateIcebreaker({
      itemId: group.id || idOrSlug,
      itemType: "group",
      itemName: group.name,
      category: group.category,
      contactLead: group.contact_lead,
      style: icebreakerStyle,
      channel: channel,
    });
    setIcebreakerText(res.formatted_text);
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(icebreakerText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  if (loading) {
    return (
      <div>
        <Header />
        <div style={{ textAlign: "center", padding: "60px", color: "var(--text-muted)" }}>
          Loading community details...
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

        {/* Hero Card */}
        <div className="glass" style={{ borderRadius: "24px", padding: "32px", marginBottom: "24px" }}>
          <span
            style={{
              padding: "4px 12px",
              borderRadius: "20px",
              background: "rgba(99, 102, 241, 0.15)",
              color: "var(--primary-300)",
              fontSize: "12px",
              fontWeight: 700,
              textTransform: "uppercase",
              display: "inline-block",
              marginBottom: "12px",
            }}
          >
            👥 {group.category}
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
            {group.name}
          </h1>
          <p style={{ fontSize: "15px", color: "var(--text-secondary)", lineHeight: 1.6, marginBottom: "24px" }}>
            {group.description}
          </p>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "12px",
              fontSize: "13px",
              marginBottom: "24px",
            }}
          >
            <div style={{ padding: "12px", borderRadius: "10px", background: "var(--bg-secondary)" }}>
              <span style={{ color: "var(--text-muted)", display: "block", fontSize: "11px" }}>Meeting Time</span>
              <strong>{group.meeting_information}</strong>
            </div>
            <div style={{ padding: "12px", borderRadius: "10px", background: "var(--bg-secondary)" }}>
              <span style={{ color: "var(--text-muted)", display: "block", fontSize: "11px" }}>Location</span>
              <strong>{group.location}</strong>
            </div>
            <div style={{ padding: "12px", borderRadius: "10px", background: "var(--bg-secondary)" }}>
              <span style={{ color: "var(--text-muted)", display: "block", fontSize: "11px" }}>Lead Contact</span>
              <strong>{group.contact_lead}</strong>
            </div>
            <div style={{ padding: "12px", borderRadius: "10px", background: "var(--bg-secondary)" }}>
              <span style={{ color: "var(--text-muted)", display: "block", fontSize: "11px" }}>Target Audience</span>
              <strong>{group.target_audience}</strong>
            </div>
          </div>
        </div>

        {/* Icebreaker Generator Studio */}
        <div className="glass" style={{ borderRadius: "24px", padding: "28px" }}>
          <h3
            style={{
              fontSize: "18px",
              fontWeight: 700,
              fontFamily: "'Space Grotesk', sans-serif",
              marginBottom: "6px",
            }}
          >
            💬 Ready-To-Send Icebreaker Studio
          </h3>
          <p style={{ fontSize: "13px", color: "var(--text-muted)", marginBottom: "16px" }}>
            Choose your preferred tone and platform to break the ice with {group.contact_lead}.
          </p>

          {/* Tone Selector */}
          <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginBottom: "12px" }}>
            {["casual", "friendly", "professional", "short", "introvert", "in_person"].map((st) => (
              <button
                key={st}
                onClick={() => setIcebreakerStyle(st)}
                style={{
                  padding: "5px 12px",
                  borderRadius: "8px",
                  border: icebreakerStyle === st ? "1px solid var(--primary-400)" : "1px solid var(--border-subtle)",
                  background: icebreakerStyle === st ? "var(--primary-600)" : "var(--bg-secondary)",
                  color: icebreakerStyle === st ? "#fff" : "var(--text-secondary)",
                  fontSize: "12px",
                  fontWeight: 600,
                  cursor: "pointer",
                  textTransform: "capitalize",
                }}
              >
                {st.replace("_", " ")}
              </button>
            ))}
          </div>

          {/* Channel Selector */}
          <div style={{ display: "flex", gap: "8px", marginBottom: "14px" }}>
            {[
              { id: "whatsapp", label: "WhatsApp" },
              { id: "discord", label: "Discord" },
              { id: "slack", label: "Slack" },
            ].map((ch) => (
              <button
                key={ch.id}
                onClick={() => setChannel(ch.id)}
                style={{
                  padding: "6px 14px",
                  borderRadius: "8px",
                  border: channel === ch.id ? "1px solid #fff" : "1px solid var(--border-subtle)",
                  background: channel === ch.id ? "rgba(255, 255, 255, 0.15)" : "var(--bg-secondary)",
                  color: "#fff",
                  fontSize: "12px",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                {ch.label}
              </button>
            ))}
          </div>

          <pre
            style={{
              padding: "16px",
              borderRadius: "12px",
              background: "var(--bg-primary)",
              border: "1px dashed var(--border-subtle)",
              fontSize: "13.5px",
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
              marginBottom: "16px",
              color: "var(--text-primary)",
            }}
          >
            {icebreakerText}
          </pre>

          <div style={{ display: "flex", gap: "10px" }}>
            <button
              onClick={handleCopy}
              style={{
                flex: 1,
                padding: "10px",
                borderRadius: "10px",
                background: copied ? "rgba(34, 197, 94, 0.2)" : "linear-gradient(135deg, var(--primary-500), #a855f7)",
                color: copied ? "var(--tier-high)" : "#fff",
                fontWeight: 600,
                fontSize: "13px",
                border: "none",
                cursor: "pointer",
              }}
            >
              {copied ? "✓ Copied to Clipboard!" : "📋 Copy Message"}
            </button>

            {channel === "whatsapp" && (
              <a
                href={`https://wa.me/?text=${encodeURIComponent(icebreakerText)}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  padding: "10px 18px",
                  borderRadius: "10px",
                  background: "#25D366",
                  color: "#fff",
                  fontWeight: 600,
                  fontSize: "13px",
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
      </main>
    </div>
  );
}
