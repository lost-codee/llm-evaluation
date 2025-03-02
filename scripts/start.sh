#!/bin/bash

# Ensure wait-on is installed
npm install wait-on

# Wait for database to be ready
echo "Waiting for database to be ready..."
npx wait-on tcp:5432 -t 60000

# Run migrations
echo "Running database migrations..."
npx prisma migrate deploy

# Generate Prisma Client
echo "Generating Prisma Client..."
npx prisma generate

# Start the application
echo "Starting the application..."
npm run dev
