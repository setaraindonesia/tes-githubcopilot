# Setaradapps Quick VPS Connect & Deploy
# Script sederhana untuk koneksi cepat ke VPS

Write-Host "🚀 Setaradapps Quick VPS Connect & Deploy" -ForegroundColor Green
Write-Host "===========================================" -ForegroundColor Green

# Get VPS details
$vpsIP = Read-Host "Enter VPS IP Address"
$username = Read-Host "Enter Username (default: root)" 
if ([string]::IsNullOrEmpty($username)) { $username = "root" }
$sshPort = Read-Host "Enter SSH Port (default: 22)"
if ([string]::IsNullOrEmpty($sshPort)) { $sshPort = 22 }

Write-Host ""
Write-Host "🔍 Testing connection to $username@$vpsIP port $sshPort..." -ForegroundColor Blue

# Test SSH connection
try {
    $result = ssh -o ConnectTimeout=10 -o BatchMode=yes -p $sshPort $username@$vpsIP "echo 'Connection successful'"
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ SSH connection successful!" -ForegroundColor Green
        Write-Host ""
        
        # Ask what to do
        Write-Host "What would you like to do?" -ForegroundColor Yellow
        Write-Host "1. Quick Deploy (Setup + Deploy)" -ForegroundColor Cyan
        Write-Host "2. Setup VPS Environment Only" -ForegroundColor Cyan
        Write-Host "3. Deploy Application Only" -ForegroundColor Cyan
        Write-Host "4. Check Status" -ForegroundColor Cyan
        Write-Host "5. Exit" -ForegroundColor Cyan
        
        $choice = Read-Host "Enter your choice (1-5)"
        
        if ($choice -eq "1") {
            Write-Host "🚀 Starting Quick Deploy..." -ForegroundColor Green
            
            # Setup environment
            Write-Host "🔧 Setting up VPS environment..." -ForegroundColor Blue
            ssh -p $sshPort $username@$vpsIP "apt update -y"
            ssh -p $sshPort $username@$vpsIP "apt upgrade -y"
            ssh -p $sshPort $username@$vpsIP "apt install -y curl wget git nano"
            ssh -p $sshPort $username@$vpsIP "curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -"
            ssh -p $sshPort $username@$vpsIP "apt-get install -y nodejs"
            ssh -p $sshPort $username@$vpsIP "curl -fsSL https://get.docker.com -o get-docker.sh"
            ssh -p $sshPort $username@$vpsIP "sh get-docker.sh"
            ssh -p $sshPort $username@$vpsIP "systemctl start docker"
            ssh -p $sshPort $username@$vpsIP "systemctl enable docker"
            ssh -p $sshPort $username@$vpsIP "curl -L 'https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)' -o /usr/local/bin/docker-compose"
            ssh -p $sshPort $username@$vpsIP "chmod +x /usr/local/bin/docker-compose"
            
            # Setup firewall
            ssh -p $sshPort $username@$vpsIP "ufw --force enable"
            ssh -p $sshPort $username@$vpsIP "ufw default deny incoming"
            ssh -p $sshPort $username@$vpsIP "ufw default allow outgoing"
            ssh -p $sshPort $username@$vpsIP "ufw allow 22/tcp"
            ssh -p $sshPort $username@$vpsIP "ufw allow 3000/tcp"
            ssh -p $sshPort $username@$vpsIP "ufw allow 3009/tcp"
            
            Write-Host "✅ Environment setup completed!" -ForegroundColor Green
            
            # Deploy application
            Write-Host "🚀 Deploying application..." -ForegroundColor Blue
            ssh -p $sshPort $username@$vpsIP "mkdir -p /opt/setaradapps"
            
            # Upload files
            Write-Host "📤 Uploading project files..." -ForegroundColor Blue
            scp -P $sshPort -r * $username@$vpsIP`:/opt/setaradapps/
            
            # Install and start
            ssh -p $sshPort $username@$vpsIP "cd /opt/setaradapps; npm install"
            ssh -p $sshPort $username@$vpsIP "cd /opt/setaradapps; cp services/auth-service/env.example .env"
            ssh -p $sshPort $username@$vpsIP "cd /opt/setaradapps; docker-compose build"
            ssh -p $sshPort $username@$vpsIP "cd /opt/setaradapps; docker-compose up -d"
            
            Write-Host "✅ Application deployed successfully!" -ForegroundColor Green
        }
        elseif ($choice -eq "2") {
            Write-Host "🔧 Setting up VPS environment..." -ForegroundColor Blue
            ssh -p $sshPort $username@$vpsIP "apt update -y"
            ssh -p $sshPort $username@$vpsIP "apt upgrade -y"
            ssh -p $sshPort $username@$vpsIP "apt install -y curl wget git nano"
            ssh -p $sshPort $username@$vpsIP "curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -"
            ssh -p $sshPort $username@$vpsIP "apt-get install -y nodejs"
            ssh -p $sshPort $username@$vpsIP "curl -fsSL https://get.docker.com -o get-docker.sh"
            ssh -p $sshPort $username@$vpsIP "sh get-docker.sh"
            ssh -p $sshPort $username@$vpsIP "systemctl start docker"
            ssh -p $sshPort $username@$vpsIP "systemctl enable docker"
            ssh -p $sshPort $username@$vpsIP "curl -L 'https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)' -o /usr/local/bin/docker-compose"
            ssh -p $sshPort $username@$vpsIP "chmod +x /usr/local/bin/docker-compose"
            Write-Host "✅ Environment setup completed!" -ForegroundColor Green
        }
        elseif ($choice -eq "3") {
            Write-Host "🚀 Deploying application..." -ForegroundColor Blue
            ssh -p $sshPort $username@$vpsIP "mkdir -p /opt/setaradapps"
            scp -P $sshPort -r * $username@$vpsIP`:/opt/setaradapps/
            ssh -p $sshPort $username@$vpsIP "cd /opt/setaradapps; npm install"
            ssh -p $sshPort $username@$vpsIP "cd /opt/setaradapps; cp services/auth-service/env.example .env"
            ssh -p $sshPort $username@$vpsIP "cd /opt/setaradapps; docker-compose build"
            ssh -p $sshPort $username@$vpsIP "cd /opt/setaradapps; docker-compose up -d"
            Write-Host "✅ Application deployed successfully!" -ForegroundColor Green
        }
        elseif ($choice -eq "4") {
            Write-Host "📊 Checking deployment status..." -ForegroundColor Blue
            ssh -p $sshPort $username@$vpsIP "cd /opt/setaradapps; docker-compose ps"
            Write-Host ""
            Write-Host "📝 Recent logs:" -ForegroundColor Blue
            ssh -p $sshPort $username@$vpsIP "cd /opt/setaradapps; docker-compose logs --tail=10"
        }
        elseif ($choice -eq "5") {
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
        Write-Host ""
        Write-Host "📚 Useful commands:" -ForegroundColor Yellow
        Write-Host "   Check status: ssh -p $sshPort $username@$vpsIP 'cd /opt/setaradapps; docker-compose ps'" -ForegroundColor Cyan
        Write-Host "   View logs: ssh -p $sshPort $username@$vpsIP 'cd /opt/setaradapps; docker-compose logs -f'" -ForegroundColor Cyan
        Write-Host "   Restart: ssh -p $sshPort $username@$vpsIP 'cd /opt/setaradapps; docker-compose restart'" -ForegroundColor Cyan
        
    } else {
        Write-Host "❌ SSH connection failed!" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Connection error: $_" -ForegroundColor Red
    Write-Host ""
    Write-Host "🔧 Troubleshooting tips:" -ForegroundColor Yellow
    Write-Host "   - Check if VPS IP is correct" -ForegroundColor White
    Write-Host "   - Verify SSH port (default: 22)" -ForegroundColor White
    Write-Host "   - Ensure VPS is running" -ForegroundColor White
    Write-Host "   - Check firewall settings" -ForegroundColor White
    Write-Host "   - Verify username and credentials" -ForegroundColor White
}
