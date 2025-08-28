# Chat Service Deployment Fix

## Masalah yang Ditemukan:

### 1. **Missing Prisma Migrations** ❌
- Chat service tidak punya folder `prisma/migrations`
- Hanya ada `schema.prisma` tanpa migration files
- Ini menyebabkan `npx prisma migrate deploy` gagal

### 2. **Schema Conflict** ⚠️
- Auth service dan Chat service pakai schema berbeda
- Chat service punya `MessageReadReceipt` tambahan
- Database table tidak sinkron

### 3. **Missing Dependencies** ⚠️
- Prisma CLI mungkin tidak ter-install di production

## Solusi Cepat:

### Option 1: Gunakan db push (Recommended)
**Railway Chat Service Build Command:**
```bash
cd services/chat-service && npm ci && npx prisma generate && npx prisma db push --accept-data-loss && npm run build
```

### Option 2: Copy Migration dari Auth Service
```bash
cd services/chat-service && npm ci && npx prisma generate && npx prisma migrate deploy && npm run build
```

### Option 3: Reset Database Schema
```bash
cd services/chat-service && npm ci && npx prisma generate && npx prisma db push --force-reset && npm run build
```

## Step-by-Step Fix:

### 1. Copy Migration Files (Jika Option 2)
```bash
cp -r services/auth-service/prisma/migrations services/chat-service/prisma/
```

### 2. Update Railway Chat Service Settings:
- **Build Command**: Gunakan salah satu option di atas
- **Start Command**: `cd services/chat-service && npm run start:prod`
- **Environment Variables**: Sama seperti auth service

### 3. Redeploy
Save settings → Railway akan auto-redeploy

## Expected Result:
✅ Database tables created
✅ Chat service starts successfully
✅ API endpoints accessible
✅ Real-time chat works
