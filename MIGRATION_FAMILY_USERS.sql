-- Migration: Family Users System (No Auth)
-- Run this in Supabase SQL Editor

-- Step 1: Create local_users table
CREATE TABLE IF NOT EXISTS local_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 2: Add local_user_id to grocery_lists
ALTER TABLE grocery_lists
ADD COLUMN IF NOT EXISTS local_user_id UUID REFERENCES local_users(id) ON DELETE CASCADE;

-- Step 3: Add local_user_id to receipts (if table exists)
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'receipts') THEN
    ALTER TABLE receipts
    ADD COLUMN IF NOT EXISTS local_user_id UUID REFERENCES local_users(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Step 4: Add local_user_id to price_memories (if table exists)
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

-- Step 5: Add local_user_id to item_images (if table exists)
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

-- Step 6: Create indexes
CREATE INDEX IF NOT EXISTS idx_grocery_lists_local_user_id ON grocery_lists(local_user_id);
CREATE INDEX IF NOT EXISTS idx_local_users_created_at ON local_users(created_at);

-- Step 7: Data Migration - Create default user for existing data
DO $$
DECLARE
  default_user_id UUID;
  existing_user_count INTEGER;
BEGIN
  -- Check if there are any existing grocery_lists with user_id but no local_user_id
  SELECT COUNT(*) INTO existing_user_count
  FROM grocery_lists
  WHERE user_id IS NOT NULL AND local_user_id IS NULL;
  
  IF existing_user_count > 0 THEN
    -- Create a default local user
    INSERT INTO local_users (name)
    VALUES ('Default User')
    RETURNING id INTO default_user_id;
    
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

-- Step 8: Disable RLS on tables that used auth (for simple hobby app)
-- Note: This is NOT secure for production, but fine for a family shopping list app
ALTER TABLE grocery_lists DISABLE ROW LEVEL SECURITY;
ALTER TABLE grocery_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE local_users DISABLE ROW LEVEL SECURITY;

-- If these tables exist, disable RLS on them too
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'receipts') THEN
    ALTER TABLE receipts DISABLE ROW LEVEL SECURITY;
  END IF;
  
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'price_memories') THEN
    ALTER TABLE price_memories DISABLE ROW LEVEL SECURITY;
  END IF;
  
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'item_images') THEN
    ALTER TABLE item_images DISABLE ROW LEVEL SECURITY;
  END IF;
END $$;
