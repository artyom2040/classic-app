-- =============================================
-- User Progress Table Migration
-- Run this in Supabase SQL Editor
-- =============================================

-- Create user_progress table for syncing local progress
CREATE TABLE IF NOT EXISTS public.user_progress (
    -- Primary key is the user ID (one progress record per user)
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,

    -- Kickstart journey progress
    kickstart_day INTEGER DEFAULT 0,
    kickstart_completed BOOLEAN DEFAULT FALSE,

    -- Viewed content tracking (arrays of IDs)
    viewed_composers TEXT[] DEFAULT '{}',
    viewed_periods TEXT[] DEFAULT '{}',
    viewed_forms TEXT[] DEFAULT '{}',
    viewed_terms TEXT[] DEFAULT '{}',

    -- Achievements
    badges TEXT[] DEFAULT '{}',

    -- App state
    first_launch BOOLEAN DEFAULT TRUE,

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for efficient queries
CREATE INDEX IF NOT EXISTS idx_user_progress_updated
ON public.user_progress(updated_at DESC);

-- Enable Row Level Security
ALTER TABLE public.user_progress ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can only access their own progress

-- Users can read their own progress
CREATE POLICY "Users can read own progress" ON public.user_progress
    FOR SELECT
    USING (auth.uid() = user_id);

-- Users can insert their own progress
CREATE POLICY "Users can insert own progress" ON public.user_progress
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Users can update their own progress
CREATE POLICY "Users can update own progress" ON public.user_progress
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Users can delete their own progress (for account cleanup)
CREATE POLICY "Users can delete own progress" ON public.user_progress
    FOR DELETE
    USING (auth.uid() = user_id);

-- Grant permissions to authenticated users
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_progress TO authenticated;

-- Function to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_user_progress_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update timestamp on changes
DROP TRIGGER IF EXISTS update_user_progress_timestamp ON public.user_progress;
CREATE TRIGGER update_user_progress_timestamp
    BEFORE UPDATE ON public.user_progress
    FOR EACH ROW
    EXECUTE FUNCTION public.update_user_progress_timestamp();

-- End of migration
