# Simple PowerShell script to start chat service
Write-Host "🚀 Starting Chat Service..." -ForegroundColor Green
Write-Host ""

# Change to chat service directory
Set-Location "services\chat-service"
Write-Host "📁 Changed to chat-service directory" -ForegroundColor Yellow

# Start the service
Write-Host "🔧 Starting NestJS chat service..." -ForegroundColor Yellow
npm run start:dev


