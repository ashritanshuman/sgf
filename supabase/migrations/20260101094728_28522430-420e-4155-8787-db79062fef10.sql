-- Add explicit DENY policies to user_roles table for clearer security model
-- These prevent any user-initiated write operations on the roles table

-- Explicitly deny all user-initiated inserts
CREATE POLICY "Deny user role insertions"
ON public.user_roles FOR INSERT
TO authenticated
WITH CHECK (false);

-- Explicitly deny all user-initiated updates
CREATE POLICY "Deny user role updates"
ON public.user_roles FOR UPDATE
TO authenticated
USING (false);

-- Explicitly deny all user-initiated deletions
CREATE POLICY "Deny user role deletions"
ON public.user_roles FOR DELETE
TO authenticated
USING (false);

-- Add comment explaining role management
COMMENT ON TABLE public.user_roles IS 'User role assignments. Only modified by: (1) handle_new_user() trigger for new users, (2) Admin operations using service role key. All user-initiated modifications are denied by RLS policies.';