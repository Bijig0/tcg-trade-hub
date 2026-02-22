-- Drop the unique constraint on (user_id, external_id, condition, is_wishlist)
-- so that each physical card can be its own row.
-- Previously, adding the same card in the same condition would upsert (increment quantity).
-- Now each add creates a new row with quantity=1.
DROP INDEX IF EXISTS idx_collection_items_user_card;
