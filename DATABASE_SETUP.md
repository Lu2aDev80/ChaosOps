# PostgreSQL & Prisma ORM Setup Guide

## Overview
This project now uses PostgreSQL as the database and Prisma ORM for database management. The setup is configured to work with automatic deployment via Docker and Watchtower.

## Database Architecture

### Models
- **Organisation**: Stores organisation information
- **Event**: Events managed by organisations
- **DayPlan**: Daily plans for events
- **ScheduleItem**: Individual schedule items (sessions, workshops, breaks, etc.)
- **AdminUser**: Admin authentication

## Local Development Setup

### Prerequisites
- Node.js 22+
- Docker & Docker Compose (recommended) OR PostgreSQL 16+

### Option 1: Using Docker Compose (Recommended)

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start PostgreSQL:**
   ```bash
   docker-compose up -d postgres
   ```

3. **Generate Prisma Client:**
   ```bash
   npm run db:generate
   ```

4. **Create and apply migrations:**
   ```bash
   npm run db:migrate:dev
   ```

5. **Seed the database (optional):**
   ```bash
   npm run db:seed
   ```

6. **Start development server:**
   ```bash
   npm run dev
   ```

### Option 2: Using Local PostgreSQL

1. **Install PostgreSQL 16+** on your machine

2. **Create database:**
   ```sql
   CREATE DATABASE konfidayplaner;
   CREATE USER konfiadmin WITH PASSWORD 'konfi2024secure';
   GRANT ALL PRIVILEGES ON DATABASE konfidayplaner TO konfiadmin;
   ```

3. **Update `.env` file** with your local database URL:
   ```env
   DATABASE_URL="postgresql://konfiadmin:konfi2024secure@localhost:5432/konfidayplaner?schema=public"
   ```

4. **Follow steps 1, 3-6 from Option 1**

## Environment Variables

### Development (.env)
```env
DATABASE_URL="postgresql://konfiadmin:konfi2024secure@localhost:5432/konfidayplaner?schema=public"
POSTGRES_USER=konfiadmin
POSTGRES_PASSWORD=konfi2024secure
POSTGRES_DB=konfidayplaner
```

### Production
For production deployment, update the Docker Compose file with secure credentials:
- Change `POSTGRES_PASSWORD` to a strong password
- Update `DATABASE_URL` accordingly
- Consider using Docker secrets for sensitive data

## Available NPM Scripts

| Script | Description |
|--------|-------------|
| `npm run db:generate` | Generate Prisma Client |
| `npm run db:push` | Push schema changes to database (dev) |
| `npm run db:migrate` | Apply migrations (production) |
| `npm run db:migrate:dev` | Create and apply migrations (dev) |
| `npm run db:seed` | Seed database with initial data |
| `npm run db:studio` | Open Prisma Studio (database GUI) |

## Database Migrations

### Development Workflow

1. **Modify `prisma/schema.prisma`** with your changes

2. **Create a migration:**
   ```bash
   npm run db:migrate:dev
   ```
   This will:
   - Create a new migration file
   - Apply it to the database
   - Regenerate Prisma Client

3. **Commit the migration files** to Git

### Production Deployment

Migrations are automatically applied during deployment:
- The Docker build process generates Prisma Client
- On container startup, migrations are applied via `prisma migrate deploy`

## Docker Deployment

### Architecture
```
┌─────────────────┐
│   Watchtower    │  (Auto-updates)
└─────────────────┘
         │
┌─────────────────┐     ┌─────────────────┐
│   App (Nginx)   │────▶│   PostgreSQL    │
│   Port: 8080    │     │   Port: 5432    │
└─────────────────┘     └─────────────────┘
         │                       │
         └───────────────────────┘
              app-network
```

### Deployment Steps

1. **Update `.env` or Docker Compose** with production credentials

2. **Start services:**
   ```bash
   docker-compose up -d
   ```

3. **Check logs:**
   ```bash
   docker-compose logs -f app
   docker-compose logs -f postgres
   ```

4. **Verify database connection:**
   ```bash
   docker exec -it konfidayplaner-postgres psql -U konfiadmin -d konfidayplaner
   ```

### Automatic Updates with Watchtower

Watchtower monitors the Docker image and automatically updates when a new version is pushed:
- Polls every 5 minutes (300 seconds)
- Automatically pulls new images
- Restarts containers with new versions
- Cleans up old images

## Prisma Studio

Access the database GUI:
```bash
npm run db:studio
```

Opens at `http://localhost:5555`

## Database Backup & Restore

### Backup
```bash
docker exec konfidayplaner-postgres pg_dump -U konfiadmin konfidayplaner > backup.sql
```

### Restore
```bash
docker exec -i konfidayplaner-postgres psql -U konfiadmin konfidayplaner < backup.sql
```

## Troubleshooting

### Issue: Cannot connect to database
**Solution:** Ensure PostgreSQL container is running:
```bash
docker-compose ps
docker-compose up -d postgres
```

### Issue: Prisma Client not found
**Solution:** Regenerate Prisma Client:
```bash
npm run db:generate
```

### Issue: Migration failed
**Solution:** Check migration status and reset if needed:
```bash
npx prisma migrate status
npx prisma migrate reset  # ⚠️ This will delete all data!
```

### Issue: Database connection in production
**Solution:** Verify environment variables are set correctly in docker-compose.yml

## Security Considerations

1. **Change default credentials** in production
2. **Use Docker secrets** for sensitive data
3. **Enable SSL** for database connections in production
4. **Implement proper authentication** (bcrypt for passwords)
5. **Regular backups** of production database
6. **Network isolation** - PostgreSQL should not be exposed publicly

## Next Steps

1. **Implement API endpoints** to interact with the database
2. **Add authentication middleware**
3. **Create database access layer** in `src/services/`
4. **Migrate existing hardcoded data** to database
5. **Add data validation** with Zod or similar
6. **Implement error handling** for database operations

## References

- [Prisma Documentation](https://www.prisma.io/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
