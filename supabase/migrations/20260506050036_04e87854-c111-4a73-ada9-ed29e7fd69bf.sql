-- Roles
DO $$ BEGIN
  CREATE TYPE public.app_role AS ENUM ('admin','moderator','user');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$ SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role) $$;

DROP POLICY IF EXISTS "Users can view own roles" ON public.user_roles;
CREATE POLICY "Users can view own roles" ON public.user_roles FOR SELECT USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins manage roles" ON public.user_roles;
CREATE POLICY "Admins manage roles" ON public.user_roles FOR ALL USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Verification requests
CREATE TABLE IF NOT EXISTS public.verification_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL,
  platform text NOT NULL,
  proof_url text NOT NULL,
  notes text,
  status text NOT NULL DEFAULT 'pending',
  reviewed_by uuid,
  reviewed_at timestamptz,
  review_note text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT verification_requests_status_chk CHECK (status IN ('pending','approved','rejected'))
);
ALTER TABLE public.verification_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Owners view their requests" ON public.verification_requests;
CREATE POLICY "Owners view their requests" ON public.verification_requests FOR SELECT
  USING (auth.uid() = profile_id OR public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Owners insert their requests" ON public.verification_requests;
CREATE POLICY "Owners insert their requests" ON public.verification_requests FOR INSERT
  WITH CHECK (auth.uid() = profile_id AND status = 'pending');

DROP POLICY IF EXISTS "Owners delete pending" ON public.verification_requests;
CREATE POLICY "Owners delete pending" ON public.verification_requests FOR DELETE
  USING (auth.uid() = profile_id AND status = 'pending');

DROP POLICY IF EXISTS "Admins update requests" ON public.verification_requests;
CREATE POLICY "Admins update requests" ON public.verification_requests FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE INDEX IF NOT EXISTS idx_vr_status ON public.verification_requests(status);
CREATE INDEX IF NOT EXISTS idx_vr_profile ON public.verification_requests(profile_id);

-- Auto-mark profile verified on approval
CREATE OR REPLACE FUNCTION public.apply_verification_decision()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  NEW.updated_at := now();
  IF NEW.status = 'approved' AND (OLD.status IS DISTINCT FROM 'approved') THEN
    NEW.reviewed_at := now();
    UPDATE public.profiles
       SET verified = true, verified_source = NEW.proof_url
     WHERE id = NEW.profile_id;
  ELSIF NEW.status = 'rejected' AND (OLD.status IS DISTINCT FROM 'rejected') THEN
    NEW.reviewed_at := now();
  END IF;
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS trg_apply_verification_decision ON public.verification_requests;
CREATE TRIGGER trg_apply_verification_decision
BEFORE UPDATE ON public.verification_requests
FOR EACH ROW EXECUTE FUNCTION public.apply_verification_decision();