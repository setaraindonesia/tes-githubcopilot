# Setaradapps Complete Setup Script for Windows
# This script will check prerequisites and set up the entire development environment

Write-Host "🚀 Setaradapps Complete Setup Script for Windows" -ForegroundColor Green
Write-Host "=================================================" -ForegroundColor Green

# Function to check if command exists
function Test-Command($cmdname) {
    return [bool](Get-Command -Name $cmdname -ErrorAction SilentlyContinue)
}

# Function to check Node.js version
function Test-NodeVersion {
    if (Test-Command "node") {
        $nodeVersion = node --version
        Write-Host "✅ Node.js found: $nodeVersion" -ForegroundColor Green
        
        # Extract version number
        $version = $nodeVersion -replace 'v', ''
        $majorVersion = [int]($version -split '\.')[0]
        
        if ($majorVersion -ge 18) {
            Write-Host "✅ Node.js version is compatible (>= 18)" -ForegroundColor Green
            return $true
        } else {
            Write-Host "❌ Node.js version too old. Please install Node.js 18+ from https://nodejs.org/" -ForegroundColor Red
            return $false
        }
    } else {
        Write-Host "❌ Node.js not found!" -ForegroundColor Red
        Write-Host "   Please install Node.js from: https://nodejs.org/" -ForegroundColor Yellow
        Write-Host "   Choose LTS version and restart PowerShell after installation" -ForegroundColor Yellow
        return $false
    }
}

# Function to check npm version
function Test-NpmVersion {
    if (Test-Command "npm") {
        $npmVersion = npm --version
        Write-Host "✅ npm found: $npmVersion" -ForegroundColor Green
        return $true
    } else {
        Write-Host "❌ npm not found!" -ForegroundColor Red
        return $false
    }
}

# Function to check Docker
function Test-Docker {
    if (Test-Command "docker") {
        try {
            $dockerVersion = docker --version
            Write-Host "✅ Docker found: $dockerVersion" -ForegroundColor Green
            
            # Test if Docker daemon is running
            $dockerInfo = docker info 2>$null
            if ($LASTEXITCODE -eq 0) {
                Write-Host "✅ Docker daemon is running" -ForegroundColor Green
                return $true
            } else {
                Write-Host "❌ Docker daemon is not running!" -ForegroundColor Red
                Write-Host "   Please start Docker Desktop" -ForegroundColor Yellow
                return $false
            }
        } catch {
            Write-Host "❌ Docker error: $_" -ForegroundColor Red
            return $false
        }
    } else {
        Write-Host "❌ Docker not found!" -ForegroundColor Red
        Write-Host "   Please install Docker Desktop from: https://www.docker.com/products/docker-desktop/" -ForegroundColor Yellow
        Write-Host "   Enable WSL2 if prompted and restart computer after installation" -ForegroundColor Yellow
        return $false
    }
}

# Function to check Git
function Test-Git {
    if (Test-Command "git") {
        $gitVersion = git --version
        Write-Host "✅ Git found: $gitVersion" -ForegroundColor Green
        return $true
    } else {
        Write-Host "❌ Git not found!" -ForegroundColor Red
        Write-Host "   Please install Git from: https://git-scm.com/" -ForegroundColor Yellow
        return $false
    }
}

