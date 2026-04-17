-- Replace broad SELECT on avatars with one that doesn't allow bucket listing.
-- The "public" flag on the bucket itself still allows direct file URL access.
DROP POLICY IF EXISTS "Avatar images are publicly accessible" ON storage.objects;