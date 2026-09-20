-- ═══════════════════════════════════════════════════════════════════════════════
-- MATCHMYVIBE V2 — Supabase PostgreSQL Schema with pgvector
-- ═══════════════════════════════════════════════════════════════════════════════

-- 1. Enable Required Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "vector";

-- 2. Profiles Table (linked with Supabase Auth users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL DEFAULT 'Aatmoday Student',
    email TEXT,
    avatar_url TEXT,
    bio TEXT,
    vibe_summary TEXT,
    activity_preferences TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Interests Taxonomy Table
CREATE TABLE IF NOT EXISTS public.interests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    category TEXT NOT NULL, -- Technology, Creative, Performing Arts, Sports, Adventure, Social
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Groups / Clubs Table
CREATE TABLE IF NOT EXISTS public.groups (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT NOT NULL,
    category TEXT NOT NULL,
    image_url TEXT,
    location TEXT NOT NULL,
    meeting_information TEXT NOT NULL,
    contact_lead TEXT NOT NULL,
    contact_information TEXT,
    target_audience TEXT NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    embedding VECTOR(768),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. Group Interests Many-to-Many Mapping
CREATE TABLE IF NOT EXISTS public.group_interests (
    group_id UUID NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
    interest_id UUID NOT NULL REFERENCES public.interests(id) ON DELETE CASCADE,
    relevance_weight FLOAT NOT NULL DEFAULT 1.0,
    PRIMARY KEY (group_id, interest_id)
);

-- 6. Events Table
CREATE TABLE IF NOT EXISTS public.events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    group_id UUID REFERENCES public.groups(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    event_type TEXT NOT NULL DEFAULT 'meetup',
    event_date TIMESTAMPTZ NOT NULL,
    location TEXT NOT NULL,
    image_url TEXT,
    registration_url TEXT,
    contact_lead TEXT NOT NULL,
    contact_information TEXT,
    target_audience TEXT NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    embedding VECTOR(768),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. Event Interests Many-to-Many Mapping
CREATE TABLE IF NOT EXISTS public.event_interests (
    event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
    interest_id UUID NOT NULL REFERENCES public.interests(id) ON DELETE CASCADE,
    relevance_weight FLOAT NOT NULL DEFAULT 1.0,
    PRIMARY KEY (event_id, interest_id)
);

-- 8. Saved Items (Bookmarks for Groups and Events)
CREATE TABLE IF NOT EXISTS public.saved_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    group_id UUID REFERENCES public.groups(id) ON DELETE CASCADE,
    event_id UUID REFERENCES public.events(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_saved_item CHECK (
        (group_id IS NOT NULL AND event_id IS NULL) OR
        (group_id IS NULL AND event_id IS NOT NULL)
    ),
    CONSTRAINT uq_user_group UNIQUE (user_id, group_id),
    CONSTRAINT uq_user_event UNIQUE (user_id, event_id)
);

-- 9. Search History Table
CREATE TABLE IF NOT EXISTS public.search_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    query TEXT NOT NULL,
    understood_interests JSONB NOT NULL DEFAULT '[]'::JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 10. Recommendations Table
CREATE TABLE IF NOT EXISTS public.recommendations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    group_id UUID REFERENCES public.groups(id) ON DELETE CASCADE,
    event_id UUID REFERENCES public.events(id) ON DELETE CASCADE,
    match_score FLOAT NOT NULL,
    match_reason TEXT NOT NULL,
    match_signals JSONB NOT NULL DEFAULT '{}'::JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_recommendation_target CHECK (
        (group_id IS NOT NULL AND event_id IS NULL) OR
        (group_id IS NULL AND event_id IS NOT NULL)
    )
);

-- 11. Icebreakers Table
CREATE TABLE IF NOT EXISTS public.icebreakers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    group_id UUID REFERENCES public.groups(id) ON DELETE CASCADE,
    event_id UUID REFERENCES public.events(id) ON DELETE CASCADE,
    style TEXT NOT NULL, -- casual, friendly, professional, short, introvert, in_person
    icebreaker TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_icebreaker_target CHECK (
        (group_id IS NOT NULL AND event_id IS NULL) OR
        (group_id IS NULL AND event_id IS NOT NULL)
    )
);

-- 12. Recommendation Feedback Table
CREATE TABLE IF NOT EXISTS public.recommendation_feedback (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    recommendation_id UUID REFERENCES public.recommendations(id) ON DELETE CASCADE,
    feedback TEXT NOT NULL, -- 'positive' | 'negative'
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ═══════════════════════════════════════════════════════════════════════════════
-- INDEXES & PGVECTOR SEARCH OPTIMIZATIONS
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE INDEX IF NOT EXISTS idx_groups_category ON public.groups(category);
CREATE INDEX IF NOT EXISTS idx_events_category ON public.events(category);
CREATE INDEX IF NOT EXISTS idx_events_date ON public.events(event_date);
CREATE INDEX IF NOT EXISTS idx_saved_items_user ON public.saved_items(user_id);
CREATE INDEX IF NOT EXISTS idx_search_history_user ON public.search_history(user_id);
CREATE INDEX IF NOT EXISTS idx_recommendations_user ON public.recommendations(user_id);

-- Vector Cosine Similarity Indexes (HNSW for high-performance approximate nearest neighbor search)
CREATE INDEX IF NOT EXISTS idx_groups_embedding ON public.groups
USING hnsw (embedding vector_cosine_ops);

CREATE INDEX IF NOT EXISTS idx_events_embedding ON public.events
USING hnsw (embedding vector_cosine_ops);

-- ═══════════════════════════════════════════════════════════════════════════════
-- RPC FUNCTIONS FOR VECTOR MATCHING
-- ═══════════════════════════════════════════════════════════════════════════════

-- 1. Match Groups using Cosine Similarity
CREATE OR REPLACE FUNCTION match_groups (
    query_embedding VECTOR(768),
    match_threshold FLOAT,
    match_count INT
)
RETURNS TABLE (
    id UUID,
    name TEXT,
    slug TEXT,
    description TEXT,
    category TEXT,
    image_url TEXT,
    location TEXT,
    meeting_information TEXT,
    contact_lead TEXT,
    contact_information TEXT,
    target_audience TEXT,
    similarity FLOAT
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT
        g.id,
        g.name,
        g.slug,
        g.description,
        g.category,
        g.image_url,
        g.location,
        g.meeting_information,
        g.contact_lead,
        g.contact_information,
        g.target_audience,
        (1 - (g.embedding <=> query_embedding))::FLOAT AS similarity
    FROM public.groups g
    WHERE g.is_active = TRUE
      AND g.embedding IS NOT NULL
      AND (1 - (g.embedding <=> query_embedding)) >= match_threshold
    ORDER BY g.embedding <=> query_embedding
    LIMIT match_count;
END;
$$;

-- 2. Match Events using Cosine Similarity (Strictly Future / Upcoming Events)
CREATE OR REPLACE FUNCTION match_events (
    query_embedding VECTOR(768),
    match_threshold FLOAT,
    match_count INT
)
RETURNS TABLE (
    id UUID,
    group_id UUID,
    name TEXT,
    description TEXT,
    event_type TEXT,
    event_date TIMESTAMPTZ,
    location TEXT,
    image_url TEXT,
    registration_url TEXT,
    contact_lead TEXT,
    contact_information TEXT,
    target_audience TEXT,
    similarity FLOAT
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT
        e.id,
        e.group_id,
        e.name,
        e.description,
        e.event_type,
        e.event_date,
        e.location,
        e.image_url,
        e.registration_url,
        e.contact_lead,
        e.contact_information,
        e.target_audience,
        (1 - (e.embedding <=> query_embedding))::FLOAT AS similarity
    FROM public.events e
    WHERE e.is_active = TRUE
      AND e.embedding IS NOT NULL
      AND e.event_date >= NOW() -- NEVER recommend expired events
      AND (1 - (e.embedding <=> query_embedding)) >= match_threshold
    ORDER BY e.embedding <=> query_embedding
    LIMIT match_count;
END;
$$;

-- ═══════════════════════════════════════════════════════════════════════════════
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ═══════════════════════════════════════════════════════════════════════════════

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.interests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.search_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.icebreakers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recommendation_feedback ENABLE ROW LEVEL SECURITY;

-- Public read access for groups, events, interests
CREATE POLICY "Public read groups" ON public.groups FOR SELECT USING (is_active = TRUE);
CREATE POLICY "Public read events" ON public.events FOR SELECT USING (is_active = TRUE);
CREATE POLICY "Public read interests" ON public.interests FOR SELECT USING (TRUE);

-- Profiles: users manage their own profile
CREATE POLICY "Users view own profile" ON public.profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Saved items: users manage their own saved items
CREATE POLICY "Users manage saved items" ON public.saved_items FOR ALL USING (auth.uid() = user_id);

-- Search history: users view and delete own history
CREATE POLICY "Users manage search history" ON public.search_history FOR ALL USING (auth.uid() = user_id);

-- Feedback: users insert feedback
CREATE POLICY "Users insert feedback" ON public.recommendation_feedback FOR ALL USING (auth.uid() = user_id);
