#!/bin/bash

# SSL Certificate Setup Script for chaos-ops.de

echo "=== SSL Certificate Setup for chaos-ops.de ==="

# Check if certificates already exist
if [ -f "/home/chaos-ops.de/ssl_certificates/chaos-ops.de/server.crt" ] && [ -s "/home/chaos-ops.de/ssl_certificates/chaos-ops.de/server.crt" ]; then
    echo "Certificate already exists and is not empty."
    read -p "Do you want to replace it? (y/N): " replace
    if [ "$replace" != "y" ] && [ "$replace" != "Y" ]; then
        echo "Keeping existing certificate."
        exit 0
    fi
fi

# Create certificate directory if it doesn't exist
mkdir -p /home/chaos-ops.de/ssl_certificates/chaos-ops.de

echo ""
echo "Choose certificate type:"
echo "1) Self-signed certificate (for testing)"
echo "2) Let's Encrypt certificate (recommended for production)"
echo "3) Use existing certificate files"
read -p "Enter your choice (1-3): " choice

case $choice in
    1)
        echo "Generating self-signed certificate..."
        openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
            -keyout /home/chaos-ops.de/ssl_certificates/chaos-ops.de/server.key \
            -out /home/chaos-ops.de/ssl_certificates/chaos-ops.de/server.crt \
            -subj "/C=DE/ST=State/L=City/O=Organization/OU=OrgUnit/CN=chaos-ops.de/emailAddress=admin@chaos-ops.de"
        
        if [ $? -eq 0 ]; then
            echo "✓ Self-signed certificate generated successfully!"
            echo "  Certificate: /home/chaos-ops.de/ssl_certificates/chaos-ops.de/server.crt"
            echo "  Private Key: /home/chaos-ops.de/ssl_certificates/chaos-ops.de/server.key"
            echo ""
            echo "⚠️  WARNING: Self-signed certificates will show security warnings in browsers."
            echo "   Use this only for testing or internal use."
        else
            echo "❌ Failed to generate self-signed certificate"
            exit 1
        fi
        ;;
    2)
        echo "Setting up Let's Encrypt certificate..."
        
        # Check if certbot is installed
        if ! command -v certbot &> /dev/null; then
            echo "Installing certbot..."
            apt update && apt install -y certbot
        fi
        
        # Stop containers to free port 80
        echo "Stopping containers temporarily..."
        cd /home/chaos-ops.de/ChaosOps
        docker compose down
        
        # Get certificate
        echo "Requesting certificate from Let's Encrypt..."
        certbot certonly --standalone -d chaos-ops.de --agree-tos --non-interactive --email admin@chaos-ops.de
        
        if [ $? -eq 0 ]; then
            # Copy certificates to our location
            cp /etc/letsencrypt/live/chaos-ops.de/fullchain.pem /home/chaos-ops.de/ssl_certificates/chaos-ops.de/server.crt
            cp /etc/letsencrypt/live/chaos-ops.de/privkey.pem /home/chaos-ops.de/ssl_certificates/chaos-ops.de/server.key
            
            # Set proper permissions
            chown root:root /home/chaos-ops.de/ssl_certificates/chaos-ops.de/*
            chmod 644 /home/chaos-ops.de/ssl_certificates/chaos-ops.de/server.crt
            chmod 600 /home/chaos-ops.de/ssl_certificates/chaos-ops.de/server.key
            
            echo "✓ Let's Encrypt certificate obtained successfully!"
            echo "  Certificate: /home/chaos-ops.de/ssl_certificates/chaos-ops.de/server.crt"
            echo "  Private Key: /home/chaos-ops.de/ssl_certificates/chaos-ops.de/server.key"
        else
            echo "❌ Failed to obtain Let's Encrypt certificate"
            echo "Make sure:"
            echo "  - chaos-ops.de points to this server's IP address"
            echo "  - Port 80 is accessible from the internet"
            echo "  - No firewall is blocking access"
            exit 1
        fi
        
        # Restart containers
        echo "Restarting containers..."
        docker compose up -d
        ;;
    3)
        echo "Please place your certificate files in:"
        echo "  Certificate: /home/chaos-ops.de/ssl_certificates/chaos-ops.de/server.crt"
        echo "  Private Key: /home/chaos-ops.de/ssl_certificates/chaos-ops.de/server.key"
        echo ""
        echo "Make sure the files have proper permissions:"
        echo "  chmod 644 server.crt"
        echo "  chmod 600 server.key"
        echo ""
        read -p "Press Enter when you have placed the files..."
        
        if [ -f "/home/chaos-ops.de/ssl_certificates/chaos-ops.de/server.crt" ] && [ -s "/home/chaos-ops.de/ssl_certificates/chaos-ops.de/server.crt" ]; then
            echo "✓ Certificate files found!"
        else
            echo "❌ Certificate files not found or empty"
            exit 1
        fi
        ;;
    *)
        echo "Invalid choice"
        exit 1
        ;;
esac

echo ""
echo "=== Updating Nginx Configuration for HTTPS ==="

# Create HTTPS-enabled nginx config
cat > /home/chaos-ops.de/ChaosOps/nginx-proxy.conf << 'EOF'
# HTTP to HTTPS redirect
server {
    listen 80;
    server_name chaos-ops.de www.chaos-ops.de;
    return 301 https://$server_name$request_uri;
}

# HTTPS server configuration
server {
    listen 443 ssl;
    http2 on;
    server_name chaos-ops.de www.chaos-ops.de;

    # SSL certificate configuration
    ssl_certificate /etc/ssl/certs/server.crt;
    ssl_certificate_key /etc/ssl/private/server.key;
    
    # SSL configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-SHA384;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;
    
    # Security headers
    add_header Strict-Transport-Security "max-age=63072000; includeSubDomains; preload" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; connect-src 'self'; img-src 'self' data: https:;" always;

    access_log /var/log/nginx/access.log;
    error_log /var/log/nginx/error.log;

    # Proxy to the frontend application
    location / {
        proxy_pass http://app:80;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }

    # Proxy API requests directly to the API container
    location /api/ {
        proxy_pass http://api:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_http_version 1.1;
        proxy_set_header Connection "";
        
        # CORS headers
        add_header 'Access-Control-Allow-Origin' '$http_origin' always;
        add_header 'Access-Control-Allow-Credentials' 'true' always;
        add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, DELETE, OPTIONS' always;
        add_header 'Access-Control-Allow-Headers' 'Content-Type, Authorization, Cookie' always;
        
        # Handle preflight requests
        if ($request_method = 'OPTIONS') {
            add_header 'Access-Control-Allow-Origin' '$http_origin' always;
            add_header 'Access-Control-Allow-Credentials' 'true' always;
            add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, DELETE, OPTIONS' always;
            add_header 'Access-Control-Allow-Headers' 'Content-Type, Authorization, Cookie' always;
            add_header 'Access-Control-Max-Age' 86400;
            add_header 'Content-Type' 'text/plain charset=UTF-8';
            add_header 'Content-Length' 0;
            return 204;
        }
    }

    # Static file caching
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        proxy_pass http://app:80;
        proxy_set_header Host $host;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
EOF

# Update docker-compose.yml to include SSL certificates
echo "Updating Docker Compose configuration..."

# Create backup
cp /home/chaos-ops.de/ChaosOps/docker-compose.yml /home/chaos-ops.de/ChaosOps/docker-compose.yml.backup

# Add SSL certificate volumes to reverse-proxy service
sed -i '/volumes:/,/networks:/ {
    /nginx-proxy.conf/a\
      - ../ssl_certificates/chaos-ops.de/server.crt:/etc/ssl/certs/server.crt:ro\
      - ../ssl_certificates/chaos-ops.de/server.key:/etc/ssl/private/server.key:ro
}' /home/chaos-ops.de/ChaosOps/docker-compose.yml

# Add HTTPS port
sed -i '/80:80/a\
      - '"'"'443:443'"'"'' /home/chaos-ops.de/ChaosOps/docker-compose.yml

echo "✓ Configuration updated!"

echo ""
echo "=== Restarting Services ==="
cd /home/chaos-ops.de/ChaosOps
docker compose restart reverse-proxy

echo ""
echo "✅ SSL setup complete!"
echo ""
echo "Your ChaosOps application should now be accessible at:"
echo "  🔒 https://chaos-ops.de (HTTPS - recommended)"
echo "  🔓 http://chaos-ops.de (will redirect to HTTPS)"
echo ""
echo "Check the setup with:"
echo "  curl -I https://chaos-ops.de"