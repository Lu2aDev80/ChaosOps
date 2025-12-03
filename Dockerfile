# Build stage
FROM node:22 AS builder

WORKDIR /usr/src/app

# Copy package files
COPY package*.json ./

# Copy Prisma schema first (needed for postinstall hook from package.json)
COPY prisma ./prisma

# Install ALL dependencies (including devDependencies for build)
# This will run postinstall which generates Prisma Client
RUN npm ci

# Copy rest of source code
COPY . .

# Set build-time environment variables for Vite
ARG VITE_API_BASE_URL=/minihackathon
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

# Build the application
RUN npm run build

########## Production stage ##########
FROM nginx:alpine

# Copy built files to the target subfolder expected by base path
RUN mkdir -p /usr/share/nginx/html/minihackathon
COPY --from=builder /usr/src/app/dist /usr/share/nginx/html/minihackathon

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

# Use the standard Nginx entrypoint
CMD ["nginx", "-g", "daemon off;"]
