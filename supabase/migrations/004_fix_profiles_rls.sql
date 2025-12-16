-- ============================================
-- 004: Fix Profiles RLS Policies
-- ============================================
-- Fixes infinite recursion in profiles RLS policies
-- Run after 001_create_profiles_table.sql

-- Drop problematic self-referencing policies
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;

-- Recreate with proper non-recursive checks
-- Users can view their own profile OR if they have admin role in JWT
CREATE POLICY "Users and admins can view profiles"
  ON public.profiles
  FOR SELECT
  USING (
    auth.uid() = id OR 
    (auth.jwt() ->> 'role') = 'admin'
  );

-- Service role has full access (for admin operations via backend)
CREATE POLICY "Service role full access"
  ON public.profiles
  FOR ALL
  USING (auth.role() = 'service_role');
