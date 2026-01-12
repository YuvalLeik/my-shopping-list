# 🔐 Setting Up Environment Variables

## Important Step: Add Your API Keys

You need to create a file called `.env.local` in your project root directory with your Supabase API keys.

---

## 📋 Step-by-Step Instructions:

### Step 1: Navigate to Your Project Folder

1. **Open File Explorer** (Windows Explorer)
2. **Navigate to**: `C:\Users\User\grocery-store-list`
   - This is your project root folder
   - You should see folders like `app`, `public`, `node_modules`, etc.

### Step 2: Create the `.env.local` File

**Option A: Using File Explorer (Windows)**

1. **Right-click** in the empty space inside the `grocery-store-list` folder
2. **Select "New"** → **"Text Document"**
3. **Rename the file** to exactly: `.env.local`
   - Important: The file name must start with a dot (`.`)
   - Important: The file must have NO extension (not `.env.local.txt`)
   - If Windows asks "Are you sure you want to change the extension?", click **"Yes"**

**Option B: Using VS Code (Recommended)**

1. **Open VS Code** (or your code editor)
2. **Open the folder**: `C:\Users\User\grocery-store-list`
3. **Right-click** in the file explorer (left sidebar)
4. **Select "New File"**
5. **Type the exact name**: `.env.local`
6. **Press Enter**

**Option C: Using Command Line (Git Bash or PowerShell)**

1. **Open Git Bash** or **PowerShell**
2. **Navigate to the project**:
   ```bash
   cd C:\Users\User\grocery-store-list
   ```
3. **Create the file**:
   ```bash
   touch .env.local
   ```
   Or in PowerShell:
   ```powershell
   New-Item -Path .env.local -ItemType File
   ```

### Step 3: Open the File

1. **Right-click** on `.env.local`
2. **Select "Open with"** → **"Notepad"** (or any text editor)
   - Or double-click if it opens in a text editor

### Step 4: Add the Content

1. **Copy and paste** this exact content into the file:

```env
NEXT_PUBLIC_SUPABASE_URL=your-project-url-here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

### Step 5: Replace the Placeholder Values

1. **Find** `your-project-url-here` in the file
2. **Replace it** with your **Project URL** from Supabase
   - This should look like: `https://abcdefghijklmnop.supabase.co`
3. **Find** `your-anon-key-here` in the file
4. **Replace it** with your **anon public key** from Supabase
   - This should look like: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` (very long string)

### Example of What the Final File Should Look Like:

```env
NEXT_PUBLIC_SUPABASE_URL=https://abcdefghijklmnop.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprbG1ub3AiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTY0NTEyMzQ1NiwiZXhwIjoxOTYwNzA5NDU2fQ.xxxxx
```

### Step 6: Save the File

1. **Press Ctrl+S** (or File → Save)
2. **Close the file**

---

## ⚠️ Important Notes:

1. **Do NOT upload this file to GitHub!** (It's already in `.gitignore`)
2. **Keep your keys safe!** Don't share them with anyone
3. **The file must be named exactly**: `.env.local` (with the dot at the beginning)
4. **No spaces** around the `=` sign in the file
5. **No quotes** needed around the values

---

## ✅ How to Verify the File Was Created Correctly:

1. **Go back to File Explorer**
2. **Look in the folder**: `C:\Users\User\grocery-store-list`
3. **You should see** a file named `.env.local`
   - If you don't see it, you might need to enable "Show hidden files" in File Explorer
   - In File Explorer: View → Show → Hidden items

---

## ❓ Troubleshooting:

**Q: I can't see the file after creating it.**
A: The file might be hidden. In File Explorer, go to View → Show → Hidden items. Or use VS Code to see it.

**Q: Windows says "You must type a file name" when trying to rename.**
A: This happens because Windows doesn't like files starting with a dot. Try creating it in VS Code instead, or use the command line method.

**Q: The file has a `.txt` extension.**
A: You need to remove the extension. Right-click → Rename → Remove `.txt` at the end. Windows will warn you - click "Yes".

**Q: Where exactly should the file be?**
A: In the root of your project: `C:\Users\User\grocery-store-list\.env.local`
   - Same level as `package.json`, `app` folder, `public` folder, etc.

---

## ✅ After You're Done:

**Tell me "I'm done"** and I'll continue with the next step - creating the Database!

---

## 📍 File Location Summary:

- **Full path**: `C:\Users\User\grocery-store-list\.env.local`
- **Same folder as**: `package.json`, `app`, `public`, `node_modules`
- **File name**: Exactly `.env.local` (with dot, no extension)
