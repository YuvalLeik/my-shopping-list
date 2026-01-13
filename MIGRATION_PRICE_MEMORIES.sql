-- Migration: Add Price Memories Table
-- Run this in Supabase SQL Editor

-- Create price_memories table
CREATE TABLE IF NOT EXISTS price_memories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  vendor_name TEXT NOT NULL,
  item_name TEXT NOT NULL,
  normalized_name TEXT NOT NULL,
  unit_price NUMERIC(10, 2) NOT NULL,
  currency TEXT DEFAULT 'ILS',
  last_used_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, vendor_name, normalized_name)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_price_memories_user_vendor ON price_memories(user_id, vendor_name);
CREATE INDEX IF NOT EXISTS idx_price_memories_normalized_name ON price_memories(normalized_name);
CREATE INDEX IF NOT EXISTS idx_price_memories_last_used ON price_memories(last_used_at DESC);

-- Enable RLS
ALTER TABLE price_memories ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies
CREATE POLICY "Users can view own price memories"
  ON price_memories FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own price memories"
  ON price_memories FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own price memories"
  ON price_memories FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own price memories"
  ON price_memories FOR DELETE
  USING (auth.uid() = user_id);

-- Create function to update updated_at
CREATE OR REPLACE FUNCTION update_price_memory_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_price_memory_updated_at ON price_memories;
CREATE TRIGGER trigger_update_price_memory_updated_at
  BEFORE UPDATE ON price_memories
  FOR EACH ROW
  EXECUTE FUNCTION update_price_memory_updated_at();
