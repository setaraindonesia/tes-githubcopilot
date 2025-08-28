# Simple Dockerfile for Railway deployment
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY prisma ./prisma

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Generate Prisma client
RUN npx prisma generate --schema=./prisma/schema.prisma

# Build the application
RUN npm run build

# Expose port
EXPOSE 3000

# Start command with migrations
CMD sh -c "npx prisma migrate deploy --schema=./prisma/schema.prisma || npx prisma db push --schema=./prisma/schema.prisma --accept-data-loss; node dist/main.js"
