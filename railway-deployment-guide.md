# Railway Deployment Guide - Setara Apps

## 1. PostgreSQL Database Setup
1. Open Railway Dashboard: https://railway.app/project/6462810f-8c5e-42f7-a39c-4226ad83e9a2
2. Click **"New"** → **"Database"** → **"PostgreSQL"**
3. Wait for provisioning (2-3 minutes)
4. Copy the DATABASE_URL from Variables tab

## 2. Auth Service Setup
1. Click **"New"** → **"GitHub Repo"**
2. Select repository: `tes-githubcopilot`
3. Service name: `auth-service`
4. **Settings** → **Build Command**:
   ```
   cd services/auth-service && npm install && npm run build
   ```
5. **Settings** → **Start Command**:
   ```
   cd services/auth-service && npm run start:prod
   ```
6. **Variables** tab - Add:
   ```
   DATABASE_URL=${{Postgres.DATABASE_URL}}
   JWT_SECRET=super_secret_key_setara_2024
   NODE_ENV=production
   PORT=3000
   ```

## 3. Chat Service Setup
1. Click **"New"** → **"GitHub Repo"**
2. Select repository: `tes-githubcopilot`
3. Service name: `chat-service`
4. **Settings** → **Build Command**:
   ```
   cd services/chat-service && npm install && npm run build
   ```
5. **Settings** → **Start Command**:
   ```
   cd services/chat-service && npm run start:prod
   ```
6. **Variables** tab - Add:
   ```
   DATABASE_URL=${{Postgres.DATABASE_URL}}
   JWT_SECRET=super_secret_key_setara_2024
   NODE_ENV=production
   PORT=3000
   ```

## 4. After Deployment
- Get public URLs from each service
- Update Vercel environment variables
- Test API endpoints

## 5. Expected URLs
- Auth Service: `https://auth-service-production.up.railway.app`
- Chat Service: `https://chat-service-production.up.railway.app`
