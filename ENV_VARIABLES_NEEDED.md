# 🔐 Environment Variables Needed

## Server-Side Variables (Add to Vercel)

These must be added to **Vercel Dashboard** → Your Project → **Settings** → **Environment Variables**:

### 1. Supabase Service Role Key
- **Name**: `SUPABASE_SERVICE_ROLE_KEY`
- **Value**: Your Supabase service_role key (from Supabase Dashboard → Settings → API)
- **⚠️ Important**: This is a SECRET key - never expose it to the client!
- **Environments**: Production, Preview, Development

### 2. Google Cloud Vision API Credentials
- **Name**: `GOOGLE_CLOUD_CREDENTIALS`
- **Value**: JSON string of your Google Cloud service account credentials
- **How to get**:
  1. Go to [Google Cloud Console](https://console.cloud.google.com)
  2. Create a new project (or use existing)
  3. Enable "Cloud Vision API"
  4. Create a Service Account
  5. Download JSON key file
  6. Copy entire JSON content and paste as the value (as a string)
- **Environments**: Production, Preview, Development

### 3. OpenAI API Key
- **Name**: `OPENAI_API_KEY`
- **Value**: Your OpenAI API key (from https://platform.openai.com/api-keys)
- **Environments**: Production, Preview, Development

---

## How to Add in Vercel

1. **Go to Vercel Dashboard** → Your Project
2. **Click "Settings"** → **"Environment Variables"**
3. **Add each variable:**
   - Click "Add New"
   - Enter Name
   - Enter Value
   - Select environments (Production, Preview, Development)
   - Click "Save"
4. **Redeploy** your app after adding variables

---

## ⚠️ Security Notes

- **Never commit these to Git!** They're already in `.gitignore`
- **Service Role Key** has admin access - keep it secret!
- **Google Credentials** should be a service account with minimal permissions
- **OpenAI Key** should have usage limits set

---

## 📝 Example Values Format

### GOOGLE_CLOUD_CREDENTIALS
```json
{
  "type": "service_account",
  "project_id": "your-project-id",
  "private_key_id": "...",
  "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n",
  "client_email": "...",
  "client_id": "...",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  ...
}
```

**Important**: Paste the entire JSON as a single-line string (or use `JSON.stringify()`)

---

## ✅ After Adding Variables

1. **Redeploy** your app in Vercel
2. **Test** the receipt upload feature
3. **Check logs** if there are any errors
