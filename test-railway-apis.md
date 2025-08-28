# Test Railway APIs

## Test Commands (ganti URL dengan Railway URLs Anda):

### Test Auth Service:
```bash
# Health check
curl https://your-auth-service.up.railway.app/api/v1/health

# Register test user
curl -X POST https://your-auth-service.up.railway.app/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","username":"testuser","password":"password123","firstName":"Test","lastName":"User"}'

# Login test user
curl -X POST https://your-auth-service.up.railway.app/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

### Test Chat Service:
```bash
# Health check
curl https://your-chat-service.up.railway.app/api/v1/health

# Get conversations (dengan Bearer token dari login)
curl https://your-chat-service.up.railway.app/api/v1/chat/conversations \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Expected Results:
- ✅ Health checks return 200 OK
- ✅ Register creates user in database
- ✅ Login returns JWT token
- ✅ Chat endpoints work with authentication

## Next Step:
Copy URLs and paste them below for Vercel environment variables update.
