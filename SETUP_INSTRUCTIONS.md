# 🚀 Smart Prices Feature - Setup Instructions (FREE VERSION)

## ✅ Code Implementation Complete!

All code has been implemented using **FREE services only** - no paid APIs required!

---

## Step 1: Run Database Migrations

### Migration 1: Price Fields (if not already done)
1. **Go to Supabase Dashboard** → Your Project
2. **Click "SQL Editor"** in left sidebar
3. **Click "New query"**
4. **Open** `MIGRATION_ADD_PRICES.sql` on your computer
5. **Copy all the code** (Ctrl+A, Ctrl+C)
6. **Paste into SQL Editor** (Ctrl+V)
7. **Click "Run"**

### Migration 2: Price Memories Table
1. **Open** `MIGRATION_PRICE_MEMORIES.sql` on your computer
2. **Copy all the code** and paste into SQL Editor
3. **Click "Run"**
4. **Verify**: Go to "Table Editor" - you should see:
   - `price_memories` table
   - `receipts` table (for reference images)
   - `grocery_items` table should have price columns

---

## Step 2: Set Up Storage Bucket

1. **Go to Supabase Dashboard** → **Storage**
2. **Click "New bucket"**
3. **Configure:**
   - **Name**: `receipts-images`
   - **Public bucket**: ❌ **Uncheck** (must be private)
   - **File size limit**: 10MB
   - **Allowed MIME types**: `image/jpeg,image/png,image/webp`
4. **Click "Create bucket"**

### Set Up Storage Policies

After creating the bucket:

1. **Go to Storage** → **Policies** → **receipts-images**
2. **Add these 3 policies** (click "New Policy" for each):

**Policy 1: Upload**
```sql
CREATE POLICY "Users can upload to own folder"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'receipts-images' AND
  (storage.foldername(name))[1] = auth.uid()::text
);
```

**Policy 2: Read**
```sql
CREATE POLICY "Users can read from own folder"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'receipts-images' AND
  (storage.foldername(name))[1] = auth.uid()::text
);
```

**Policy 3: Delete**
```sql
CREATE POLICY "Users can delete own files"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'receipts-images' AND
  (storage.foldername(name))[1] = auth.uid()::text
);
```

---

## Step 3: Install Dependencies

**No additional dependencies needed!** The app uses only:
- Next.js
- Supabase client libraries
- React

All packages are already installed.

---

## Step 4: Deploy

**No environment variables needed!** The app uses only:
- `NEXT_PUBLIC_SUPABASE_URL` (already set)
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` (already set)

Just deploy to Vercel as usual.

---

## Step 5: Test!

1. **Open your live app**
2. **Add some items** to your grocery list
3. **Click "Add Prices"** button
4. **Enter vendor/store name** (e.g., "Shufersal")
5. **Optionally upload receipt image** (for reference only)
6. **Enter prices manually** for each item
7. **Click "Apply Prices"**
8. **Next time you add prices for the same vendor**, you'll see suggested prices!

---

## 🎯 How It Works

1. **User clicks "Add Prices"**
2. **Enters vendor name** (e.g., "Shufersal")
3. **Optionally uploads receipt image** (stored for reference)
4. **Enters prices manually** for each item
5. **App saves prices** to `grocery_items`
6. **App saves to price memory** (`price_memories` table)
7. **Next time**: When user selects same vendor, app suggests remembered prices
8. **User can use suggestion** or enter new price (overwrites memory)

---

## 📋 Features

- ✅ **Free** - No paid APIs
- ✅ **Manual price entry** - User controls everything
- ✅ **Price memory** - Remembers prices per vendor + item
- ✅ **Smart suggestions** - Shows last used price
- ✅ **Receipt images** - Optional reference storage
- ✅ **Secure** - RLS policies ensure user data isolation
- ✅ **Simple** - No complex setup required

---

## ❓ Troubleshooting

### Problem: "Unauthorized" error
**Solution**: Make sure user is logged in

### Problem: "Failed to upload image"
**Solution**: 
- Check Storage bucket exists and is named `receipts-images`
- Check Storage policies are set up correctly
- Check file size is under 10MB

### Problem: Prices don't appear after applying
**Solution**:
- Check browser console for errors
- Verify items were updated in Supabase Table Editor
- Try refreshing the page

### Problem: Suggestions don't appear
**Solution**:
- Make sure you've entered prices for this vendor before
- Check that vendor name matches exactly (case-sensitive)
- Verify `price_memories` table has data

---

## 📝 Summary

1. ✅ Run SQL migrations (price fields + price_memories)
2. ✅ Create Storage bucket + policies
3. ✅ Deploy (no env vars needed!)
4. ✅ Test!

---

**You're all set!** This is a completely free implementation! 🎉
