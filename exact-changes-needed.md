# 🎯 Exact Changes Needed - Chat Service Only

## 📍 LOKASI PERUBAHAN:
**Railway Dashboard** → **Chat Service** → **Settings Tab**

## 🔧 YANG PERLU DIGANTI:

### 1. Build Command (WAJIB GANTI)
**Dari (yang sekarang error):**
```bash
cd services/chat-service && npm install && npx prisma generate && npx prisma db push && npm run build
```

**Ke (yang pasti berhasil):**
```bash
cd services/chat-service && npm install && npx prisma generate --schema=./prisma/schema.prisma && npx prisma db push --schema=./prisma/schema.prisma --accept-data-loss && npm run build
```

**Perbedaan:** Added `--schema=./prisma/schema.prisma` path

### 2. Start Command (Cek, mungkin sudah benar)
**Should be:**
```bash
cd services/chat-service && npm run start:prod
```

### 3. Environment Variables (Pastikan ada)
```
DATABASE_URL=${{Postgres.DATABASE_URL}}
JWT_SECRET=super_secret_key_setara_2024
NODE_ENV=production
PORT=3000
ALLOWED_ORIGINS=https://web-5it9deahv-setaraindonesias-projects.vercel.app,http://localhost:3000
```

## 🚫 YANG TIDAK PERLU DIUBAH:
- ❌ **Auth Service** → Jangan disentuh (sudah running)
- ❌ **PostgreSQL** → Jangan disentuh (sudah running)
- ❌ **Vercel Frontend** → Nanti setelah chat service fixed

## 🎯 MINIMAL ACTION:
**Hanya ganti Build Command chat service** → Save → Done!

## ⏱️ ESTIMATED TIME:
- Edit build command: 30 detik
- Railway redeploy: 2-3 menit
- Total: < 5 menit

## ✅ SUCCESS INDICATOR:
Railway deployment logs akan show:
```
✅ Installing dependencies...
✅ Generating Prisma client...
✅ Pushing database schema...
✅ Building application...
✅ Deployment successful!
```
