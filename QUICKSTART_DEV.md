# Quick Start Guide - Development Server

## What the Dev Server Starts

When you run the development server, the following components are started:

### 1. **PostgreSQL Database** (via Docker)
- PostgreSQL 16 database running in a Docker container
- Accessible on `localhost:5432`
- Database name: `konfidayplaner`
- User: `konfiadmin`

### 2. **Vite Development Server**
- Hot Module Replacement (HMR) - changes update instantly
- React application with TypeScript
- Accessible on `http://localhost:5173`
- Fast refresh for React components

### 3. **Prisma Client** (Auto-generated)
- TypeScript types for database models
- Type-safe database queries
- Automatically regenerated when schema changes

## Starting the Development Environment

### Step 1: Start PostgreSQL Database

```bash
# Start just the PostgreSQL container
docker-compose up -d postgres
```

This starts:
- ✅ PostgreSQL database on port 5432
- ✅ Persistent data volume (`postgres_data`)

### Step 2: Initialize Database (First Time Only)

```bash
# Create the initial migration
npm run db:migrate:dev

# Seed the database with initial data (optional)
npm run db:seed
```

### Step 3: Start the Development Server

```bash
npm run dev
```

This starts:
- ✅ Vite dev server on `http://localhost:5173`
- ✅ Hot Module Replacement (HMR)
- ✅ TypeScript compilation
- ✅ Tailwind CSS processing

## Quick Commands Reference

```bash
# Complete startup (first time)
docker-compose up -d postgres     # Start database
npm run db:migrate:dev            # Create & run migrations
npm run db:seed                   # Seed data (optional)
npm run dev                       # Start dev server

# Daily development
docker-compose up -d postgres     # Start database (if not running)
npm run dev                       # Start dev server

# View database (in a new terminal)
npm run db:studio                 # Opens Prisma Studio on http://localhost:5555
```

## What Each Terminal Window Shows

### Terminal 1: Development Server
```
VITE v7.2.4  ready in 234 ms

➜  Local:   http://localhost:5173/minihackathon/
➜  Network: use --host to expose
➜  press h + enter to show help
```

Shows:
- Server status
- Hot reload notifications
- Build errors and warnings
- TypeScript errors

### Terminal 2: Database (Optional)
```bash
# View database logs
docker-compose logs -f postgres

# Access database shell
docker exec -it konfidayplaner-postgres psql -U konfiadmin -d konfidayplaner
```

### Terminal 3: Prisma Studio (Optional)
```bash
npm run db:studio
# Opens http://localhost:5555
```

Provides:
- Visual database browser
- Edit data directly
- View relationships
- Query builder

## Ports Used

| Service | Port | URL |
|---------|------|-----|
| Vite Dev Server | 5173 | http://localhost:5173/minihackathon/ |
| PostgreSQL | 5432 | localhost:5432 |
| Prisma Studio | 5555 | http://localhost:5555 |

## Development Workflow

### Making Changes

1. **Edit React components** in `src/`
   - Changes auto-reload in browser
   - See updates instantly

2. **Modify database schema** in `prisma/schema.prisma`
   ```bash
   npm run db:migrate:dev   # Creates migration and updates DB
   ```
   - Prisma Client automatically regenerates
   - TypeScript types update

3. **Add new dependencies**
   ```bash
   npm install package-name
   ```

### Viewing Data

**Option 1: Prisma Studio** (Recommended)
```bash
npm run db:studio
```
- Visual interface
- Easy to use
- Real-time updates

**Option 2: PostgreSQL CLI**
```bash
docker exec -it konfidayplaner-postgres psql -U konfiadmin -d konfidayplaner
```
```sql
-- View tables
\dt

-- Query organisations
SELECT * FROM organisations;

-- Query events
SELECT * FROM events;

-- View all data with relations
SELECT e.*, o.name as org_name 
FROM events e 
JOIN organisations o ON e."organisationId" = o.id;
```

## Stopping the Development Environment

```bash
# Stop Vite dev server
# Press Ctrl+C in the terminal

# Stop PostgreSQL (keeps data)
docker-compose stop postgres

# Stop and remove containers (keeps data)
docker-compose down

# Stop and remove everything INCLUDING DATA (⚠️ careful!)
docker-compose down -v
```

## Troubleshooting

### Issue: Port 5173 already in use
```bash
# Kill process on port 5173
Get-Process -Id (Get-NetTCPConnection -LocalPort 5173).OwningProcess | Stop-Process

# Or use a different port
npm run dev -- --port 3000
```

### Issue: Database connection refused
```bash
# Check if PostgreSQL is running
docker-compose ps postgres

# Restart PostgreSQL
docker-compose restart postgres

# Check logs
docker-compose logs postgres
```

### Issue: Prisma Client out of sync
```bash
# Regenerate Prisma Client
npm run db:generate
```

### Issue: Database schema out of sync
```bash
# Check migration status
npx prisma migrate status

# Reset database (⚠️ deletes all data!)
npx prisma migrate reset

# Or push schema changes without migration
npm run db:push
```

## Hot Module Replacement (HMR)

The dev server automatically reloads when you change:
- ✅ React components (`.tsx`, `.jsx`)
- ✅ TypeScript files (`.ts`)
- ✅ CSS files (`.css`)
- ✅ Tailwind classes (instant)
- ❌ `vite.config.ts` (requires restart)
- ❌ `.env` files (requires restart)
- ❌ Prisma schema (run `npm run db:migrate:dev`)

## Environment Variables

Development environment variables are loaded from `.env`:

```env
DATABASE_URL="postgresql://konfiadmin:konfi2024secure@localhost:5432/konfidayplaner?schema=public"
POSTGRES_USER=konfiadmin
POSTGRES_PASSWORD=konfi2024secure
POSTGRES_DB=konfidayplaner
```

For Vite to use variables in the frontend, prefix them with `VITE_`:
```env
VITE_API_URL=http://localhost:3000
```

Access in code:
```typescript
const apiUrl = import.meta.env.VITE_API_URL
```

## Next Steps

1. Open http://localhost:5173/minihackathon/ in your browser
2. Open http://localhost:5555 for Prisma Studio (optional)
3. Start coding in `src/`
4. Check `DATABASE_SETUP.md` for database operations
5. See `DEPLOYMENT_GUIDE.md` for production deployment
