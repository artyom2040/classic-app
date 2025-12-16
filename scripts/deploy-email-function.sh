#!/bin/bash
# Deploy send-email function to VPS Supabase

set -e

echo "📧 Deploying send-email function to VPS..."
echo ""

# Check if running on VPS
if [ ! -d "/supabase-project" ]; then
    echo "⚠️  Not on VPS. Run this on your VPS at /supabase-project"
    exit 1
fi

cd /supabase-project

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

echo "1️⃣  Copying function to functions volume..."
# Create functions directory in volume if not exists
docker compose exec -T supabase-functions sh -c "mkdir -p /home/deno/functions/send-email" || true

# Copy function files from local repo (assuming classic-app is cloned)
if [ -d "/root/classic-app/supabase/functions/send-email" ]; then
    echo "   Copying from /root/classic-app..."
    docker cp /root/classic-app/supabase/functions/send-email/index.ts \
        $(docker compose ps -q supabase-functions):/home/deno/functions/send-email/index.ts
else
    echo "❌ Function source not found at /root/classic-app/supabase/functions/send-email"
    echo "   Run: cd /root && git clone <your-repo-url> classic-app"
    exit 1
fi

echo ""
echo "2️⃣  Adding environment variables to docker-compose.yml..."
# Check if env vars are in docker-compose.yml
if ! grep -q "RESEND_API_KEY" docker-compose.yml; then
    echo "   Adding RESEND_API_KEY to functions service..."
    # This is a simplified approach - manually add to docker-compose.yml
    echo "⚠️  Manual step required:"
    echo "   Edit docker-compose.yml and add under supabase-functions -> environment:"
    echo "     RESEND_API_KEY: \${RESEND_API_KEY}"
    echo "     FROM_EMAIL: \${FROM_EMAIL}"
fi

echo ""
echo "3️⃣  Restarting functions service..."
docker compose restart supabase-functions

echo ""
echo "4️⃣  Waiting for service to start..."
sleep 3

echo ""
echo "5️⃣  Verifying deployment..."
if docker compose exec -T supabase-functions sh -c "ls /home/deno/functions/send-email/index.ts" &> /dev/null; then
    echo "✅ Function deployed successfully"
else
    echo "❌ Function not found after deployment"
    exit 1
fi

echo ""
echo "✨ Done! Test with password reset on your app."
