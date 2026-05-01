ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS layout TEXT NOT NULL DEFAULT 'classic',
  ADD COLUMN IF NOT EXISTS auto_dark BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS glass_effect BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS privacy_mode BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS verified BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS verified_source TEXT;

ALTER TABLE public.links
  ADD COLUMN IF NOT EXISTS bento_size TEXT NOT NULL DEFAULT '1x1';

ALTER TABLE public.click_events
  ADD COLUMN IF NOT EXISTS source TEXT;

ALTER TABLE public.page_views
  ADD COLUMN IF NOT EXISTS source TEXT;

CREATE INDEX IF NOT EXISTS idx_page_views_profile_created ON public.page_views(profile_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_click_events_profile_created ON public.click_events(profile_id, created_at DESC);