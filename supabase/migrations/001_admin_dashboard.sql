-- =============================================
-- Admin Dashboard MVP - Supabase Migration
-- Run this in Supabase SQL Editor
-- =============================================

-- 1. Update role enum to include 'admin' (if not already exists)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
        CREATE TYPE user_role AS ENUM ('user', 'admin');
    END IF;
END $$;

-- 2. Create audit_logs table
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Who made the change
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    user_email TEXT,
    
    -- What was changed
    action TEXT NOT NULL CHECK (action IN ('create', 'update', 'delete', 'restore')),
    entity_type TEXT NOT NULL, -- 'composer', 'term', 'era', 'form', 'concert_hall'
    entity_id TEXT NOT NULL,
    entity_name TEXT, -- Human-readable name for display
    
    -- Change details (JSON diff)
    changes JSONB, -- { field: { old: ..., new: ... } }
    
    -- When
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for efficient queries
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity 
ON public.audit_logs(entity_type, entity_id);

CREATE INDEX IF NOT EXISTS idx_audit_logs_user 
ON public.audit_logs(user_id);

CREATE INDEX IF NOT EXISTS idx_audit_logs_created 
ON public.audit_logs(created_at DESC);

-- 3. Create content_versions table for rollback capability
CREATE TABLE IF NOT EXISTS public.content_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Content reference
    entity_type TEXT NOT NULL,
    entity_id TEXT NOT NULL,
    
    -- Version info
    version_number INTEGER NOT NULL,
    content JSONB NOT NULL, -- Full snapshot of content at this version
    
    -- Metadata
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Unique constraint per entity version
    UNIQUE(entity_type, entity_id, version_number)
);

-- Index for efficient version lookup
CREATE INDEX IF NOT EXISTS idx_content_versions_entity 
ON public.content_versions(entity_type, entity_id, version_number DESC);

-- 4. Row-Level Security Policies

-- Enable RLS
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_versions ENABLE ROW LEVEL SECURITY;

-- Audit logs: admins can read, system can insert
CREATE POLICY "Admins can read audit logs" ON public.audit_logs
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles
            WHERE user_profiles.id = auth.uid()
            AND user_profiles.role = 'admin'
        )
    );

CREATE POLICY "System can insert audit logs" ON public.audit_logs
    FOR INSERT
    WITH CHECK (true);

-- Content versions: admins can read and insert
CREATE POLICY "Admins can read versions" ON public.content_versions
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles
            WHERE user_profiles.id = auth.uid()
            AND user_profiles.role = 'admin'
        )
    );

CREATE POLICY "Admins can insert versions" ON public.content_versions
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.user_profiles
            WHERE user_profiles.id = auth.uid()
            AND user_profiles.role = 'admin'
        )
    );

-- 5. Grant permissions
GRANT SELECT, INSERT ON public.audit_logs TO authenticated;
GRANT SELECT, INSERT ON public.content_versions TO authenticated;

-- 6. Add role column to user_profiles if not exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user_profiles' AND column_name = 'role'
    ) THEN
        ALTER TABLE public.user_profiles ADD COLUMN role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin'));
    END IF;
END $$;

-- End of migration
