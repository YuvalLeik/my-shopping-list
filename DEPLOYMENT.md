# הוראות פריסה - רשימת קניות

מדריך זה מסביר איך לפרוס את האפליקציה כאתר ואחר כך כאפליקציה.

## חלק 1: פריסה כאתר (Web)

### אפשרות 1: Vercel (מומלץ - הכי קל)

1. **התקן את Vercel CLI** (אופציונלי):
   ```bash
   npm i -g vercel
   ```

2. **העלה את הקוד ל-GitHub**:
   - צור repository חדש ב-GitHub
   - העלה את כל הקבצים:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/YOUR_USERNAME/grocery-store-list.git
   git push -u origin main
   ```

3. **התחבר ל-Vercel**:
   - לך ל-[vercel.com](https://vercel.com)
   - התחבר עם GitHub
   - לחץ על "Add New Project"
   - בחר את ה-repository שלך
   - Vercel יזהה אוטומטית שזה Next.js
   - לחץ על "Deploy"

4. **האתר יהיה זמין תוך דקות!**
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

### אפשרות 3: פריסה ידנית (VPS/Server)

1. **בנה את האפליקציה**:
   ```bash
   npm run build
   ```

2. **הרץ את השרת**:
   ```bash
   npm start
   ```

3. **השתמש ב-PM2 לניהול**:
   ```bash
   npm install -g pm2
   pm2 start npm --name "grocery-list" -- start
   pm2 save
   pm2 startup
   ```

## חלק 2: הפיכה לאפליקציה (PWA)

האפליקציה כבר מוכנה להיות PWA! רק צריך:

### 1. הוסף אייקונים

צור 2 תמונות אייקון:
- `public/icon-192.png` - 192x192 פיקסלים
- `public/icon-512.png` - 512x512 פיקסלים

אתה יכול להשתמש בכלי כמו:
- [PWA Asset Generator](https://github.com/elegantapp/pwa-asset-generator)
- או ליצור בעצמך עם כל עורך תמונות

### 2. הוסף Service Worker

הקובץ `public/sw.js` כבר קיים. עכשיו צריך להוסיף אותו ל-`app/layout.tsx`:

```typescript
// הוסף את זה ב-useEffect ב-component
useEffect(() => {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => console.log('SW registered'))
      .catch((error) => console.log('SW registration failed'));
  }
}, []);
```

### 3. בדוק שהכל עובד

1. פתח את האתר בדפדפן
2. בדפדפן Chrome/Edge: לחץ על "..." > "התקן אפליקציה"
3. בדפדפן Safari (iOS): לחץ על "שתף" > "הוסף למסך הבית"

## חלק 3: אפליקציה Native (אופציונלי)

אם אתה רוצה אפליקציה אמיתית ב-App Store/Play Store:

### אפשרות 1: Capacitor (מומלץ)

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

### אפשרות 2: React Native (דורש שינויים בקוד)

זה דורש שינוי משמעותי של הקוד. לא מומלץ אלא אם אתה רוצה להתחיל מחדש.

## הערות חשובות

1. **localStorage**: הנתונים נשמרים רק בדפדפן/אפליקציה של המשתמש. אם אתה רוצה סנכרון בין מכשירים, תצטרך להוסיף backend.

2. **HTTPS חובה**: PWA עובד רק עם HTTPS. Vercel ו-Netlify מספקים HTTPS אוטומטית.

3. **תמיכה בדפדפנים**: PWA עובד טוב ב-Chrome, Edge, Safari (iOS 11.3+), Firefox.

## צעדים הבאים

1. ✅ העלה ל-GitHub
2. ✅ פרוס ב-Vercel/Netlify
3. ✅ הוסף אייקונים
4. ✅ בדוק PWA
5. (אופציונלי) הוסף Capacitor לאפליקציה native

## תמיכה

אם יש בעיות, בדוק:
- Console בדפדפן (F12)
- Network tab לבדיקת טעינת קבצים
- Application tab > Service Workers לבדיקת SW
