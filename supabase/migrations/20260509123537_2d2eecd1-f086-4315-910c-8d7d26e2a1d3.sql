
-- 1) Prevent duplicate pending verification requests per (profile, platform)
CREATE UNIQUE INDEX IF NOT EXISTS verification_requests_unique_pending
  ON public.verification_requests (profile_id, platform)
  WHERE status = 'pending';

-- 2) Server-side validation: proof URL host must match the selected platform
CREATE OR REPLACE FUNCTION public.validate_verification_proof_url()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  host TEXT;
  ok BOOLEAN := false;
BEGIN
  -- Extract hostname (lowercase, no path), strip leading www.
  host := lower(regexp_replace(NEW.proof_url, '^https?://([^/]+).*$', '\1'));
  host := regexp_replace(host, '^www\.', '');

  IF NEW.platform = 'GitHub' THEN
    ok := host = 'github.com' OR host LIKE '%.github.com';
  ELSIF NEW.platform = 'LinkedIn' THEN
    ok := host = 'linkedin.com' OR host LIKE '%.linkedin.com';
  ELSIF NEW.platform = 'X / Twitter' THEN
    ok := host IN ('x.com','twitter.com') OR host LIKE '%.x.com' OR host LIKE '%.twitter.com';
  ELSIF NEW.platform = 'Instagram' THEN
    ok := host = 'instagram.com' OR host LIKE '%.instagram.com';
  ELSIF NEW.platform = 'YouTube' THEN
    ok := host IN ('youtube.com','youtu.be') OR host LIKE '%.youtube.com';
  ELSIF NEW.platform = 'Other' THEN
    ok := host IS NOT NULL AND length(host) > 3;
  ELSE
    ok := false;
  END IF;

  IF NOT ok THEN
    RAISE EXCEPTION 'Proof URL host "%" does not match selected platform "%"', host, NEW.platform
      USING ERRCODE = 'check_violation';
  END IF;

  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS validate_verification_proof_url_trg ON public.verification_requests;
CREATE TRIGGER validate_verification_proof_url_trg
  BEFORE INSERT OR UPDATE OF proof_url, platform ON public.verification_requests
  FOR EACH ROW EXECUTE FUNCTION public.validate_verification_proof_url();

-- 3) Ensure existing apply_verification_decision trigger is attached (it was missing from db)
DROP TRIGGER IF EXISTS apply_verification_decision_trg ON public.verification_requests;
CREATE TRIGGER apply_verification_decision_trg
  BEFORE UPDATE OF status ON public.verification_requests
  FOR EACH ROW EXECUTE FUNCTION public.apply_verification_decision();

-- 4) Remove subscribers feature
DROP TABLE IF EXISTS public.email_subscribers CASCADE;
