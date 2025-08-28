# 🚀 Railway Deployment - Complete Step-by-Step Guide

## ✅ Files Already Created:
- `services/auth-service/Dockerfile` ✅
- `services/chat-service/Dockerfile` ✅
- Updated `services/chat-service/package.json` with deploy scripts ✅
- Fixed WebSocket CORS configuration ✅
- Added health endpoints ✅

## 🎯 RAILWAY DEPLOYMENT STEPS:

### Step 1: Deploy Auth Service with Docker

1. **Open Railway Dashboard**: https://railway.app/project/6462810f-8c5e-42f7-a39c-4226ad83e9a2
2. **Click "auth service"** (not PostgreSQL)
3. **Go to Settings tab**
4. **Configure Builder**:
   - Builder: **Dockerfile**
   - Source: **GitHub**
   - Root Directory: `services/auth-service`
   - Dockerfile Path: `Dockerfile`

5. **Environment Variables** (Variables tab):
   ```
   DATABASE_URL=${{Postgres.DATABASE_URL}}
   JWT_SECRET=super_secret_key_setara_2024
   NODE_ENV=production
   PORT=3000
   ALLOWED_ORIGINS=https://web-5it9deahv-setaraindonesias-projects.vercel.app,http://localhost:3000
   ```

6. **Save Settings** → Railway will auto-redeploy

### Step 2: Deploy Chat Service with Docker

1. **Click "chat service"** 
2. **Go to Settings tab**
3. **Configure Builder**:
   - Builder: **Dockerfile**
   - Source: **GitHub**
   - Root Directory: `services/chat-service`
   - Dockerfile Path: `Dockerfile`

4. **Environment Variables** (Variables tab):
   ```
   DATABASE_URL=${{Postgres.DATABASE_URL}}
   JWT_SECRET=super_secret_key_setara_2024
   NODE_ENV=production
   PORT=3000
   ALLOWED_ORIGINS=https://web-5it9deahv-setaraindonesias-projects.vercel.app,http://localhost:3000
   ```

5. **Save Settings** → Railway will auto-redeploy

### Step 3: Get Service URLs

After deployment completes:

1. **Auth Service** → Settings → Domains → Copy URL
2. **Chat Service** → Settings → Domains → Copy URL

### Step 4: Test Deployments

```bash
# Test Auth Service
curl https://your-auth-service.up.railway.app/api/v1/health

# Test Chat Service  
curl https://your-chat-service.up.railway.app/api/v1/chat/health
```

Expected responses:
```json
{
  "status": "ok",
  "timestamp": "2025-01-XX...",
  "service": "auth-service", // or "chat-service"
  "version": "1.0.0"
}
```

### Step 5: Update Vercel Environment Variables

1. **Open Vercel Dashboard**: https://vercel.com/setaraindonesias-projects/web
2. **Settings** → **Environment Variables**
3. **Add/Update**:
   ```
   NEXT_PUBLIC_CHAT_API_BASE=https://your-chat-service.up.railway.app
   NEXT_PUBLIC_CHAT_WS_URL=wss://your-chat-service.up.railway.app
   ```

4. **Redeploy Vercel** → Deployments → Redeploy

### Step 6: Test End-to-End

1. **Open Vercel App**: https://web-5it9deahv-setaraindonesias-projects.vercel.app/dashboard
2. **Test Chat Functionality**:
   - Register new user
   - Login 
   - Create conversation
   - Send messages
   - Check real-time updates

## 🔧 Troubleshooting:

### If Auth Service Fails:
- Check Deployments tab for error logs
- Verify DATABASE_URL is accessible
- Check if PostgreSQL service is running

### If Chat Service Fails:
- Check WebSocket connection in browser console
- Verify JWT_SECRET matches between services
- Check CORS origins include your Vercel domain

### Common Issues:
1. **Database Connection**: Ensure PostgreSQL is running first
2. **Environment Variables**: Double-check all variables are set
3. **CORS Errors**: Update ALLOWED_ORIGINS with correct domains
4. **Port Issues**: Railway automatically assigns ports, use PORT env var

## 🎉 Success Indicators:
- ✅ Both services show "Deployed" status
- ✅ Health endpoints return 200 OK
- ✅ Frontend can connect to chat API
- ✅ Real-time chat works between users
- ✅ Messages persist in database
