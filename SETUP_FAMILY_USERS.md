# 🚀 Family Users Setup Instructions

## Step 1: Run SQL Migration

1. **Go to Supabase Dashboard** → Your Project
2. **Click "SQL Editor"** in left sidebar
3. **Click "New query"** button
4. **Open** `MIGRATION_FAMILY_USERS.sql` on your computer
5. **Copy all the code** (Ctrl+A, Ctrl+C)
6. **Paste into SQL Editor** (Ctrl+V)
7. **Click "Run"** button
8. **Wait for completion** - you should see "Success"

### Verify Migration:
- Go to "Table Editor"
- Check that `local_users` table exists
- Check that `grocery_lists` has `local_user_id` column

---

## Step 2: Environment Variables

**No changes needed!**

The app uses only:
- `NEXT_PUBLIC_SUPABASE_URL` ✅ (already set)
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` ✅ (already set)

---

## Step 3: Test the App

### First Launch:
1. Open the app
2. Should see "Create your first user" screen
3. Enter a name (e.g., "Mom")
4. Click "Create"
5. App should load with shopping list

### Add More Users:
1. Click "Users" in navigation (mobile: bottom tab, desktop: sidebar)
2. Click "+ Add User"
3. Create a second user (e.g., "Dad")
4. Verify both users appear

### Switch Users:
1. Click "Switch" next to a different user
2. Verify the shopping list changes (should be empty for new user)
3. Add items to this user's list
4. Switch back to first user
5. Verify original list is still there

### Navigation:
- **Mobile**: Bottom tabs (List, History, Users)
- **Desktop**: Left sidebar with user dropdown and nav links

---

## What Changed

### Removed:
- ✅ Email/password authentication
- ✅ Auth component
- ✅ All `supabase.auth` calls
- ✅ User login/signup UI

### Added:
- ✅ Family user profiles (name only)
- ✅ User switcher (mobile tabs, desktop sidebar)
- ✅ Onboarding screen for first user
- ✅ Users screen (create, edit, delete, switch)

### Database:
- ✅ `local_users` table (simple: id, name, created_at)
- ✅ All tables now use `local_user_id` instead of `user_id`
- ✅ RLS disabled (simple hobby app approach)

---

## Files Created/Modified

### New Files:
- `MIGRATION_FAMILY_USERS.sql`
- `lib/family-users.ts`
- `app/components/Onboarding.tsx`
- `app/components/UsersScreen.tsx`
- `app/components/Navigation.tsx`

### Modified Files:
- `lib/database.ts` - Uses `local_user_id`
- `lib/database-prices.ts` - Uses `local_user_id`
- `app/api/receipts/upload/route.ts` - Uses `local_user_id`
- `app/components/ManualPriceModal.tsx` - Updated
- `app/page.tsx` - Removed auth, added navigation

---

## Troubleshooting

**"No active user selected" error:**
- Make sure you've created at least one user via onboarding

**Can't see other user's lists:**
- This is expected! Each user has separate lists. Switch users to see their lists.

**Migration fails:**
- Check if tables already exist
- Make sure you're running the full migration script
- Check Supabase logs for specific errors

---

**After migration, the app will work without any authentication!** 🎉
