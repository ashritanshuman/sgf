
CREATE TABLE public.university_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  university TEXT NOT NULL,
  user_id UUID NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX idx_university_messages_uni_created
  ON public.university_messages (university, created_at DESC);

ALTER TABLE public.university_messages ENABLE ROW LEVEL SECURITY;

-- Helper: get current user's university from their profile
CREATE OR REPLACE FUNCTION public.current_user_university()
RETURNS TEXT
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT university FROM public.profiles WHERE user_id = auth.uid() LIMIT 1;
$$;

CREATE POLICY "Users can view messages from their university"
ON public.university_messages
FOR SELECT
TO authenticated
USING (university = public.current_user_university());

CREATE POLICY "Users can post to their own university"
ON public.university_messages
FOR INSERT
TO authenticated
WITH CHECK (
  user_id = auth.uid()
  AND university = public.current_user_university()
);

CREATE POLICY "Users can delete their own messages"
ON public.university_messages
FOR DELETE
TO authenticated
USING (user_id = auth.uid());

ALTER PUBLICATION supabase_realtime ADD TABLE public.university_messages;
ALTER TABLE public.university_messages REPLICA IDENTITY FULL;
