// ─── AI Module: Gemini Extraction, Embedding & Re-Ranking ─────────────────────
// All Gemini interactions are encapsulated here.
// When GEMINI_API_KEY is absent or set to "mock", realistic mock data is returned.

import { GoogleGenAI } from "@google/genai";
import type { ExtractResult, RerankResult } from "./types";
import { ExtractSchema, RerankSchema } from "./types";

// ─── Configuration ────────────────────────────────────────────────────────────

function getApiKey(): string {
  return process.env.GEMINI_API_KEY || "";
}

export function isMockMode(): boolean {
  const key = getApiKey();
  return !key || key === "mock" || key.startsWith("your_");
}

let _genai: GoogleGenAI | null = null;
function getGenAI(): GoogleGenAI {
  const key = getApiKey();
  if (!_genai) {
    _genai = new GoogleGenAI({ apiKey: key });
  }
  return _genai;
}

// ─── Step 1: Extract Interests ────────────────────────────────────────────────

const EXTRACT_SYSTEM_INSTRUCTION = `You are an empathetic campus student advisor at DDU university. 
Analyze unstructured student notes, including Hinglish, Gujarati idioms (e.g., "bhai coding ane gaming no shokh chhe", "raat ko football khelna hai"), colloquial campus slang, introverted notes, or niche requests. 
Extract 2 to 5 canonical hobby/interest tags that can be used to match the student with campus clubs and events.
Return ONLY valid JSON matching this schema:
{
  "interests": ["tag1", "tag2", ...],
  "sentiment": "enthusiastic" | "curious" | "shy" | "neutral" | "introverted",
  "nicheFlag": true | false
}`;

export async function extractInterests(text: string): Promise<ExtractResult> {
  if (isMockMode()) {
    return mockExtract(text);
  }

  try {
    const ai = getGenAI();
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: text,
      config: {
        systemInstruction: EXTRACT_SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        temperature: 0.3,
      },
    });

    const raw = response.text ?? "";
    const parsed = JSON.parse(raw);
    return ExtractSchema.parse(parsed);
  } catch (error) {
    console.error("Extraction error, falling back to mock:", error);
    return mockExtract(text);
  }
}

// ─── Step 2: Generate Query Embedding ─────────────────────────────────────────

const EMBEDDING_MODELS = [
  "text-embedding-004",
  "gemini-embedding-001",
  "embedding-001"
];

export async function embedQuery(query: string): Promise<number[]> {
  if (isMockMode()) {
    return mockEmbed(query);
  }

  try {
    const ai = getGenAI();
    for (const modelName of EMBEDDING_MODELS) {
      try {
        const response = await ai.models.embedContent({
          model: modelName,
          contents: query,
        });
        if (response.embeddings && response.embeddings.length > 0 && response.embeddings[0].values) {
          return response.embeddings[0].values;
        }
      } catch (err: any) {
        // Try next model if 404
      }
    }
    throw new Error("No embedding returned from models");
  } catch (error) {
    console.error("Embedding error, falling back to mock:", error);
    return mockEmbed(query);
  }
}

// ─── Step 3: Re-Rank & Generate Icebreakers ───────────────────────────────────

