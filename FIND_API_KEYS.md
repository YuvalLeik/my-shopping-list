# 🔑 Where to Find API Keys in Supabase

## You're Already on the Right Page! 👍

You're on the **API Keys** page in Settings. Now you need to switch to the second tab.

---

## 📍 Step 1: Find the Tabs

At the top of the page, you should see **2 tabs**:

1. **"Publishable and secret API keys"** ← This tab is currently selected
2. **"Legacy anon, service_role API keys"** ← **Click on this one!**

---

## 📍 Step 2: Click on the Second Tab

Click on the tab **"Legacy anon, service_role API keys"**

After you click, you'll see 2 keys:

### 1. **anon public** (This is what you need!)
- This is the key you need
- It starts with `eyJ...` (or something similar)
- **This is safe to use in the browser** (because of RLS)

### 2. **service_role** (Don't use this!)
- This is a secret key
- **Don't share it!**
- Only used on servers

---

## 📋 What You Need to Save:

1. **Project URL** - Already saved ✅
2. **anon public key** - This is what you need to find now

---

## 💡 What It Looks Like:

After you click on the second tab, you'll see something like this:

```
anon public
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlvdXJwcm9qZWN0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE2NDUxMjM0NTYsImV4cCI6MTk2MDcwOTQ1Nn0.xxxxx

service_role
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlvdXJwcm9qZWN0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTY0NTEyMzQ1NiwiZXhwIjoxOTYwNzA5NDU2fQ.xxxxx
```

**You need the "anon public" one!**

---

## ✅ After You Found It:

1. **Copy the anon public key** (click the copy button next to the key)
2. **Save it** in a safe place
3. **Tell me** - and I'll continue with the next step!

---

## ❓ Can't Find It?

If you don't see the tabs:
1. Make sure you're on the **Settings > API** page
2. Scroll up - the tabs are at the top of the page
3. Look for the words "Legacy" or "anon"

**Tell me if you found it or if there's a problem!** 🚀
