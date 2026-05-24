-- Migration: Family Sync & Realtime
-- Run this in Supabase SQL Editor

-- 1. Add family_id to user_profiles for family grouping
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS family_id UUID DEFAULT gen_random_uuid();

CREATE INDEX IF NOT EXISTS idx_user_profiles_family ON user_profiles(family_id);

-- 2. Enable Realtime on grocery_items and grocery_lists
ALTER PUBLICATION supabase_realtime ADD TABLE grocery_items;
ALTER PUBLICATION supabase_realtime ADD TABLE grocery_lists;

-- 3. Update RLS policies to allow family members to access shared lists
DROP POLICY IF EXISTS "Users can view own lists" ON grocery_lists;
DROP POLICY IF EXISTS "Users can view family lists" ON grocery_lists;
CREATE POLICY "Users can view family lists"
  ON grocery_lists FOR SELECT
  USING (
    local_user_id IN (
      SELECT up.id FROM user_profiles up
      WHERE up.family_id = (
        SELECT family_id FROM user_profiles WHERE id = auth.uid()
      )
    )
  );

DROP POLICY IF EXISTS "Users can view own items" ON grocery_items;
DROP POLICY IF EXISTS "Users can view family items" ON grocery_items;
CREATE POLICY "Users can view family items"
  ON grocery_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM grocery_lists gl
      JOIN user_profiles up ON gl.local_user_id = up.id
      WHERE gl.id = grocery_items.list_id
      AND up.family_id = (SELECT family_id FROM user_profiles WHERE id = auth.uid())
    )
  );

DROP POLICY IF EXISTS "Users can insert own items" ON grocery_items;
DROP POLICY IF EXISTS "Users can insert family items" ON grocery_items;
CREATE POLICY "Users can insert family items"
  ON grocery_items FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM grocery_lists gl
      JOIN user_profiles up ON gl.local_user_id = up.id
      WHERE gl.id = grocery_items.list_id
      AND up.family_id = (SELECT family_id FROM user_profiles WHERE id = auth.uid())
    )
  );

DROP POLICY IF EXISTS "Users can update own items" ON grocery_items;
DROP POLICY IF EXISTS "Users can update family items" ON grocery_items;
CREATE POLICY "Users can update family items"
  ON grocery_items FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM grocery_lists gl
      JOIN user_profiles up ON gl.local_user_id = up.id
      WHERE gl.id = grocery_items.list_id
      AND up.family_id = (SELECT family_id FROM user_profiles WHERE id = auth.uid())
    )
  );

DROP POLICY IF EXISTS "Users can delete own items" ON grocery_items;
DROP POLICY IF EXISTS "Users can delete family items" ON grocery_items;
CREATE POLICY "Users can delete family items"
  ON grocery_items FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM grocery_lists gl
      JOIN user_profiles up ON gl.local_user_id = up.id
      WHERE gl.id = grocery_items.list_id
      AND up.family_id = (SELECT family_id FROM user_profiles WHERE id = auth.uid())
    )
  );