# Function to create environment files
function Create-EnvironmentFiles {
    Write-Host "📝 Creating environment files..." -ForegroundColor Blue
    
    # Root .env
    if (!(Test-Path ".env")) {
        @"
# Setaradapps Environment Configuration
NODE_ENV=development

# Database
DATABASE_URL=postgresql://setaradapps:setaradapps123@localhost:5432/setaradapps

# Redis
REDIS_URL=redis://localhost:6379

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-in-production

# OpenAI
OPENAI_API_KEY=your-openai-api-key

# Stripe
STRIPE_SECRET_KEY=your-stripe-secret-key
STRIPE_PUBLISHABLE_KEY=your-stripe-publishable-key

# Blockchain
ETHEREUM_RPC_URL=https://mainnet.infura.io/v3/your-project-id
POLYGON_RPC_URL=https://polygon-rpc.com
BSC_RPC_URL=https://bsc-dataseed.binance.org

# MQTT
MQTT_BROKER_URL=mqtt://localhost:1883

# Allowed Origins
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3009
"@ | Out-File -FilePath ".env" -Encoding UTF8
        Write-Host "✅ Created root .env file" -ForegroundColor Green
    } else {
        Write-Host "ℹ️  Root .env file already exists" -ForegroundColor Yellow
    }
    
    # Create .env files for each service
    $services = @("auth-service", "chat-service", "marketplace-service", "delivery-service", "wallet-service", "payment-service", "ai-service", "iot-service")
    
    foreach ($service in $services) {
        $envPath = "services/$service/.env"
        if (!(Test-Path $envPath)) {
            Copy-Item "services/$service/env.example" $envPath -ErrorAction SilentlyContinue
            if (Test-Path $envPath) {
                Write-Host "✅ Created .env for $service" -ForegroundColor Green
            }
        }
    }
}

# Function to install dependencies
function Install-Dependencies {
    Write-Host "📦 Installing dependencies..." -ForegroundColor Blue
    
    # Install root dependencies
    Write-Host "   Installing root dependencies..." -ForegroundColor Yellow
    npm install
    
    # Install workspace dependencies
    Write-Host "   Installing workspace dependencies..." -ForegroundColor Yellow
    
    # Services
    Get-ChildItem -Path "services" -Directory | ForEach-Object {
        Write-Host "     Installing $($_.Name)..." -ForegroundColor Cyan
        Set-Location $_.FullName
        npm install
        Set-Location $PSScriptRoot
    }
    
    # Apps
    Get-ChildItem -Path "apps" -Directory | ForEach-Object {
        Write-Host "     Installing $($_.Name)..." -ForegroundColor Cyan
        Set-Location $_.FullName
        npm install
        Set-Location $PSScriptRoot
    }
    
    # Packages
    Get-ChildItem -Path "packages" -Directory | ForEach-Object {
        Write-Host "     Installing $($_.Name)..." -ForegroundColor Cyan
        Set-Location $_.FullName
        npm install
        Set-Location $PSScriptRoot
    }
}

# Function to build Docker images
function Build-DockerImages {
    Write-Host "🐳 Building Docker images..." -ForegroundColor Blue
    
    try {
        # Build all services
        docker-compose build
        
        Write-Host "✅ Docker images built successfully" -ForegroundColor Green
    } catch {
        Write-Host "❌ Error building Docker images: $_" -ForegroundColor Red
        Write-Host "   Please check Docker is running and try again" -ForegroundColor Yellow
    }
}

# Function to start services
function Start-Services {
    Write-Host "🚀 Starting services..." -ForegroundColor Blue
    
    try {
        # Start database services first
        docker-compose up -d postgres redis mqtt-broker
        
        Write-Host "   Waiting for database to be ready..." -ForegroundColor Yellow
        Start-Sleep -Seconds 10
        
        # Start all services
        docker-compose up -d
        
        Write-Host "✅ All services started successfully" -ForegroundColor Green
        Write-Host "   🌐 Web App: http://localhost:3000" -ForegroundColor Cyan
        Write-Host "   🔐 Auth Service: http://localhost:3001" -ForegroundColor Cyan
        Write-Host "   💬 Chat Service: http://localhost:3002" -ForegroundColor Cyan
        Write-Host "   🛒 Marketplace: http://localhost:3003" -ForegroundColor Cyan
        Write-Host "   💰 Wallet Service: http://localhost:3004" -ForegroundColor Cyan
        Write-Host "   🤖 AI Service: http://localhost:3005" -ForegroundColor Cyan
        Write-Host "   📱 IoT Service: http://localhost:3006" -ForegroundColor Cyan
        Write-Host "   🚚 Delivery Service: http://localhost:3007" -ForegroundColor Cyan
        Write-Host "   💳 Payment Service: http://localhost:3008" -ForegroundColor Cyan
        Write-Host "   🏢 Admin Dashboard: http://localhost:3009" -ForegroundColor Cyan
        
    } catch {
        Write-Host "❌ Error starting services: $_" -ForegroundColor Red
    }
}

