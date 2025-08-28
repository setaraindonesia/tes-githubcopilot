@echo off
echo 🚀 Starting Chat Testing Environment...
echo.

echo 📋 This will start 4 services:
echo   - Auth Service (port 3002)
echo   - Chat Service (port 3002) 
echo   - Web App User1 (port 3000)
echo   - Web App User2 (port 3001)
echo.

echo ⚠️  Make sure to run these commands in separate terminals:
echo.

echo Terminal 1: Auth/Chat Service
echo cd services/auth-service
echo npm run start:dev
echo.

echo Terminal 2: Chat Service  
echo cd services/chat-service
echo npm run start:dev
echo.

echo Terminal 3: Web App Port 3000
echo cd apps/web
echo npm run dev:port1
echo.

echo Terminal 4: Web App Port 3001
echo cd apps/web  
echo npm run dev:port2
echo.

echo Terminal 5: Create Test Users
echo cd services/auth-service
echo npm run seed
echo.

echo 📋 After all services are running:
echo 1. Open: http://localhost:3000/chat-test
echo 2. Open: http://localhost:3001/chat-test  
echo 3. Login as user1 in first tab
echo 4. Login as user2 in second tab
echo 5. Use same conversation ID and start chatting!
echo.

pause

