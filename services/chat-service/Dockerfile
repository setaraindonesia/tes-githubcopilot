# syntax=docker/dockerfile:1

# Multi-stage build for chat-service from monorepo root
FROM node:18-alpine AS deps
WORKDIR /app
# Copy chat-service package files
COPY services/chat-service/package*.json ./
RUN npm ci --only=production && npm cache clean --force

# Build stage
FROM node:18-alpine AS build  
WORKDIR /app
# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules
# Copy chat-service source files
COPY services/chat-service/ ./
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
  CMD node -e "require('http').get('http://localhost:' + (process.env.PORT || 3000) + '/api/v1/chat/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })" || exit 1

# Start command: push schema then start server
CMD sh -c "npx prisma db push --schema=./prisma/schema.prisma --accept-data-loss && node dist/main.js"
