
-- Add meet_link to coworking_rooms for call rooms
ALTER TABLE public.coworking_rooms ADD COLUMN IF NOT EXISTS meet_link text DEFAULT '';

-- Create coworking_messages table for real-time chat
CREATE TABLE IF NOT EXISTS public.coworking_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id uuid REFERENCES public.coworking_rooms(id) ON DELETE CASCADE NOT NULL,
  user_id uuid NOT NULL,
  user_name text NOT NULL DEFAULT 'Operador',
  content text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.coworking_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone authenticated can view messages" ON public.coworking_messages
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can send messages" ON public.coworking_messages
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- Enable realtime for chat
ALTER PUBLICATION supabase_realtime ADD TABLE public.coworking_messages;

-- Make profiles viewable by all authenticated users (public profiles)
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
CREATE POLICY "Anyone authenticated can view profiles" ON public.profiles
  FOR SELECT TO authenticated USING (true);

-- Add paused_at to challenge_progress for pause functionality
ALTER TABLE public.challenge_progress ADD COLUMN IF NOT EXISTS paused_at timestamptz DEFAULT NULL;

-- Create storage bucket for avatars
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true)
ON CONFLICT DO NOTHING;

-- Storage policies for avatars
CREATE POLICY "Anyone can view avatars" ON storage.objects
  FOR SELECT USING (bucket_id = 'avatars');

CREATE POLICY "Authenticated users can upload avatars" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (bucket_id = 'avatars');

CREATE POLICY "Users can update their own avatars" ON storage.objects
  FOR UPDATE TO authenticated USING (bucket_id = 'avatars');

CREATE POLICY "Users can delete their own avatars" ON storage.objects
  FOR DELETE TO authenticated USING (bucket_id = 'avatars');
