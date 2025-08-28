# Chat Service Debug & Fix

## Analisis Masalah Deployment:

### 1. **WebSocket Configuration Issue** ⚠️
```typescript
@WebSocketGateway({
  cors: {
    origin: ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002', '*'],
    credentials: true,
  },
  namespace: '/chat',
})
```
- CORS wildcard '*' bisa menyebabkan masalah di production
- Localhost origins tidak cocok untuk Railway deployment

### 2. **Missing Production Environment Variables** ❌
- JWT_SECRET mungkin belum diset
- Database connection issue

### 3. **Prisma Schema Sync Issue** ❌
- MessageReadReceipt model berbeda dari auth service

## Solusi Komprehensif:

### Step 1: Fix WebSocket CORS Configuration
```typescript
// Update chat.gateway.ts
@WebSocketGateway({
  cors: {
    origin: process.env.ALLOWED_ORIGINS?.split(',') || [
      'http://localhost:3000',
      'https://web-5it9deahv-setaraindonesias-projects.vercel.app'
    ],
    credentials: true,
  },
  namespace: '/chat',
})
```

### Step 2: Updated Railway Build Commands

**Chat Service Build Command (Final Fix):**
```bash
cd services/chat-service && npm ci --omit=dev && npx prisma generate && npx prisma db push --accept-data-loss && npm run build
```

**Environment Variables (Ensure these are set):**
```
DATABASE_URL=${{Postgres.DATABASE_URL}}
JWT_SECRET=super_secret_key_setara_2024
NODE_ENV=production
PORT=3000
ALLOWED_ORIGINS=https://web-5it9deahv-setaraindonesias-projects.vercel.app,http://localhost:3000
```

### Step 3: Add Health Check Endpoint
```typescript
// In chat.controller.ts
@Get('health')
async health() {
  return {
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'chat-service',
    version: '1.0.0'
  };
}
```

### Step 4: Alternative Build Command (if still fails)
```bash
cd services/chat-service && npm install && npx prisma generate && npx prisma db push --force-reset && npm run build
```

## Debug Steps:
1. Check Railway logs for specific error messages
2. Verify DATABASE_URL is accessible
3. Test Prisma connection
4. Verify all dependencies installed
