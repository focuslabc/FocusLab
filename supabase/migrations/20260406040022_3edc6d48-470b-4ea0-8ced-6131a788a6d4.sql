
-- Verified badges table for admin to manage
CREATE TABLE public.verified_badges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  username text NOT NULL,
  badge_type text NOT NULL DEFAULT 'partner',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.verified_badges ENABLE ROW LEVEL SECURITY;

-- Anyone authenticated can view badges
CREATE POLICY "Anyone can view badges" ON public.verified_badges
  FOR SELECT TO authenticated USING (true);

-- Only admins can manage badges
CREATE POLICY "Admins can insert badges" ON public.verified_badges
  FOR INSERT TO authenticated WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update badges" ON public.verified_badges
  FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete badges" ON public.verified_badges
  FOR DELETE TO authenticated USING (has_role(auth.uid(), 'admin'));

-- Library partners content table
CREATE TABLE public.library_partners (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text DEFAULT '',
  content_url text DEFAULT '',
  image_url text DEFAULT '',
  partner_name text DEFAULT '',
  price text DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.library_partners ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view partners" ON public.library_partners
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins can insert partners" ON public.library_partners
  FOR INSERT TO authenticated WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update partners" ON public.library_partners
  FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete partners" ON public.library_partners
  FOR DELETE TO authenticated USING (has_role(auth.uid(), 'admin'));

-- User theme preference table
CREATE TABLE public.user_theme_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  theme_id uuid REFERENCES public.global_themes(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

ALTER TABLE public.user_theme_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own prefs" ON public.user_theme_preferences
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own prefs" ON public.user_theme_preferences
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own prefs" ON public.user_theme_preferences
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- Allow admins to delete any coworking message
CREATE POLICY "Admins can delete messages" ON public.coworking_messages
  FOR DELETE TO authenticated USING (has_role(auth.uid(), 'admin'));

-- Allow admin to delete coworking rooms they didn't create
CREATE POLICY "Admins can delete any room" ON public.coworking_rooms
  FOR DELETE TO authenticated USING (has_role(auth.uid(), 'admin'));
