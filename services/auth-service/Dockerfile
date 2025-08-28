# syntax=docker/dockerfile:1

# Multi-stage build for auth-service from monorepo root
FROM node:18-alpine AS deps
WORKDIR /app
# Copy auth-service package files
COPY services/auth-service/package*.json ./
RUN npm ci --only=production && npm cache clean --force

# Build stage
FROM node:18-alpine AS build  
WORKDIR /app
# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules
# Copy auth-service source files
COPY services/auth-service/ ./
# Generate Prisma client and build
RUN npx prisma generate --schema=./prisma/schema.prisma
RUN npm run build

# Production runner
FROM node:18-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# Copy built application
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/prisma ./prisma
COPY --from=build /app/package.json ./package.json

# Expose port (Railway will set PORT env var)
EXPOSE $PORT

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:' + (process.env.PORT || 3000) + '/api/v1/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })" || exit 1

# Start command: run migrations then start server
CMD sh -c "npx prisma migrate deploy --schema=./prisma/schema.prisma && node dist/main.js"
