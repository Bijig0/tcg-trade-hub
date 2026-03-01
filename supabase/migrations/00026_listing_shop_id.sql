-- Add nullable shop_id FK to listings
ALTER TABLE public.listings
  ADD COLUMN shop_id UUID REFERENCES public.shops(id) ON DELETE SET NULL;

CREATE INDEX idx_listings_shop_id ON public.listings (shop_id);

-- Auto-populate shop_id on INSERT if the creator owns a shop
CREATE OR REPLACE FUNCTION public.set_listing_shop_id()
RETURNS TRIGGER AS $$
BEGIN
  SELECT id INTO NEW.shop_id
    FROM public.shops
    WHERE owner_id = NEW.user_id
    LIMIT 1;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_set_listing_shop
  BEFORE INSERT ON public.listings
  FOR EACH ROW EXECUTE FUNCTION public.set_listing_shop_id();
