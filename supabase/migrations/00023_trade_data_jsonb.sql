-- Replace the 4 card columns with a single trade_data JSONB column
ALTER TABLE public.pre_registrations
  ADD COLUMN trade_data JSONB;

ALTER TABLE public.pre_registrations
  DROP COLUMN card_name,
  DROP COLUMN card_set,
  DROP COLUMN card_external_id,
  DROP COLUMN card_image_url;
