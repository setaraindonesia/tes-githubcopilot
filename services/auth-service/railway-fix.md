# Railway Auth Service Crash Fix

## Kemungkinan Penyebab Crash:

1. **Database Migration belum dijalankan**
2. **Environment variables kurang lengkap**
3. **Build command tidak include Prisma generate**
4. **Missing dependencies di production**

## Solusi:

### 1. Update Build Command di Railway Settings:
```bash
cd services/auth-service && npm install && npx prisma generate && npx prisma db push && npm run build
```

### 2. Update Start Command di Railway Settings:
```bash
cd services/auth-service && npm run start:prod
```

### 3. Environment Variables (Railway Variables tab):
```
DATABASE_URL=${{Postgres.DATABASE_URL}}
JWT_SECRET=super_secret_key_setara_2024
NODE_ENV=production
PORT=3000
ALLOWED_ORIGINS=https://web-5it9deahv-setaraindonesias-projects.vercel.app,http://localhost:3000
```

### 4. Alternative Build Commands (jika masih crash):

**Option A - With Migration:**
```bash
cd services/auth-service && npm ci && npx prisma generate && npx prisma migrate deploy && npm run build
```

**Option B - Reset Database (untuk development):**
```bash
cd services/auth-service && npm ci && npx prisma generate && npx prisma db push --force-reset && npm run build
```

## Debug Steps:
1. Check Railway Logs untuk error message
2. Pastikan PostgreSQL sudah running
3. Test DATABASE_URL connection
4. Verify Prisma schema valid
