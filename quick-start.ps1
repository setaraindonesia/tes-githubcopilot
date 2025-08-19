# Setaradapps Quick Start Script
# Simple script to get you started quickly

Write-Host "🚀 Setaradapps Quick Start" -ForegroundColor Green
Write-Host "=========================" -ForegroundColor Green

# Check if we're in the right directory
if (!(Test-Path "package.json")) {
    Write-Host "❌ Please run this script from the project root directory" -ForegroundColor Red
    exit 1
}

Write-Host "📋 Prerequisites Check:" -ForegroundColor Blue

# Check Node.js
if (Get-Command "node" -ErrorAction SilentlyContinue) {
    $nodeVersion = node --version
    Write-Host "✅ Node.js: $nodeVersion" -ForegroundColor Green
} else {
    Write-Host "❌ Node.js not found! Please install from https://nodejs.org/" -ForegroundColor Red
    exit 1
}

# Check Docker
if (Get-Command "docker" -ErrorAction SilentlyContinue) {
    try {
        docker info > $null 2>&1
        Write-Host "✅ Docker: Running" -ForegroundColor Green
    } catch {
        Write-Host "❌ Docker not running! Please start Docker Desktop" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "❌ Docker not found! Please install Docker Desktop" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "🚀 Starting Setup..." -ForegroundColor Blue

# Install dependencies
Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow
npm install

# Create environment files
Write-Host "📝 Creating environment files..." -ForegroundColor Yellow
if (!(Test-Path ".env")) {
    Copy-Item "services/auth-service/env.example" ".env" -ErrorAction SilentlyContinue
    Write-Host "✅ Created .env file" -ForegroundColor Green
}

# Start services
Write-Host "🐳 Starting Docker services..." -ForegroundColor Yellow
docker-compose up -d

Write-Host ""
Write-Host "🎉 Setup completed!" -ForegroundColor Green
Write-Host ""
Write-Host "🌐 Access your applications:" -ForegroundColor Cyan
Write-Host "   Web App: http://localhost:3000" -ForegroundColor White
Write-Host "   Admin: http://localhost:3009" -ForegroundColor White
Write-Host ""
Write-Host "📚 Next steps:" -ForegroundColor Yellow
Write-Host "   1. Check services: docker-compose ps" -ForegroundColor White
Write-Host "   2. View logs: docker-compose logs -f" -ForegroundColor White
Write-Host "   3. Start development: npm run apps:dev" -ForegroundColor White
Write-Host ""
Write-Host "Happy coding! 🚀" -ForegroundColor Green
