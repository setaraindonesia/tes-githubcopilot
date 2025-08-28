# Railway Environment Variables for Chat Service

Copy these to Railway Dashboard > chat-service > Variables tab:

## Required Variables:

```
DATABASE_URL=${{Postgres.DATABASE_URL}}
JWT_SECRET=super_secret_key_setara_2024
NODE_ENV=production
PORT=3000
ALLOWED_ORIGINS=https://web-5it9deahv-setaraindonesias-projects.vercel.app,http://localhost:3000
```

## Optional Variables:

```
JWT_EXPIRES_IN=7d
WEBSOCKET_CORS_ORIGIN=https://web-5it9deahv-setaraindonesias-projects.vercel.app,http://localhost:3000
```
