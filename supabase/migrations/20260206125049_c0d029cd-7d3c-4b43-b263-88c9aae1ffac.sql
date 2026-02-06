-- Fix: Add explicit authentication check to group_requests SELECT policies
-- Drop existing SELECT policies
DROP POLICY IF EXISTS "Users can view their own requests" ON public.group_requests;
DROP POLICY IF EXISTS "Group creators can view requests for their groups" ON public.group_requests;

-- Recreate with explicit authentication checks
CREATE POLICY "Users can view their own requests" 
ON public.group_requests 
FOR SELECT 
USING (auth.uid() IS NOT NULL AND auth.uid() = requester_id);

CREATE POLICY "Group creators can view requests for their groups" 
ON public.group_requests 
FOR SELECT 
USING (auth.uid() IS NOT NULL AND EXISTS (
  SELECT 1
  FROM study_groups
  WHERE study_groups.id = group_requests.group_id 
    AND study_groups.created_by = auth.uid()
));