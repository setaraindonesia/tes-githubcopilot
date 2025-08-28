# 🔧 Railway Non-Docker Setup (BACKUP PLAN)

## ⚡ DISABLE DOCKER APPROACH

### Auth Service Settings:
```
☐ UNCHECK "Use Dockerfile"
Root Directory: services/auth-service
Build Command: npm install && npx prisma generate --schema=./prisma/schema.prisma && npx prisma migrate deploy --schema=./prisma/schema.prisma && npm run build
Start Command: npm run start:prod
```

### Chat Service Settings:
```
☐ UNCHECK "Use Dockerfile"  
Root Directory: services/chat-service
Build Command: npm install && npx prisma generate --schema=./prisma/schema.prisma && npx prisma db push --schema=./prisma/schema.prisma --accept-data-loss && npm run build
Start Command: npm run start:prod
```

## 🎯 HOW TO APPLY:

### 1. Auth Service:
1. Railway Dashboard → auth service
2. Settings → Deploy
3. **UNCHECK "Use Dockerfile"**
4. Set Root Directory: `services/auth-service`
5. Copy-paste Build Command above
6. Set Start Command: `npm run start:prod`
7. **Save & Deploy**

### 2. Chat Service:
1. Railway Dashboard → chat service  
2. Settings → Deploy
3. **UNCHECK "Use Dockerfile"**
4. Set Root Directory: `services/chat-service`
5. Copy-paste Build Command above
6. Set Start Command: `npm run start:prod`
7. **Save & Deploy**

## 📋 ENVIRONMENT VARIABLES NEEDED:

### Both Services:
```
NODE_ENV=production
DATABASE_URL=postgresql://...
JWT_SECRET=your_jwt_secret_here
ALLOWED_ORIGINS=https://your-vercel-app.vercel.app
PORT=3000
```

## ⚡ ADVANTAGES:
- ✅ **No Docker complexity**
- ✅ **Root directory approach** (proven to work)
- ✅ **Explicit Prisma schema paths**
- ✅ **Faster builds**
- ✅ **Easier debugging**

## 🎯 SUCCESS INDICATORS:
- Build logs show: "npm install" → "prisma generate" → "npm run build"
- Start logs show: "Auth/Chat Service is running on port..."
- Health endpoints respond: `/api/v1/health` and `/api/v1/chat/health`

---
**USE THIS IF DOCKER STILL FAILS!**
