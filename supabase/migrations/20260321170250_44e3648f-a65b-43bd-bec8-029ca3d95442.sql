
CREATE OR REPLACE FUNCTION public.check_username_available(uname text)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT NOT EXISTS (
    SELECT 1 FROM public.profiles WHERE username = uname
  )
$$;

CREATE TABLE IF NOT EXISTS public.daily_streaks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  streak_date date NOT NULL DEFAULT CURRENT_DATE,
  red_completed integer NOT NULL DEFAULT 0,
  red_total integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, streak_date)
);
ALTER TABLE public.daily_streaks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own streaks" ON public.daily_streaks FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own streaks" ON public.daily_streaks FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own streaks" ON public.daily_streaks FOR UPDATE TO authenticated USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS public.friendships (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_id uuid NOT NULL,
  addressee_id uuid NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(requester_id, addressee_id)
);
ALTER TABLE public.friendships ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own friendships" ON public.friendships FOR SELECT TO authenticated USING (auth.uid() = requester_id OR auth.uid() = addressee_id);
CREATE POLICY "Users can send friend requests" ON public.friendships FOR INSERT TO authenticated WITH CHECK (auth.uid() = requester_id);
CREATE POLICY "Users can update own friendships" ON public.friendships FOR UPDATE TO authenticated USING (auth.uid() = requester_id OR auth.uid() = addressee_id);
CREATE POLICY "Users can delete own friendships" ON public.friendships FOR DELETE TO authenticated USING (auth.uid() = requester_id OR auth.uid() = addressee_id);

CREATE TABLE IF NOT EXISTS public.private_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id uuid NOT NULL,
  receiver_id uuid NOT NULL,
  content text NOT NULL,
  read boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.private_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own messages" ON public.private_messages FOR SELECT TO authenticated USING (auth.uid() = sender_id OR auth.uid() = receiver_id);
CREATE POLICY "Users can send messages" ON public.private_messages FOR INSERT TO authenticated WITH CHECK (auth.uid() = sender_id);
CREATE POLICY "Users can update own messages" ON public.private_messages FOR UPDATE TO authenticated USING (auth.uid() = receiver_id);
ALTER PUBLICATION supabase_realtime ADD TABLE public.private_messages;

CREATE TABLE IF NOT EXISTS public.addiction_habits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  name text NOT NULL,
  description text DEFAULT '',
  frequency text DEFAULT '',
  cue text DEFAULT '',
  routine text DEFAULT '',
  reward text DEFAULT '',
  new_routine text DEFAULT '',
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.addiction_habits ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own habits" ON public.addiction_habits FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS public.addiction_daily_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  habit_id uuid NOT NULL REFERENCES public.addiction_habits(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  log_date date NOT NULL DEFAULT CURRENT_DATE,
  did_old_routine boolean DEFAULT false,
  did_new_routine boolean DEFAULT false,
  craving_level integer DEFAULT 5,
  note text DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(habit_id, log_date)
);
ALTER TABLE public.addiction_daily_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own logs" ON public.addiction_daily_logs FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS onboarding_completed boolean DEFAULT false;

CREATE OR REPLACE FUNCTION public.get_user_streak(uid uuid)
RETURNS integer
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
  WITH consecutive AS (
    SELECT streak_date, 
           streak_date - (ROW_NUMBER() OVER (ORDER BY streak_date))::integer * interval '1 day' AS grp
    FROM public.daily_streaks
    WHERE user_id = uid AND red_completed > 0 AND red_total > 0 AND red_completed = red_total
    ORDER BY streak_date DESC
  )
  SELECT COALESCE(COUNT(*)::integer, 0)
  FROM consecutive
  WHERE grp = (SELECT grp FROM consecutive ORDER BY streak_date DESC LIMIT 1)
$$;
