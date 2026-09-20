// ─── MatchMyVibe V3 Typed API Client ──────────────────────────────────────────
// Communicates with the FastAPI backend (or Next.js proxy) with Supabase Auth headers

export interface UnderstoodVibe {
  interests: string[];
  categories: string[];
  activity_preferences: string[];
  social_preference: string;
  experience_level: string;
  intent: string;
  vibe_summary: string;
  niche_flag: boolean;
}

export interface RecommendationItem {
  id: string;
  type: "group" | "event";
  name: string;
  slug?: string;
  category: string;
  description: string;
  image_url?: string;
  match_score: number;
  match_tier: "high" | "moderate" | "exploratory";
  match_reason: string;
  match_signals: Record<string, any>;
  location: string;
  meeting_information?: string;
  event_date?: string;
  contact_lead: string;
  contact_information?: string;
  target_audience: string;
  tags: string[];
  icebreakers: [string, string, string];
}

export interface MatchResponse {
  success: boolean;
  vibe: UnderstoodVibe;
  recommendations: RecommendationItem[];
  is_fallback: boolean;
  fallback_notice?: string;
  meta: {
    provider_used: string;
    fallback_triggered: boolean;
    fallback_reason?: string;
    total_candidates_evaluated: number;
    processing_time_ms: number;
  };
}

export interface IcebreakerResponse {
  icebreaker: string;
  style: string;
  channel: string;
  formatted_text: string;
  whatsapp_share_url?: string;
}

export interface GroupItem {
  id: string;
  name: string;
  slug: string;
  category: string;
  description: string;
  image_url?: string;
  location: string;
  meeting_information: string;
  contact_lead: string;
  contact_information?: string;
  target_audience: string;
  tags: string[];
}

export interface EventItem {
  id: string;
  group_id?: string;
  name: string;
  category: string;
  description: string;
  event_type: string;
  event_date: string;
  location: string;
  image_url?: string;
  registration_url?: string;
  contact_lead: string;
  contact_information?: string;
  target_audience: string;
  tags: string[];
}

export interface ChatMessageItem {
  id: string;
  conversation_id: string;
  user_id: string;
  role: "user" | "assistant" | "system";
  content: string;
  provider?: string | null;
  created_at: string;
}

export interface ConversationItem {
  id: string;
  user_id: string;
  title: string;
  created_at: string;
  updated_at: string;
  messages?: ChatMessageItem[];
}

export interface ChatCompletionResponse {
  conversation_id: string;
  message: ChatMessageItem;
  title?: string;
  provider?: string;
  is_fallback: boolean;
}

export interface SavedItemRecord {
  id: string;
  user_id: string;
  group_id?: string;
  event_id?: string;
  item_type: "group" | "event";
  title: string;
  category: string;
  image_url?: string;
  created_at: string;
}

export interface StudentProfileData {
  id: string;
  user_id: string;
  name: string;
  full_name?: string;
  email?: string;
  avatar_url?: string;
  bio?: string;
  batch?: string;
  branch?: string;
  student_id?: string;
  role: "student" | "admin";
  onboarding_completed: boolean;
  vibe_summary?: string;
  activity_preferences: string[];
  created_at?: string;
}

const BACKEND_URL =
  process.env.NEXT_PUBLIC_FASTAPI_BACKEND_URL ||
  process.env.FASTAPI_BACKEND_URL ||
  "http://localhost:8000";

class ApiClient {
  private authToken: string | null = null;

  setAuthToken(token: string | null) {
    this.authToken = token;
  }

  private getHeaders(): HeadersInit {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    if (this.authToken) {
      headers["Authorization"] = `Bearer ${this.authToken}`;
    } else if (typeof window !== "undefined") {
      const storedToken = localStorage.getItem("matchmyvibe_access_token");
      if (storedToken) {
        headers["Authorization"] = `Bearer ${storedToken}`;
      }
      const storedId = localStorage.getItem("matchmyvibe_user_id");
      if (storedId) {
        headers["x-user-id"] = storedId;
      }
    }
    return headers;
  }

  // ── Match ──────────────────────────────────────────────────────────────────
  async match(text: string): Promise<MatchResponse> {
    try {
      const res = await fetch(`${BACKEND_URL}/api/v1/match`, {
        method: "POST",
        headers: this.getHeaders(),
        body: JSON.stringify({ text }),
      });
      if (res.ok) {
        return await res.json();
      }
    } catch {
      // Fall through to internal proxy
    }

    const fallbackRes = await fetch("/api/match", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });

