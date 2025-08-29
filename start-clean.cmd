@echo off
echo ===========================================
echo 🧹 CLEAN STARTUP - CHAT TESTING
echo ===========================================

echo.
echo 🛑 Killing existing Node processes...
taskkill /f /im node.exe 2>nul

echo.
echo ⏱️ Waiting 2 seconds...
timeout /t 2 /nobreak >nul

echo.
echo 🚀 Starting Auth Service (port 3002)...
start "Auth Service" cmd /k "cd services\auth-service && npm run start:dev"

echo.
echo ⏱️ Waiting 5 seconds for auth service...
timeout /t 5 /nobreak >nul

echo.
echo 🌐 Starting Web App (port 3000)...
start "Web App" cmd /k "cd apps\web && npm run dev:port1"

echo.
echo ✅ SERVICES STARTING!
echo.
echo 📋 Next Steps:
echo 1. Wait for both services to start (check their windows)
echo 2. Open http://localhost:3000 in 2 browsers
echo 3. Login user1 and user2
echo 4. Test chat functionality
echo.
echo 🔧 If issues: Close all cmd windows and run this script again
echo.
pause


