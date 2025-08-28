# 🧪 Chat Testing Instructions

## ✅ **Prerequisites Check:**

### 1. **Services Running:**
- ✅ **Auth Service**: http://localhost:3002 
- ✅ **Web App**: http://localhost:3000
- ❌ **Chat Service**: http://localhost:3004 (PERLU DISTART)

### 2. **Test Users Ready:**
- ✅ **user1** - user1@setaradapps.com / test123
- ✅ **user2** - user2@setaradapps.com / test123

## 🚀 **Testing Steps:**

### **Step 1: Start Chat Service**
```powershell
cd services\chat-service
npm run start:dev
```

### **Step 2: Open Chat Tester**
Navigate to: `http://localhost:3000/chat-test-single`

### **Step 3: Analyze Functionality**

#### **Expected Behavior:**
1. **Auto-Authentication**: Component will auto-login user1 dan user2
2. **WebSocket Connection**: Kedua user connect ke chat service
3. **Split Screen**: Tampilkan chat interface untuk kedua user
4. **Real-time Chat**: Messages muncul instantly di kedua sisi

#### **Test Scenarios:**
1. **Create Conversation**: Click "Create Test Conversation"
2. **Send Messages**: Type di user1, lihat di user2
3. **Typing Indicators**: Typing di satu side, lihat indicator di side lain
4. **Rate Limiting**: Send banyak messages quickly
5. **Error Handling**: Disconnect chat service, lihat error handling

## 📊 **Analysis Checklist:**

### ✅ **Dapat Digunakan Jika:**
- [ ] Both users auto-authenticate successfully
- [ ] WebSocket connections established
- [ ] Can create conversations
- [ ] Real-time messaging works
- [ ] Typing indicators work
- [ ] Error handling graceful

### ❌ **Tidak Dapat Digunakan Jika:**
- [ ] Authentication fails
- [ ] WebSocket connection errors
- [ ] Messages tidak real-time
- [ ] Component crashes
- [ ] No error feedback

## 🛠 **Troubleshooting:**

### **Auth Errors:**
- Check mock users di `/api/auth/login`
- Verify user1/user2 credentials

### **WebSocket Errors:**
- Ensure chat service running di port 3004
- Check CORS settings
- Verify JWT token valid

### **Message Errors:**
- Check conversation creation
- Verify participants setup
- Test WebSocket emit/on events

## 🎯 **Success Criteria:**

Component **DAPAT DIGUNAKAN** jika user bisa:
1. See both chat interfaces
2. Create conversations
3. Send real-time messages
4. See typing indicators
5. Get proper error messages

Component **TIDAK DAPAT DIGUNAKAN** jika ada critical errors yang block basic functionality.

