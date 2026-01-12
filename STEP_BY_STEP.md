# 📖 מדריך שלב אחר שלב - למתחילים

## שלב 1: עבור לתיקיית הפרויקט

ב-Git Bash שלך, הקלד:

```bash
cd /c/Users/User/grocery-store-list
```

לחץ Enter. אתה אמור לראות שהתיקייה השתנתה.

---

## שלב 2: בדוק שהכל שם

הקלד:

```bash
ls
```

לחץ Enter. אתה אמור לראות רשימת קבצים כמו `app`, `public`, `package.json` וכו'.

---

## שלב 3: הגדר את Git (רק פעם אחת)

הקלד את שתי הפקודות הבאות (אחת בכל פעם):

```bash
git config --global user.name "השם שלך"
```

לחץ Enter. **החלף "השם שלך" בשם האמיתי שלך** (למשל: "John Doe")

אחרי זה:

```bash
git config --global user.email "your-email@example.com"
```

לחץ Enter. **החלף "your-email@example.com" באימייל שלך** (אותו שתשתמש ב-GitHub)

---

## שלב 4: הוסף את כל הקבצים

הקלד:

```bash
git add .
```

לחץ Enter. זה מוסיף את כל הקבצים.

---

## שלב 5: שמור את השינויים (Commit)

הקלד:

```bash
git commit -m "Initial commit - My Shopping List App"
```

לחץ Enter. זה שומר את כל הקבצים.

---

## שלב 6: צור Repository ב-GitHub

1. **פתח דפדפן** (Chrome, Edge, וכו')
2. **לך ל**: https://github.com
3. **התחבר** (או צור חשבון אם אין לך)
4. **לחץ על הכפתור הירוק** "New" או לך ל: https://github.com/new
5. **בשדה "Repository name"** הקלד: `my-shopping-list`
6. **אל תסמן שום דבר** (לא README, לא .gitignore, כלום)
7. **לחץ על "Create repository"** (כפתור ירוק)

---

## שלב 7: העלה את הקוד ל-GitHub

חזור ל-Git Bash והקלד את הפקודות הבאות (אחת בכל פעם):

**החלף `YOUR_USERNAME` בשם המשתמש שלך ב-GitHub!**

```bash
git remote add origin https://github.com/YOUR_USERNAME/my-shopping-list.git
```

לחץ Enter.

```bash
git branch -M main
```

לחץ Enter.

```bash
git push -u origin main
```

לחץ Enter.

**אם זה מבקש ממך שם משתמש וסיסמה:**
- שם משתמש: השם שלך ב-GitHub
- סיסמה: **לא** הסיסמה הרגילה! צריך ליצור "Personal Access Token"
  - לך ל: https://github.com/settings/tokens
  - לחץ "Generate new token (classic)"
  - תן שם: "Vercel"
  - סמן "repo" (כל התיבות תחת repo)
  - לחץ "Generate token"
  - העתק את הקוד שמופיע (זה הסיסמה החדשה)
  - השתמש בקוד הזה כסיסמה

---

## שלב 8: פרוס ב-Vercel

1. **פתח דפדפן חדש** (או tab חדש)
2. **לך ל**: https://vercel.com
3. **לחץ "Sign Up"**
4. **בחר "Continue with GitHub"**
5. **אשר את הגישה** (Authorize)
6. **לחץ "Add New Project"**
7. **בחר את `my-shopping-list`** מהרשימה
8. **בשדה "Project Name"** ודא שכתוב: `my-shopping-list`
9. **לחץ "Deploy"** (כפתור כחול)

---

## שלב 9: קבל את הקישור! 🎉

תוך 2-3 דקות:
- תראה הודעת הצלחה
- הקישור יהיה: **`https://my-shopping-list.vercel.app`**
- לחץ על הקישור כדי לראות את האתר!

---

## 💡 טיפים

- אם יש שגיאה, העתק את השגיאה ושלח לי
- אם משהו לא עובד, תאר לי מה קרה
- כל פקודה צריכה להיות בשורה נפרדת

## ❓ שאלות נפוצות

**Q: איך אני יודע מה שם המשתמש שלי ב-GitHub?**
A: זה השם שמופיע ב-URL כשאתה נכנס לחשבון שלך. למשל: `https://github.com/john-doe` אז השם הוא `john-doe`

**Q: מה אם השם `my-shopping-list` כבר תפוס?**
A: בחר שם אחר, למשל: `my-shopping-list-2024` או `my-grocery-app`

**Q: כמה זמן זה לוקח?**
A: בערך 10 דקות אם הכל עובד חלק

---

**תתחיל משלב 1 ותגיד לי איך זה הולך!** 🚀
