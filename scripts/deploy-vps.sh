#!/bin/bash
# VPS Deployment Script for Context Composer
# Run this ON YOUR VPS after cloning the repo

set -e

echo "🎵 Context Composer - VPS Deployment"
echo "====================================="

# Check if we're updating or fresh install
if [ -d "node_modules" ]; then
    echo "📦 Updating existing installation..."
    git pull origin main
else
    echo "📦 Fresh install - installing dependencies..."
fi

# Install dependencies
npm install

# Build for web
echo "🔨 Building web version..."
npx expo export -p web

# Check if pm2 is installed
if ! command -v pm2 &> /dev/null; then
    echo "📥 Installing PM2..."
    npm install -g pm2
fi

# Check if serve is installed
if ! command -v serve &> /dev/null; then
    echo "📥 Installing serve..."
    npm install -g serve
fi

# Stop existing instance if running
pm2 delete classic-app 2>/dev/null || true

# Start the server
echo "🚀 Starting server on port 3000..."
pm2 serve dist --name "classic-app" --port 3000 --spa

# Save PM2 config
pm2 save

echo ""
echo "✅ Deployment complete!"
echo ""
echo "🌐 Access your app at: http://185.194.140.57:3000"
echo ""
echo "📋 Useful commands:"
echo "   pm2 logs classic-app  - View logs"
echo "   pm2 restart classic-app - Restart app"
echo "   pm2 stop classic-app  - Stop app"
echo ""
echo "🔄 To update after git changes:"
echo "   git pull && npm install && npx expo export -p web && pm2 restart classic-app"
