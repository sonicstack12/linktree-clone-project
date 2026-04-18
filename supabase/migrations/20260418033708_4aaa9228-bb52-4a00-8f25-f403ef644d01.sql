ALTER TABLE public.links
  ADD COLUMN IF NOT EXISTS type text NOT NULL DEFAULT 'link',
  ADD COLUMN IF NOT EXISTS start_at timestamptz,
  ADD COLUMN IF NOT EXISTS end_at timestamptz;

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS use_custom_colors boolean NOT NULL DEFAULT false;

CREATE TABLE IF NOT EXISTS public.email_subscribers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL,
  email text NOT NULL,
  source_link_id uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (profile_id, email)
);

ALTER TABLE public.email_subscribers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can subscribe" ON public.email_subscribers;
CREATE POLICY "Anyone can subscribe"
  ON public.email_subscribers FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS "Owners can view their subscribers" ON public.email_subscribers;
CREATE POLICY "Owners can view their subscribers"
  ON public.email_subscribers FOR SELECT
  USING (auth.uid() = profile_id);

DROP POLICY IF EXISTS "Owners can delete their subscribers" ON public.email_subscribers;
CREATE POLICY "Owners can delete their subscribers"
  ON public.email_subscribers FOR DELETE
  USING (auth.uid() = profile_id);