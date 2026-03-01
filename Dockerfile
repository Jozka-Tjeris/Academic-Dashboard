# Stage 1: Build
FROM node:22-alpine AS builder
WORKDIR /app

# Copy root package.json and lockfile for workspaces
COPY package.json package-lock.json* ./

# Copy backend and shared source code before installing
COPY backend ./backend
COPY shared ./shared

# Install dependencies for all workspaces (links workspaces correctly)
RUN npm install

# Set working directory to backend for build commands
WORKDIR /app/backend

# Generate Prisma client
RUN npx prisma generate

# Build shared first, then backend
RUN npm run build -w @internal_package/shared
RUN npm run build

# Stage 2: Production image
FROM node:22-alpine
WORKDIR /app

# Copy built JS and node_modules from builder
COPY --from=builder /app /app/

# Environment variables
ENV NODE_ENV=development
ENV PORT=4000
EXPOSE 4000

# Healthcheck (optional)
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s \
  CMD node -e "fetch('http://localhost:4000/health').then(r=>{if(!r.ok) process.exit(1)}).catch(()=>process.exit(1))"

# Run compiled JS
CMD ["node", "./backend/dist/backend/src/server.js"]
