# Railway Environment Variables Template

Copy these variables to each service's **Variables** tab in Railway Dashboard:

## For Auth Service & Chat Service:

```
DATABASE_URL=${{Postgres.DATABASE_URL}}
JWT_SECRET=super_secret_key_setara_2024
JWT_EXPIRES_IN=7d
NODE_ENV=production
PORT=3000
CORS_ORIGIN=https://web-5it9deahv-setaraindonesias-projects.vercel.app,http://localhost:3000
```

## Optional (for future features):
```
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
```

## Notes:
- `${{Postgres.DATABASE_URL}}` automatically references the PostgreSQL service
- Update `CORS_ORIGIN` with your actual Vercel domain
- `PORT=3000` is Railway's default port
