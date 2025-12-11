-- Drop the overly permissive SELECT policy
DROP POLICY IF EXISTS "Authenticated users can view profiles" ON public.profiles;

-- Create policy: Users can view their own profile
CREATE POLICY "Users can view own profile" 
ON public.profiles FOR SELECT 
USING (auth.uid() = user_id);

-- Create policy: Users can view profiles of members in their groups
CREATE POLICY "Users can view group members profiles" 
ON public.profiles FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.group_members gm1
    JOIN public.group_members gm2 ON gm1.group_id = gm2.group_id
    WHERE gm1.user_id = auth.uid()
    AND gm2.user_id = profiles.user_id
  )
);