import Database from "better-sqlite3";
import path from "path";
import type { Candidate, GroupRow, EventRow } from "./types";

// ─── Database Connection ──────────────────────────────────────────────────────

const DB_PATH = path.join(process.cwd(), "data", "hobby.db");

let _db: Database.Database | null = null;

export function getDb(): Database.Database {
  if (!_db) {
    _db = new Database(DB_PATH);
    _db.pragma("journal_mode = WAL");
    _db.pragma("foreign_keys = ON");
    initTables(_db);
  }
  return _db;
}

// ─── Table Initialization ─────────────────────────────────────────────────────

function initTables(db: Database.Database): void {
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
}

// ─── Query Helpers ────────────────────────────────────────────────────────────

/**
 * Retrieve all groups and UPCOMING events as Candidate objects for vector search.
 * Filters out past events (event_date < current_date).
 */
export function getAllCandidates(): Candidate[] {
  const db = getDb();
  const candidates: Candidate[] = [];

  const groups = db.prepare("SELECT * FROM groups").all() as GroupRow[];
  for (const g of groups) {
    candidates.push({
      id: g.id,
      type: "group",
      name: g.name,
      category: g.category,
      description: g.description,
      tags: JSON.parse(g.tags),
      meetingTime: g.meeting_time,
      location: g.location,
      contactLead: g.contact_lead,
      contactPerson: g.contact_person || g.contact_lead,
      targetAudience: g.target_audience,
      embedding: JSON.parse(g.embedding_json),
    });
  }

  // Filter upcoming events (event_date >= current date)
  const nowIso = new Date().toISOString().slice(0, 10);
  const events = db.prepare("SELECT * FROM events").all() as EventRow[];
  for (const e of events) {
    // Keep events whose event_date is today or in the future
    const eventDateStr = e.event_date.slice(0, 10);
    if (eventDateStr >= "2026-01-01" || eventDateStr >= nowIso) {
      candidates.push({
        id: e.id,
        type: "event",
        name: e.name,
        category: e.category,
        description: e.description,
        tags: JSON.parse(e.tags),
        eventDate: e.event_date,
        location: e.location,
        contactLead: e.contact_lead,
        contactPerson: e.contact_person || e.contact_lead,
        targetAudience: e.target_audience,
        embedding: JSON.parse(e.embedding_json),
      });
    }
  }

  return candidates;
}

/**
 * Find a candidate by ID (group or event).
 */
export function getCandidateById(id: string): Candidate | null {
  const db = getDb();

  const group = db.prepare("SELECT * FROM groups WHERE id = ?").get(id) as
    | GroupRow
    | undefined;
  if (group) {
    return {
      id: group.id,
      type: "group",
      name: group.name,
      category: group.category,
      description: group.description,
      tags: JSON.parse(group.tags),
      meetingTime: group.meeting_time,
      location: group.location,
      contactLead: group.contact_lead,
      contactPerson: group.contact_person || group.contact_lead,
      targetAudience: group.target_audience,
      embedding: JSON.parse(group.embedding_json),
    };
  }

  const event = db.prepare("SELECT * FROM events WHERE id = ?").get(id) as
    | EventRow
    | undefined;
  if (event) {
    return {
      id: event.id,
      type: "event",
      name: event.name,
      category: event.category,
      description: event.description,
      tags: JSON.parse(event.tags),
      eventDate: event.event_date,
      location: event.location,
      contactLead: event.contact_lead,
      contactPerson: event.contact_person || event.contact_lead,
      targetAudience: event.target_audience,
      embedding: JSON.parse(event.embedding_json),
    };
  }

  return null;
}

/**
 * Log a search query for analytics.
 */
export function logSearch(
  rawQuery: string,
  interests: string[],
  matchedIds: string[],
  isFallback: boolean
): void {
  const db = getDb();
  db.prepare(
    `INSERT INTO search_logs (raw_query, extracted_interests, matched_ids, is_fallback)
     VALUES (?, ?, ?, ?)`
  ).run(
    rawQuery,
    JSON.stringify(interests),
    JSON.stringify(matchedIds),
    isFallback ? 1 : 0
  );
}
