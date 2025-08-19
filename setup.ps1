# PowerShell Setup Script for Setaradapps Development Environment

Write-Host "🚀 Setting up Setaradapps Development Environment..." -ForegroundColor Green

# Check if Docker is running
try {
    docker info | Out-Null
    Write-Host "✅ Docker is running" -ForegroundColor Green
} catch {
    Write-Host "❌ Docker is not running. Please start Docker and try again." -ForegroundColor Red
    exit 1
}

# Check if Node.js is installed
if (!(Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Node.js is not installed. Please install Node.js 18+ and try again." -ForegroundColor Red
    exit 1
}

# Check Node.js version
$nodeVersion = (node -v).Substring(1).Split('.')[0]
if ([int]$nodeVersion -lt 18) {
    Write-Host "❌ Node.js version 18+ is required. Current version: $(node -v)" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Prerequisites check passed" -ForegroundColor Green

# Install root dependencies
Write-Host "📦 Installing root dependencies..." -ForegroundColor Yellow
npm install

# Install service dependencies
Write-Host "🔧 Installing service dependencies..." -ForegroundColor Yellow
Push-Location services/auth-service; npm install; Pop-Location
Push-Location services/chat-service; npm install; Pop-Location
Push-Location services/marketplace-service; npm install; Pop-Location
Push-Location services/delivery-service; npm install; Pop-Location
Push-Location services/wallet-service; npm install; Pop-Location
Push-Location services/payment-service; npm install; Pop-Location
Push-Location services/ai-service; npm install; Pop-Location
Push-Location services/iot-service; npm install; Pop-Location

# Install app dependencies
Write-Host "📱 Installing app dependencies..." -ForegroundColor Yellow
Push-Location apps/web; npm install; Pop-Location
Push-Location apps/mobile; npm install; Pop-Location
Push-Location apps/admin; npm install; Pop-Location

# Install package dependencies
Write-Host "📦 Installing package dependencies..." -ForegroundColor Yellow
Push-Location packages/shared; npm install; Pop-Location
Push-Location packages/ui; npm install; Pop-Location
Push-Location packages/contracts; npm install; Pop-Location

# Create environment files
Write-Host "⚙️ Creating environment files..." -ForegroundColor Yellow
Copy-Item services/auth-service/env.example services/auth-service/.env -Force
Copy-Item services/chat-service/env.example services/chat-service/.env -Force
Copy-Item services/marketplace-service/env.example services/marketplace-service/.env -Force
Copy-Item services/delivery-service/env.example services/delivery-service/.env -Force
Copy-Item services/wallet-service/env.example services/wallet-service/.env -Force
Copy-Item services/payment-service/env.example services/payment-service/.env -Force
Copy-Item services/ai-service/env.example services/ai-service/.env -Force
Copy-Item services/iot-service/env.example services/iot-service/.env -Force

# Build Docker images
Write-Host "🐳 Building Docker images..." -ForegroundColor Yellow
docker-compose build

Write-Host "✅ Setup completed successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "🚀 To start the development environment:" -ForegroundColor Cyan
Write-Host "   npm run docker:up" -ForegroundColor White
Write-Host ""
Write-Host "🔧 To stop the development environment:" -ForegroundColor Cyan
Write-Host "   npm run docker:down" -ForegroundColor White
Write-Host ""
Write-Host "📚 For more information, check the README.md files in each service directory." -ForegroundColor Cyan
