# 📋 Smart Prices Feature - Implementation Plan

## 🎯 Overview

Add receipt/photo-based price extraction to grocery items with OCR + LLM processing, Hebrew support, and manual override capabilities.

---

## 📊 Data Model Changes

### 1. Update `grocery_items` table
Add new columns:
- `unit_price` (NUMERIC) - Price per unit
- `line_total` (NUMERIC) - Total for this line (unit_price * quantity)
- `currency` (TEXT, default 'ILS') - Currency code
- `price_source` (TEXT) - Enum: 'manual', 'receipt', 'photo', 'suggested'
- `receipt_id` (UUID, nullable) - FK to receipts table
- `updated_at` (TIMESTAMP) - Auto-update on price changes

### 2. New `receipts` table
- `id` (UUID, PK)
- `user_id` (UUID, FK to auth.users)
- `list_id` (UUID, FK to grocery_lists, nullable)
- `type` (TEXT) - 'receipt' or 'photo'
- `image_path` (TEXT) - Path in Supabase Storage
- `ocr_text` (TEXT) - Raw OCR output
- `vendor_name` (TEXT, nullable) - Store/vendor name
- `receipt_total` (NUMERIC, nullable) - Total from receipt
- `currency` (TEXT, default 'ILS')
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

### 3. New `receipt_lines` table
- `id` (UUID, PK)
- `receipt_id` (UUID, FK to receipts)
- `raw_line_text` (TEXT) - Original OCR line
- `normalized_name` (TEXT) - Normalized item name for matching
- `quantity` (NUMERIC) - Extracted quantity
- `unit_price` (NUMERIC) - Extracted unit price
- `line_total` (NUMERIC) - Extracted line total
- `match_item_id` (UUID, nullable, FK to grocery_items)
- `match_confidence` (NUMERIC, 0-1) - Matching confidence score
- `created_at` (TIMESTAMP)

---

## 🏗️ Architecture

### Storage
- **Bucket**: `receipts-images` (private)
- **Path structure**: `{userId}/{receiptId}/original.{ext}`
- **RLS**: Users can only access their own folder

### API Routes (Server-side)
1. **`/api/receipts/upload`** (POST)
   - Accept image file
   - Upload to Supabase Storage
   - Create receipt record
   - Return receipt ID

2. **`/api/receipts/process`** (POST)
   - Input: receipt_id
   - Run OCR (provider TBD)
   - Run LLM extraction (OpenAI with JSON schema)
   - Save OCR text and receipt_lines
   - Return structured data

3. **`/api/receipts/match`** (POST)
   - Input: receipt_id, list_id
   - Match receipt_lines to grocery_items
   - Return matches with confidence scores

4. **`/api/receipts/apply`** (POST)
   - Input: receipt_id, matches (item_id -> receipt_line_id mapping)
   - Update grocery_items with prices
   - Link items to receipt

### UI Components
1. **`PriceUploadModal.tsx`** - Main modal
   - Upload dropzone
   - Progress indicator
   - Extracted lines table
   - Matching interface
   - Apply button

2. **`ReceiptLinesTable.tsx`** - Display extracted lines
   - Show raw text, normalized name, prices
   - Show suggested match
   - Allow manual match selection

3. **`PriceMatchEditor.tsx`** - Match editor
   - Dropdown to select item for each line
   - Confidence indicator
   - Manual override

### Database Functions
- Update `lib/database.ts` with:
  - `updateItemPrice(itemId, priceData)`
  - `getReceipt(receiptId)`
  - `getReceiptLines(receiptId)`
  - `applyPriceMatches(receiptId, matches)`

---

## 🔍 Matching Algorithm

### Normalization
1. Lowercase
2. Remove punctuation
3. Hebrew normalization (if possible)
4. Remove common words (articles, etc.)

### Fuzzy Matching
- Use string similarity (Levenshtein or similar)
- Match against item names in current list
- Calculate confidence score (0-1)
- Threshold: >0.7 = auto-match, 0.5-0.7 = suggest, <0.5 = manual

### Manual Override
- User can manually select item for any line
- User can edit prices before applying

---

## 🔐 Security & RLS

### Storage Policies
- Users can upload to `{userId}/*`
- Users can read from `{userId}/*`
- No cross-user access

### Table Policies
- `receipts`: user_id = auth.uid()
- `receipt_lines`: via receipt (user_id check)
- `grocery_items`: existing policies + price update allowed for owner

---

## 📦 Dependencies Needed

### Server-side (API routes)
- OCR provider SDK (TBD: Google/Azure/AWS)
- OpenAI SDK (`openai`)
- Image processing (if needed)

### Client-side
- File upload handling (already have image upload pattern)
- Modal components (can reuse existing modal pattern)

---

## 🚀 Implementation Steps (MVP)

### Phase 1: Database & Types
1. Create SQL migration
2. Update TypeScript types
3. Update database helper functions

### Phase 2: Storage Setup
1. Create Supabase Storage bucket
2. Set up RLS policies
3. Test upload

### Phase 3: API Routes (Receipt Upload)
1. Create upload endpoint
2. Test image upload to Storage

### Phase 4: OCR Integration
1. Choose OCR provider
2. Implement OCR call
3. Save OCR text to database

### Phase 5: LLM Extraction
1. Create OpenAI integration
2. Define JSON schema for extraction
3. Parse and save receipt_lines

### Phase 6: Matching Logic
1. Implement normalization
2. Implement fuzzy matching
3. Calculate confidence scores

### Phase 7: UI Components
1. Create PriceUploadModal
2. Create ReceiptLinesTable
3. Create PriceMatchEditor
4. Integrate into main page

### Phase 8: Apply Prices
1. Create apply endpoint
2. Update grocery_items
3. Link to receipts

### Phase 9: Display Prices
1. Update GroceryItem component to show prices
2. Update types

---

## ❓ Questions for You

1. **OCR Provider**: Which do you prefer?
   - Google Cloud Vision API (good Hebrew support, pay-per-use)
   - Azure Computer Vision (good Hebrew support, pay-per-use)
   - AWS Textract (good Hebrew support, pay-per-use)
   - **Recommendation**: Google Cloud Vision (best Hebrew OCR)

2. **Currency**: Default to ILS? ✅ (confirmed)

3. **Vendor Name**: Store it? ✅ (yes, optional field)

4. **MVP Scope**: Start with "receipt" type only, add "photo" later? ✅

---

## 📝 Next Steps

1. **Wait for OCR provider confirmation**
2. Create SQL migration script
3. Implement Phase 1-3 (database, storage, upload)
4. Implement Phase 4-5 (OCR + LLM)
5. Implement Phase 6-8 (matching + UI + apply)
6. Test end-to-end
7. Extend to "photo" type

---

## 🔄 Future Enhancements (Post-MVP)

- Photo of price tags (different extraction logic)
- Price history tracking
- Price comparison across stores
- Budget tracking
- Receipt image viewer
- Bulk receipt processing
