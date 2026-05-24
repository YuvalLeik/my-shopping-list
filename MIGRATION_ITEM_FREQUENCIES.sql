-- Item frequency tracking for smart suggestions
-- Run this migration in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS item_frequencies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  item_name TEXT NOT NULL,
  normalized_name TEXT NOT NULL,
  category TEXT,
  purchase_count INTEGER DEFAULT 1,
  last_purchased_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  first_purchased_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  avg_interval_days NUMERIC(10, 2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, normalized_name)
);

-- Indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_item_frequencies_user_count
  ON item_frequencies(user_id, purchase_count DESC);

CREATE INDEX IF NOT EXISTS idx_item_frequencies_user_last
  ON item_frequencies(user_id, last_purchased_at DESC);

-- Add backfill_done flag to user_profiles
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS frequency_backfill_done BOOLEAN DEFAULT FALSE;

-- RLS policies
ALTER TABLE item_frequencies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own item frequencies"
  ON item_frequencies FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own item frequencies"
  ON item_frequencies FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own item frequencies"
  ON item_frequencies FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own item frequencies"
  ON item_frequencies FOR DELETE
  USING (auth.uid() = user_id);
