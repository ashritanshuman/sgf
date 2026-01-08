-- Fix 1: Require authentication for profiles SELECT (prevent anonymous access)
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view group members profiles" ON public.profiles;

CREATE POLICY "Users can view own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() IS NOT NULL AND auth.uid() = user_id);

CREATE POLICY "Users can view group members profiles" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() IS NOT NULL AND shares_group_with(auth.uid(), user_id));

-- Fix 2: Require authentication for study_sessions SELECT
DROP POLICY IF EXISTS "Group members can view sessions" ON public.study_sessions;

CREATE POLICY "Group members can view sessions" 
ON public.study_sessions 
FOR SELECT 
USING (
  auth.uid() IS NOT NULL AND 
  (auth.uid() = host_id OR (group_id IS NOT NULL AND is_group_member(auth.uid(), group_id)))
);

-- Fix 3: Require authentication for group_members SELECT
DROP POLICY IF EXISTS "Users can view group members" ON public.group_members;

CREATE POLICY "Users can view group members" 
ON public.group_members 
FOR SELECT 
USING (
  auth.uid() IS NOT NULL AND 
  (is_group_member(auth.uid(), group_id) OR 
   EXISTS (SELECT 1 FROM study_groups sg WHERE sg.id = group_id AND sg.is_public = true))
);

-- Fix 4: Require authentication for study_groups SELECT
DROP POLICY IF EXISTS "Anyone can view public groups" ON public.study_groups;

CREATE POLICY "Authenticated users can view public groups" 
ON public.study_groups 
FOR SELECT 
USING (auth.uid() IS NOT NULL AND (is_public = true OR created_by = auth.uid()));

-- Fix 5: Allow users to delete their own notifications
CREATE POLICY "Users can delete own notifications" 
ON public.notifications 
FOR DELETE 
USING (auth.uid() = user_id);

-- Fix 6: Allow users to delete their own messages
CREATE POLICY "Users can delete own messages" 
ON public.messages 
FOR DELETE 
USING (auth.uid() = user_id);

-- Fix 7: Allow users to delete their own study progress
CREATE POLICY "Users can delete own progress" 
ON public.study_progress 
FOR DELETE 
USING (auth.uid() = user_id);

-- Fix 8: Allow users to withdraw their group join requests
CREATE POLICY "Users can withdraw own requests" 
ON public.group_requests 
FOR DELETE 
USING (auth.uid() = requester_id);