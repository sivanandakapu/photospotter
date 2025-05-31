#!/bin/bash

echo "Starting update process..."

# Navigate to app directory
cd /home/ubuntu/photospotter

# Pull latest changes
echo "Pulling latest changes..."
git pull

# Install dependencies
echo "Installing dependencies..."
npm install --legacy-peer-deps

# Build the application
echo "Building the application..."
npm run build

# Restart PM2
echo "Restarting PM2..."
pm2 restart all

echo "Update completed!" 