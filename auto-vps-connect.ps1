# Setaradapps Auto VPS Connect
# Script untuk koneksi otomatis ke VPS

Write-Host "🚀 Setaradapps Auto VPS Connect" -ForegroundColor Green
Write-Host "=================================" -ForegroundColor Green

# VPS Details
$vpsIP = "103.187.146.144"
$username = "root"
$password = "Setara020294##"
$sshPort = 22

Write-Host "🔍 Connecting to VPS..." -ForegroundColor Blue
Write-Host "   IP: $vpsIP" -ForegroundColor White
Write-Host "   User: $username" -ForegroundColor White
Write-Host "   Port: $sshPort" -ForegroundColor White
Write-Host ""

# Test connection
Write-Host "📡 Testing SSH connection..." -ForegroundColor Yellow

# Method 1: Try using sshpass if available
try {
    if (Get-Command "sshpass" -ErrorAction SilentlyContinue) {
        Write-Host "✅ sshpass found, using automatic login..." -ForegroundColor Green
        $result = sshpass -p $password ssh -o ConnectTimeout=10 -o StrictHostKeyChecking=no -p $sshPort $username@$vpsIP "echo 'Connection successful'"
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ SSH connection successful!" -ForegroundColor Green
            Start-AutoDeploy
        }
    } else {
        Write-Host "⚠️  sshpass not found, using manual method..." -ForegroundColor Yellow
        Start-ManualDeploy
    }
} catch {
    Write-Host "⚠️  sshpass method failed, using manual method..." -ForegroundColor Yellow
    Start-ManualDeploy
}

function Start-AutoDeploy {
    Write-Host ""
    Write-Host "🚀 Starting Auto Deploy..." -ForegroundColor Green
    
    # Setup environment
    Write-Host "🔧 Setting up VPS environment..." -ForegroundColor Blue
    sshpass -p $password ssh -o StrictHostKeyChecking=no -p $sshPort $username@$vpsIP "apt update -y"
    sshpass -p $password ssh -o StrictHostKeyChecking=no -p $sshPort $username@$vpsIP "apt install -y curl wget git nano"
    sshpass -p $password ssh -o StrictHostKeyChecking=no -p $sshPort $username@$vpsIP "curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -"
    sshpass -p $password ssh -o StrictHostKeyChecking=no -p $sshPort $username@$vpsIP "apt-get install -y nodejs"
    sshpass -p $password ssh -o StrictHostKeyChecking=no -p $sshPort $username@$vpsIP "curl -fsSL https://get.docker.com -o get-docker.sh"
    sshpass -p $password ssh -o StrictHostKeyChecking=no -p $sshPort $username@$vpsIP "sh get-docker.sh"
    sshpass -p $password ssh -o StrictHostKeyChecking=no -p $sshPort $username@$vpsIP "systemctl start docker"
    sshpass -p $password ssh -o StrictHostKeyChecking=no -p $sshPort $username@$vpsIP "systemctl enable docker"
    
    Write-Host "✅ Environment setup completed!" -ForegroundColor Green
    
    # Deploy application
    Write-Host "🚀 Deploying application..." -ForegroundColor Blue
    sshpass -p $password ssh -o StrictHostKeyChecking=no -p $sshPort $username@$vpsIP "mkdir -p /opt/setaradapps"
    
    # Upload files
    Write-Host "📤 Uploading project files..." -ForegroundColor Blue
    sshpass -p $password scp -o StrictHostKeyChecking=no -P $sshPort -r * $username@$vpsIP`:/opt/setaradapps/
    
    # Install and start
    sshpass -p $password ssh -o StrictHostKeyChecking=no -p $sshPort $username@$vpsIP "cd /opt/setaradapps; npm install"
    sshpass -p $password ssh -o StrictHostKeyChecking=no -p $sshPort $username@$vpsIP "cd /opt/setaradapps; cp services/auth-service/env.example .env"
    sshpass -p $password ssh -o StrictHostKeyChecking=no -p $sshPort $username@$vpsIP "cd /opt/setaradapps; docker-compose build"
    sshpass -p $password ssh -o StrictHostKeyChecking=no -p $sshPort $username@$vpsIP "cd /opt/setaradapps; docker-compose up -d"
    
    Write-Host "✅ Application deployed successfully!" -ForegroundColor Green
    Show-SuccessMessage
}

function Start-ManualDeploy {
    Write-Host ""
    Write-Host "📋 Manual Deployment Instructions:" -ForegroundColor Yellow
    Write-Host "=================================" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "1. Open a new terminal and run:" -ForegroundColor Cyan
    Write-Host "   ssh root@$vpsIP" -ForegroundColor White
    Write-Host ""
    Write-Host "2. Enter password when prompted:" -ForegroundColor Cyan
    Write-Host "   $password" -ForegroundColor White
    Write-Host ""
    Write-Host "3. After successful login, run these commands:" -ForegroundColor Cyan
    Write-Host "   # Update system" -ForegroundColor White
    Write-Host "   apt update -y" -ForegroundColor White
    Write-Host "   apt upgrade -y" -ForegroundColor White
    Write-Host ""
    Write-Host "   # Install Node.js" -ForegroundColor White
    Write-Host "   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -" -ForegroundColor White
    Write-Host "   apt-get install -y nodejs" -ForegroundColor White
    Write-Host ""
    Write-Host "   # Install Docker" -ForegroundColor White
    Write-Host "   curl -fsSL https://get.docker.com -o get-docker.sh" -ForegroundColor White
    Write-Host "   sh get-docker.sh" -ForegroundColor White
    Write-Host "   systemctl start docker" -ForegroundColor White
    Write-Host "   systemctl enable docker" -ForegroundColor White
    Write-Host ""
    Write-Host "4. In a new terminal (from your local machine), upload files:" -ForegroundColor Cyan
    Write-Host "   scp -r * root@$vpsIP:/opt/setaradapps/" -ForegroundColor White
    Write-Host ""
    Write-Host "5. Back in VPS terminal, deploy app:" -ForegroundColor Cyan
    Write-Host "   cd /opt/setaradapps" -ForegroundColor White
    Write-Host "   npm install" -ForegroundColor White
    Write-Host "   cp services/auth-service/env.example .env" -ForegroundColor White
    Write-Host "   docker-compose build" -ForegroundColor White
    Write-Host "   docker-compose up -d" -ForegroundColor White
}

function Show-SuccessMessage {
    Write-Host ""
    Write-Host "🎉 Deployment completed successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "🌐 Access your applications:" -ForegroundColor Cyan
    Write-Host "   Web App: http://$vpsIP:3000" -ForegroundColor White
    Write-Host "   Admin: http://$vpsIP:3009" -ForegroundColor White
    Write-Host ""
    Write-Host "📚 Useful commands:" -ForegroundColor Yellow
    Write-Host "   Check status: ssh root@$vpsIP 'cd /opt/setaradapps; docker-compose ps'" -ForegroundColor Cyan
    Write-Host "   View logs: ssh root@$vpsIP 'cd /opt/setaradapps; docker-compose logs -f'" -ForegroundColor Cyan
}
