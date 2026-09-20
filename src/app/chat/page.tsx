"use client";

import React, { useState, useEffect, useRef } from "react";
import Header from "@/components/Header";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { apiClient, ConversationItem, ChatMessageItem } from "@/lib/api-client";

export default function ChatPage() {
  const { user, isLoading: authLoading } = useAuth();

  const [conversations, setConversations] = useState<ConversationItem[]>([]);
  const [activeConvId, setActiveConvId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessageItem[]>([]);
  const [inputText, setInputText] = useState("");
  const [sending, setSending] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [editingTitleId, setEditingTitleId] = useState<string | null>(null);
  const [editTitleText, setEditTitleText] = useState("");

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const quickPrompts = [
    "📸 Which photography or creative clubs can I join?",
    "🤖 Tell me about robotics and coding groups at DDU",
    "📅 What campus events are coming up this week?",
    "🤝 Give me an icebreaker for joining a new student group",
  ];

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, sending]);

  // Load user conversations on auth
  useEffect(() => {
    if (!user) return;
    async function loadConversations() {
      setLoadingHistory(true);
      try {
        const list = await apiClient.listConversations();
        setConversations(list);
        if (list.length > 0 && !activeConvId) {
          setActiveConvId(list[0].id);
          loadMessages(list[0].id);
        }
      } catch (err) {
        console.warn("Failed to load conversations:", err);
      } finally {
        setLoadingHistory(false);
      }
    }
    loadConversations();
  }, [user]);

  const loadMessages = async (convId: string) => {
    try {
      const conv = await apiClient.getConversation(convId);
      if (conv.messages) {
        setMessages(conv.messages);
      }
    } catch {
      setMessages([]);
    }
  };

  const handleSelectConversation = (id: string) => {
    setActiveConvId(id);
    loadMessages(id);
  };

  const handleNewConversation = async () => {
    try {
      const newConv = await apiClient.createConversation("New Conversation");
      setConversations((prev) => [newConv, ...prev]);
      setActiveConvId(newConv.id);
      setMessages([]);
    } catch {
      // Offline fallback
      const mockId = `mock_conv_${Date.now()}`;
      const mockConv: ConversationItem = {
        id: mockId,
        user_id: user?.id || "anon",
        title: "New Conversation",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      setConversations((prev) => [mockConv, ...prev]);
      setActiveConvId(mockId);
      setMessages([]);
    }
  };

  const handleDeleteConversation = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Are you sure you want to delete this conversation?")) return;
    try {
      await apiClient.deleteConversation(id);
      setConversations((prev) => prev.filter((c) => c.id !== id));
      if (activeConvId === id) {
        const remaining = conversations.filter((c) => c.id !== id);
        if (remaining.length > 0) {
          setActiveConvId(remaining[0].id);
          loadMessages(remaining[0].id);
        } else {
          setActiveConvId(null);
          setMessages([]);
        }
      }
    } catch (err) {
      alert("Could not delete conversation.");
    }
  };

  const handleSaveTitle = async (id: string, e: React.FormEvent) => {
    e.preventDefault();
    if (!editTitleText.trim()) return;
    try {
      await apiClient.updateConversation(id, editTitleText.trim());
      setConversations((prev) =>
        prev.map((c) => (c.id === id ? { ...c, title: editTitleText.trim() } : c))
      );
    } catch {}
    setEditingTitleId(null);
  };

  const handleSendMessage = async (textToSend?: string) => {
    const query = textToSend || inputText;
    if (!query.trim() || sending) return;

    setInputText("");
    setSending(true);

    // Optimistic user message
    const tempUserMsg: ChatMessageItem = {
      id: `temp_${Date.now()}`,
      conversation_id: activeConvId || "new",
      user_id: user?.id || "student",
      role: "user",
      content: query,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, tempUserMsg]);

    try {
      const resp = await apiClient.sendChatMessage(query, activeConvId || undefined);

      // If active conversation was null or new, update active ID and conversation list
      if (!activeConvId || resp.conversation_id !== activeConvId) {
        setActiveConvId(resp.conversation_id);
        const list = await apiClient.listConversations();
        setConversations(list);
      }

      setMessages((prev) => [...prev, resp.message]);
    } catch (err: any) {
      // Fallback assistant response
      const fallbackMsg: ChatMessageItem = {
        id: `err_${Date.now()}`,
        conversation_id: activeConvId || "new",
        user_id: "assistant",
        role: "assistant",
        content:
          "I'm having trouble connecting to MatchMyVibe AI right now. You can still explore communities and events directly from Discover, or try asking again in a moment!",
        provider: "fallback",
        created_at: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // ── Unauthenticated State ──────────────────────────────────────────────────
  if (!authLoading && !user) {
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
              padding: "44px 32px",
              textAlign: "center",
              border: "1px solid rgba(255, 255, 255, 0.12)",
            }}
          >
            <div style={{ fontSize: "44px", marginBottom: "16px" }}>💬</div>
            <h2
              style={{
                fontSize: "24px",
                fontWeight: 800,
                fontFamily: "'Space Grotesk', sans-serif",
                marginBottom: "8px",
              }}
            >
              MatchMyVibe <span className="gradient-text">AI Assistant</span>
            </h2>
            <p style={{ fontSize: "14px", color: "var(--text-secondary)", marginBottom: "28px" }}>
              Please sign in with your student account to access personalized community recommendations,
              upcoming event guides, and reachout icebreakers.
            </p>
            <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
              <Link
                href="/login"
                style={{
                  padding: "12px 24px",
                  borderRadius: "12px",
                  background: "linear-gradient(135deg, var(--primary-500), #a855f7)",
                  color: "#fff",
                  fontWeight: 700,
                  fontSize: "14px",
                  textDecoration: "none",
                }}
              >
                Sign In
              </Link>
              <Link
                href="/signup"
                style={{
                  padding: "12px 24px",
                  borderRadius: "12px",
                  background: "rgba(255, 255, 255, 0.08)",
                  border: "1px solid var(--border-subtle)",
                  color: "#fff",
                  fontWeight: 600,
                  fontSize: "14px",
                  textDecoration: "none",
                }}
              >
                Create Account
              </Link>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // ── Authenticated AI Chat Layout ───────────────────────────────────────────
  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", overflow: "hidden" }}>
      <Header />

      <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
        {/* Sidebar: Conversation History */}
        <aside
          style={{
            width: "300px",
            borderRight: "1px solid var(--border-subtle)",
            background: "rgba(10, 10, 24, 0.6)",
            display: "flex",
            flexDirection: "column",
            backdropFilter: "blur(12px)",
          }}
        >
          {/* New Chat Button */}
          <div style={{ padding: "16px", borderBottom: "1px solid var(--border-subtle)" }}>
            <button
              onClick={handleNewConversation}
              style={{
                width: "100%",
                padding: "10px 14px",
                borderRadius: "12px",
                background: "linear-gradient(135deg, rgba(99, 102, 241, 0.2), rgba(168, 85, 247, 0.2))",
                border: "1px solid rgba(99, 102, 241, 0.4)",
                color: "#fff",
                fontWeight: 600,
                fontSize: "13px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
              }}
            >
              <span>✨</span>
              <span>New Conversation</span>
            </button>
          </div>

          {/* Conversation List */}
          <div style={{ flex: 1, overflowY: "auto", padding: "12px 10px" }}>
            <div
              style={{
                fontSize: "11px",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                color: "var(--text-muted)",
                marginBottom: "8px",
                paddingLeft: "8px",
              }}
            >
              Your Conversations
            </div>

            {loadingHistory ? (
              <div style={{ padding: "20px", textAlign: "center", fontSize: "12px", color: "var(--text-muted)" }}>
                Loading conversations...
              </div>
            ) : conversations.length === 0 ? (
              <div style={{ padding: "20px", textAlign: "center", fontSize: "12px", color: "var(--text-muted)" }}>
                No conversations yet. Start a new chat!
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                {conversations.map((conv) => {
                  const isActive = conv.id === activeConvId;
                  const isEditing = editingTitleId === conv.id;

                  return (
                    <div
                      key={conv.id}
                      onClick={() => handleSelectConversation(conv.id)}
                      style={{
                        padding: "8px 10px",
                        borderRadius: "10px",
                        cursor: "pointer",
                        background: isActive ? "rgba(99, 102, 241, 0.2)" : "transparent",
                        border: isActive ? "1px solid rgba(99, 102, 241, 0.3)" : "1px solid transparent",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}
                    >
                      {isEditing ? (
                        <form
                          onSubmit={(e) => handleSaveTitle(conv.id, e)}
                          onClick={(e) => e.stopPropagation()}
                          style={{ flex: 1, display: "flex", gap: "4px" }}
                        >
                          <input
                            type="text"
                            autoFocus
                            value={editTitleText}
                            onChange={(e) => setEditTitleText(e.target.value)}
                            style={{
                              flex: 1,
                              padding: "4px 6px",
                              borderRadius: "6px",
                              background: "var(--bg-secondary)",
                              color: "#fff",
                              fontSize: "12px",
                              border: "1px solid var(--primary-500)",
                            }}
                          />
                          <button
                            type="submit"
                            style={{
                              padding: "2px 6px",
                              borderRadius: "4px",
                              background: "var(--primary-500)",
                              color: "#fff",
                              border: "none",
                              fontSize: "11px",
                            }}
                          >
                            ✓
                          </button>
                        </form>
                      ) : (
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                            overflow: "hidden",
                            flex: 1,
                          }}
                        >
                          <span style={{ fontSize: "13px" }}>💬</span>
                          <span
                            style={{
                              fontSize: "13px",
                              fontWeight: isActive ? 600 : 400,
                              color: isActive ? "#fff" : "var(--text-secondary)",
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                            }}
                          >
                            {conv.title}
                          </span>
                        </div>
                      )}

                      {/* Rename / Delete buttons on active */}
                      {isActive && !isEditing && (
                        <div style={{ display: "flex", gap: "4px" }}>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingTitleId(conv.id);
                              setEditTitleText(conv.title);
                            }}
                            title="Rename"
                            style={{
                              background: "none",
                              border: "none",
                              color: "var(--text-muted)",
                              cursor: "pointer",
                              fontSize: "12px",
                              padding: "2px",
                            }}
                          >
                            ✏️
                          </button>
                          <button
                            onClick={(e) => handleDeleteConversation(conv.id, e)}
                            title="Delete"
                            style={{
                              background: "none",
                              border: "none",
                              color: "#f87171",
                              cursor: "pointer",
                              fontSize: "12px",
                              padding: "2px",
                            }}
                          >
                            🗑️
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Student Profile Quick Badge */}
          <div
            style={{
              padding: "12px 14px",
              borderTop: "1px solid var(--border-subtle)",
              background: "rgba(255, 255, 255, 0.02)",
              display: "flex",
              alignItems: "center",
              gap: "10px",
            }}
          >
            <div
              style={{
                width: "32px",
                height: "32px",
                borderRadius: "50%",
                background: "linear-gradient(135deg, var(--primary-500), #a855f7)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "14px",
                fontWeight: 700,
              }}
            >
              🎓
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  fontSize: "13px",
                  fontWeight: 600,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {user?.name || "Student"}
              </div>
              <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                {user?.branch || "DDU Campus"}
              </div>
            </div>
          </div>
        </aside>

        {/* Main Chat Area */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", height: "100%", background: "var(--bg-primary)" }}>
          {/* Chat Header */}
          <div
            style={{
              padding: "14px 24px",
              borderBottom: "1px solid var(--border-subtle)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              background: "rgba(10, 10, 24, 0.4)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div
                style={{
                  width: "36px",
                  height: "36px",
                  borderRadius: "10px",
                  background: "linear-gradient(135deg, var(--accent-primary), #a855f7)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "18px",
                  boxShadow: "0 0 12px rgba(91, 85, 245, 0.35)",
                }}
              >
                🤖
              </div>
              <div>
                <h3 style={{ fontSize: "15px", fontWeight: 700, lineHeight: 1.2, display: "flex", alignItems: "center", gap: "8px" }}>
                  <span>MatchMyVibe AI</span>
                  <span
                    style={{
                      fontSize: "11px",
                      fontWeight: 600,
                      color: "#34d399",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "4px",
                    }}
                  >
                    <span
                      style={{
                        width: "6px",
                        height: "6px",
                        borderRadius: "50%",
                        background: "#10b981",
                        display: "inline-block",
                      }}
                    />
                    Online
                  </span>
                </h3>
                <p style={{ fontSize: "11px", color: "var(--text-secondary)" }}>
                  Your DDU Campus Community Assistant
                </p>
              </div>
            </div>

            <div
              style={{
                fontSize: "11px",
                padding: "4px 10px",
                borderRadius: "12px",
                background: "rgba(91, 85, 245, 0.12)",
                border: "1px solid rgba(91, 85, 245, 0.25)",
                color: "var(--accent-secondary)",
                fontWeight: 600,
              }}
            >
              🔒 MatchMyVibe Scoped
            </div>
          </div>

          {/* Messages Stream */}
          <div
            style={{
              flex: 1,
              overflowY: "auto",
              padding: "24px 28px",
              display: "flex",
              flexDirection: "column",
              gap: "18px",
            }}
          >
            {messages.length === 0 ? (
              <div
                style={{
                  margin: "auto",
                  maxWidth: "580px",
                  textAlign: "center",
                  padding: "40px 20px",
                }}
              >
                <div
                  style={{
                    width: "64px",
                    height: "64px",
                    borderRadius: "20px",
                    background: "linear-gradient(135deg, rgba(99, 102, 241, 0.2), rgba(168, 85, 247, 0.2))",
                    border: "1px solid rgba(99, 102, 241, 0.3)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "30px",
                    margin: "0 auto 16px auto",
                  }}
                >
                  💬
                </div>
                <h2
                  style={{
                    fontSize: "24px",
                    fontWeight: 800,
                    fontFamily: "'Space Grotesk', sans-serif",
                    marginBottom: "8px",
                  }}
                >
                  Your campus, understood.
                </h2>
                <p style={{ fontSize: "14px", color: "var(--text-secondary)", marginBottom: "24px" }}>
                  Ask me about communities, events, hobbies, matches, or how to start a conversation.
                </p>

                {/* Quick Prompts */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", textAlign: "left" }}>
                  {quickPrompts.map((prompt, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSendMessage(prompt)}
                      style={{
                        padding: "12px 14px",
                        borderRadius: "14px",
                        background: "rgba(255, 255, 255, 0.03)",
                        border: "1px solid var(--border-subtle)",
                        color: "var(--text-secondary)",
                        fontSize: "12px",
                        cursor: "pointer",
                        lineHeight: 1.4,
                        transition: "all 0.2s",
                      }}
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              messages.map((msg) => {
                const isUser = msg.role === "user";
                return (
                  <div
                    key={msg.id}
                    style={{
                      display: "flex",
                      justifyContent: isUser ? "flex-end" : "flex-start",
                      gap: "10px",
                      maxWidth: "820px",
                      alignSelf: isUser ? "flex-end" : "flex-start",
                      width: "100%",
                    }}
                  >
                    {!isUser && (
                      <div
                        style={{
                          width: "32px",
                          height: "32px",
                          borderRadius: "10px",
                          background: "linear-gradient(135deg, var(--primary-500), #a855f7)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "15px",
                          flexShrink: 0,
                          marginTop: "2px",
                        }}
                      >
                        🤖
                      </div>
                    )}

                    <div
                      style={{
                        maxWidth: "75%",
                        padding: "14px 18px",
                        borderRadius: isUser ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
                        background: isUser
                          ? "linear-gradient(135deg, var(--primary-600), #9333ea)"
                          : "rgba(255, 255, 255, 0.05)",
                        border: isUser ? "none" : "1px solid rgba(255, 255, 255, 0.08)",
                        color: "#fff",
                        fontSize: "14px",
                        lineHeight: 1.6,
                        boxShadow: isUser ? "0 4px 14px rgba(99, 102, 241, 0.3)" : "none",
                        whiteSpace: "pre-wrap",
                      }}
                    >
                      {msg.content}

                      {!isUser && msg.provider && (
                        <div
                          style={{
                            marginTop: "8px",
                            paddingTop: "6px",
                            borderTop: "1px solid rgba(255, 255, 255, 0.08)",
                            fontSize: "11px",
                            color: "var(--text-muted)",
                            display: "flex",
                            alignItems: "center",
                            gap: "6px",
                          }}
                        >
                          <span>⚡</span>
                          <span>
                            {msg.provider === "guardrail"
                              ? "DDU Scope Guardrail"
                              : msg.provider === "fallback"
                              ? "Deterministic Campus Engine"
                              : `${msg.provider.toUpperCase()} AI`}
                          </span>
                        </div>
                      )}
                    </div>

                    {isUser && (
                      <div
                        style={{
                          width: "32px",
                          height: "32px",
                          borderRadius: "10px",
                          background: "rgba(255, 255, 255, 0.1)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "14px",
                          flexShrink: 0,
                          marginTop: "2px",
                        }}
                      >
                        🎓
                      </div>
                    )}
                  </div>
                );
              })
            )}

            {sending && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  alignSelf: "flex-start",
                }}
              >
                <div
                  style={{
                    width: "32px",
                    height: "32px",
                    borderRadius: "10px",
                    background: "linear-gradient(135deg, var(--primary-500), #a855f7)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "15px",
                  }}
                >
                  🤖
                </div>
                <div
                  style={{
                    padding: "12px 18px",
                    borderRadius: "18px 18px 18px 4px",
                    background: "rgba(255, 255, 255, 0.05)",
                    border: "1px solid rgba(255, 255, 255, 0.08)",
                    color: "var(--text-muted)",
                    fontSize: "13px",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                  }}
                >
                  <span
                    style={{
                      width: "6px",
                      height: "6px",
                      borderRadius: "50%",
                      background: "var(--primary-400)",
                      animation: "pulse-glow 1s ease-in-out infinite",
                    }}
                  />
                  Grounding response with DDU campus database...
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Box */}
          <div
            style={{
              padding: "16px 24px 20px 24px",
              borderTop: "1px solid var(--border-subtle)",
              background: "rgba(10, 10, 24, 0.7)",
              backdropFilter: "blur(12px)",
            }}
          >
            <div
              style={{
                maxWidth: "820px",
                margin: "0 auto",
                display: "flex",
                gap: "10px",
                alignItems: "flex-end",
              }}
            >
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask about clubs, events, meeting times, hobbies, or icebreakers... (Enter to send)"
                rows={2}
                style={{
                  flex: 1,
                  padding: "12px 16px",
                  borderRadius: "14px",
                  background: "var(--bg-secondary)",
                  border: "1px solid var(--border-subtle)",
                  color: "#fff",
                  fontSize: "14px",
                  outline: "none",
                  resize: "none",
                  lineHeight: 1.4,
                }}
              />
              <button
                onClick={() => handleSendMessage()}
                disabled={sending || !inputText.trim()}
                style={{
                  height: "48px",
                  padding: "0 22px",
                  borderRadius: "12px",
                  background:
                    sending || !inputText.trim()
                      ? "rgba(99, 102, 241, 0.3)"
                      : "linear-gradient(135deg, var(--primary-500), #a855f7)",
                  color: "#fff",
                  fontWeight: 700,
                  fontSize: "14px",
                  border: "none",
                  cursor: sending || !inputText.trim() ? "not-allowed" : "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  boxShadow: "0 4px 14px rgba(99, 102, 241, 0.3)",
                }}
              >
                <span>Send</span>
                <span>➤</span>
              </button>
            </div>
            <p
              style={{
                textAlign: "center",
                fontSize: "11px",
                color: "var(--text-muted)",
                marginTop: "8px",
                paddingBottom: "env(safe-area-inset-bottom, 8px)",
              }}
            >
              MatchMyVibe AI is strictly scoped to DDU campus communities & events.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
