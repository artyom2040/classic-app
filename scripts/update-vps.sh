#!/bin/bash
# Quick update script - run after git pull
set -e

echo "🔄 Updating Context Composer..."

git pull origin main
npm install

# Export environment variables for web build
export EXPO_PUBLIC_SUPABASE_URL="https://api.artyom2040.com"
export EXPO_PUBLIC_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyAgCiAgICAicm9sZSI6ICJhbm9uIiwKICAgICJpc3MiOiAic3VwYWJhc2UtZGVtbyIsCiAgICAiaWF0IjogMTY0MTc2OTIwMCwKICAgICJleHAiOiAxNzk5NTM1NjAwCn0.dc_X5iR_VP_qT0zsiyj_I_OZ2T9FtRU2BBNWN8Bu4GE"
export EXPO_PUBLIC_AUTH_REDIRECT_URL="https://app.artyom2040.com/auth-callback"

npx expo export -p web
pm2 restart classic-app

echo "✅ Updated! App running at https://app.artyom2040.com"
