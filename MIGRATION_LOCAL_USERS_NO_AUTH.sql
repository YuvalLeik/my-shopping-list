-- Migration: Local Users System (No Auth)
-- Run this in Supabase SQL Editor

-- Step 1: Create app_instances table
CREATE TABLE IF NOT EXISTS app_instances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  instance_key TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 2: Create local_users table
CREATE TABLE IF NOT EXISTS local_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  instance_id UUID NOT NULL REFERENCES app_instances(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  color TEXT,
  avatar TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(instance_id, name)
);

-- Step 3: Add local_user_id to grocery_lists
ALTER TABLE grocery_lists
ADD COLUMN IF NOT EXISTS local_user_id UUID REFERENCES local_users(id) ON DELETE CASCADE;

-- Step 4: Add local_user_id to receipts (if table exists)
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'receipts') THEN
    ALTER TABLE receipts
    ADD COLUMN IF NOT EXISTS local_user_id UUID REFERENCES local_users(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Step 5: Add local_user_id to price_memories (if table exists)
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'price_memories') THEN
    ALTER TABLE price_memories
    ADD COLUMN IF NOT EXISTS local_user_id UUID REFERENCES local_users(id) ON DELETE CASCADE;
    
    -- Drop old user_id column if it exists
    IF EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'price_memories' AND column_name = 'user_id') THEN
      ALTER TABLE price_memories DROP COLUMN user_id;
    END IF;
  END IF;
END $$;

-- Step 6: Add local_user_id to item_images (if table exists)
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'item_images') THEN
    ALTER TABLE item_images
    ADD COLUMN IF NOT EXISTS local_user_id UUID REFERENCES local_users(id) ON DELETE CASCADE;
    
    -- Drop old user_id column if it exists
    IF EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'item_images' AND column_name = 'user_id') THEN
      ALTER TABLE item_images DROP COLUMN user_id;
    END IF;
  END IF;
END $$;

-- Step 7: Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_local_users_instance_id ON local_users(instance_id);
CREATE INDEX IF NOT EXISTS idx_grocery_lists_local_user_id ON grocery_lists(local_user_id);
CREATE INDEX IF NOT EXISTS idx_app_instances_key ON app_instances(instance_key);

-- Step 8: Data Migration - Create default user for existing data
DO $$
DECLARE
  default_instance_id UUID;
  default_user_id UUID;
  existing_user_count INTEGER;
BEGIN
  -- Check if there are any existing grocery_lists with user_id but no local_user_id
  SELECT COUNT(*) INTO existing_user_count
  FROM grocery_lists
  WHERE user_id IS NOT NULL AND local_user_id IS NULL;
  
  IF existing_user_count > 0 THEN
    -- Create a default app instance
    INSERT INTO app_instances (instance_key)
    VALUES ('migration-default-' || gen_random_uuid()::text)
    ON CONFLICT DO NOTHING
    RETURNING id INTO default_instance_id;
    
    -- If no instance was created (already exists), get it
    IF default_instance_id IS NULL THEN
      SELECT id INTO default_instance_id FROM app_instances WHERE instance_key LIKE 'migration-default-%' LIMIT 1;
    END IF;
    
    -- Create a default local user
    INSERT INTO local_users (instance_id, name, color)
    VALUES (default_instance_id, 'Default User', '#3B82F6')
    ON CONFLICT (instance_id, name) DO NOTHING
    RETURNING id INTO default_user_id;
    
    -- If no user was created, get it
    IF default_user_id IS NULL THEN
      SELECT id INTO default_user_id FROM local_users WHERE instance_id = default_instance_id AND name = 'Default User';
    END IF;
    
    -- Migrate existing grocery_lists
    UPDATE grocery_lists
    SET local_user_id = default_user_id
    WHERE user_id IS NOT NULL AND local_user_id IS NULL;
    
    -- Migrate existing receipts if table exists
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'receipts') THEN
      UPDATE receipts
      SET local_user_id = default_user_id
      WHERE user_id IS NOT NULL AND local_user_id IS NULL;
    END IF;
    
    -- Migrate existing price_memories if table exists
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'price_memories') THEN
      UPDATE price_memories
      SET local_user_id = default_user_id
      WHERE local_user_id IS NULL;
    END IF;
    
    -- Migrate existing item_images if table exists
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'item_images') THEN
      UPDATE item_images
      SET local_user_id = default_user_id
      WHERE local_user_id IS NULL;
    END IF;
  END IF;
END $$;

-- Step 9: Enable RLS (optional - for hobby app, we can skip if too complex)
-- Note: We'll use instance_key filtering in application code instead
-- This keeps it simple for a hobby app

-- Step 10: Create helper function to get instance_id from header (optional)
-- If using headers, uncomment this:
/*
CREATE OR REPLACE FUNCTION get_instance_id_from_header()
RETURNS UUID AS $$
DECLARE
  instance_key_val TEXT;
  instance_id_val UUID;
BEGIN
  instance_key_val := current_setting('request.headers', true)::json->>'x-instance-key';
  IF instance_key_val IS NULL THEN
    RETURN NULL;
  END IF;
  SELECT id INTO instance_id_val FROM app_instances WHERE instance_key = instance_key_val;
  RETURN instance_id_val;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
*/

-- Note: For simplicity, we'll filter by instance_key in application code
-- RLS is disabled for these tables (hobby app approach)
