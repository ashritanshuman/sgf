-- Drop the overly permissive SELECT policy
DROP POLICY IF EXISTS "Members can view sessions" ON public.study_sessions;

-- Create policy: Only hosts and group members can view sessions
CREATE POLICY "Group members can view sessions" 
ON public.study_sessions FOR SELECT 
USING (
  auth.uid() = host_id OR
  EXISTS (
    SELECT 1 FROM public.group_members
    WHERE group_members.group_id = study_sessions.group_id
    AND group_members.user_id = auth.uid()
  )
);