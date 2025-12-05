#!/bin/bash
# Quick update script - run after git pull
set -e

echo "🔄 Updating Context Composer..."

git pull origin main
npm install
npx expo export -p web
pm2 restart classic-app

echo "✅ Updated! App running at http://185.194.140.57:3000"
