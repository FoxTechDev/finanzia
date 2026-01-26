#!/bin/bash

# Azure Deployment Script for NestJS Backend
# This script runs during Azure App Service deployment

echo "========================================="
echo "Starting Azure Deployment"
echo "========================================="

# 1. Install dependencies
echo "Installing production dependencies..."
npm ci --only=production

# 2. Build the application
echo "Building application..."
npm run build

# 3. Run database migrations (if enabled)
if [ "$RUN_MIGRATIONS" = "true" ]; then
  echo "Running database migrations..."
  npm run migration:run:prod
else
  echo "Skipping migrations (RUN_MIGRATIONS not set to true)"
fi

echo "========================================="
echo "Deployment completed successfully"
echo "========================================="
