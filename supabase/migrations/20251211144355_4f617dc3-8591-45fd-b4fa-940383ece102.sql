-- Drop the overly permissive SELECT policy
DROP POLICY IF EXISTS "Members can view group members" ON public.group_members;

-- Create policy: Users can see memberships for groups they belong to or public groups
CREATE POLICY "Users can view group members" 
ON public.group_members FOR SELECT 
USING (
  -- User is a member of the group
  EXISTS (
    SELECT 1 FROM public.group_members gm
    WHERE gm.group_id = group_members.group_id
    AND gm.user_id = auth.uid()
  )
  OR
  -- Group is public (for discovery)
  EXISTS (
    SELECT 1 FROM public.study_groups sg
    WHERE sg.id = group_members.group_id
    AND sg.is_public = true
  )
);