# Function to run database migrations
function Run-Migrations {
    Write-Host "🗄️  Running database migrations..." -ForegroundColor Blue
    
    try {
        # Wait for database to be ready
        Start-Sleep -Seconds 5
        
        # Run migrations
        npm run db:migrate
        
        Write-Host "✅ Database migrations completed" -ForegroundColor Green
    } catch {
        Write-Host "❌ Error running migrations: $_" -ForegroundColor Red
    }
}

# Main execution
Write-Host "🔍 Checking prerequisites..." -ForegroundColor Blue

$nodeOk = Test-NodeVersion
$npmOk = Test-NpmVersion
$dockerOk = Test-Docker
$gitOk = Test-Git

if ($nodeOk -and $npmOk -and $dockerOk -and $gitOk) {
    Write-Host "✅ All prerequisites are satisfied!" -ForegroundColor Green
    Write-Host ""
    
    # Ask user what to do
    Write-Host "What would you like to do?" -ForegroundColor Yellow
    Write-Host "1. Create environment files only" -ForegroundColor Cyan
    Write-Host "2. Install dependencies only" -ForegroundColor Cyan
    Write-Host "3. Build Docker images only" -ForegroundColor Cyan
    Write-Host "4. Start all services" -ForegroundColor Cyan
    Write-Host "5. Complete setup (everything)" -ForegroundColor Cyan
    Write-Host "6. Exit" -ForegroundColor Cyan
    
    $choice = Read-Host "Enter your choice (1-6)"
    
    switch ($choice) {
        "1" {
            Create-EnvironmentFiles
        }
        "2" {
            Install-Dependencies
        }
        "3" {
            Build-DockerImages
        }
        "4" {
            Start-Services
        }
        "5" {
            Write-Host "🚀 Running complete setup..." -ForegroundColor Green
            Create-EnvironmentFiles
            Install-Dependencies
            Build-DockerImages
            Start-Services
            Run-Migrations
        }
        "6" {
            Write-Host "👋 Setup cancelled. Goodbye!" -ForegroundColor Yellow
            exit
        }
        default {
            Write-Host "❌ Invalid choice. Exiting." -ForegroundColor Red
            exit
        }
    }
    
    Write-Host ""
    Write-Host "🎉 Setup completed successfully!" -ForegroundColor Green
    Write-Host "Next steps:" -ForegroundColor Yellow
    Write-Host "1. Check the services are running: docker-compose ps" -ForegroundColor Cyan
    Write-Host "2. View logs: docker-compose logs -f" -ForegroundColor Cyan
    Write-Host "3. Access web app: http://localhost:3000" -ForegroundColor Cyan
    Write-Host "4. Start development: npm run apps:dev" -ForegroundColor Cyan
    
} else {
    Write-Host ""
    Write-Host "❌ Prerequisites not satisfied. Please install missing components and run this script again." -ForegroundColor Red
    Write-Host ""
    Write-Host "Summary:" -ForegroundColor Yellow
    Write-Host "  Node.js: $(if($nodeOk) {'✅'} else {'❌'})" -ForegroundColor $(if($nodeOk) {'Green'} else {'Red'})
    Write-Host "  npm: $(if($npmOk) {'✅'} else {'❌'})" -ForegroundColor $(if($npmOk) {'Green'} else {'Red'})
    Write-Host "  Docker: $(if($dockerOk) {'✅'} else {'❌'})" -ForegroundColor $(if($dockerOk) {'Green'} else {'Red'})
    Write-Host "  Git: $(if($gitOk) {'✅'} else {'❌'})" -ForegroundColor $(if($gitOk) {'Green'} else {'Red'})
}
