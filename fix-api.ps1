#!/usr/bin/env pwsh
# Fix API server issues - Rebuild API container

Write-Host "=== Fixing API Server (nodemailer error) ===" -ForegroundColor Cyan
Write-Host "This will rebuild the API container to fix the mailer issue`n"

# Check if docker-compose is available
if (-not (Get-Command docker-compose -ErrorAction SilentlyContinue)) {
    Write-Host "[ERROR] docker-compose not found!" -ForegroundColor Red
    exit 1
}

Write-Host "This will:" -ForegroundColor Yellow
Write-Host "  1. Stop the API container"
Write-Host "  2. Rebuild with no cache"
Write-Host "  3. Start the updated container"
Write-Host ""
$confirm = Read-Host "Continue? (y/N)"

if ($confirm -ne 'y' -and $confirm -ne 'Y') {
    Write-Host "Aborted." -ForegroundColor Yellow
    exit 0
}

Write-Host "`n[1/3] Stopping API container..." -ForegroundColor White
docker-compose stop api

Write-Host "`n[2/3] Rebuilding API container (this may take a few minutes)..." -ForegroundColor White
docker-compose build --no-cache api

if ($LASTEXITCODE -ne 0) {
    Write-Host "`n[ERROR] Build failed!" -ForegroundColor Red
    Write-Host "Check the build logs above for errors" -ForegroundColor Yellow
    exit 1
}

Write-Host "`n[3/3] Starting updated API container..." -ForegroundColor White
docker-compose up -d api

if ($LASTEXITCODE -ne 0) {
    Write-Host "`n[ERROR] Failed to start container!" -ForegroundColor Red
    exit 1
}

Write-Host "`n=== API Rebuild Complete ===" -ForegroundColor Green
Write-Host ""

# Wait for container to start
Write-Host "Waiting for API to start..." -ForegroundColor White
Start-Sleep -Seconds 5

Write-Host "`nChecking container status..." -ForegroundColor White
docker-compose ps api

Write-Host "`nRecent logs:" -ForegroundColor White
docker-compose logs --tail=20 api

Write-Host "`n=== Testing API ===" -ForegroundColor Cyan
Write-Host "Testing health endpoint..."
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000/api/health" -UseBasicParsing -TimeoutSec 5
    if ($response.StatusCode -eq 200) {
        Write-Host "[OK] API is responding!" -ForegroundColor Green
        $response.Content
    }
} catch {
    Write-Host "[WARN] API health check failed - it may still be starting up" -ForegroundColor Yellow
    Write-Host "Wait 30 seconds and try: curl http://localhost:3000/api/health" -ForegroundColor Yellow
}

Write-Host "`n=== Next Steps ===" -ForegroundColor Cyan
Write-Host "1. Test the email endpoint in your browser"
Write-Host "2. Check API logs: docker-compose logs -f api"
Write-Host "3. If issues persist, check .env.production SMTP settings"
Write-Host ""
Write-Host "API Health: http://localhost:3000/api/health" -ForegroundColor Green
