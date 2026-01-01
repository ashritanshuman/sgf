-- Create a security definer function to check if a user is a member of a group
-- This bypasses RLS to avoid infinite recursion
CREATE OR REPLACE FUNCTION public.is_group_member(_user_id uuid, _group_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.group_members
    WHERE user_id = _user_id
      AND group_id = _group_id
  )
$$;

-- Create a function to check if two users share a group
CREATE OR REPLACE FUNCTION public.shares_group_with(_user_id uuid, _other_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.group_members gm1
    JOIN public.group_members gm2 ON gm1.group_id = gm2.group_id
    WHERE gm1.user_id = _user_id
      AND gm2.user_id = _other_user_id
  )
$$;

-- Drop the problematic policies
DROP POLICY IF EXISTS "Users can view group members" ON public.group_members;
DROP POLICY IF EXISTS "Users can view group members profiles" ON public.profiles;
DROP POLICY IF EXISTS "Group members can view sessions" ON public.study_sessions;

-- Recreate group_members SELECT policy using the security definer function
CREATE POLICY "Users can view group members"
ON public.group_members
FOR SELECT
TO authenticated
USING (
  public.is_group_member(auth.uid(), group_id)
  OR EXISTS (
    SELECT 1 FROM public.study_groups sg
    WHERE sg.id = group_id AND sg.is_public = true
  )
);

-- Recreate profiles SELECT policy for group members
CREATE POLICY "Users can view group members profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (
  public.shares_group_with(auth.uid(), user_id)
);

-- Recreate study_sessions SELECT policy
CREATE POLICY "Group members can view sessions"
ON public.study_sessions
FOR SELECT
TO authenticated
USING (
  auth.uid() = host_id
  OR public.is_group_member(auth.uid(), group_id)
);