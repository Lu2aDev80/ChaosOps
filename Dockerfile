# Build stage
FROM node:22 AS builder

WORKDIR /usr/src/app

# Copy package files
COPY package*.json ./

# Copy Prisma schema first (needed for postinstall hook)
COPY prisma ./prisma

# Install ALL dependencies (including devDependencies for build)
# This will run postinstall which generates Prisma Client
RUN npm ci

# Copy rest of source code
COPY . .

# Build the application
RUN npm run build

# Production stage
FROM nginx:alpine

# Create minihackathon directory and copy built files there
RUN mkdir -p /usr/share/nginx/html/minihackathon
COPY --from=builder /usr/src/app/dist /usr/share/nginx/html/minihackathon

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

# Create startup script with logging and database migration
RUN echo '#!/bin/sh' > /docker-entrypoint-custom.sh && \
    echo 'echo "============================================"' >> /docker-entrypoint-custom.sh && \
    echo 'echo "🚀 KonfiDayPlaner Container Starting..."' >> /docker-entrypoint-custom.sh && \
    echo 'echo "============================================"' >> /docker-entrypoint-custom.sh && \
    echo 'echo "📦 Container: luca3008/minihackerthon"' >> /docker-entrypoint-custom.sh && \
    echo 'echo "🌐 Port: 80"' >> /docker-entrypoint-custom.sh && \
    echo 'echo "📍 Base Path: /minihackathon/"' >> /docker-entrypoint-custom.sh && \
    echo 'echo "🔗 Should be accessible at: http://lu2adevelopment.de/minihackathon/"' >> /docker-entrypoint-custom.sh && \
    echo 'echo "============================================"' >> /docker-entrypoint-custom.sh && \
    echo 'echo "📂 Checking files in /usr/share/nginx/html:"' >> /docker-entrypoint-custom.sh && \
    echo 'ls -lah /usr/share/nginx/html/' >> /docker-entrypoint-custom.sh && \
    echo 'echo "============================================"' >> /docker-entrypoint-custom.sh && \
    echo 'echo "🔧 Nginx Configuration:"' >> /docker-entrypoint-custom.sh && \
    echo 'cat /etc/nginx/conf.d/default.conf' >> /docker-entrypoint-custom.sh && \
    echo 'echo "============================================"' >> /docker-entrypoint-custom.sh && \
    echo 'echo "✅ Starting Nginx with debug logging..."' >> /docker-entrypoint-custom.sh && \
    echo 'echo "📋 Logs: docker logs <container-name>"' >> /docker-entrypoint-custom.sh && \
    echo 'echo "============================================"' >> /docker-entrypoint-custom.sh && \
    echo 'exec /docker-entrypoint.sh nginx -g "daemon off;"' >> /docker-entrypoint-custom.sh && \
    chmod +x /docker-entrypoint-custom.sh

CMD ["/bin/sh", "/docker-entrypoint-custom.sh"]
