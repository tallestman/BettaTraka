# Multi-stage Dockerfile for BettaTraka Self-Hosted VPS Deployment

# Stage 1: Build Frontend Assets
FROM node:22-alpine AS builder

WORKDIR /app

# Install build dependencies
COPY package*.json ./
RUN npm ci

# Copy source and build static bundle
COPY . .
RUN npm run build

# Stage 2: Production Server Runtime
FROM node:22-alpine AS runner

WORKDIR /app
ENV NODE_ENV=production

# Install production dependencies only
COPY package*.json ./
RUN npm ci --omit=dev && npm install -g tsx

# Copy built frontend assets and server application code
COPY --from=builder /app/dist ./dist
COPY server ./server
COPY server.ts ./
COPY tsconfig.json ./

EXPOSE 3000

# Start server (runs migrations automatically on connected database)
CMD ["tsx", "server.ts"]
