
-- Create timestamp update function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Profiles table
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT DEFAULT 'Operador',
  bio TEXT DEFAULT 'Foco absoluto. Execução implacável.',
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile" ON public.profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'name', 'Operador'));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- RED Tasks table
CREATE TABLE public.red_tasks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'Work' CHECK (category IN ('Bio', 'Mind', 'Work', 'Outro')),
  completed BOOLEAN NOT NULL DEFAULT false,
  completed_at TIMESTAMP WITH TIME ZONE,
  position INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.red_tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own red_tasks" ON public.red_tasks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own red_tasks" ON public.red_tasks FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own red_tasks" ON public.red_tasks FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own red_tasks" ON public.red_tasks FOR DELETE USING (auth.uid() = user_id);

CREATE TRIGGER update_red_tasks_updated_at BEFORE UPDATE ON public.red_tasks FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Objectives table (quarterly focus)
CREATE TABLE public.objectives (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL DEFAULT 'Conquistar meu próximo grande objetivo',
  target_date DATE NOT NULL,
  end_time TEXT DEFAULT '23:59',
  quarter TEXT DEFAULT 'Q1 2026',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.objectives ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own objectives" ON public.objectives FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own objectives" ON public.objectives FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own objectives" ON public.objectives FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own objectives" ON public.objectives FOR DELETE USING (auth.uid() = user_id);

CREATE TRIGGER update_objectives_updated_at BEFORE UPDATE ON public.objectives FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- General Tasks table
CREATE TABLE public.general_tasks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  completed BOOLEAN NOT NULL DEFAULT false,
  position INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.general_tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own general_tasks" ON public.general_tasks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own general_tasks" ON public.general_tasks FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own general_tasks" ON public.general_tasks FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own general_tasks" ON public.general_tasks FOR DELETE USING (auth.uid() = user_id);

CREATE TRIGGER update_general_tasks_updated_at BEFORE UPDATE ON public.general_tasks FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Journal Entries table
CREATE TABLE public.journal_entries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  question_index INTEGER NOT NULL,
  content TEXT NOT NULL DEFAULT '',
  entry_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.journal_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own journal_entries" ON public.journal_entries FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own journal_entries" ON public.journal_entries FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own journal_entries" ON public.journal_entries FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own journal_entries" ON public.journal_entries FOR DELETE USING (auth.uid() = user_id);

CREATE TRIGGER update_journal_entries_updated_at BEFORE UPDATE ON public.journal_entries FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Challenge Progress table
CREATE TABLE public.challenge_progress (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  challenge_id INTEGER NOT NULL,
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  days_completed INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.challenge_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own challenge_progress" ON public.challenge_progress FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own challenge_progress" ON public.challenge_progress FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own challenge_progress" ON public.challenge_progress FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own challenge_progress" ON public.challenge_progress FOR DELETE USING (auth.uid() = user_id);

CREATE TRIGGER update_challenge_progress_updated_at BEFORE UPDATE ON public.challenge_progress FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
