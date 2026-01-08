-- Fix the SECURITY DEFINER view warning by recreating with SECURITY INVOKER
DROP VIEW IF EXISTS public.public_profiles;

CREATE VIEW public.public_profiles 
WITH (security_invoker = true)
AS
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