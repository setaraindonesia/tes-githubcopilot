# Setaradapps Simple VPS Connect
# Script sederhana untuk koneksi VPS dengan auto-accept host key

Write-Host "🚀 Setaradapps Simple VPS Connect" -ForegroundColor Green
Write-Host "===================================" -ForegroundColor Green

# VPS Details
$vpsIP = "103.187.146.144"
$username = "root"
$sshPort = 22

Write-Host "🔍 Connecting to VPS..." -ForegroundColor Blue
Write-Host "   IP: $vpsIP" -ForegroundColor White
Write-Host "   User: $username" -ForegroundColor White
Write-Host "   Port: $sshPort" -ForegroundColor White
Write-Host ""

# Test connection with auto-accept host key
Write-Host "📡 Testing SSH connection..." -ForegroundColor Yellow
try {
    # Use ssh-keyscan to add host key automatically
    ssh-keyscan -H $vpsIP >> ~/.ssh/known_hosts 2>$null
    
    # Test connection
    $result = ssh -o ConnectTimeout=10 -o StrictHostKeyChecking=no -p $sshPort $username@$vpsIP "echo 'Connection successful'"
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ SSH connection successful!" -ForegroundColor Green
        Write-Host ""
        
        # Ask what to do
        Write-Host "What would you like to do?" -ForegroundColor Yellow
        Write-Host "1. Quick Deploy (Setup + Deploy)" -ForegroundColor Cyan
        Write-Host "2. Setup Environment Only" -ForegroundColor Cyan
        Write-Host "3. Deploy App Only" -ForegroundColor Cyan
        Write-Host "4. Exit" -ForegroundColor Cyan
        
        $choice = Read-Host "Enter your choice (1-4)"
        
        if ($choice -eq "1") {
            Write-Host "🚀 Starting Quick Deploy..." -ForegroundColor Green
            
            # Setup environment
            Write-Host "🔧 Setting up VPS environment..." -ForegroundColor Blue
            ssh -o StrictHostKeyChecking=no -p $sshPort $username@$vpsIP "apt update -y"
            ssh -o StrictHostKeyChecking=no -p $sshPort $username@$vpsIP "apt install -y curl wget git nano"
            ssh -o StrictHostKeyChecking=no -p $sshPort $username@$vpsIP "curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -"
            ssh -o StrictHostKeyChecking=no -p $sshPort $username@$vpsIP "apt-get install -y nodejs"
            ssh -o StrictHostKeyChecking=no -p $sshPort $username@$vpsIP "curl -fsSL https://get.docker.com -o get-docker.sh"
            ssh -o StrictHostKeyChecking=no -p $sshPort $username@$vpsIP "sh get-docker.sh"
            ssh -o StrictHostKeyChecking=no -p $sshPort $username@$vpsIP "systemctl start docker"
            ssh -o StrictHostKeyChecking=no -p $sshPort $username@$vpsIP "systemctl enable docker"
            
            Write-Host "✅ Environment setup completed!" -ForegroundColor Green
            
            # Deploy application
            Write-Host "🚀 Deploying application..." -ForegroundColor Blue
            ssh -o StrictHostKeyChecking=no -p $sshPort $username@$vpsIP "mkdir -p /opt/setaradapps"
            
            # Upload files
            Write-Host "📤 Uploading project files..." -ForegroundColor Blue
            scp -o StrictHostKeyChecking=no -P $sshPort -r * $username@$vpsIP`:/opt/setaradapps/
            
            # Install and start
            ssh -o StrictHostKeyChecking=no -p $sshPort $username@$vpsIP "cd /opt/setaradapps; npm install"
            ssh -o StrictHostKeyChecking=no -p $sshPort $username@$vpsIP "cd /opt/setaradapps; cp services/auth-service/env.example .env"
            ssh -o StrictHostKeyChecking=no -p $sshPort $username@$vpsIP "cd /opt/setaradapps; docker-compose build"
            ssh -o StrictHostKeyChecking=no -p $sshPort $username@$vpsIP "cd /opt/setaradapps; docker-compose up -d"
            
            Write-Host "✅ Application deployed successfully!" -ForegroundColor Green
        }
        elseif ($choice -eq "2") {
            Write-Host "🔧 Setting up VPS environment..." -ForegroundColor Blue
            ssh -o StrictHostKeyChecking=no -p $sshPort $username@$vpsIP "apt update -y"
            ssh -o StrictHostKeyChecking=no -p $sshPort $username@$vpsIP "apt install -y curl wget git nano"
            ssh -o StrictHostKeyChecking=no -p $sshPort $username@$vpsIP "curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -"
            ssh -o StrictHostKeyChecking=no -p $sshPort $username@$vpsIP "apt-get install -y nodejs"
            ssh -o StrictHostKeyChecking=no -p $sshPort $username@$vpsIP "curl -fsSL https://get.docker.com -o get-docker.sh"
            ssh -o StrictHostKeyChecking=no -p $sshPort $username@$vpsIP "sh get-docker.sh"
            ssh -o StrictHostKeyChecking=no -p $sshPort $username@$vpsIP "systemctl start docker"
            ssh -o StrictHostKeyChecking=no -p $sshPort $username@$vpsIP "systemctl enable docker"
            Write-Host "✅ Environment setup completed!" -ForegroundColor Green
        }
        elseif ($choice -eq "3") {
            Write-Host "🚀 Deploying application..." -ForegroundColor Blue
            ssh -o StrictHostKeyChecking=no -p $sshPort $username@$vpsIP "mkdir -p /opt/setaradapps"
            scp -o StrictHostKeyChecking=no -P $sshPort -r * $username@$vpsIP`:/opt/setaradapps/
            ssh -o StrictHostKeyChecking=no -p $sshPort $username@$vpsIP "cd /opt/setaradapps; npm install"
            ssh -o StrictHostKeyChecking=no -p $sshPort $username@$vpsIP "cd /opt/setaradapps; cp services/auth-service/env.example .env"
            ssh -o StrictHostKeyChecking=no -p $sshPort $username@$vpsIP "cd /opt/setaradapps; docker-compose build"
            ssh -o StrictHostKeyChecking=no -p $sshPort $username@$vpsIP "cd /opt/setaradapps; docker-compose up -d"
            Write-Host "✅ Application deployed successfully!" -ForegroundColor Green
        }
        elseif ($choice -eq "4") {
            Write-Host "👋 Goodbye!" -ForegroundColor Yellow
            exit
        }
        else {
            Write-Host "❌ Invalid choice. Exiting." -ForegroundColor Red
            exit
        }
        
        Write-Host ""
        Write-Host "🎉 Operation completed!" -ForegroundColor Green
        Write-Host ""
        Write-Host "🌐 Access your applications:" -ForegroundColor Cyan
        Write-Host "   Web App: http://$vpsIP:3000" -ForegroundColor White
        Write-Host "   Admin: http://$vpsIP:3009" -ForegroundColor White
        
    } else {
        Write-Host "❌ SSH connection failed!" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Connection error: $_" -ForegroundColor Red
    Write-Host ""
    Write-Host "🔧 Troubleshooting tips:" -ForegroundColor Yellow
    Write-Host "   - Check if VPS IP is correct" -ForegroundColor White
    Write-Host "   - Verify username and password" -ForegroundColor White
    Write-Host "   - Ensure VPS is running" -ForegroundColor White
}
