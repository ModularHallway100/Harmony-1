# Multi-stage build for Harmony application

# Stage 1: Build frontend
FROM node:18-alpine AS frontend-builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy frontend source code
COPY src/ ./src/
COPY public/ ./public/
COPY vite.config.ts ./
COPY tailwind.config.js ./
COPY postcss.config.js ./
COPY tsconfig*.json ./

# Build frontend
RUN npm run build

# Stage 2: Build backend
FROM node:18-alpine AS backend-builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy backend source code
COPY server/ ./server/
COPY worker/ ./worker/
COPY redis/ ./redis/

# Install development dependencies for building
RUN npm ci --include=dev

# Build TypeScript
RUN npx tsc --project tsconfig.json

# Stage 3: Production image
FROM node:18-alpine AS production

# Set working directory
WORKDIR /app

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S harmony -u 1001

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Copy package files
COPY package*.json ./

# Install production dependencies only
RUN npm ci --only=production && npm cache clean --force

# Copy built frontend from frontend-builder
COPY --from=frontend-builder --chown=harmony:nodejs /app/dist ./dist

# Copy built backend from backend-builder
COPY --from=backend-builder --chown=harmony:nodejs /app/build ./build
COPY --from=backend-builder --chown=harmony:nodejs /app/node_modules ./node_modules

# Copy server and worker directories
COPY --from=backend-builder --chown=harmony:nodejs /app/server ./server
COPY --from=backend-builder --chown=harmony:nodejs /app/worker ./worker
COPY --from=backend-builder --chown=harmony:nodejs /app/redis ./redis

# Copy configuration files
COPY wrangler.jsonc ./
COPY .env.example ./

# Create necessary directories
RUN mkdir -p /app/uploads /app/logs /app/cache && chown harmony:nodejs /app/uploads /app/logs /app/cache

# Switch to non-root user
USER harmony

# Expose ports
EXPOSE 3000 5000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node healthcheck.js

# Set entrypoint
ENTRYPOINT ["dumb-init", "--"]

# Start the application
CMD ["node", "build/server/index.js"]