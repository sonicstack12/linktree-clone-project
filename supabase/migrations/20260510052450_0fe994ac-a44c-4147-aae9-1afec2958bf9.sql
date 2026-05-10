-- 1. Onboarding completion (server-side, syncs across devices)
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS onboarded_at TIMESTAMPTZ;

-- 2. Products table — mini page builder
CREATE TABLE IF NOT EXISTS public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL,
  slug TEXT NOT NULL,
  title TEXT NOT NULL,
  tagline TEXT,
  description TEXT,
  cover_image TEXT,
  gallery JSONB NOT NULL DEFAULT '[]'::jsonb,
  price TEXT,
  cta_label TEXT,
  cta_url TEXT,
  published BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (profile_id, slug)
);

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Published products are viewable by everyone"
  ON public.products FOR SELECT
  USING (published = true OR auth.uid() = profile_id);

CREATE POLICY "Owners can insert products"
  ON public.products FOR INSERT
  WITH CHECK (auth.uid() = profile_id);

CREATE POLICY "Owners can update their products"
  ON public.products FOR UPDATE
  USING (auth.uid() = profile_id);

CREATE POLICY "Owners can delete their products"
  ON public.products FOR DELETE
  USING (auth.uid() = profile_id);

CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX IF NOT EXISTS idx_products_profile ON public.products(profile_id);
CREATE INDEX IF NOT EXISTS idx_products_published ON public.products(published) WHERE published = true;