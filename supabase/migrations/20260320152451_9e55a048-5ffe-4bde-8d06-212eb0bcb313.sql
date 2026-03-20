
-- Add username column to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS username text UNIQUE;

-- Add reply_to column to coworking_messages for reply references
ALTER TABLE public.coworking_messages ADD COLUMN IF NOT EXISTS reply_to uuid REFERENCES public.coworking_messages(id);
ALTER TABLE public.coworking_messages ADD COLUMN IF NOT EXISTS avatar_url text;

-- Create storage bucket for library uploads if not exists
INSERT INTO storage.buckets (id, name, public) VALUES ('library', 'library', true) ON CONFLICT (id) DO NOTHING;

-- RLS for library bucket
CREATE POLICY "Admins can upload to library" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'library' AND public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Anyone can view library files" ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'library');
CREATE POLICY "Admins can delete library files" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'library' AND public.has_role(auth.uid(), 'admin'));

-- Function to generate username from display_name
CREATE OR REPLACE FUNCTION public.generate_username(name text)
RETURNS text
LANGUAGE plpgsql
AS $$
DECLARE
  base_username text;
  final_username text;
  counter int := 0;
BEGIN
  base_username := lower(replace(trim(name), ' ', '.'));
  base_username := regexp_replace(base_username, '[^a-z0-9.]', '', 'g');
  IF base_username = '' THEN base_username := 'user'; END IF;
  final_username := base_username;
  WHILE EXISTS (SELECT 1 FROM public.profiles WHERE username = final_username) LOOP
    counter := counter + 1;
    final_username := base_username || counter::text;
  END LOOP;
  RETURN final_username;
END;
$$;

-- Set usernames for existing profiles that don't have one
UPDATE public.profiles SET username = public.generate_username(COALESCE(display_name, 'user')) WHERE username IS NULL;

-- Update handle_new_user to also set username
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, display_name, username)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'name', 'Operador'), public.generate_username(COALESCE(NEW.raw_user_meta_data->>'username', NEW.raw_user_meta_data->>'name', 'user')));
  RETURN NEW;
END;
$$;
