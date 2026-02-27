-- Add 'proposed' to meetup_status enum before 'confirmed'
ALTER TYPE meetup_status ADD VALUE IF NOT EXISTS 'proposed' BEFORE 'confirmed';
