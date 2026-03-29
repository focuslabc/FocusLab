
-- Global theme settings table (admin-managed, all users read)
CREATE TABLE public.global_themes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  is_active boolean NOT NULL DEFAULT false,
  is_light boolean NOT NULL DEFAULT false,
  colors jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.global_themes ENABLE ROW LEVEL SECURITY;

-- Everyone can read themes
CREATE POLICY "Anyone authenticated can view themes"
  ON public.global_themes FOR SELECT
  TO authenticated
  USING (true);

-- Only admins can manage themes
CREATE POLICY "Admins can insert themes"
  ON public.global_themes FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update themes"
  ON public.global_themes FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete themes"
  ON public.global_themes FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Trigger for updated_at
CREATE TRIGGER update_global_themes_updated_at
  BEFORE UPDATE ON public.global_themes
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Seed default themes
INSERT INTO public.global_themes (name, is_active, is_light, colors) VALUES
('Vermelho Clássico', true, false, '{"primary":"#991b1b","primaryLight":"#dc2626","accent":"#ef4444","gradientFrom":"#0a0a0a","gradientTo":"#1c1917","surface":"#18181b","surfaceBorder":"#27272a","text":"#ffffff","textMuted":"#71717a"}'),
('Azul Oceano', false, false, '{"primary":"#1e3a5f","primaryLight":"#2563eb","accent":"#3b82f6","gradientFrom":"#020617","gradientTo":"#0f172a","surface":"#18181b","surfaceBorder":"#27272a","text":"#ffffff","textMuted":"#71717a"}'),
('Verde Floresta', false, false, '{"primary":"#14532d","primaryLight":"#16a34a","accent":"#22c55e","gradientFrom":"#022c22","gradientTo":"#052e16","surface":"#18181b","surfaceBorder":"#27272a","text":"#ffffff","textMuted":"#71717a"}'),
('Roxo Neon', false, false, '{"primary":"#581c87","primaryLight":"#9333ea","accent":"#a855f7","gradientFrom":"#0c0a1a","gradientTo":"#1e1b4b","surface":"#18181b","surfaceBorder":"#27272a","text":"#ffffff","textMuted":"#71717a"}'),
('Dourado Elite', false, false, '{"primary":"#78350f","primaryLight":"#d97706","accent":"#f59e0b","gradientFrom":"#0a0a0a","gradientTo":"#1c1917","surface":"#18181b","surfaceBorder":"#27272a","text":"#ffffff","textMuted":"#71717a"}'),
('Ciano Cyber', false, false, '{"primary":"#164e63","primaryLight":"#06b6d4","accent":"#22d3ee","gradientFrom":"#020617","gradientTo":"#082f49","surface":"#18181b","surfaceBorder":"#27272a","text":"#ffffff","textMuted":"#71717a"}'),
('Modo Claro', false, true, '{"primary":"#991b1b","primaryLight":"#dc2626","accent":"#ef4444","gradientFrom":"#f5f5f4","gradientTo":"#e7e5e4","surface":"#ffffff","surfaceBorder":"#d4d4d8","text":"#18181b","textMuted":"#71717a"}'),
('Azul Claro', false, true, '{"primary":"#1e40af","primaryLight":"#3b82f6","accent":"#60a5fa","gradientFrom":"#f0f9ff","gradientTo":"#e0f2fe","surface":"#ffffff","surfaceBorder":"#bfdbfe","text":"#1e293b","textMuted":"#64748b"}');
