# Setaradapps VPS Connection & Deployment Script
# Script untuk koneksi ke VPS dan deploy project

param(
    [Parameter(Mandatory=$true)]
    [string]$VpsIP,
    
    [Parameter(Mandatory=$true)]
    [string]$Username = "root",
    
    [Parameter(Mandatory=$false)]
    [string]$Password,
    
    [Parameter(Mandatory=$false)]
    [int]$SSHPort = 22
)

Write-Host "🚀 Setaradapps VPS Connection & Deployment" -ForegroundColor Green
Write-Host "=============================================" -ForegroundColor Green

# Function to check if command exists
function Test-Command($cmdname) {
    return [bool](Get-Command -Name $cmdname -ErrorAction SilentlyContinue)
}

# Function to test SSH connection
function Test-SSHConnection {
    param($ip, $port, $user)
    
    Write-Host "🔍 Testing SSH connection to $user@$ip:$port..." -ForegroundColor Blue
    
    try {
        # Test connection with timeout
        $result = ssh -o ConnectTimeout=10 -o BatchMode=yes -p $port $user@$ip "echo 'Connection successful'"
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ SSH connection successful!" -ForegroundColor Green
            return $true
        } else {
            Write-Host "❌ SSH connection failed!" -ForegroundColor Red
            return $false
        }
    } catch {
        Write-Host "❌ SSH connection error: $_" -ForegroundColor Red
        return $false
    }
}

