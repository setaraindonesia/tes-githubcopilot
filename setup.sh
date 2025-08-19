#!/bin/bash

echo "🚀 Setting up Setaradapps Development Environment..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker and try again."
    exit 1
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ and try again."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version 18+ is required. Current version: $(node -v)"
    exit 1
fi

echo "✅ Prerequisites check passed"

# Install root dependencies
echo "📦 Installing root dependencies..."
npm install

# Install service dependencies
echo "🔧 Installing service dependencies..."
cd services/auth-service && npm install && cd ../..
cd services/chat-service && npm install && cd ../..
cd services/marketplace-service && npm install && cd ../..
cd services/delivery-service && npm install && cd ../..
cd services/wallet-service && npm install && cd ../..
cd services/payment-service && npm install && cd ../..
cd services/ai-service && npm install && cd ../..
cd services/iot-service && npm install && cd ../..

# Install app dependencies
echo "📱 Installing app dependencies..."
cd apps/web && npm install && cd ../..
cd apps/mobile && npm install && cd ../..
cd apps/admin && npm install && cd ../..

# Install package dependencies
echo "📦 Installing package dependencies..."
cd packages/shared && npm install && cd ../..
cd packages/ui && npm install && cd ../..
cd packages/contracts && npm install && cd ../..

# Create environment files
echo "⚙️ Creating environment files..."
cp services/auth-service/env.example services/auth-service/.env
cp services/chat-service/env.example services/chat-service/.env
cp services/marketplace-service/env.example services/marketplace-service/.env
cp services/delivery-service/env.example services/delivery-service/.env
cp services/wallet-service/env.example services/wallet-service/.env
cp services/payment-service/env.example services/payment-service/.env
cp services/ai-service/env.example services/ai-service/.env
cp services/iot-service/env.example services/iot-service/.env

# Build Docker images
echo "🐳 Building Docker images..."
docker-compose build

echo "✅ Setup completed successfully!"
echo ""
echo "🚀 To start the development environment:"
echo "   npm run docker:up"
echo ""
echo "🔧 To stop the development environment:"
echo "   npm run docker:down"
echo ""
echo "📚 For more information, check the README.md files in each service directory."
