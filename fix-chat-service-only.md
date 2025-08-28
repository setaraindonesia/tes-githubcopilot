# Fix Chat Service Only - Auth Service Tetap Running

## 🎯 SITUASI SEKARANG:
- ✅ **Auth Service** → Already deployed & running
- ❌ **Chat Service** → Error deployment (Prisma schema issue)
- ✅ **PostgreSQL** → Running

## 🔧 YANG PERLU DIPERBAIKI (CHAT SERVICE SAJA):

### Option 1: Update Build Command (Tercepat)
**Railway Dashboard** → **Chat Service** → **Settings**:

**Build Command (ganti yang sekarang):**
```bash
cd services/chat-service && npm install && npx prisma generate --schema=./prisma/schema.prisma && npx prisma db push --schema=./prisma/schema.prisma --accept-data-loss && npm run build
```

**Start Command (tetap sama):**
```bash
cd services/chat-service && npm run start:prod
```

### Option 2: Switch to Dockerfile (Lebih Robust)
**Railway Dashboard** → **Chat Service** → **Settings**:

1. **Builder**: Change from "Nixpacks" to **"Dockerfile"**
2. **Root Directory**: `services/chat-service`
3. **Dockerfile Path**: `Dockerfile`

**Environment Variables (pastikan ada):**
```
DATABASE_URL=${{Postgres.DATABASE_URL}}
JWT_SECRET=super_secret_key_setara_2024
NODE_ENV=production
PORT=3000
ALLOWED_ORIGINS=https://web-5it9deahv-setaraindonesias-projects.vercel.app,http://localhost:3000
```

## 🚫 YANG TIDAK PERLU DIUBAH:
- ❌ **Auth Service** → Jangan diubah, sudah running
- ❌ **PostgreSQL** → Jangan diubah, sudah running
- ❌ **Environment variables** → Sudah benar

## 🎯 LANGKAH CEPAT:
1. **Buka Railway** → **Chat Service** → **Settings**
2. **Pilih Option 1 atau 2** (rekomendasi: Option 1 dulu)
3. **Save** → Railway auto-redeploy chat service
4. **Monitor logs** di tab "Deployments"

## ✅ EXPECTED RESULT:
- Auth Service: tetap running di URL yang sama
- Chat Service: fixed dan running di URL yang sama
- Total downtime: ~2-3 menit (hanya chat service)

**Rekomendasi: Coba Option 1 dulu (update build command), kalau masih error baru switch ke Option 2 (Dockerfile).**
