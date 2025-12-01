# Build stage
FROM node:22 AS builder

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy built files to nginx
COPY --from=builder /usr/src/app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

# Create startup script with logging
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
