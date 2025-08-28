# PowerShell script untuk start chat testing environment
Write-Host "🚀 Starting Chat Testing Environment..." -ForegroundColor Green

# Function to check if a port is in use
function Test-Port {
    param([int]$Port)
    try {
        $connection = New-Object System.Net.Sockets.TcpClient
        $connection.Connect("localhost", $Port)
        $connection.Close()
        return $true
    } catch {
        return $false
    }
}

# Function to start service in new window
function Start-Service {
    param(
        [string]$ServiceName,
        [string]$Path,
        [string]$Command,
        [int]$Port
    )
    
    Write-Host "📦 Starting $ServiceName..." -ForegroundColor Yellow
    
    if (Test-Port -Port $Port) {
        Write-Host "✅ $ServiceName already running on port $Port" -ForegroundColor Green
    } else {
        $scriptBlock = "cd '$Path'; $Command; pause"
        Start-Process powershell -ArgumentList "-NoExit", "-Command", $scriptBlock -WindowStyle Normal
        
        # Wait a bit for service to start
        Start-Sleep -Seconds 3
        
        if (Test-Port -Port $Port) {
            Write-Host "✅ $ServiceName started successfully on port $Port" -ForegroundColor Green
        } else {
            Write-Host "⚠️  $ServiceName may still be starting on port $Port" -ForegroundColor Yellow
        }
    }
}

# Get current directory
$currentDir = Get-Location

# Start required services
Start-Service -ServiceName "Auth Service" -Path "$currentDir\services\auth-service" -Command "npm run start:dev" -Port 3003
Start-Service -ServiceName "Chat Service" -Path "$currentDir\services\chat-service" -Command "npm run start:dev" -Port 3004
Start-Service -ServiceName "Web App" -Path "$currentDir\apps\web" -Command "npm run dev" -Port 3000

Write-Host "`n⏳ Waiting for all services to be ready..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

# Check all services
$services = @(
    @{Name="Auth Service"; Port=3003; Url="http://localhost:3003"},
    @{Name="Chat Service"; Port=3004; Url="http://localhost:3004"},
    @{Name="Web App"; Port=3000; Url="http://localhost:3000"}
)

Write-Host "`n🔍 Checking service status:" -ForegroundColor Cyan
foreach ($service in $services) {
    if (Test-Port -Port $service.Port) {
        Write-Host "✅ $($service.Name): $($service.Url)" -ForegroundColor Green
    } else {
        Write-Host "❌ $($service.Name): Not running on port $($service.Port)" -ForegroundColor Red
    }
}

Write-Host "`n🎯 Next steps:" -ForegroundColor Cyan
Write-Host "1. Run: node scripts/create-test-users.js" -ForegroundColor White
Write-Host "2. Open: http://localhost:3000/chat-test" -ForegroundColor White
Write-Host "3. Open multiple browser windows to test chat" -ForegroundColor White

Write-Host "`n📚 Testing Guide:" -ForegroundColor Cyan
Write-Host "• Use different test users in different browser windows" -ForegroundColor White
Write-Host "• Create conversations and test real-time messaging" -ForegroundColor White
Write-Host "• Test typing indicators and read receipts" -ForegroundColor White
Write-Host "• Test rate limiting by sending many messages quickly" -ForegroundColor White

Read-Host "`nPress Enter to continue..."

