# 🔧 Quick Fix - App Not Working

## Most Likely Issue: Database Migration Not Run

The app requires the `local_users` table to exist. If you see errors or the app doesn't work, **run the SQL migration first**.

---

## ✅ Fix Steps

### 1. Run SQL Migration

**File:** `MIGRATION_FAMILY_USERS.sql`

1. Go to **Supabase Dashboard** → Your Project
2. Click **"SQL Editor"** (left sidebar)
3. Click **"New query"**
4. Open `MIGRATION_FAMILY_USERS.sql` on your computer
5. **Copy all code** (Ctrl+A, Ctrl+C)
6. **Paste** into SQL Editor (Ctrl+V)
7. Click **"Run"**
8. Wait for **"Success"**

### 2. Check Browser Console

Open browser DevTools (F12) → Console tab → Look for errors:
- If you see `relation "local_users" does not exist` → Migration not run
- If you see other errors → Share them

### 3. Refresh the App

After running migration:
- Refresh the browser (F5)
- App should show "Create your first user" screen
- Create a user → App should work

---

## 🐛 Common Errors

**Error: "relation local_users does not exist"**
- **Fix:** Run `MIGRATION_FAMILY_USERS.sql` in Supabase SQL Editor

**Error: "No active user selected"**
- **Fix:** Create a user via onboarding screen

**App stuck on loading**
- **Fix:** Check browser console for errors, run migration if needed

---

## 📝 What I Fixed

1. ✅ Added better error handling for missing tables
2. ✅ Added helpful error messages in onboarding
3. ✅ Fixed SSR issues (window checks)
4. ✅ Improved error detection for migration status

---

**After running the migration, the app should work!** 🎉
