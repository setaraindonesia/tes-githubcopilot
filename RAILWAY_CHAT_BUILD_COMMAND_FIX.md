# 🔧 RAILWAY CHAT SERVICE - BUILD COMMAND FIX

## ❌ ERROR:
```
Could not load `--schema` from provided path `prisma/schema.prisma`: file or directory not found
```

## 🎯 ROOT CAUSE:
Railway build command masih pakai path relatif tanpa `./` prefix.

## ✅ SOLUSI PASTI:

### 1. Buka Railway Dashboard:
```
https://railway.app/project/6462810f-8c5e-42f7-a39c-4226ad83e9a2
```

### 2. Klik "chat service" → "Settings"

### 3. Scroll ke "Build"

### 4. HAPUS build command lama, GANTI dengan:

```bash
cd services/chat-service && npm ci && npx prisma generate --schema=./prisma/schema.prisma && npx prisma db push --schema=./prisma/schema.prisma --accept-data-loss && npm run build
```

### 5. Klik "Save"

## 🔍 PENJELASAN PERUBAHAN:

**SEBELUM (ERROR):**
```bash
--schema=prisma/schema.prisma    ← SALAH! No ./
```

**SESUDAH (BENAR):**
```bash
--schema=./prisma/schema.prisma  ← BENAR! Ada ./
```

## 📋 PERINTAH LENGKAP STEP BY STEP:

1. **Change Directory**: `cd services/chat-service`
2. **Install Dependencies**: `npm ci`
3. **Generate Prisma Client**: `npx prisma generate --schema=./prisma/schema.prisma`
4. **Push Database Schema**: `npx prisma db push --schema=./prisma/schema.prisma --accept-data-loss`
5. **Build Application**: `npm run build`

## 🚀 EXPECTED RESULT:
```
✅ Dependencies installed
✅ Prisma client generated
✅ Database schema synchronized  
✅ Application built successfully
✅ Chat service deployed
```

## ⚡ QUICK COPY-PASTE:
```
cd services/chat-service && npm ci && npx prisma generate --schema=./prisma/schema.prisma && npx prisma db push --schema=./prisma/schema.prisma --accept-data-loss && npm run build
```

**Copy command di atas → Paste ke Railway Build Command → Save → Done!** 🎯
