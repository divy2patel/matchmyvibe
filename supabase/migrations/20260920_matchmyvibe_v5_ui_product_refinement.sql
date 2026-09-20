-- ===============================================================================
-- MATCHMYVIBE V5 — DDU CAMPUS EDITION UI & PRODUCT REFINEMENT MIGRATION
-- File: supabase/migrations/20260920_matchmyvibe_v5_ui_product_refinement.sql
-- Note: Non-destructive, additive upgrade. Preserves all previous data & schema.
-- ===============================================================================

-- 1. Add student_id to profiles if not present
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS student_id TEXT;

-- 2. Backfill existing student_id values with official format TMV-XXXXXX
UPDATE public.profiles
SET student_id = 'TMV-' || UPPER(SUBSTRING(REPLACE(COALESCE(user_id::text, id::text), '-', '') FROM 1 FOR 6))
WHERE student_id IS NULL;

-- 3. Update handle_new_user trigger to include student_id on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
    INSERT INTO public.profiles (
        user_id,
        name,
        full_name,
        email,
        role,
        student_id,
        onboarding_completed
    )
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'role', 'student'),
        'TMV-' || UPPER(SUBSTRING(REPLACE(NEW.id::text, '-', '') FROM 1 FOR 6)),
        TRUE
    )
    ON CONFLICT (user_id) DO UPDATE
    SET
        email = EXCLUDED.email,
        full_name = COALESCE(public.profiles.full_name, EXCLUDED.full_name),
        name = COALESCE(public.profiles.name, EXCLUDED.name),
        student_id = COALESCE(public.profiles.student_id, EXCLUDED.student_id);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
