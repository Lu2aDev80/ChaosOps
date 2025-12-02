#!/bin/bash

echo "🔄 Running database migrations..."

# Wait for PostgreSQL to be ready
until PGPASSWORD=$POSTGRES_PASSWORD psql -h "postgres" -U "$POSTGRES_USER" -d "$POSTGRES_DB" -c '\q'; do
  echo "⏳ Waiting for PostgreSQL to be ready..."
  sleep 2
done

echo "✅ PostgreSQL is ready!"

# Run Prisma migrations
cd /usr/src/app
npx prisma migrate deploy

echo "✅ Database migrations completed!"
