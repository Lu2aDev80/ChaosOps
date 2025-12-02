# Deployment Guide - PostgreSQL & Prisma Setup

## Quick Start Deployment

This guide covers deploying KonfiDayPlaner with PostgreSQL database using Docker Compose with automatic updates via Watchtower.

## Prerequisites

- Docker and Docker Compose installed on your server
- Git installed
- Access to your server (SSH)

## Step 1: Update Environment Variables

1. **Edit the `.env` file** (or create it from `.env.example`):

```env
# Database Configuration
DATABASE_URL="postgresql://konfiadmin:YOUR_SECURE_PASSWORD@postgres:5432/konfidayplaner?schema=public"

# PostgreSQL Configuration
POSTGRES_USER=konfiadmin
POSTGRES_PASSWORD=YOUR_SECURE_PASSWORD
POSTGRES_DB=konfidayplaner
```

⚠️ **Important**: Replace `YOUR_SECURE_PASSWORD` with a strong password!

## Step 2: Build and Push Docker Image

### Automated via GitHub Actions (Recommended)

If you have GitHub Actions set up:

1. **Push to main branch**:
```bash
git add .
git commit -m "Add PostgreSQL and Prisma setup"
git push origin master
```

2. GitHub Actions will automatically:
   - Build the Docker image
   - Push to Docker Hub
   - Watchtower will detect and update the running container

### Manual Build and Push

If building manually:

```bash
# Login to Docker Hub
docker login

# Build the image
docker build -t luca3008/konfidayplaner:latest .

# Push to Docker Hub
docker push luca3008/konfidayplaner:latest
```

## Step 3: Deploy with Docker Compose

1. **SSH into your server**:
```bash
ssh user@your-server.com
```

2. **Create deployment directory**:
```bash
mkdir -p ~/konfidayplaner
cd ~/konfidayplaner
```

3. **Copy docker-compose.yml and .env** to the server

4. **Start the services**:
```bash
docker-compose up -d
```

This will start:
- PostgreSQL database
- KonfiDayPlaner application
- Watchtower (for automatic updates)

## Step 4: Initialize Database

### Option A: Using Prisma Migrations (Recommended)

1. **Access the app container**:
```bash
docker exec -it konfidayplaner-app sh
```

2. **Run migrations**:
```bash
cd /usr/src/app
npx prisma migrate deploy
```

3. **Seed the database** (optional):
```bash
npm run db:seed
```

4. **Exit container**:
```bash
exit
```

### Option B: Using db:push (Development)

If you don't have migrations yet:

```bash
docker exec -it konfidayplaner-app sh -c "cd /usr/src/app && npx prisma db push"
```

## Step 5: Verify Deployment

1. **Check container status**:
```bash
docker-compose ps
```

Expected output:
```
NAME                    STATUS          PORTS
konfidayplaner-app      Up 2 minutes    0.0.0.0:8080->80/tcp
konfidayplaner-postgres Up 2 minutes    0.0.0.0:5432->5432/tcp
watchtower              Up 2 minutes
```

2. **Check logs**:
```bash
# Application logs
docker-compose logs -f app

# PostgreSQL logs
docker-compose logs -f postgres

# All logs
docker-compose logs -f
```

3. **Test database connection**:
```bash
docker exec -it konfidayplaner-postgres psql -U konfiadmin -d konfidayplaner -c "\dt"
```

You should see your Prisma tables listed.

4. **Access your application**:
```
http://your-server.com:8080
# or
http://lu2adevelopment.de/minihackathon/
```

## Automatic Updates

Watchtower is configured to:
- Check for new images every 5 minutes (300 seconds)
- Automatically pull and restart containers when updates are available
- Clean up old images

### Manual Update

If you need to force an update:

```bash
docker-compose pull
docker-compose up -d
```

## Database Management

### Access PostgreSQL

```bash
docker exec -it konfidayplaner-postgres psql -U konfiadmin -d konfidayplaner
```

### Backup Database

