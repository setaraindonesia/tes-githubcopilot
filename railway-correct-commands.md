# Railway Correct Commands - NO TYPOS!

## Auth Service Configuration:

### Build Command:
```bash
cd services/auth-service && npm install && npx prisma generate && npx prisma db push && npm run build
```

### Start Command:
```bash
cd services/auth-service && npm run start:prod
```

### Environment Variables:
```
DATABASE_URL=${{Postgres.DATABASE_URL}}
JWT_SECRET=super_secret_key_setara_2024
NODE_ENV=production
PORT=3000
ALLOWED_ORIGINS=https://web-5it9deahv-setaraindonesias-projects.vercel.app
```

## Chat Service Configuration:

### Build Command:
```bash
cd services/chat-service && npm install && npx prisma generate && npx prisma db push && npm run build
```

### Start Command:
```bash
cd services/chat-service && npm run start:prod
```

### Environment Variables:
```
DATABASE_URL=${{Postgres.DATABASE_URL}}
JWT_SECRET=super_secret_key_setara_2024
NODE_ENV=production
PORT=3000
ALLOWED_ORIGINS=https://web-5it9deahv-setaraindonesias-projects.vercel.app
```

## IMPORTANT: 
- Pastikan semua `npm` (bukan `npn`)
- Copy-paste commands ini untuk menghindari typo
- Railway akan auto-redeploy setelah save
