# PowerShell script untuk fix database dan start auth service
Write-Host "🔧 Fixing Database Connection & Starting Auth Service..." -ForegroundColor Green

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

Write-Host "🔍 Checking if PostgreSQL is already running..." -ForegroundColor Yellow
if (Test-Port -Port 5432) {
    Write-Host "✅ PostgreSQL is already running on port 5432" -ForegroundColor Green
} else {
    Write-Host "🚀 Starting PostgreSQL with Docker Compose..." -ForegroundColor Cyan
    
    # Navigate to root directory
    Set-Location ".."
    
    # Start PostgreSQL
    docker-compose up postgres -d
    
    # Wait for PostgreSQL to start
    Write-Host "⏳ Waiting for PostgreSQL to start..." -ForegroundColor Yellow
    Start-Sleep -Seconds 15
    
    # Check if PostgreSQL is now running
    $retryCount = 0
    while (-not (Test-Port -Port 5432) -and $retryCount -lt 6) {
        Write-Host "⏳ Waiting for PostgreSQL... (attempt $($retryCount + 1)/6)" -ForegroundColor Yellow
        Start-Sleep -Seconds 5
        $retryCount++
    }
    
    if (Test-Port -Port 5432) {
        Write-Host "✅ PostgreSQL is now running on port 5432" -ForegroundColor Green
    } else {
        Write-Host "❌ Failed to start PostgreSQL. Checking logs..." -ForegroundColor Red
        docker-compose logs postgres
        Write-Host "🔧 Trying to restart PostgreSQL..." -ForegroundColor Yellow
        docker-compose restart postgres
        Start-Sleep -Seconds 10
    }
}

Write-Host "🔍 Checking if port 3001 is available..." -ForegroundColor Yellow
if (Test-Port -Port 3001) {
    Write-Host "⚠️  Port 3001 is already in use. Stopping existing service..." -ForegroundColor Yellow
    
    # Try to find and kill process on port 3001
    $process = Get-NetTCPConnection -LocalPort 3001 -ErrorAction SilentlyContinue | Select-Object OwningProcess -First 1
    if ($process) {
        Stop-Process -Id $process.OwningProcess -Force -ErrorAction SilentlyContinue
        Write-Host "✅ Stopped existing service on port 3001" -ForegroundColor Green
        Start-Sleep -Seconds 2
    }
}

Write-Host "📁 Navigating to auth service directory..." -ForegroundColor Cyan
Set-Location "services/auth-service"

Write-Host "📦 Installing dependencies..." -ForegroundColor Cyan
npm install

Write-Host "🔨 Building auth service..." -ForegroundColor Cyan
npm run build

Write-Host "🔄 Starting auth service in development mode..." -ForegroundColor Cyan
Write-Host "🌐 Service will be available at: http://localhost:3001" -ForegroundColor Green
Write-Host "📋 API Documentation: http://localhost:3001/api/v1/auth/health" -ForegroundColor Green
Write-Host "🐘 PostgreSQL running on: localhost:5432" -ForegroundColor Green
Write-Host "" 
Write-Host "Press Ctrl+C to stop the service" -ForegroundColor Yellow
Write-Host ""

npm run start:dev
