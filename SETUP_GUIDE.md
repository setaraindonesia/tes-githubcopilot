# 🚀 Setaradapps Complete Setup Guide

## 📋 **Overview**
Guide lengkap untuk setup development environment Setaradapps di Windows.

## 🔧 **Prerequisites (Yang Harus Diinstall Dulu)**

### **1. Node.js (Wajib)**
- **Download**: https://nodejs.org/en/
- **Version**: LTS (Long Term Support) - minimal Node.js 18+
- **Install**: Download installer, run dengan default settings
- **Restart**: Restart PowerShell setelah install

### **2. Docker Desktop (Wajib)**
- **Download**: https://www.docker.com/products/docker-desktop/
- **Install**: Download installer, run dengan default settings
- **WSL2**: Enable WSL2 jika diminta
- **Restart**: Restart komputer setelah install
- **Start**: Buka Docker Desktop dan pastikan running

### **3. Git (Wajib)**
- **Download**: https://git-scm.com/
- **Install**: Download installer, run dengan default settings
- **Restart**: Restart PowerShell setelah install

### **4. Visual Studio Code (Recommended)**
- **Download**: https://code.visualstudio.com/
- **Extensions**: Install extensions untuk TypeScript, React, Next.js

## 🚀 **Setup Methods**

### **Method 1: Automated Setup (Recommended)**
```powershell
# Run the complete setup script
powershell -ExecutionPolicy Bypass -File setup-complete.ps1
```

### **Method 2: Manual Setup**
```powershell
# 1. Install dependencies
npm install

# 2. Create environment files
npm run setup:win

# 3. Start Docker services
npm run docker:up

# 4. Run database migrations
npm run db:migrate
```

### **Method 3: Step by Step**
```powershell
# Step 1: Check prerequisites
node --version
npm --version
docker --version
git --version

# Step 2: Install root dependencies
npm install

# Step 3: Install workspace dependencies
npm run setup:win

# Step 4: Build Docker images
docker-compose build

# Step 5: Start services
docker-compose up -d

# Step 6: Run migrations
npm run db:migrate
```

## 📁 **Project Structure After Setup**

```
setaradapps/
├── 📱 apps/
│   ├── web/                    # Next.js Web App
│   │   ├── src/app/           # App Router
│   │   ├── public/            # Static Assets
│   │   └── package.json       # Dependencies
│   ├── mobile/                 # React Native App
│   │   ├── src/               # Source Code
│   │   └── package.json       # Dependencies
│   └── admin/                  # Admin Dashboard
│       ├── src/app/           # Admin App Router
│       └── package.json       # Dependencies
├── 🔧 packages/
│   ├── shared/                 # Shared utilities
│   ├── ui/                     # Design system
│   └── contracts/              # Smart contracts
├── 🏢 services/
│   ├── auth-service/           # Authentication
│   ├── chat-service/           # Real-time messaging
│   ├── marketplace-service/    # B2B/B2C marketplace
│   ├── delivery-service/       # Driver & delivery
│   ├── wallet-service/         # Multi-currency wallet
│   ├── payment-service/        # P2P payments
│   ├── ai-service/             # AI agents
│   └── iot-service/            # IoT integration
├── 🗄️ database/
│   ├── migrations/             # Database migrations
│   └── seeds/                  # Database seeds
├── 🔐 security/
│   ├── encryption/             # Encryption utilities
│   └── audit/                  # Audit logs
├── 📚 docs/                    # Documentation
├── ⚙️ config/                  # Configuration files
├── .env                        # Environment variables
├── docker-compose.yml          # Docker services
└── package.json                # Root dependencies
```

## 🌐 **Services & Ports**

| Service | Port | URL | Description |
|---------|------|-----|-------------|
| Web App | 3000 | http://localhost:3000 | Main web application |
| Auth Service | 3001 | http://localhost:3001 | Authentication & users |
| Chat Service | 3002 | http://localhost:3002 | Real-time messaging |
| Marketplace | 3003 | http://localhost:3003 | B2B/B2C marketplace |
| Wallet Service | 3004 | http://localhost:3004 | Multi-currency wallet |
| AI Service | 3005 | http://localhost:3005 | AI agents & automation |
| IoT Service | 3006 | http://localhost:3006 | IoT device integration |
| Delivery Service | 3007 | http://localhost:3007 | Driver & delivery |
| Payment Service | 3008 | http://localhost:3008 | P2P payments |
| Admin Dashboard | 3009 | http://localhost:3009 | Admin panel |
| PostgreSQL | 5432 | localhost:5432 | Database |
| Redis | 6379 | localhost:6379 | Cache & sessions |
| MQTT Broker | 1883 | localhost:1883 | IoT communication |

