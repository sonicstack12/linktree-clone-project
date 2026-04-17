-- =========================
-- PROFILES
-- =========================
CREATE TABLE public.profiles (
  id UUID NOT NULL PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT NOT NULL UNIQUE,
  display_name TEXT,
  bio TEXT,
  avatar_url TEXT,
  theme TEXT NOT NULL DEFAULT 'leaf',
  button_style TEXT NOT NULL DEFAULT 'rounded',
  background_color TEXT,
  text_color TEXT,
  button_color TEXT,
  button_text_color TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT username_format CHECK (username ~ '^[a-zA-Z0-9_]{3,30}$')
);

CREATE INDEX idx_profiles_username ON public.profiles(LOWER(username));

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Profiles are viewable by everyone"
  ON public.profiles FOR SELECT USING (true);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can delete their own profile"
  ON public.profiles FOR DELETE USING (auth.uid() = id);

-- =========================
-- LINKS
-- =========================
CREATE TABLE public.links (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  url TEXT NOT NULL,
  position INTEGER NOT NULL DEFAULT 0,
  enabled BOOLEAN NOT NULL DEFAULT true,
  icon TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_links_profile ON public.links(profile_id, position);

ALTER TABLE public.links ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Links are viewable by everyone"
  ON public.links FOR SELECT USING (true);

CREATE POLICY "Owners can insert links"
  ON public.links FOR INSERT WITH CHECK (auth.uid() = profile_id);

CREATE POLICY "Owners can update their links"
  ON public.links FOR UPDATE USING (auth.uid() = profile_id);

CREATE POLICY "Owners can delete their links"
  ON public.links FOR DELETE USING (auth.uid() = profile_id);

-- =========================
-- SOCIAL LINKS
-- =========================
CREATE TABLE public.social_links (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  platform TEXT NOT NULL,
  url TEXT NOT NULL,
  position INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (profile_id, platform)
);

CREATE INDEX idx_social_links_profile ON public.social_links(profile_id, position);

ALTER TABLE public.social_links ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Social links are viewable by everyone"
  ON public.social_links FOR SELECT USING (true);

CREATE POLICY "Owners can insert social links"
  ON public.social_links FOR INSERT WITH CHECK (auth.uid() = profile_id);

CREATE POLICY "Owners can update their social links"
  ON public.social_links FOR UPDATE USING (auth.uid() = profile_id);

CREATE POLICY "Owners can delete their social links"
  ON public.social_links FOR DELETE USING (auth.uid() = profile_id);

-- =========================
-- CLICK EVENTS
-- =========================
CREATE TABLE public.click_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  link_id UUID NOT NULL REFERENCES public.links(id) ON DELETE CASCADE,
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  referrer TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_click_events_link ON public.click_events(link_id, created_at DESC);
CREATE INDEX idx_click_events_profile ON public.click_events(profile_id, created_at DESC);

ALTER TABLE public.click_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can record clicks"
  ON public.click_events FOR INSERT WITH CHECK (true);

CREATE POLICY "Owners can view their clicks"
  ON public.click_events FOR SELECT USING (auth.uid() = profile_id);

-- =========================
-- PAGE VIEWS
-- =========================
CREATE TABLE public.page_views (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  referrer TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_page_views_profile ON public.page_views(profile_id, created_at DESC);

ALTER TABLE public.page_views ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can record page views"
  ON public.page_views FOR INSERT WITH CHECK (true);

CREATE POLICY "Owners can view their page views"
  ON public.page_views FOR SELECT USING (auth.uid() = profile_id);

-- =========================
-- TIMESTAMP TRIGGER
-- =========================
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_links_updated_at
  BEFORE UPDATE ON public.links
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =========================
-- AUTO-CREATE PROFILE ON SIGNUP
-- =========================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  base_username TEXT;
  final_username TEXT;
  attempt INT := 0;
BEGIN
  base_username := COALESCE(
    NEW.raw_user_meta_data->>'username',
    LOWER(REGEXP_REPLACE(SPLIT_PART(NEW.email, '@', 1), '[^a-zA-Z0-9_]', '', 'g'))
  );

  IF base_username IS NULL OR LENGTH(base_username) < 3 THEN
    base_username := 'user' || SUBSTRING(NEW.id::text, 1, 8);
  END IF;

  final_username := base_username;

  WHILE EXISTS (SELECT 1 FROM public.profiles WHERE username = final_username) LOOP
    attempt := attempt + 1;
    final_username := base_username || attempt::text;
  END LOOP;

  INSERT INTO public.profiles (id, username, display_name)
  VALUES (
    NEW.id,
    final_username,
    COALESCE(NEW.raw_user_meta_data->>'display_name', final_username)
  );

  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =========================
-- AVATAR STORAGE
-- =========================
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true);

CREATE POLICY "Avatar images are publicly accessible"
  ON storage.objects FOR SELECT USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload their own avatar"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own avatar"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own avatar"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);