# Build stage
FROM node:22.15.0-bullseye-slim AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --omit=dev && npm cache clean --force

# Copy source code
COPY . .

# Generate Prisma client and build the application
RUN npx prisma generate && npm run build

# Production stage
FROM node:22.15.0-bullseye-slim AS production

# Set working directory
WORKDIR /home/node/app

# Copy package files
COPY package*.json ./

# Install only production dependencies via npm
RUN npm ci --omit=dev && \
    npm cache clean --force

# Create directories and set ownership
RUN mkdir -p /home/node/app/dist /home/node/app/uploads && chown -R node:node /home/node/app

# Switch to non-root user
USER node

# Copy built application and generated Prisma client from builder stage
COPY --chown=node:node --from=builder /app/dist ./dist
COPY --chown=node:node --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --chown=node:node --from=builder /app/prisma ./prisma

# Expose port
EXPOSE 4000

# Create volume for uploads
VOLUME ["/home/node/app/uploads"]

# Start the application
CMD ["node", "dist/src/main.js"]
