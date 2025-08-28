# 🚀 Manual Start Chat Service

## Steps to Start Chat Service:

### Option 1: Manual Command
1. Open PowerShell
2. Run these commands one by one:
```powershell
cd services\chat-service
npm run start:dev
```

### Option 2: Use Batch File
1. Double-click `start-chat-service.cmd`
2. Wait for service to start

### Option 3: PowerShell with Semicolon
```powershell
cd services\chat-service; npm run start:dev
```

## ✅ Success Indicators:
- Port 3004 active
- "Chat Service is running on: http://localhost:3004"
- "WebSocket server ready"
- No compilation errors

## 🧪 Testing Real-Time Chat:

### Pre-requirements:
- ✅ Auth Service: http://localhost:3002
- ✅ Web App: http://localhost:3000  
- ✅ Chat Service: http://localhost:3004

### Testing Steps:
1. **Login user1** di browser normal
2. **Login user2** di browser incognito
3. **Di user1**: Click "Tambah Kontak Baru"
4. **Search "user2"** dan click "Chat"
5. **Real-time chat window** akan terbuka
6. **Type message** dan test real-time messaging!

## 🔧 Troubleshooting:

### If Chat Service Won't Start:
- Check if port 3004 is free
- Ensure dependencies installed: `npm install`
- Check database connection
- Verify .env file exists

### If WebSocket Connection Fails:
- Ensure JWT token valid
- Check CORS settings
- Verify auth service running

### If Messages Don't Send:
- Check WebSocket connection status
- Verify conversation created
- Check browser console for errors

