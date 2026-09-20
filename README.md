# 🎯 MatchMyVibe — DDU Campus Edition
> **Find your people. Find your communities. Find your campus vibe.**  
> *Built for DDU Campus • GDG Hackathon*

---

## 🌟 Overview

**MatchMyVibe** is an intelligent, AI-powered campus community and hobby matchmaker designed for DDU students. Instead of scrolling through static club directories, students express what they love in unstructured natural language (including Hinglish and campus slang). 

The platform extracts semantic vibe signals, searches precomputed 768-dimensional vector embeddings, filters active campus communities and strictly upcoming events, performs neural re-ranking using Google Gemini 2.5 Flash with automatic Groq failover, and delivers personalized recommendations with context-aware icebreakers.

---

## 🚀 Key Features

- **"Vibe Network" Midnight Design System**: Deep midnight glassmorphic UI (`#0A0A18`), floating navbar, responsive mobile bottom dock, and constellation mesh background.
- **AI Command Surface**: Real-time character counter, `⌘ Enter` keyboard shortcut, flowing category chips, and live campus signals.
- **5-Stage Multi-Phase Pipeline Loader**: Real-time pipeline progress tracker illustrating the end-to-end matching process.
- **Hybrid Search & Re-ranking**:
  - Semantic vector search (768-dim embeddings via `text-embedding-004`).
  - Categorical and tag overlap matching.
  - Neural re-ranking via Google Gemini 2.5 Flash.
  - Automatic sub-second failover to Groq (Llama 3.3 70B Versatile) and deterministic offline fallback.
- **Strict Scope Guardrails**: AI Chat is strictly bounded to DDU campus life, clubs, events, and reachout icebreakers, resisting prompt-injection attacks.
- **Your Campus Shelf**: Real-time bookmarked communities and upcoming events with tab filters (`All`, `Communities`, `Events`).
- **Student Identity & Vibe Map**: Official `TMV-XXXXXX` student identification badge with copy feedback and an interactive visual Vibe Map constellation.
- **Student Auth & Role-Based Access Control**: Student and campus admin accounts with Supabase row-level security.

---

## 🛠️ Tech Stack

- **Frontend**: Next.js 16 (App Router, Turbopack), React 19, TypeScript, Vanilla CSS design tokens
- **Backend**: FastAPI, Python 3.13, Uvicorn, Pydantic v2
- **Database & Auth**: Supabase PostgreSQL with `pgvector` extension and Row-Level Security (RLS)
- **AI Orchestration**:
  - Primary: Google Gemini 2.5 Flash (`google-genai`)
  - Fallback: Groq Cloud API (`llama-3.3-70b-versatile`)
  - Embeddings: Google `text-embedding-004` (768 dimensions)

---

## ⚡ Quick Start

### 1. Prerequisites
- Node.js 18+ (Node 20+ recommended)
- Python 3.11+
- Supabase account with `pgvector` enabled

### 2. Environment Setup
Copy `.env.example` to `.env.local` and `.env`:
```bash
cp .env.example .env.local
cp .env.example .env
```
Fill in your credentials:
```env
AI_PRIMARY_PROVIDER=gemini
AI_FALLBACK_PROVIDER=groq
GEMINI_API_KEY=your_gemini_api_key
GROQ_API_KEY=your_groq_api_key
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
FASTAPI_BACKEND_URL=http://localhost:8000
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Install & Run Frontend
```bash
npm install
npm run dev
```
Open [http://localhost:3000](http://localhost:3000).

### 4. Install & Run Backend
```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn backend.app.main:app --host 127.0.0.1 --port 8000 --reload
```
API Documentation available at [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs).

### 5. Running Tests
```bash
PYTHONPATH=. pytest backend/tests/ -v
```

---

## 🏛️ Database Migrations
Migrations are managed in `supabase/migrations/`:
- `001_initial_schema.sql`: Tables for groups, events, interests, match logs, and vector embeddings.
- `20260920_matchmyvibe_auth_chat_upgrade.sql`: Profiles, saved items, chat conversations, and RLS policies.
- `20260920_matchmyvibe_v5_ui_product_refinement.sql`: Additive refinement adding `student_id` (`TMV-XXXXXX`) and trigger generation.

---

## 📄 License
MIT License. Built for DDU Campus • GDG Hackathon.