## 🗄️ **Database Setup**

### **PostgreSQL**
- **Database**: setaradapps
- **Username**: setaradapps
- **Password**: setaradapps123
- **Port**: 5432

### **Redis**
- **Port**: 6379
- **No authentication required** (development)

### **MQTT Broker**
- **Port**: 1883
- **WebSocket**: 9001
- **No authentication required** (development)

## 🔐 **Environment Variables**

### **Root .env**
```bash
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
```

## 🚀 **Development Commands**

### **Start Development Environment**
```bash
# Start all services
npm run docker:up

# Start specific services
npm run services:dev    # Backend services only
npm run apps:dev        # Frontend apps only

# View logs
npm run docker:logs

# Restart services
npm run docker:restart
```

### **Database Management**
```bash
# Run migrations
npm run db:migrate

# Seed database
npm run db:seed

# Reset database
npm run db:reset
```

### **Build & Deploy**
```bash
# Build all packages
npm run packages:build

# Build specific workspace
cd apps/web && npm run build
cd services/auth-service && npm run build
```

## 🐛 **Troubleshooting**

### **Common Issues**

#### **1. Docker not running**
```bash
# Start Docker Desktop
# Check if Docker is running
docker --version
docker info
```

#### **2. Port already in use**
```bash
# Check what's using the port
netstat -ano | findstr :3000

# Kill the process
taskkill /PID <PID> /F
```

#### **3. Database connection failed**
```bash
# Check if PostgreSQL is running
docker-compose ps postgres

# Check logs
docker-compose logs postgres

# Restart database
docker-compose restart postgres
```

#### **4. Node modules issues**
```bash
# Clear node modules and reinstall
Remove-Item -Recurse -Force node_modules
Remove-Item package-lock.json
npm install
```

#### **5. TypeScript errors**
```bash
# Check TypeScript config
npx tsc --noEmit

# Clear TypeScript cache
Remove-Item -Recurse -Force .next
Remove-Item -Recurse -Force dist
```

## 📱 **Mobile Development**

### **React Native Setup**
```bash
# Install React Native CLI
npm install -g @react-native-community/cli

# Start Metro bundler
cd apps/mobile
npm start

# Run on Android
npm run android

# Run on iOS (macOS only)
npm run ios
```

### **Prerequisites for Mobile**
- **Android**: Android Studio, Android SDK
- **iOS**: Xcode (macOS only), CocoaPods

## 🔗 **Useful Links**

### **Documentation**
- [Next.js Documentation](https://nextjs.org/docs)
- [NestJS Documentation](https://docs.nestjs.com/)
- [React Native Documentation](https://reactnative.dev/docs/getting-started)
- [Prisma Documentation](https://www.prisma.io/docs/)
- [Docker Documentation](https://docs.docker.com/)

### **Tools**
- [Node.js](https://nodejs.org/)
- [Docker Desktop](https://www.docker.com/products/docker-desktop/)
- [Git](https://git-scm.com/)
- [VS Code](https://code.visualstudio.com/)

## 🎯 **Next Steps After Setup**

### **1. Explore the Codebase**
- Check out the web app: http://localhost:3000
- Explore the admin dashboard: http://localhost:3009
- Review the API documentation

### **2. Start Development**
- Pick a feature to work on
- Create a new branch: `git checkout -b feature/your-feature`
- Make changes and test locally
- Commit and push: `git push origin feature/your-feature`

### **3. Learn the Architecture**
- Study the microservices structure
- Understand the database schema
- Review the smart contracts
- Explore the UI components

### **4. Contribute**
- Report bugs
- Suggest features
- Submit pull requests
- Help with documentation

## 🎉 **Congratulations!**

You've successfully set up the Setaradapps development environment! 

**Happy coding! 🚀**
