# 📦 Supabase Storage Setup for Receipts

## Create Storage Bucket

1. **Go to Supabase Dashboard** → Your Project
2. **Click "Storage"** in left sidebar
3. **Click "New bucket"**
4. **Configure:**
   - **Name**: `receipts-images`
   - **Public bucket**: ❌ **Uncheck** (private)
   - **File size limit**: 10MB (or adjust as needed)
   - **Allowed MIME types**: `image/jpeg,image/png,image/webp`
5. **Click "Create bucket"**

## Set Up Storage Policies

After creating the bucket, go to **Storage** → **Policies** → **receipts-images**

### Policy 1: Allow users to upload to their own folder
```sql
CREATE POLICY "Users can upload to own folder"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'receipts-images' AND
  (storage.foldername(name))[1] = auth.uid()::text
);
```

### Policy 2: Allow users to read from their own folder
```sql
CREATE POLICY "Users can read from own folder"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'receipts-images' AND
  (storage.foldername(name))[1] = auth.uid()::text
);
```

### Policy 3: Allow users to delete their own files
```sql
CREATE POLICY "Users can delete own files"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'receipts-images' AND
  (storage.foldername(name))[1] = auth.uid()::text
);
```

## Path Structure

Files will be stored as:
```
receipts-images/
  {userId}/
    {receiptId}/
      original.jpg
```

Example:
```
receipts-images/
  abc123-user-id/
    xyz789-receipt-id/
      original.jpg
```
