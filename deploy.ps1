# Script לפריסה מהירה
# הרץ את זה ב-PowerShell: .\deploy.ps1

Write-Host "=== הכנת הפרויקט לפריסה ===" -ForegroundColor Green

# בדוק אם git מותקן
try {
    $gitVersion = git --version
    Write-Host "✓ Git מותקן: $gitVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ Git לא מותקן. התקן מ: https://git-scm.com" -ForegroundColor Red
    exit 1
}

# בדוק אם יש repository
if (Test-Path .git) {
    Write-Host "✓ Git repository קיים" -ForegroundColor Green
} else {
    Write-Host "מאתחל Git repository..." -ForegroundColor Yellow
    git init
    Write-Host "✓ Git repository נוצר" -ForegroundColor Green
}

# הוסף את כל הקבצים
Write-Host "מוסיף קבצים ל-Git..." -ForegroundColor Yellow
git add .

# בדוק אם יש שינויים
$status = git status --porcelain
if ($status) {
    Write-Host "יוצר commit..." -ForegroundColor Yellow
    git commit -m "Prepare for deployment"
    Write-Host "✓ Commit נוצר" -ForegroundColor Green
} else {
    Write-Host "אין שינויים חדשים" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "=== השלבים הבאים ===" -ForegroundColor Cyan
Write-Host "1. העלה את הקוד ל-GitHub:" -ForegroundColor White
Write-Host "   git remote add origin https://github.com/YOUR_USERNAME/my-shopping-list.git" -ForegroundColor Gray
Write-Host "   git branch -M main" -ForegroundColor Gray
Write-Host "   git push -u origin main" -ForegroundColor Gray
Write-Host ""
Write-Host "2. לך ל-vercel.com והתחבר עם GitHub" -ForegroundColor White
Write-Host "3. לחץ 'Add New Project' ובחר את ה-repository" -ForegroundColor White
Write-Host "4. לחץ 'Deploy' - זהו!" -ForegroundColor White
Write-Host ""
Write-Host "האתר שלך יהיה זמין תוך דקות! 🚀" -ForegroundColor Green
