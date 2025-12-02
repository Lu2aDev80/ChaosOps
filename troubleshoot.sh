#!/bin/bash

# Troubleshooting script for KonfiDayPlaner API deployment

echo "=== KonfiDayPlaner API Troubleshooting ==="
echo "$(date)"
echo ""

echo "1. Checking container status..."
docker-compose ps

echo ""
echo "2. Checking API container health..."
if docker-compose ps api | grep -q "Up"; then
    echo "✓ API container is running"
    
    echo ""
    echo "3. Testing API health endpoint..."
    if curl -s -f http://localhost:3000/api/health > /dev/null; then
        echo "✓ API health check passed"
        curl -s http://localhost:3000/api/health | jq .
    else
        echo "✗ API health check failed"
    fi
else
    echo "✗ API container is not running"
fi

echo ""
echo "4. Checking PostgreSQL status..."
if docker-compose ps postgres | grep -q "healthy"; then
    echo "✓ PostgreSQL is healthy"
else
    echo "✗ PostgreSQL health check failed"
fi

echo ""
echo "5. Checking recent API logs..."
echo "Last 20 lines of API logs:"
docker-compose logs --tail=20 api

echo ""
echo "6. Checking database connection..."
echo "Testing database connection from API container:"
docker-compose exec -T api sh -c 'npx prisma db pull --print' 2>/dev/null && echo "✓ Database connection successful" || echo "✗ Database connection failed"

echo ""
echo "7. Checking environment variables..."
echo "Database URL (masked):"
docker-compose exec -T api sh -c 'echo $DATABASE_URL | sed "s/:.*@/:***@/"'

echo ""
echo "8. Checking for restart loops..."
echo "API container restart count:"
docker inspect konfidayplaner-api | jq '.[0].RestartCount'

echo ""
echo "9. Checking for port conflicts..."
echo "Port 3000 usage:"
netstat -tulpn 2>/dev/null | grep :3000 || echo "No processes found on port 3000"

echo ""
echo "=== Troubleshooting Complete ==="
echo ""
echo "If issues persist, try:"
echo "- docker-compose down && docker-compose up -d --build"
echo "- docker-compose logs -f api (for real-time logs)"
echo "- docker-compose exec api sh (to access container)"