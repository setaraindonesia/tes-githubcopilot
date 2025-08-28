@echo off
echo 🚀 Starting Chat Service...
echo.

cd services\chat-service
echo 📁 Changed to chat-service directory
echo.

echo 🔧 Starting NestJS chat service with watch mode...
npm run start:dev

echo.
echo 🎉 Chat service startup attempted!
echo.
echo 📋 If successful, you should see:
echo - Chat Service running on port 3004
echo - WebSocket server active
echo - Database connections established
echo.
pause

