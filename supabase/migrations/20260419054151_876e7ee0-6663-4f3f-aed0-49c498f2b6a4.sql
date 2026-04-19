
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS font_family text NOT NULL DEFAULT 'inter',
  ADD COLUMN IF NOT EXISTS button_effect text NOT NULL DEFAULT 'shadow',
  ADD COLUMN IF NOT EXISTS background_pattern text NOT NULL DEFAULT 'none',
  ADD COLUMN IF NOT EXISTS animation_style text NOT NULL DEFAULT 'fade';
