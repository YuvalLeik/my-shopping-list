# 🚀 Local Users Setup Instructions

## SQL Migration

### Step 1: Run the Migration
1. **Go to Supabase Dashboard** → Your Project
2. **Click "SQL Editor"** in the left sidebar
3. **Click "New query"** button
4. **Open** `MIGRATION_LOCAL_USERS_NO_AUTH.sql` on your computer
5. **Copy all the code** (Ctrl+A, Ctrl+C)
6. **Paste into SQL Editor** (Ctrl+V)
7. **Click "Run"** button (or press Ctrl+Enter)
8. **Wait for completion** - you should see "Success. No rows returned"

### Step 2: Verify Tables
1. **Go to "Table Editor"** in Supabase
2. **Verify these tables exist:**
   - `app_instances`
   - `local_users`
   - `grocery_lists` (should have `local_user_id` column)
   - `receipts` (should have `local_user_id` column if exists)
   - `price_memories` (should have `local_user_id` column if exists)
   - `item_images` (should have `local_user_id` column if exists)

---

## Environment Variables

**No new environment variables needed!**

The app uses only:
- `NEXT_PUBLIC_SUPABASE_URL` (already set)
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` (already set)

**You can remove any auth-related environment variables if they exist.**

---

## Testing User Switching

### Test Flow:
1. **First Launch:**
   - Open the app
   - You should see "Create your first user" onboarding screen
   - Enter a name (e.g., "Mom")
   - Select a color and optional avatar
   - Click "Create"
   - App should load with shopping list

2. **Add More Users:**
   - Click "Users" in navigation (mobile: bottom tab, desktop: sidebar)
   - Click "+ Add User"
   - Create a second user (e.g., "Dad")
   - Verify both users appear in the list

3. **Switch Users:**
   - Click "Switch" next to a different user
   - Verify the shopping list changes (should be empty for new user)
   - Add items to this user's list
   - Switch back to first user
   - Verify original list is still there

4. **Edit User:**
   - Click "Edit" next to a user
   - Change the name
   - Press Enter or click outside
   - Verify name updated

5. **Delete User:**
   - Click "Delete" next to a user (if more than 1 exists)
   - Confirm deletion
   - If deleted user was active, verify app switches to another user
   - Verify deleted user's lists are gone

---

## What Changed

### Removed:
- ✅ Email/password authentication
- ✅ Auth component
- ✅ All `supabase.auth` calls
- ✅ User login/signup UI

### Added:
- ✅ Local user profiles (name, color, avatar)
- ✅ Instance-based data isolation
- ✅ User switcher (mobile tabs, desktop sidebar)
- ✅ Onboarding screen for first user
- ✅ User management screen

### Database:
- ✅ `app_instances` table (one per browser/device)
- ✅ `local_users` table (family members)
- ✅ All tables now use `local_user_id` instead of `user_id`

---

## Security Note

This implementation uses **instance_key** stored in localStorage for data isolation. This is suitable for a **hobby/family app** but is **not secure** for production apps with sensitive data.

For a family shopping list app, this is acceptable. Each browser/device gets its own instance, and users within that instance can switch between profiles.

---

## Troubleshooting

### Problem: "No active user selected"
**Solution**: Make sure you've created at least one user via onboarding

### Problem: Can't see other user's lists
**Solution**: This is expected! Each user has separate lists. Switch users to see their lists.

### Problem: Migration fails
**Solution**: 
- Check if tables already exist
- Make sure you're running the full migration script
- Check Supabase logs for specific errors

### Problem: Users don't persist
**Solution**: 
- Check browser localStorage is enabled
- Verify instance_key is being saved
- Check Supabase connection

---

**After migration, the app will work without any authentication!** 🎉