```bash
docker exec konfidayplaner-postgres pg_dump -U konfiadmin konfidayplaner > backup-$(date +%Y%m%d).sql
```

### Restore Database

```bash
docker exec -i konfidayplaner-postgres psql -U konfiadmin konfidayplaner < backup-20241202.sql
```

### Access Prisma Studio (Remote)

If you want to access Prisma Studio on your server:

1. **Port forward** (on your local machine):
```bash
ssh -L 5555:localhost:5555 user@your-server.com
```

2. **Run Prisma Studio** (on server):
```bash
docker exec -it konfidayplaner-app sh -c "cd /usr/src/app && npx prisma studio"
```

3. **Access** at `http://localhost:5555`

## Monitoring

### Check Container Health

```bash
docker-compose ps
```

### View Resource Usage

```bash
docker stats
```

### Check Watchtower Activity

```bash
docker logs watchtower
```

## Troubleshooting

### Issue: Database connection refused

**Check if PostgreSQL is running:**
```bash
docker-compose ps postgres
```

**Check PostgreSQL logs:**
```bash
docker-compose logs postgres
```

**Restart PostgreSQL:**
```bash
docker-compose restart postgres
```

### Issue: Application can't connect to database

**Check environment variables:**
```bash
docker exec konfidayplaner-app env | grep DATABASE
```

**Verify network connectivity:**
```bash
docker exec konfidayplaner-app ping postgres
```

### Issue: Migrations failed

**Check migration status:**
```bash
docker exec -it konfidayplaner-app sh -c "cd /usr/src/app && npx prisma migrate status"
```

**Force migration:**
```bash
docker exec -it konfidayplaner-app sh -c "cd /usr/src/app && npx prisma migrate deploy"
```

### Issue: Container keeps restarting

**Check logs for errors:**
```bash
docker-compose logs --tail=100 app
```

**Check Prisma Client generation:**
```bash
docker exec -it konfidayplaner-app sh -c "cd /usr/src/app && npx prisma generate"
```

## Security Checklist

- [ ] Changed default PostgreSQL password
- [ ] Database not exposed to public internet (only accessible via Docker network)
- [ ] Used strong passwords (minimum 16 characters)
- [ ] Regular database backups configured
- [ ] SSL/TLS configured for production
- [ ] Firewall rules configured
- [ ] Docker socket protected (for Watchtower)
- [ ] Environment variables not committed to Git

## Rollback Procedure

If something goes wrong:

1. **Stop current containers:**
```bash
docker-compose down
```

2. **Pull previous image version:**
```bash
docker pull luca3008/konfidayplaner:previous-tag
```

3. **Update docker-compose.yml** to use previous tag

4. **Start containers:**
```bash
docker-compose up -d
```

5. **Restore database backup** if needed

## Production Configuration

For production, consider:

1. **Use Docker secrets** instead of environment variables:
```yaml
secrets:
  db_password:
    file: ./secrets/db_password.txt
```

2. **Add health checks** to docker-compose.yml:
```yaml
healthcheck:
  test: ["CMD", "pg_isready", "-U", "konfiadmin"]
  interval: 30s
  timeout: 10s
  retries: 3
```

3. **Configure backup automation**:
```bash
# Add to crontab
0 2 * * * docker exec konfidayplaner-postgres pg_dump -U konfiadmin konfidayplaner > /backups/konfidayplaner-$(date +\%Y\%m\%d).sql
```

4. **Set up monitoring** (Prometheus, Grafana, etc.)

5. **Configure log rotation**

## Support

For issues or questions:
- Check [DATABASE_SETUP.md](./DATABASE_SETUP.md) for detailed database setup
- Review Docker logs: `docker-compose logs`
- Check Prisma documentation: https://www.prisma.io/docs

## Next Steps

After successful deployment:
1. [ ] Configure automatic backups
2. [ ] Set up monitoring and alerting
3. [ ] Implement API endpoints for database interaction
4. [ ] Add authentication and authorization
5. [ ] Configure SSL/TLS certificates
6. [ ] Set up CI/CD pipeline improvements
