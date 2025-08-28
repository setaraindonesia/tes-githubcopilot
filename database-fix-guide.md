# Database Fix Guide - Otomatis Simpan Data

## Masalah Sekarang:
1. **Auth Service**: Punya migration ✅ - database tables sudah dibuat
2. **Chat Service**: Tidak ada migration ❌ - database tables belum dibuat
3. **Schema berbeda**: Chat service punya MessageReadReceipt yang tidak ada di auth service

## Solusi:

### Option 1: Update Build Commands (Recommended)

**Auth Service Build Command:**
```bash
cd services/auth-service && npm install && npx prisma generate && npx prisma migrate deploy && npm run build
```

**Chat Service Build Command:**
```bash
cd services/chat-service && npm install && npx prisma generate && npx prisma db push && npm run build
```

### Option 2: Sinkronisasi Schema
1. Copy schema dari auth-service ke chat-service
2. Atau buat migration untuk chat-service

### Option 3: Gunakan Shared Database
- Auth dan Chat service pakai database yang sama
- Migration hanya perlu dijalankan sekali

## Perbaikan Cepat:

### 1. Update Railway Chat Service:
**Build Command (ganti yang sekarang):**
```bash
cd services/chat-service && npm install && npx prisma generate && npx prisma db push --force-reset && npm run build
```

**Ini akan:**
- Generate Prisma client
- Push schema ke database
- Create tables otomatis
- Build application

### 2. Test Database Connection
Setelah deploy, test:
```bash
curl https://your-chat-service.up.railway.app/api/v1/health
```

## Expected Result:
✅ Tables akan dibuat otomatis
✅ Chat messages akan tersimpan
✅ User registration/login akan bekerja
✅ Real-time chat dengan database persistence
