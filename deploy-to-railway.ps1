# Railway Deployment Script
# This script deploys both auth and chat services to Railway

Write-Host "🚀 Starting Railway Deployment..." -ForegroundColor Green

# Check if logged in
$whoami = railway whoami
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Not logged in to Railway. Run 'railway login' first." -ForegroundColor Red
    exit 1
}

Write-Host "✅ Logged in as: $whoami" -ForegroundColor Green

# Deploy Auth Service
Write-Host "`n📦 Deploying Auth Service..." -ForegroundColor Yellow
Set-Location "services/auth-service"

# Create .railway directory if not exists
New-Item -ItemType Directory -Force -Path ".railway" | Out-Null

# Try to link and deploy
Write-Host "🔗 Linking to Railway project..." -ForegroundColor Cyan
$linkResult = railway link 2>&1
if ($linkResult -match "No projects found") {
    Write-Host "❌ No Railway projects found. Please create a project first." -ForegroundColor Red
    Set-Location "../.."
    exit 1
}

# Set environment variables
Write-Host "🔧 Setting environment variables..." -ForegroundColor Cyan
$env:DATABASE_URL = '`${{Postgres.DATABASE_URL}}'
$env:JWT_SECRET = 'super_secret_key_setara_2024'
$env:NODE_ENV = 'production'
$env:PORT = '3000'
$env:ALLOWED_ORIGINS = 'https://web-5it9deahv-setaraindonesias-projects.vercel.app,http://localhost:3000'

# Deploy
Write-Host "🚀 Deploying auth service..." -ForegroundColor Cyan
railway up --detach

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Auth service deployed successfully!" -ForegroundColor Green
} else {
    Write-Host "❌ Auth service deployment failed!" -ForegroundColor Red
}

# Deploy Chat Service
Write-Host "`n📦 Deploying Chat Service..." -ForegroundColor Yellow
Set-Location "../chat-service"

# Link and deploy
Write-Host "🔗 Linking to Railway project..." -ForegroundColor Cyan
railway link 2>&1 | Out-Null

Write-Host "🔧 Setting environment variables..." -ForegroundColor Cyan
$env:DATABASE_URL = '`${{Postgres.DATABASE_URL}}'
$env:JWT_SECRET = 'super_secret_key_setara_2024'
$env:NODE_ENV = 'production'
$env:PORT = '3000'
$env:ALLOWED_ORIGINS = 'https://web-5it9deahv-setaraindonesias-projects.vercel.app,http://localhost:3000'

Write-Host "🚀 Deploying chat service..." -ForegroundColor Cyan
railway up --detach

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Chat service deployed successfully!" -ForegroundColor Green
} else {
    Write-Host "❌ Chat service deployment failed!" -ForegroundColor Red
}

# Return to root
Set-Location "../.."

Write-Host "`n🎉 Deployment completed!" -ForegroundColor Green
Write-Host "📋 Next steps:" -ForegroundColor Yellow
Write-Host "1. Check Railway dashboard for service URLs" -ForegroundColor White
Write-Host "2. Update Vercel environment variables" -ForegroundColor White
Write-Host "3. Test the deployed services" -ForegroundColor White
