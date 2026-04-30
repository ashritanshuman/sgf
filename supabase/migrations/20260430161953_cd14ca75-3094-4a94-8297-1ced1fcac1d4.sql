-- Universities table for admin-managed dataset
CREATE TABLE public.universities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  normalized_name text NOT NULL UNIQUE,
  country text,
  aliases text[] DEFAULT '{}',
  source text DEFAULT 'manual',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid
);

CREATE INDEX idx_universities_name ON public.universities (name);
CREATE INDEX idx_universities_normalized ON public.universities (normalized_name);

ALTER TABLE public.universities ENABLE ROW LEVEL SECURITY;

-- Anyone authenticated can read the list (it powers the picker)
CREATE POLICY "Authenticated users can view universities"
ON public.universities FOR SELECT
TO authenticated
USING (true);

-- Only admins can insert/update/delete
CREATE POLICY "Admins can insert universities"
ON public.universities FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update universities"
ON public.universities FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete universities"
ON public.universities FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_universities_updated_at
BEFORE UPDATE ON public.universities
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Promote the most-recently-created user to admin (project owner)
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::app_role FROM auth.users
ORDER BY created_at DESC LIMIT 1
ON CONFLICT (user_id, role) DO NOTHING;