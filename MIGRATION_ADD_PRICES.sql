-- Migration: Add Smart Prices Feature
-- Run this in Supabase SQL Editor

-- 1. Add price columns to grocery_items table
ALTER TABLE grocery_items
ADD COLUMN IF NOT EXISTS unit_price NUMERIC(10, 2),
ADD COLUMN IF NOT EXISTS line_total NUMERIC(10, 2),
ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'ILS',
ADD COLUMN IF NOT EXISTS price_source TEXT CHECK (price_source IN ('manual', 'receipt', 'photo', 'suggested')),
ADD COLUMN IF NOT EXISTS receipt_id UUID REFERENCES receipts(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Create index for receipt_id lookups
CREATE INDEX IF NOT EXISTS idx_grocery_items_receipt_id ON grocery_items(receipt_id);

-- Create trigger to update updated_at on price changes
CREATE OR REPLACE FUNCTION update_grocery_item_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  IF (OLD.unit_price IS DISTINCT FROM NEW.unit_price) OR 
     (OLD.line_total IS DISTINCT FROM NEW.line_total) OR
     (OLD.price_source IS DISTINCT FROM NEW.price_source) THEN
    NEW.updated_at = NOW();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_grocery_item_updated_at ON grocery_items;
CREATE TRIGGER trigger_update_grocery_item_updated_at
  BEFORE UPDATE ON grocery_items
  FOR EACH ROW
  EXECUTE FUNCTION update_grocery_item_updated_at();

-- 2. Create receipts table
CREATE TABLE IF NOT EXISTS receipts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  list_id UUID REFERENCES grocery_lists(id) ON DELETE SET NULL,
  type TEXT NOT NULL CHECK (type IN ('receipt', 'photo')),
  image_path TEXT NOT NULL,
  ocr_text TEXT,
  vendor_name TEXT,
  receipt_total NUMERIC(10, 2),
  currency TEXT DEFAULT 'ILS',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_receipts_user_id ON receipts(user_id);
CREATE INDEX IF NOT EXISTS idx_receipts_list_id ON receipts(list_id);
CREATE INDEX IF NOT EXISTS idx_receipts_created_at ON receipts(created_at DESC);

-- 3. Create receipt_lines table
CREATE TABLE IF NOT EXISTS receipt_lines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  receipt_id UUID NOT NULL REFERENCES receipts(id) ON DELETE CASCADE,
  raw_line_text TEXT NOT NULL,
  normalized_name TEXT,
  quantity NUMERIC(10, 3) DEFAULT 1,
  unit_price NUMERIC(10, 2),
  line_total NUMERIC(10, 2),
  match_item_id UUID REFERENCES grocery_items(id) ON DELETE SET NULL,
  match_confidence NUMERIC(3, 2) CHECK (match_confidence >= 0 AND match_confidence <= 1),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_receipt_lines_receipt_id ON receipt_lines(receipt_id);
CREATE INDEX IF NOT EXISTS idx_receipt_lines_match_item_id ON receipt_lines(match_item_id);
CREATE INDEX IF NOT EXISTS idx_receipt_lines_normalized_name ON receipt_lines(normalized_name);

-- 4. Enable RLS
ALTER TABLE receipts ENABLE ROW LEVEL SECURITY;
ALTER TABLE receipt_lines ENABLE ROW LEVEL SECURITY;

-- 5. Create RLS Policies for receipts
CREATE POLICY "Users can view own receipts"
  ON receipts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own receipts"
  ON receipts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own receipts"
  ON receipts FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own receipts"
  ON receipts FOR DELETE
  USING (auth.uid() = user_id);

-- 6. Create RLS Policies for receipt_lines
CREATE POLICY "Users can view own receipt lines"
  ON receipt_lines FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM receipts
      WHERE receipts.id = receipt_lines.receipt_id
      AND receipts.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own receipt lines"
  ON receipt_lines FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM receipts
      WHERE receipts.id = receipt_lines.receipt_id
      AND receipts.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own receipt lines"
  ON receipt_lines FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM receipts
      WHERE receipts.id = receipt_lines.receipt_id
      AND receipts.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own receipt lines"
  ON receipt_lines FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM receipts
      WHERE receipts.id = receipt_lines.receipt_id
      AND receipts.user_id = auth.uid()
    )
  );

-- 7. Update grocery_items RLS to allow price updates
-- (Existing policies should already allow updates, but ensure price fields are included)
-- The existing "Users can update own items" policy should cover price updates

-- 8. Create function to update line_total when unit_price or quantity changes
CREATE OR REPLACE FUNCTION calculate_grocery_item_line_total()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.unit_price IS NOT NULL AND NEW.quantity IS NOT NULL THEN
    NEW.line_total = NEW.unit_price * NEW.quantity;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_calculate_grocery_item_line_total ON grocery_items;
CREATE TRIGGER trigger_calculate_grocery_item_line_total
  BEFORE INSERT OR UPDATE ON grocery_items
  FOR EACH ROW
  EXECUTE FUNCTION calculate_grocery_item_line_total();
