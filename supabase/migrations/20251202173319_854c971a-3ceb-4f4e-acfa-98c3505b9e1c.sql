-- Create enum for user roles
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

-- Create enum for learning styles
CREATE TYPE public.learning_style AS ENUM ('visual', 'auditory', 'reading', 'kinesthetic');

-- Create enum for skill levels
CREATE TYPE public.skill_level AS ENUM ('beginner', 'intermediate', 'advanced', 'expert');

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  university TEXT,
  major TEXT,
  year_of_study TEXT,
  learning_style learning_style DEFAULT 'visual',
  skill_level skill_level DEFAULT 'beginner',
  subjects TEXT[] DEFAULT '{}',
  interests TEXT[] DEFAULT '{}',
  availability JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create user_roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL DEFAULT 'user',
  UNIQUE (user_id, role)
);

-- Create study_groups table
CREATE TABLE public.study_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  subject TEXT NOT NULL,
  max_members INT DEFAULT 10,
  is_public BOOLEAN DEFAULT true,
  difficulty skill_level DEFAULT 'beginner',
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create group_members table
CREATE TABLE public.group_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID REFERENCES public.study_groups(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (group_id, user_id)
);

-- Create study_sessions table
CREATE TABLE public.study_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  group_id UUID REFERENCES public.study_groups(id) ON DELETE CASCADE,
  host_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  scheduled_at TIMESTAMPTZ NOT NULL,
  duration_minutes INT DEFAULT 60,
  is_virtual BOOLEAN DEFAULT true,
  meeting_link TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create messages table for chat
CREATE TABLE public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID REFERENCES public.study_groups(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create study_progress table
CREATE TABLE public.study_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  subject TEXT NOT NULL,
  hours_studied DECIMAL DEFAULT 0,
  sessions_completed INT DEFAULT 0,
  goals_met INT DEFAULT 0,
  week_start DATE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, subject, week_start)
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_progress ENABLE ROW LEVEL SECURITY;

-- Security definer function for role checking
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.raw_user_meta_data ->> 'name'),
    NEW.raw_user_meta_data ->> 'avatar_url'
  );
  
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user');
  
  RETURN NEW;
END;
$$;

-- Trigger for new user
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_study_groups_updated_at
  BEFORE UPDATE ON public.study_groups
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- RLS Policies for profiles
CREATE POLICY "Users can view all profiles"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for user_roles
CREATE POLICY "Users can view own roles"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policies for study_groups
CREATE POLICY "Anyone can view public groups"
  ON public.study_groups FOR SELECT
  TO authenticated
  USING (is_public = true OR created_by = auth.uid());

CREATE POLICY "Users can create groups"
  ON public.study_groups FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Group creators can update"
  ON public.study_groups FOR UPDATE
  TO authenticated
  USING (auth.uid() = created_by);

CREATE POLICY "Group creators can delete"
  ON public.study_groups FOR DELETE
  TO authenticated
  USING (auth.uid() = created_by);

-- RLS Policies for group_members
CREATE POLICY "Members can view group members"
  ON public.group_members FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can join groups"
  ON public.group_members FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can leave groups"
  ON public.group_members FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policies for study_sessions
CREATE POLICY "Members can view sessions"
  ON public.study_sessions FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create sessions"
  ON public.study_sessions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = host_id);

CREATE POLICY "Hosts can update sessions"
  ON public.study_sessions FOR UPDATE
  TO authenticated
  USING (auth.uid() = host_id);

-- RLS Policies for messages
CREATE POLICY "Group members can view messages"
  ON public.messages FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.group_members
      WHERE group_members.group_id = messages.group_id
      AND group_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Group members can send messages"
  ON public.messages FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM public.group_members
      WHERE group_members.group_id = messages.group_id
      AND group_members.user_id = auth.uid()
    )
  );

-- RLS Policies for study_progress
CREATE POLICY "Users can view own progress"
  ON public.study_progress FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own progress"
  ON public.study_progress FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own progress"
  ON public.study_progress FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- Enable realtime for messages
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;