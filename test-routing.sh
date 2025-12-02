#!/bin/bash

echo "=== Testing Application Routing ==="
echo ""

echo "1. Testing root redirect..."
curl -I http://localhost:8080/ 2>/dev/null | head -n 5

echo ""
echo "2. Testing minihackathon path..."
curl -I http://localhost:8080/minihackathon/ 2>/dev/null | head -n 5

echo ""
echo "3. Testing verify-email route..."
curl -I http://localhost:8080/minihackathon/verify-email 2>/dev/null | head -n 5

echo ""
echo "4. Testing API health..."
curl -s http://localhost:3000/api/health 2>/dev/null | head -n 3

echo ""
echo "5. Container status..."
docker-compose ps

echo ""
echo "6. Recent nginx logs..."
docker-compose logs --tail=10 app

echo ""
echo "=== Access URLs ==="
echo "Frontend: http://localhost:8080/"
echo "Admin: http://localhost:8080/minihackathon/login"
echo "API: http://localhost:3000/api/health"