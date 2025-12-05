-- Add university column to study_groups table
ALTER TABLE public.study_groups ADD COLUMN university text;

-- Create group_requests table for join requests
CREATE TABLE public.group_requests (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  requester_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  group_id uuid NOT NULL REFERENCES public.study_groups(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(requester_id, group_id)
);

-- Create notifications table
CREATE TABLE public.notifications (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type text NOT NULL,
  title text NOT NULL,
  message text NOT NULL,
  data jsonb DEFAULT '{}'::jsonb,
  is_read boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on new tables
ALTER TABLE public.group_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- RLS policies for group_requests
CREATE POLICY "Users can view their own requests"
ON public.group_requests FOR SELECT
USING (auth.uid() = requester_id);

CREATE POLICY "Group creators can view requests for their groups"
ON public.group_requests FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.study_groups
  WHERE study_groups.id = group_requests.group_id
  AND study_groups.created_by = auth.uid()
));

CREATE POLICY "Users can create join requests"
ON public.group_requests FOR INSERT
WITH CHECK (auth.uid() = requester_id);

CREATE POLICY "Group creators can update request status"
ON public.group_requests FOR UPDATE
USING (EXISTS (
  SELECT 1 FROM public.study_groups
  WHERE study_groups.id = group_requests.group_id
  AND study_groups.created_by = auth.uid()
));

-- RLS policies for notifications
CREATE POLICY "Users can view own notifications"
ON public.notifications FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications"
ON public.notifications FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "System can create notifications"
ON public.notifications FOR INSERT
WITH CHECK (true);

-- Add triggers for updated_at
CREATE TRIGGER update_group_requests_updated_at
BEFORE UPDATE ON public.group_requests
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for notifications
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE public.group_requests;