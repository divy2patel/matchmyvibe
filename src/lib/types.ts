import { z } from "zod";

// ─── Extraction Schema (Gemini Step 1) ────────────────────────────────────────

export const ExtractSchema = z.object({
  interests: z
    .array(z.string())
    .describe("List of 2-5 standardized interest keywords"),
  sentiment: z.enum(["enthusiastic", "curious", "shy", "neutral", "introverted"]),
  nicheFlag: z
    .boolean()
    .describe("True if user mentions an unusually specialized hobby"),
});

export type ExtractResult = z.infer<typeof ExtractSchema>;

// ─── Reranking Schema (Gemini Step 3) ─────────────────────────────────────────

export const RerankItemSchema = z.object({
  id: z.string(),
  relevance_score: z.number().min(0).max(1),
  explanation: z
    .string()
    .describe(
      "1-2 conversational sentences explaining the exact connection to user's text"
    ),
  icebreakers: z
    .array(z.string())
    .length(3)
    .describe("3 icebreaker options: [casual, direct, gentle/formal]"),
  matchTier: z.enum(["high", "moderate", "exploratory"]),
});

export const RerankSchema = z.object({
  isFallback: z.boolean(),
  fallbackNotice: z.string().optional(),
  selected: z.array(RerankItemSchema),
});

export type RerankResult = z.infer<typeof RerankSchema>;

// ─── Database Row Types ───────────────────────────────────────────────────────

export interface GroupRow {
  id: string;
  name: string;
  category: string;
  description: string;
  tags: string; // JSON array string
  meeting_time: string;
  location: string;
  contact_lead: string;
  contact_person?: string;
  target_audience: string;
  embedding_json: string;
  created_at: string;
}

export interface EventRow {
  id: string;
  name: string;
  group_id: string | null;
  category: string;
  description: string;
  tags: string; // JSON array string
  event_date: string;
  location: string;
  contact_lead: string;
  contact_person?: string;
  target_audience: string;
  embedding_json: string;
  created_at: string;
}

// ─── Candidate (unified group/event for vector search) ────────────────────────

export interface Candidate {
  id: string;
  type: "group" | "event";
  name: string;
  category: string;
  description: string;
  tags: string[];
  meetingTime?: string;
  eventDate?: string;
  location: string;
  contactLead: string;
  contactPerson: string;
  targetAudience: string;
  embedding: number[];
}

// ─── API Response Types ───────────────────────────────────────────────────────

export interface RecommendationItem {
  id: string;
  type: "group" | "event";
  name: string;
  category: string;
  relevance_score: number;
  explanation: string;
  icebreakers: [string, string, string]; // [casual, direct, gentle/formal]
  tags: string[];
  meetingTime?: string;
  eventDate?: string;
  location: string;
  contactLead: string;
  contactPerson: string;
  targetAudience: string;
  matchTier: "high" | "moderate" | "exploratory";
}

export interface MatchResponse {
  success: boolean;
  interests: string[];
  recommendations: RecommendationItem[]; // Top 3 groups + Top 2 upcoming events
  isFallback: boolean;
  fallbackNotice?: string;
  meta: {
    totalCandidatesEvaluated: number;
    processingTimeMs: number;
    mode: "live" | "mock";
  };
}

// ─── API Request Validation ───────────────────────────────────────────────────

export const MatchRequestSchema = z.object({
  text: z
    .string()
    .min(2, "Query text must be at least 2 characters long.")
    .max(1000, "Query text must not exceed 1000 characters."),
});

// ─── Seed Data Types ──────────────────────────────────────────────────────────

export interface SeedGroup {
  id: string;
  name: string;
  category: string;
  description: string;
  tags: string[];
  meeting_time: string;
  location: string;
  contact_lead: string;
  contact_person?: string;
  target_audience: string;
}

export interface SeedEvent {
  id: string;
  name: string;
  group_id: string | null;
  category: string;
  description: string;
  tags: string[];
  event_date: string;
  location: string;
  contact_lead: string;
  contact_person?: string;
  target_audience: string;
}

export interface SeedData {
  groups: SeedGroup[];
  events: SeedEvent[];
}
