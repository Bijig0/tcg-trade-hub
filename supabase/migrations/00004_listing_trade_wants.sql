-- Add trade_wants JSONB column to listings table.
-- Populated only for WTT listings with an array of CardRef objects
-- representing wanted cards. NULL for WTS/WTB.
ALTER TABLE public.listings ADD COLUMN trade_wants JSONB DEFAULT NULL;
