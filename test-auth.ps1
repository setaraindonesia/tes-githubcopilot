# Test Authentication System for Setara DApps
# Run this script to test the auth system without Docker

Write-Host "🚀 Testing Authentication System for Setara DApps..." -ForegroundColor Green

# Check if Node.js is installed
Write-Host "📋 Checking Node.js..." -ForegroundColor Yellow
try {
    node --version | Out-Null
    Write-Host "✅ Node.js is installed" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js is not installed. Please install Node.js first." -ForegroundColor Red
    exit 1
}

# Install web app dependencies
Write-Host "📦 Installing web app dependencies..." -ForegroundColor Yellow
Set-Location apps/web
npm install

# Start the web app
Write-Host "🌐 Starting web app..." -ForegroundColor Yellow
Write-Host "The app will start at http://localhost:3000" -ForegroundColor Cyan
Write-Host ""
Write-Host "📋 Testing Steps:" -ForegroundColor Cyan
Write-Host "1. Open http://localhost:3000/register" -ForegroundColor White
Write-Host "2. Register with your real email" -ForegroundColor White
Write-Host "3. Check browser console (F12) for verification link" -ForegroundColor White
Write-Host "4. Click verification link to verify email" -ForegroundColor White
Write-Host "5. Login at http://localhost:3000/login" -ForegroundColor White
Write-Host "6. Access dashboard at http://localhost:3000/dashboard" -ForegroundColor White
Write-Host ""
Write-Host "💡 Test Credentials (pre-created):" -ForegroundColor Cyan
Write-Host "Username: test_user" -ForegroundColor White
Write-Host "Password: password123" -ForegroundColor White
Write-Host ""
Write-Host "🔧 Mock Features:" -ForegroundColor Cyan
Write-Host "- Real email validation" -ForegroundColor White
Write-Host "- Username uniqueness check" -ForegroundColor White
Write-Host "- Email verification flow" -ForegroundColor White
Write-Host "- JWT token generation" -ForegroundColor White
Write-Host "- Session management" -ForegroundColor White
Write-Host ""
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Yellow
Write-Host ""

# Start the development server
npm run dev
