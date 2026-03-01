-- Add per-listing location columns (Point geometry + human-readable name)
ALTER TABLE public.listings
  ADD COLUMN location extensions.geometry(Point, 4326),
  ADD COLUMN location_name TEXT;

-- Backfill existing listings from their owner's profile location
UPDATE public.listings l
  SET location = u.location
  FROM public.users u
  WHERE l.user_id = u.id AND u.location IS NOT NULL;

-- Spatial index for proximity queries
CREATE INDEX idx_listings_location ON public.listings USING GIST (location);
