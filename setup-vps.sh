#!/bin/bash

# Setaradapps VPS Setup Script
# This script will set up the entire development environment on a VPS

echo "🚀 Setaradapps VPS Setup Script"
echo "================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}$1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check if running as root
if [ "$EUID" -ne 0 ]; then
    print_error "Please run as root (use sudo)"
    exit 1
fi

# Update system
print_status "Updating system packages..."
apt update && apt upgrade -y
print_success "System updated"

# Install essential packages
print_status "Installing essential packages..."
apt install -y curl wget git nano htop unzip software-properties-common apt-transport-https ca-certificates gnupg lsb-release
print_success "Essential packages installed"

# Install Node.js 18 LTS
print_status "Installing Node.js 18 LTS..."
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
apt-get install -y nodejs
print_success "Node.js installed: $(node --version)"

# Install npm if not included
if ! command -v npm &> /dev/null; then
    print_status "Installing npm..."
    apt install -y npm
fi
print_success "npm installed: $(npm --version)"

# Install Docker
print_status "Installing Docker..."
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh
usermod -aG docker $USER
systemctl start docker
systemctl enable docker
print_success "Docker installed: $(docker --version)"

# Install Docker Compose
print_status "Installing Docker Compose..."
curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose
print_success "Docker Compose installed: $(docker-compose --version)"

# Install Nginx (for reverse proxy)
print_status "Installing Nginx..."
apt install -y nginx
systemctl start nginx
systemctl enable nginx
print_success "Nginx installed and started"

# Setup firewall
print_status "Setting up firewall..."
ufw --force enable
ufw default deny incoming
ufw default allow outgoing
ufw allow 22/tcp    # SSH
ufw allow 80/tcp    # HTTP
ufw allow 443/tcp   # HTTPS
ufw allow 3000/tcp  # Web App
ufw allow 3009/tcp  # Admin Dashboard
print_success "Firewall configured"

# Create application directory
print_status "Setting up application directory..."
mkdir -p /opt/setaradapps
cd /opt/setaradapps

# Clone repository (if git URL provided)
if [ ! -z "$1" ]; then
    print_status "Cloning repository from $1..."
    git clone $1 .
    print_success "Repository cloned"
else
    print_warning "No repository URL provided. Please clone manually to /opt/setaradapps"
fi

# Create environment file
print_status "Creating environment file..."
cat > .env << EOF
# Setaradapps Environment Configuration for VPS
NODE_ENV=production

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

# Allowed Origins (update with your VPS IP or domain)
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3009
EOF
print_success "Environment file created"

# Setup Nginx reverse proxy
print_status "Setting up Nginx reverse proxy..."
cat > /etc/nginx/sites-available/setaradapps << EOF
server {
    listen 80;
    server_name _;

    # Web App
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }

    # Admin Dashboard
    location /admin {
        proxy_pass http://localhost:3009;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }

    # API Services
    location /api/ {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}
EOF

# Enable site
ln -sf /etc/nginx/sites-available/setaradapps /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl reload nginx
print_success "Nginx reverse proxy configured"

# Create systemd service for auto-start
print_status "Creating systemd service..."
cat > /etc/systemd/system/setaradapps.service << EOF
[Unit]
Description=Setaradapps Application
After=docker.service
Requires=docker.service

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=/opt/setaradapps
ExecStart=/usr/local/bin/docker-compose up -d
ExecStop=/usr/local/bin/docker-compose down
TimeoutStartSec=0

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
systemctl enable setaradapps.service
print_success "Systemd service created and enabled"

# Print completion message
echo ""
print_success "VPS Setup Completed!"
echo ""
echo "🌐 Access your applications:"
echo "   Web App: http://$(curl -s ifconfig.me)"
echo "   Admin: http://$(curl -s ifconfig.me)/admin"
echo ""
echo "📁 Application directory: /opt/setaradapps"
echo "🐳 Docker services: docker-compose up -d"
echo "📊 Service status: systemctl status setaradapps"
echo "📝 Logs: docker-compose logs -f"
echo ""
echo "🔧 Next steps:"
echo "   1. Clone your repository to /opt/setaradapps"
echo "   2. Run: docker-compose up -d"
echo "   3. Configure your domain (optional)"
echo "   4. Setup SSL certificate (optional)"
echo ""
echo "Happy coding! 🚀"
