# Railway Environment Variables Setup Guide

## 📍 DI MANA MENULIS ENVIRONMENT VARIABLES:

### Step 1: Buka Railway Dashboard
1. Buka browser: https://railway.app/project/6462810f-8c5e-42f7-a39c-4226ad83e9a2
2. Login dengan akun Railway Anda

### Step 2: Pilih Service
1. Klik pada **"chat-service"** (kotak service chat)
2. Jangan klik PostgreSQL, pilih yang chat-service

### Step 3: Buka Tab Variables
1. Di halaman chat-service, cari **tab "Variables"** di menu atas
2. Tab menu biasanya: Overview | Deployments | **Variables** | Settings | Logs
3. **Klik tab "Variables"**

### Step 4: Tambah Environment Variables
Di halaman Variables, klik tombol **"New Variable"** atau **"+ Add"** untuk setiap variable:

#### Variable 1:
- **Name**: `DATABASE_URL`
- **Value**: `${{Postgres.DATABASE_URL}}`

#### Variable 2:
- **Name**: `JWT_SECRET`
- **Value**: `super_secret_key_setara_2024`

#### Variable 3:
- **Name**: `NODE_ENV`
- **Value**: `production`

#### Variable 4:
- **Name**: `PORT`
- **Value**: `3000`

#### Variable 5:
- **Name**: `ALLOWED_ORIGINS`
- **Value**: `https://web-5it9deahv-setaraindonesias-projects.vercel.app,http://localhost:3000`

### Step 5: Save & Deploy
1. Setelah semua variables ditambahkan, **Save**
2. Railway akan **auto-redeploy** service
3. Monitor di tab **"Deployments"** untuk melihat progress

## 🎯 PENTING:
- Pastikan menulis **PERSIS** seperti contoh di atas
- Jangan ada spasi extra
- `${{Postgres.DATABASE_URL}}` akan otomatis reference ke PostgreSQL service
- Setelah save, deployment akan restart otomatis

## ✅ Verification:
Setelah deployment selesai, cek di tab Variables apakah semua environment variables sudah muncul.
