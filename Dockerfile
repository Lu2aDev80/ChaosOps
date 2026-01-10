# Build stage
FROM node:22 AS builder

WORKDIR /usr/src/app

# Copy package files
COPY package*.json ./

# Copy Prisma schema and config (needed for postinstall hook from package.json)
COPY prisma ./prisma

# Set a dummy DATABASE_URL for build time (Prisma Client generation doesn't need a real DB)
ENV DATABASE_URL="postgresql://dummy:dummy@localhost:5432/dummy"

# Install ALL dependencies (including devDependencies for build)
# This will run postinstall which generates Prisma Client
RUN npm ci

# Copy rest of source code
COPY . .

# Set build-time environment variables for Vite
ARG VITE_API_BASE_URL=/api
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
ARG VITE_BASE_PATH=/
ENV VITE_BASE_PATH=$VITE_BASE_PATH

# Build the application
RUN npm run build

########## Production stage ##########
FROM nginx:alpine

# Copy built files to nginx html directory
COPY --from=builder /usr/src/app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

# Use the standard Nginx entrypoint
CMD ["nginx", "-g", "daemon off;"]
