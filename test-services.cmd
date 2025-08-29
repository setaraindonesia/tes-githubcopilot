@echo off
echo 🚀 RAILWAY SERVICES HEALTH CHECK
echo ================================

set /p authUrl="Enter Auth Service URL: "
set /p chatUrl="Enter Chat Service URL: "

echo.
echo 🔍 Testing services...
echo.

if defined authUrl (
    echo Testing Auth Service: %authUrl%/api/v1/health
    curl -s "%authUrl%/api/v1/health" 2>nul
    if errorlevel 1 (
        echo ❌ Auth Service: FAILED
    ) else (
        echo ✅ Auth Service: SUCCESS
    )
    echo.
)

if defined chatUrl (
    echo Testing Chat Service: %chatUrl%/api/v1/chat/health
    curl -s "%chatUrl%/api/v1/chat/health" 2>nul
    if errorlevel 1 (
        echo ❌ Chat Service: FAILED
    ) else (
        echo ✅ Chat Service: SUCCESS
    )
    echo.
)

echo 📊 Testing complete!
echo.
echo 📋 Next steps if successful:
echo 1. Update Vercel environment variables
echo 2. Test chat functionality end-to-end
echo 3. Chat app is ready! 🎉

pause
