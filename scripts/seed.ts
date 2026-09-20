// ─── Seed Script: Initialize DB & Generate Embeddings ─────────────────────────
// Usage: npx tsx scripts/seed.ts

import Database from "better-sqlite3";
import fs from "fs";
import path from "path";
import type { SeedData } from "../src/lib/types";

// Load .env.local if present
const envLocalPath = path.join(process.cwd(), ".env.local");
if (fs.existsSync(envLocalPath)) {
  const envContent = fs.readFileSync(envLocalPath, "utf-8");
  for (const line of envContent.split("\n")) {
    const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
    if (match) {
      const key = match[1];
      let value = (match[2] || "").trim();
      if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
      process.env[key] = value;
    }
  }
}

const DB_DIR = path.join(process.cwd(), "data");
const DB_PATH = path.join(DB_DIR, "hobby.db");
const SEED_PATH = path.join(DB_DIR, "seed_aatmoday.json");

if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}

if (fs.existsSync(DB_PATH)) {
  fs.unlinkSync(DB_PATH);
  console.log("🗑️  Deleted existing hobby.db");
}

const db = new Database(DB_PATH);
db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

// ─── Create Tables ────────────────────────────────────────────────────────────

db.exec(`
  CREATE TABLE IF NOT EXISTS groups (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    description TEXT NOT NULL,
    tags TEXT NOT NULL,
    meeting_time TEXT NOT NULL,
    location TEXT NOT NULL,
    contact_lead TEXT NOT NULL,
    contact_person TEXT,
    target_audience TEXT NOT NULL,
    embedding_json TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS events (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    group_id TEXT,
    category TEXT NOT NULL,
    description TEXT NOT NULL,
    tags TEXT NOT NULL,
    event_date TEXT NOT NULL,
    location TEXT NOT NULL,
    contact_lead TEXT NOT NULL,
    contact_person TEXT,
    target_audience TEXT NOT NULL,
    embedding_json TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(group_id) REFERENCES groups(id) ON DELETE SET NULL
  );

  CREATE TABLE IF NOT EXISTS search_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    raw_query TEXT NOT NULL,
    extracted_interests TEXT NOT NULL,
    matched_ids TEXT NOT NULL,
    is_fallback INTEGER NOT NULL DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

console.log("✅ Tables created");

// ─── Load Seed Data ───────────────────────────────────────────────────────────

const raw = fs.readFileSync(SEED_PATH, "utf-8");
const seedData: SeedData = JSON.parse(raw);

// ─── Embedding Generation ─────────────────────────────────────────────────────

const API_KEY = process.env.GEMINI_API_KEY || "";
const IS_MOCK = !API_KEY || API_KEY === "mock" || API_KEY.startsWith("your_");

const EMBEDDING_MODELS = [
  "text-embedding-004",
  "gemini-embedding-001",
  "embedding-001"
];

async function getEmbedding(text: string): Promise<number[]> {
  if (!IS_MOCK) {
    const { GoogleGenAI } = await import("@google/genai");
    const ai = new GoogleGenAI({ apiKey: API_KEY });

    for (const modelName of EMBEDDING_MODELS) {
      try {
        const response = await ai.models.embedContent({
          model: modelName,
          contents: text,
        });
        if (response.embeddings && response.embeddings.length > 0 && response.embeddings[0].values) {
          return response.embeddings[0].values;
        }
      } catch (err: any) {
        // Try next model if 404
      }
    }
  }

  // Deterministic mock embedding
  const dim = 768;
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

// ─── Seed Groups ──────────────────────────────────────────────────────────────

const insertGroup = db.prepare(`
  INSERT INTO groups (id, name, category, description, tags, meeting_time, location, contact_lead, contact_person, target_audience, embedding_json)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

const insertEvent = db.prepare(`
  INSERT INTO events (id, name, group_id, category, description, tags, event_date, location, contact_lead, contact_person, target_audience, embedding_json)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

async function seed() {
  console.log(`\n🌱 Seeding ${seedData.groups.length} groups...`);
  console.log(`   Mode: ${IS_MOCK ? "MOCK (deterministic)" : "LIVE (Gemini API)"}\n`);

  for (const group of seedData.groups) {
    const embeddingText = `${group.name} ${group.category} ${group.description} ${group.tags.join(" ")}`;
    const embedding = await getEmbedding(embeddingText);

    insertGroup.run(
      group.id,
      group.name,
      group.category,
      group.description,
      JSON.stringify(group.tags),
      group.meeting_time,
      group.location,
      group.contact_lead,
      group.contact_person || group.contact_lead,
      group.target_audience,
      JSON.stringify(embedding)
    );
    console.log(`   ✓ ${group.name} (${embedding.length} dims)`);
  }

  console.log(`\n🎉 Seeding ${seedData.events.length} events...\n`);

  for (const event of seedData.events) {
    const embeddingText = `${event.name} ${event.category} ${event.description} ${event.tags.join(" ")}`;
    const embedding = await getEmbedding(embeddingText);

    insertEvent.run(
      event.id,
      event.name,
      event.group_id,
      event.category,
      event.description,
      JSON.stringify(event.tags),
      event.event_date,
      event.location,
      event.contact_lead,
      event.contact_person || event.contact_lead,
      event.target_audience,
      JSON.stringify(embedding)
    );
    console.log(`   ✓ ${event.name} (${embedding.length} dims)`);
  }

  const groupCount = (db.prepare("SELECT COUNT(*) as count FROM groups").get() as { count: number }).count;
  const eventCount = (db.prepare("SELECT COUNT(*) as count FROM events").get() as { count: number }).count;

  console.log(`\n═══════════════════════════════════════════`);
  console.log(`✅ Database seeded successfully!`);
  console.log(`   Groups: ${groupCount}`);
  console.log(`   Events: ${eventCount}`);
  console.log(`   DB Path: ${DB_PATH}`);
  console.log(`═══════════════════════════════════════════\n`);
}

seed().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});
