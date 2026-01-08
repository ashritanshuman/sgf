-- Create a view with limited profile fields for group members
-- This prevents exposing sensitive biographical information to other users

CREATE OR REPLACE VIEW public.public_profiles AS
SELECT 
  user_id,
  full_name,
  avatar_url,
  university,
  year_of_study,
  subjects,
  skill_level,
  learning_style
FROM public.profiles;

-- Grant select on the view to authenticated users
GRANT SELECT ON public.public_profiles TO authenticated;

-- Create a security definer function to get limited profile data for group members
CREATE OR REPLACE FUNCTION public.get_group_member_profile(_member_user_id uuid)
RETURNS TABLE (
  user_id uuid,
  full_name text,
  avatar_url text,
  university text,
  year_of_study text,
  subjects text[],
  skill_level skill_level,
  learning_style learning_style
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    p.user_id,
    p.full_name,
    p.avatar_url,
    p.university,
    p.year_of_study,
    p.subjects,
    p.skill_level,
    p.learning_style
  FROM public.profiles p
  WHERE p.user_id = _member_user_id
    AND (
      -- User can see their own full profile
      auth.uid() = _member_user_id
      -- Or user shares a group with this member
      OR public.shares_group_with(auth.uid(), _member_user_id)
    );
$$;