# Function to upload files to VPS
function Upload-ToVPS {
    param($ip, $port, $user, $localPath, $remotePath)
    
    Write-Host "📤 Uploading files to VPS..." -ForegroundColor Blue
    
    try {
        # Create remote directory
        ssh -p $port $user@$ip "mkdir -p $remotePath"
        
        # Upload files using scp
        scp -P $port -r $localPath/* $user@$ip`:$remotePath/
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ Files uploaded successfully!" -ForegroundColor Green
            return $true
        } else {
            Write-Host "❌ File upload failed!" -ForegroundColor Red
            return $false
        }
    } catch {
        Write-Host "❌ Upload error: $_" -ForegroundColor Red
        return $false
    }
}

# Function to run remote commands
function Invoke-RemoteCommand {
    param($ip, $port, $user, $command, $description)
    
    Write-Host "🔄 $description..." -ForegroundColor Blue
    Write-Host "   Command: $command" -ForegroundColor Gray
    
    try {
        $result = ssh -p $port $user@$ip $command
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ $description completed successfully!" -ForegroundColor Green
            return $result
        } else {
            Write-Host "❌ $description failed!" -ForegroundColor Red
            return $null
        }
    } catch {
        Write-Host "❌ Remote command error: $_" -ForegroundColor Red
        return $null
    }
}

# Function to setup VPS environment
function Setup-VPSEnvironment {
    param($ip, $port, $user)
    
    Write-Host "🔧 Setting up VPS environment..." -ForegroundColor Blue
    
    # Update system
    Invoke-RemoteCommand -ip $ip -port $port -user $user -command "apt update && apt upgrade -y" -description "Updating system packages"
    
    # Install essential packages
    Invoke-RemoteCommand -ip $ip -port $port -user $user -command "apt install -y curl wget git nano htop unzip software-properties-common" -description "Installing essential packages"
    
    # Install Node.js 18 LTS
    Invoke-RemoteCommand -ip $ip -port $port -user $user -command "curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -" -description "Adding Node.js repository"
    Invoke-RemoteCommand -ip $ip -port $port -user $user -command "apt-get install -y nodejs" -description "Installing Node.js"
    
    # Install Docker
    Invoke-RemoteCommand -ip $ip -port $port -user $user -command "curl -fsSL https://get.docker.com -o get-docker.sh" -description "Downloading Docker installer"
    Invoke-RemoteCommand -ip $ip -port $port -user $user -command "sh get-docker.sh" -description "Installing Docker"
    Invoke-RemoteCommand -ip $ip -port $port -user $user -command "systemctl start docker && systemctl enable docker" -description "Starting Docker service"
    
    # Install Docker Compose
    Invoke-RemoteCommand -ip $ip -port $port -user $user -command "curl -L 'https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)' -o /usr/local/bin/docker-compose" -description "Installing Docker Compose"
    Invoke-RemoteCommand -ip $ip -port $port -user $user -command "chmod +x /usr/local/bin/docker-compose" -description "Making Docker Compose executable"
    
    # Setup firewall
    Invoke-RemoteCommand -ip $ip -port $port -user $user -command "ufw --force enable" -description "Enabling firewall"
    Invoke-RemoteCommand -ip $ip -port $port -user $user -command "ufw default deny incoming" -description "Setting firewall defaults"
    Invoke-RemoteCommand -ip $ip -port $port -user $user -command "ufw default allow outgoing" -description "Allowing outgoing traffic"
    Invoke-RemoteCommand -ip $ip -port $port -user $user -command "ufw allow 22/tcp" -description "Allowing SSH"
    Invoke-RemoteCommand -ip $ip -port $port -user $user -command "ufw allow 3000/tcp" -description "Allowing Web App port"
    Invoke-RemoteCommand -ip $ip -port $port -user $user -command "ufw allow 3009/tcp" -description "Allowing Admin port"
    
    Write-Host "✅ VPS environment setup completed!" -ForegroundColor Green
}

# Function to deploy application
function Deploy-Application {
    param($ip, $port, $user)
    
    Write-Host "🚀 Deploying application to VPS..." -ForegroundColor Blue
    
    # Create application directory
    Invoke-RemoteCommand -ip $ip -port $port -user $user -command "mkdir -p /opt/setaradapps" -description "Creating application directory"
    
    # Upload project files
    $localPath = Get-Location
    $remotePath = "/opt/setaradapps"
    
    if (Upload-ToVPS -ip $ip -port $port -user $user -localPath $localPath -remotePath $remotePath) {
        # Install dependencies
        Invoke-RemoteCommand -ip $ip -port $port -user $user -command "cd /opt/setaradapps && npm install" -description "Installing Node.js dependencies"
        
        # Create environment file
        Invoke-RemoteCommand -ip $ip -port $port -user $user -command "cd /opt/setaradapps && cp services/auth-service/env.example .env" -description "Creating environment file"
        
        # Build and start Docker services
        Invoke-RemoteCommand -ip $ip -port $port -user $user -command "cd /opt/setaradapps && docker-compose build" -description "Building Docker images"
        Invoke-RemoteCommand -ip $ip -port $port -user $user -command "cd /opt/setaradapps && docker-compose up -d" -description "Starting Docker services"
        
        Write-Host "✅ Application deployed successfully!" -ForegroundColor Green
    } else {
        Write-Host "❌ Application deployment failed!" -ForegroundColor Red
    }
}

# Function to check deployment status
function Check-DeploymentStatus {
    param($ip, $port, $user)
    
    Write-Host "📊 Checking deployment status..." -ForegroundColor Blue
    
    # Check Docker services
    $services = Invoke-RemoteCommand -ip $ip -port $port -user $user -command "cd /opt/setaradapps && docker-compose ps" -description "Checking Docker services status"
    
    # Check application logs
    $logs = Invoke-RemoteCommand -ip $ip -port $port -user $user -command "cd /opt/setaradapps && docker-compose logs --tail=10" -description "Checking application logs"
    
    Write-Host "✅ Deployment status checked!" -ForegroundColor Green
}

# Main execution
Write-Host "🔍 Checking prerequisites..." -ForegroundColor Blue

# Check if SSH is available
if (!(Test-Command "ssh")) {
    Write-Host "❌ SSH client not found! Please install OpenSSH or use Windows Subsystem for Linux." -ForegroundColor Red
    exit 1
}

# Check if SCP is available
if (!(Test-Command "scp")) {
    Write-Host "❌ SCP client not found! Please install OpenSSH or use Windows Subsystem for Linux." -ForegroundColor Red
    exit 1
}

Write-Host "✅ Prerequisites satisfied!" -ForegroundColor Green
Write-Host ""

# Test SSH connection
if (Test-SSHConnection -ip $VpsIP -port $SSHPort -user $Username) {
    Write-Host ""
    Write-Host "🚀 Starting VPS setup and deployment..." -ForegroundColor Green
    
    # Ask user what to do
    Write-Host ""
    Write-Host "What would you like to do?" -ForegroundColor Yellow
    Write-Host "1. Setup VPS environment only" -ForegroundColor Cyan
    Write-Host "2. Deploy application only" -ForegroundColor Cyan
    Write-Host "3. Complete setup and deployment" -ForegroundColor Cyan
    Write-Host "4. Check deployment status" -ForegroundColor Cyan
    Write-Host "5. Exit" -ForegroundColor Cyan
    
    $choice = Read-Host "Enter your choice (1-5)"
    
    switch ($choice) {
        "1" {
            Setup-VPSEnvironment -ip $VpsIP -port $SSHPort -user $Username
        }
        "2" {
            Deploy-Application -ip $VpsIP -port $SSHPort -user $Username
        }
        "3" {
            Write-Host "🚀 Running complete setup and deployment..." -ForegroundColor Green
            Setup-VPSEnvironment -ip $VpsIP -port $SSHPort -user $Username
            Deploy-Application -ip $VpsIP -port $SSHPort -user $Username
        }
        "4" {
            Check-DeploymentStatus -ip $VpsIP -port $SSHPort -user $Username
        }
        "5" {
            Write-Host "👋 Operation cancelled. Goodbye!" -ForegroundColor Yellow
            exit
        }
        default {
            Write-Host "❌ Invalid choice. Exiting." -ForegroundColor Red
            exit
        }
    }
    
    Write-Host ""
    Write-Host "🎉 Operation completed successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "🌐 Access your applications:" -ForegroundColor Cyan
    Write-Host "   Web App: http://$VpsIP:3000" -ForegroundColor White
    Write-Host "   Admin: http://$VpsIP:3009" -ForegroundColor White
    Write-Host ""
    Write-Host "📚 Next steps:" -ForegroundColor Yellow
    Write-Host "   1. Check services: ssh -p $SSHPort $Username@$VpsIP 'cd /opt/setaradapps && docker-compose ps'" -ForegroundColor Cyan
    Write-Host "   2. View logs: ssh -p $SSHPort $Username@$VpsIP 'cd /opt/setaradapps && docker-compose logs -f'" -ForegroundColor Cyan
    Write-Host "   3. Access web app: http://$VpsIP:3000" -ForegroundColor Cyan
    
} else {
    Write-Host ""
    Write-Host "❌ Cannot connect to VPS. Please check:" -ForegroundColor Red
    Write-Host "   - VPS IP address is correct" -ForegroundColor Yellow
    Write-Host "   - SSH port is correct (default: 22)" -ForegroundColor Yellow
    Write-Host "   - Username is correct" -ForegroundColor Yellow
    Write-Host "   - VPS is running and accessible" -ForegroundColor Yellow
    Write-Host "   - Firewall allows SSH connections" -ForegroundColor Yellow
}
