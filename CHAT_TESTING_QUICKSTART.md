# 🚀 Chat Testing Quick Start

## 🎭 Demo Mode (Instant - No Setup Required!)

```bash
# Langsung buka browser
# http://localhost:3000/chat-demo
```
**Perfect untuk presentations dan demos - works offline!**

## 🖥️ Single Browser Testing

```bash
# 1. Start semua services
npm run chat:test:start

# 2. Create test users (di terminal baru) 
npm run chat:test:setup

# 3. Buka browser
# http://localhost:3000/chat-test-single
```
**Test dengan 2 users dalam 1 browser - split screen atau switch mode!**

## 📱 Multi Browser Testing (Traditional)

```bash
# Same setup as above, then:
# http://localhost:3000/chat-test
```

## 🧪 Testing (2 menit)

1. **Buka 2 tab browser**
2. **Login sebagai Alice & Bob**
3. **Create conversation**
4. **Mulai chat!**

## 🔧 Manual Start (jika script gagal)

```bash
# Terminal 1: Auth Service
cd services/auth-service
npm run start:dev

# Terminal 2: Chat Service  
cd services/chat-service
npm run start:dev

# Terminal 3: Web App
cd apps/web
npm run dev

# Terminal 4: Create Users
node scripts/create-test-users.js
```

## 🎯 Test URLs

- **Chat Tester**: http://localhost:3000/chat-test
- **Auth API**: http://localhost:3003/api/v1/auth
- **Chat API**: http://localhost:3004/api/v1/chat
- **Main App**: http://localhost:3000

## 🐛 Troubleshooting

**Port sudah digunakan?**
```bash
# Windows
netstat -an | findstr ":3003"
taskkill /F /PID <PID>
```

**Database error?**
```bash
# Check PostgreSQL running
pg_isready -h localhost -p 5432
```

**WebSocket error?**
- Check chat service running (port 3004)
- Check browser console untuk errors
- Verify JWT token valid

## 📋 Test Checklist

- [ ] 2 users bisa login
- [ ] Create conversation work
- [ ] Messages terkirim real-time
- [ ] Typing indicators work
- [ ] Read receipts work
- [ ] Rate limiting work (send 10+ messages cepat)

## 🎉 Success!

Jika semua work, chat service **ready for production**!

**Next steps**: Deploy ke staging environment dan test dengan real users.

---

**Dokumentasi lengkap**: [docs/CHAT_TESTING_GUIDE.md](docs/CHAT_TESTING_GUIDE.md)
