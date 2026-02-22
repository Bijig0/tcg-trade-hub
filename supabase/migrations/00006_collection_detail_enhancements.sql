-- Add photos, notes, and acquired_at columns to collection_items
-- Photos stored as text[] matching the existing pattern on listings table
ALTER TABLE collection_items
  ADD COLUMN photos text[] NOT NULL DEFAULT '{}',
  ADD COLUMN notes text,
  ADD COLUMN acquired_at timestamptz;