    if (!fallbackRes.ok) {
      const err = await fallbackRes.json().catch(() => ({}));
      throw new Error(err.error || "Failed to process match request.");
    }
    return await fallbackRes.json();
  }

  // ── Icebreaker ─────────────────────────────────────────────────────────────
  async generateIcebreaker(params: {
    itemId: string;
    itemType: "group" | "event";
    itemName: string;
    category: string;
    contactLead: string;
    style: string;
    channel: string;
    userContext?: string;
  }): Promise<IcebreakerResponse> {
    try {
      const res = await fetch(`${BACKEND_URL}/api/v1/icebreaker`, {
        method: "POST",
        headers: this.getHeaders(),
        body: JSON.stringify({
          item_id: params.itemId,
          item_type: params.itemType,
          item_name: params.itemName,
          category: params.category,
          contact_lead: params.contactLead,
          style: params.style,
          channel: params.channel,
          user_context: params.userContext,
        }),
      });
      if (res.ok) {
        return await res.json();
      }
    } catch {}

    const lead = params.contactLead.split(" ")[0] || "there";
    const text = `Hey ${lead}! Saw ${params.itemName} on MatchMyVibe. I'm really interested in ${params.category.toLowerCase()} and would love to join your next meetup!`;
    return {
      icebreaker: text,
      style: params.style,
      channel: params.channel,
      formatted_text: text,
      whatsapp_share_url: `https://wa.me/?text=${encodeURIComponent(text)}`,
    };
  }

  // ── Groups & Events ────────────────────────────────────────────────────────
  async getGroups(category?: string): Promise<GroupItem[]> {
    const url = new URL(`${BACKEND_URL}/api/v1/groups`);
    if (category && category !== "All") url.searchParams.set("category", category);
    const res = await fetch(url.toString(), { headers: this.getHeaders() });
    if (!res.ok) throw new Error("Failed to load campus communities.");
    return await res.json();
  }

  async getGroupDetail(idOrSlug: string): Promise<GroupItem> {
    const res = await fetch(`${BACKEND_URL}/api/v1/groups/${idOrSlug}`, {
      headers: this.getHeaders(),
    });
    if (!res.ok) throw new Error("Community not found.");
    return await res.json();
  }

  async getEvents(category?: string): Promise<EventItem[]> {
    const url = new URL(`${BACKEND_URL}/api/v1/events`);
    if (category && category !== "All") url.searchParams.set("category", category);
    const res = await fetch(url.toString(), { headers: this.getHeaders() });
    if (!res.ok) throw new Error("Failed to load upcoming events.");
    return await res.json();
  }

  async getEventDetail(id: string): Promise<EventItem> {
    const res = await fetch(`${BACKEND_URL}/api/v1/events/${id}`, {
      headers: this.getHeaders(),
    });
    if (!res.ok) throw new Error("Event not found.");
    return await res.json();
  }

  // ── AI Chat ────────────────────────────────────────────────────────────────
  async listConversations(): Promise<ConversationItem[]> {
    const res = await fetch(`${BACKEND_URL}/api/v1/chat/conversations`, {
      headers: this.getHeaders(),
    });
    if (!res.ok) return [];
    return await res.json();
  }

  async createConversation(title?: string): Promise<ConversationItem> {
    const res = await fetch(`${BACKEND_URL}/api/v1/chat/conversations`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify({ title: title || "New Conversation" }),
    });
    if (!res.ok) throw new Error("Failed to create conversation.");
    return await res.json();
  }

  async getConversation(id: string): Promise<ConversationItem> {
    const res = await fetch(`${BACKEND_URL}/api/v1/chat/conversations/${id}`, {
      headers: this.getHeaders(),
    });
    if (!res.ok) throw new Error("Failed to load conversation.");
    return await res.json();
  }

  async updateConversation(id: string, title: string): Promise<ConversationItem> {
    const res = await fetch(`${BACKEND_URL}/api/v1/chat/conversations/${id}`, {
      method: "PATCH",
      headers: this.getHeaders(),
      body: JSON.stringify({ title }),
    });
    if (!res.ok) throw new Error("Failed to rename conversation.");
    return await res.json();
  }

  async deleteConversation(id: string): Promise<{ success: boolean }> {
    const res = await fetch(`${BACKEND_URL}/api/v1/chat/conversations/${id}`, {
      method: "DELETE",
      headers: this.getHeaders(),
    });
    if (!res.ok) throw new Error("Failed to delete conversation.");
    return await res.json();
  }

  async sendChatMessage(content: string, conversationId?: string): Promise<ChatCompletionResponse> {
    const res = await fetch(`${BACKEND_URL}/api/v1/chat/message`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify({
        content,
        conversation_id: conversationId,
      }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || "Failed to send message.");
    }
    return await res.json();
  }

  // ── Saved Items ────────────────────────────────────────────────────────────
  async getSavedItems(): Promise<SavedItemRecord[]> {
    try {
      const res = await fetch(`${BACKEND_URL}/api/v1/saved`, {
        headers: this.getHeaders(),
      });
      if (res.ok) return await res.json();
    } catch {}
    return [];
  }

  async saveItem(payload: { groupId?: string; eventId?: string }): Promise<SavedItemRecord> {
    const res = await fetch(`${BACKEND_URL}/api/v1/saved`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify({
        group_id: payload.groupId,
        event_id: payload.eventId,
      }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || "Failed to bookmark item.");
    }
    return await res.json();
  }

  async removeSavedItem(savedId: string): Promise<boolean> {
    try {
      const res = await fetch(`${BACKEND_URL}/api/v1/saved/${savedId}`, {
        method: "DELETE",
        headers: this.getHeaders(),
      });
      return res.ok;
    } catch {
      return false;
    }
  }

  // ── Profile ────────────────────────────────────────────────────────────────
  async getProfile(): Promise<StudentProfileData> {
    const res = await fetch(`${BACKEND_URL}/api/v1/profile`, {
      headers: this.getHeaders(),
    });
    if (!res.ok) throw new Error("Failed to load profile.");
    return await res.json();
  }

  async updateProfile(data: Partial<StudentProfileData>): Promise<StudentProfileData> {
    const res = await fetch(`${BACKEND_URL}/api/v1/profile`, {
      method: "PATCH",
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Failed to update profile.");
    return await res.json();
  }

  async submitFeedback(payload: {
    recommendationId?: string;
    groupId?: string;
    eventId?: string;
    feedback: "positive" | "negative";
  }): Promise<boolean> {
    try {
      const res = await fetch(`${BACKEND_URL}/api/v1/feedback`, {
        method: "POST",
        headers: this.getHeaders(),
        body: JSON.stringify({
          recommendation_id: payload.recommendationId,
          group_id: payload.groupId,
          event_id: payload.eventId,
          feedback: payload.feedback,
        }),
      });
      return res.ok;
    } catch {
      return false;
    }
  }
}

export const apiClient = new ApiClient();
