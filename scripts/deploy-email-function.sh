#!/bin/bash
# Deploy send-email function to VPS Supabase

set -e

echo "📧 Deploying send-email function to VPS..."
echo ""

# Check if running on VPS
if [ ! -d "/root/supabase-project" ]; then
    echo "⚠️  Not on VPS. Run this on your VPS at /root/supabase-project"
    exit 1
fi

cd /root/supabase-project

# Check if .env exists with RESEND_API_KEY
if [ ! -f ".env" ]; then
    echo "❌ .env file not found!"
    echo "Create it with:"
    echo "  RESEND_API_KEY=re_your_key"
    echo "  FROM_EMAIL=Classical Music <noreply@resend.dev>"
    exit 1
fi

if ! grep -q "RESEND_API_KEY" .env; then
    echo "❌ RESEND_API_KEY not found in .env"
    exit 1
fi

echo "1️⃣  Starting Supabase services if needed..."
cd /root/supabase-project
if ! docker compose ps | grep -q "Up"; then
    echo "   Starting services..."
    docker compose up -d
    sleep 5
fi

echo ""
echo "2️⃣  Copying function to functions container..."
# Find the functions container (it might have a different name)
FUNC_CONTAINER=$(docker ps --filter "name=functions" --format "{{.Names}}" | head -1)
if [ -z "$FUNC_CONTAINER" ]; then
    echo "❌ No functions container found"
    echo "   Available containers:"
    docker ps --format "{{.Names}}"
    exit 1
fi

echo "   Using container: $FUNC_CONTAINER"

# Create directory and copy file
docker exec "$FUNC_CONTAINER" sh -c "mkdir -p /home/deno/functions/send-email" 2>/dev/null || true
docker cp /root/classic-app/supabase/functions/send-email/index.ts \
    "$FUNC_CONTAINER":/home/deno/functions/send-email/index.ts

echo ""
echo "3️⃣  Checking environment variables in docker-compose.yml..."
if [ -f ".env" ]; then
    RESEND_KEY=$(grep "^RESEND_API_KEY" .env | cut -d'=' -f2- | tr -d '"' | tr -d "'")
    
    if ! grep -q "RESEND_API_KEY" docker-compose.yml; then
        echo "   ⚠️  RESEND_API_KEY not in docker-compose.yml"
        echo ""
        echo "   Add these lines under the edge-functions service environment section:"
        echo "      RESEND_API_KEY: $RESEND_KEY"
        echo "      FROM_EMAIL: Classical Music <noreply@resend.dev>"
        echo ""
        echo "   Then run: docker compose down && docker compose up -d"
        exit 1
    else
        echo "   ✅ Environment vars configured"
    fi
else
    echo "   ❌ No .env file found"
    exit 1
fi

echo ""
echo "4️⃣  Restarting container..."
docker restart "$FUNC_CONTAINER"

echo ""
echo "5️⃣  Waiting for service to start..."
sleep 5

echo ""
echo "6️⃣  Verifying deployment..."
if docker exec "$FUNC_CONTAINER" sh -c "ls /home/deno/functions/send-email/index.ts" &> /dev/null; then
    echo "✅ Function deployed successfully"
    echo "   Container: $FUNC_CONTAINER"
else
    echo "❌ Function not found after deployment"
    exit 1
fi

echo ""
echo "✨ Done! Test with password reset on your app."