export async function rerankAndExplain(
  userQuery: string,
  interests: string[],
  candidates: { id: string; name: string; category: string; description: string; tags: string[]; targetAudience: string }[]
): Promise<RerankResult> {
  if (isMockMode()) {
    return mockRerank(candidates, userQuery);
  }

  const candidatesSummary = candidates
    .map(
      (c, i) =>
        `${i + 1}. [${c.id}] ${c.name} (${c.category})\n   Description: ${c.description}\n   Tags: ${c.tags.join(", ")}\n   Audience: ${c.targetAudience}`
    )
    .join("\n\n");

  const prompt = `The student wrote: "${userQuery}"
Their extracted interests: ${interests.join(", ")}

Here are candidate campus clubs and events:

${candidatesSummary}

Select top matches. For each selected candidate, return:
- id: the candidate's ID in square brackets above
- relevance_score: match quality from 0.0 to 1.0
- explanation: 1-2 conversational sentences explaining the exact connection to the student's text
- icebreakers: an array of EXACTLY THREE distinct icebreaker messages [casual, direct, gentle/formal]:
  1. casual: warm, peer-to-peer campus style
  2. direct: concise, clear request to join
  3. gentle/formal: low-pressure, gentle/polite message (especially for shy/introverted students)
- matchTier: "high" (score >= 0.8), "moderate" (0.6-0.79), or "exploratory" (< 0.6)

Return ONLY valid JSON matching this schema:
{
  "isFallback": boolean,
  "fallbackNotice": "optional string",
  "selected": [{ "id": "...", "relevance_score": 0.0-1.0, "explanation": "...", "icebreakers": ["casual text", "direct text", "gentle text"], "matchTier": "high|moderate|exploratory" }]
}`;

  try {
    const ai = getGenAI();
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        temperature: 0.5,
      },
    });

    const raw = response.text ?? "";
    const parsed = JSON.parse(raw);
    return RerankSchema.parse(parsed);
  } catch (error) {
    console.error("Rerank error, falling back to mock:", error);
    return mockRerank(candidates, userQuery);
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// MOCK MODE: Rule-based fallback for offline / demo use
// ═══════════════════════════════════════════════════════════════════════════════

const KEYWORD_MAP: Record<string, string[]> = {
  coding: ["programming", "code", "coding", "developer", "dev", "software", "web", "app", "python", "javascript", "hackathon", "robotics", "embedded"],
  gaming: ["gaming", "game", "gamer", "esports", "valorant", "bgmi", "pubg", "fifa", "cs", "lan"],
  sports: ["football", "sports", "badminton", "trekking", "hiking", "hikes", "outdoors", "fitness"],
  music: ["music", "singing", "guitar", "acoustic", "band", "jam", "unplugged", "vocal"],
  dance: ["dance", "cultural", "hosting", "stage", "classical dance", "folk"],
  drama: ["nukkad", "natak", "street play", "drama", "acting", "theater"],
  voluntourism: ["volunteering", "teaching", "social", "voluntourism", "community", "impact"],
  introvert: ["introvert", "introverted", "quiet", "gentle", "low-key"],
};

function mockExtract(text: string): ExtractResult {
  const lower = text.toLowerCase();
  const matched = new Set<string>();

  for (const [interest, keywords] of Object.entries(KEYWORD_MAP)) {
    for (const kw of keywords) {
      if (lower.includes(kw)) {
        matched.add(interest);
        break;
      }
    }
  }

  if (matched.size === 0) {
    matched.add("exploration");
    matched.add("community");
  }

  const interests = Array.from(matched).slice(0, 5);
  const isIntrovert = lower.includes("introvert") || lower.includes("quiet") || lower.includes("gentle");

  return {
    interests,
    sentiment: isIntrovert ? "introverted" : interests.length >= 3 ? "enthusiastic" : "curious",
    nicheFlag: matched.size === 0,
  };
}

function mockEmbed(text: string): number[] {
  const dim = 3072;
  const embedding = new Array(dim).fill(0);
  const lower = text.toLowerCase();

  for (let i = 0; i < lower.length; i++) {
    const charCode = lower.charCodeAt(i);
    for (let d = 0; d < dim; d++) {
      embedding[d] += Math.sin(charCode * (d + 1) * 0.01) * 0.01;
    }
  }

  let mag = 0;
  for (let i = 0; i < dim; i++) {
    mag += embedding[i] * embedding[i];
  }
  mag = Math.sqrt(mag);
  if (mag > 0) {
    for (let i = 0; i < dim; i++) {
      embedding[i] /= mag;
    }
  }

  return embedding;
}

function mockRerank(
  candidates: { id: string; name: string; category: string; description: string; tags: string[] }[],
  userQuery: string
): RerankResult {
  const lowerQuery = userQuery.toLowerCase();
  const isIntrovert = lowerQuery.includes("introvert") || lowerQuery.includes("quiet");

  const selected = candidates.slice(0, 5).map((c, i) => {
    const score = Math.round((0.96 - i * 0.05) * 100) / 100;
    const tier = score >= 0.8 ? "high" : score >= 0.6 ? "moderate" : "exploratory";
    const tag = c.tags[0] || c.category.toLowerCase();

    return {
      id: c.id,
      relevance_score: score,
      explanation: `Based on your note ("${userQuery.slice(0, 45)}..."), ${c.name} is a great match that aligns with your interest in ${tag}.`,
      icebreakers: [
        `Hey! 👋 Saw ${c.name} on MatchMyVibe. I'm really into ${tag} and would love to drop by for the next session!`,
        `Hi, I saw ${c.name} is active in ${tag}. I would like to join the community — how can I get started?`,
        isIntrovert
          ? `Hi there. I'm a bit quiet/introverted, but I love ${tag} and was wondering if I could drop by silently or observe a session at ${c.name}?`
          : `Hello! I am interested in ${c.name} and would appreciate information on upcoming meetups. Thank you!`,
      ] as [string, string, string],
      matchTier: tier as "high" | "moderate" | "exploratory",
    };
  });

  return {
    isFallback: selected.length === 0,
    fallbackNotice:
      selected.length === 0
        ? "We couldn't find an exact club for your specific request, but here are vibrant campus communities!"
        : undefined,
    selected,
  };
}
