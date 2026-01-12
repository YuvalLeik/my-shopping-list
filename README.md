# רשימת הקניות שלי - My Grocery List

אפליקציית רשימת קניות חכמה בעברית עם תמיכה ב-PWA (Progressive Web App).

## תכונות

- ✅ הוספת פריטים עם קטגוריות, כמות ותמונות
- ✅ חיפוש ומיון פריטים
- ✅ רשימות לפי תאריך
- ✅ שמירה אוטומטית ב-localStorage
- ✅ רשימות היסטוריות
- ✅ צ'אט בוט חכם להצעות פריטים
- ✅ תמיכה בעברית (RTL)
- ✅ Responsive - עובד על מחשב וטלפון
- ✅ PWA - ניתן להתקין כאפליקציה

## התקנה מקומית

```bash
# התקן dependencies
npm install

# הרץ במוד פיתוח
npm run dev

# פתח בדפדפן
# http://localhost:3000
```

## בנייה לפרודקשן

```bash
# בנה את האפליקציה
npm run build

# הרץ את השרת
npm start
```

## פריסה כאתר

### אפשרות 1: Vercel (מומלץ - הכי קל)

1. **העלה את הקוד ל-GitHub**:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/YOUR_USERNAME/grocery-store-list.git
   git push -u origin main
   ```

2. **התחבר ל-Vercel**:
   - לך ל-[vercel.com](https://vercel.com)
   - התחבר עם GitHub
   - לחץ על "Add New Project"
   - בחר את ה-repository שלך
   - Vercel יזהה אוטומטית שזה Next.js
   - לחץ על "Deploy"

3. **האתר יהיה זמין תוך דקות!**
   - תקבל URL כמו: `https://your-app.vercel.app`

### אפשרות 2: Netlify

1. **העלה את הקוד ל-GitHub** (כמו למעלה)

2. **התחבר ל-Netlify**:
   - לך ל-[netlify.com](https://netlify.com)
   - התחבר עם GitHub
   - לחץ על "Add new site" > "Import an existing project"
   - בחר את ה-repository שלך

3. **הגדר את ההגדרות**:
   - Build command: `npm run build`
   - Publish directory: `.next`
   - לחץ על "Deploy site"

## הפיכה לאפליקציה (PWA)

האפליקציה כבר מוכנה להיות PWA! רק צריך:

### 1. הוסף אייקונים

צור 2 תמונות אייקון והעלה אותם ל-`public/`:
- `public/icon-192.png` - 192x192 פיקסלים
- `public/icon-512.png` - 512x512 פיקסלים

אתה יכול להשתמש בכלי כמו:
- [PWA Asset Generator](https://github.com/elegantapp/pwa-asset-generator)
- או ליצור בעצמך עם כל עורך תמונות

### 2. בדוק שהכל עובד

1. פתח את האתר בדפדפן (חייב להיות HTTPS)
2. **Chrome/Edge**: לחץ על "..." > "התקן אפליקציה"
3. **Safari (iOS)**: לחץ על "שתף" > "הוסף למסך הבית"

## אפליקציה Native (אופציונלי)

אם אתה רוצה אפליקציה אמיתית ב-App Store/Play Store:

### Capacitor (מומלץ)

1. **התקן Capacitor**:
   ```bash
   npm install @capacitor/core @capacitor/cli
   npx cap init
   ```

2. **הוסף פלטפורמות**:
   ```bash
   npm install @capacitor/ios @capacitor/android
   npx cap add ios
   npx cap add android
   ```

3. **בנה וסנכרן**:
   ```bash
   npm run build
   npx cap sync
   ```

4. **פתח ב-Xcode/Android Studio**:
   ```bash
   npx cap open ios
   npx cap open android
   ```

## טכנולוגיות

- **Next.js 16** - React Framework
- **TypeScript** - Type Safety
- **Tailwind CSS** - Styling
- **PWA** - Progressive Web App
- **localStorage** - Data Persistence

## מבנה הפרויקט

```
grocery-store-list/
├── app/
│   ├── components/      # קומפוננטות React
│   ├── page.tsx        # עמוד ראשי
│   ├── layout.tsx      # Layout כללי
│   ├── manifest.ts     # PWA Manifest
│   └── types.ts        # TypeScript Types
├── public/
│   ├── sw.js           # Service Worker
│   └── icon-*.png      # אייקונים (צריך להוסיף)
└── package.json
```

## הערות חשובות

1. **localStorage**: הנתונים נשמרים רק בדפדפן/אפליקציה של המשתמש. אם אתה רוצה סנכרון בין מכשירים, תצטרך להוסיף backend.

2. **HTTPS חובה**: PWA עובד רק עם HTTPS. Vercel ו-Netlify מספקים HTTPS אוטומטית.

3. **תמיכה בדפדפנים**: PWA עובד טוב ב-Chrome, Edge, Safari (iOS 11.3+), Firefox.

## רישיון

MIT
