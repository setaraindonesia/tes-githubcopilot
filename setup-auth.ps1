# Setup Authentication System for Setara DApps
# Run this script to setup the complete auth system

Write-Host "🚀 Setting up Authentication System for Setara DApps..." -ForegroundColor Green

# Check if Docker is running
Write-Host "📋 Checking Docker status..." -ForegroundColor Yellow
try {
    docker ps | Out-Null
    Write-Host "✅ Docker is running" -ForegroundColor Green
} catch {
    Write-Host "❌ Docker is not running. Please start Docker Desktop first." -ForegroundColor Red
    exit 1
}

# Start required services
Write-Host "🐳 Starting database and Redis..." -ForegroundColor Yellow
docker-compose up -d postgres redis

# Wait for database to be ready
Write-Host "⏳ Waiting for database to be ready..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

# Install dependencies for auth service
Write-Host "📦 Installing auth service dependencies..." -ForegroundColor Yellow
Set-Location services/auth-service
npm install

# Generate Prisma client
Write-Host "🔧 Generating Prisma client..." -ForegroundColor Yellow
npx prisma generate

# Run database migrations
Write-Host "🗄️ Running database migrations..." -ForegroundColor Yellow
npx prisma migrate dev --name init

# Go back to root directory
Set-Location ../..

# Install web app dependencies
Write-Host "📦 Installing web app dependencies..." -ForegroundColor Yellow
Set-Location apps/web
npm install

# Go back to root directory
Set-Location ../..

# Start auth service
Write-Host "🔐 Starting auth service..." -ForegroundColor Yellow
docker-compose up -d auth-service

# Wait for auth service to be ready
Write-Host "⏳ Waiting for auth service to be ready..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

Write-Host "✅ Authentication system setup complete!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Next steps:" -ForegroundColor Cyan
Write-Host "1. Start the web app: cd apps/web && npm run dev" -ForegroundColor White
Write-Host "2. Open http://localhost:3000/register to create an account" -ForegroundColor White
Write-Host "3. Open http://localhost:3000/login to login" -ForegroundColor White
Write-Host "4. Access dashboard at http://localhost:3000/dashboard" -ForegroundColor White
Write-Host ""
Write-Host "🔧 Services running:" -ForegroundColor Cyan
Write-Host "- Web App: http://localhost:3000" -ForegroundColor White
Write-Host "- Auth Service: http://localhost:3001" -ForegroundColor White
Write-Host "- Database: localhost:5432" -ForegroundColor White
Write-Host "- Redis: localhost:6379" -ForegroundColor White
Write-Host ""
Write-Host "💡 Development credentials:" -ForegroundColor Cyan
Write-Host "Username: test_user" -ForegroundColor White
Write-Host "Password: password123" -ForegroundColor White
