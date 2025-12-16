#!/bin/bash
# Check Supabase email configuration on VPS

echo "🔍 Checking Supabase Email Configuration..."
echo ""

# Check if running on VPS
if [ ! -d "/supabase-project" ]; then
    echo "⚠️  Not running on VPS (no /supabase-project found)"
    exit 1
fi

cd /supabase-project

echo "1️⃣  Checking Resend API Key..."
if docker compose exec supabase-kong env | grep -q "RESEND_API_KEY"; then
    echo "✅ RESEND_API_KEY is set"
else
    echo "❌ RESEND_API_KEY is NOT set"
    echo "   Add to docker-compose.yml under supabase-functions environment:"
    echo "   RESEND_API_KEY=re_your_key_here"
fi

echo ""
echo "2️⃣  Checking FROM_EMAIL..."
if docker compose exec supabase-kong env | grep -q "FROM_EMAIL"; then
    echo "✅ FROM_EMAIL is set"
else
    echo "⚠️  FROM_EMAIL not set (will use default: noreply@resend.dev)"
fi

echo ""
echo "3️⃣  Checking if send-email function is deployed..."
if docker compose exec supabase-functions sh -c "ls /home/deno/functions/send-email 2>/dev/null" &> /dev/null; then
    echo "✅ send-email function found"
else
    echo "❌ send-email function NOT deployed"
    echo "   Deploy with: supabase functions deploy send-email"
fi

echo ""
echo "4️⃣  Testing outbound HTTPS (Resend API)..."
curl -s -o /dev/null -w "Status: %{http_code}\n" https://api.resend.com/emails

echo ""
echo "5️⃣  UFW Status (should allow outbound)..."
ufw status | grep -E "80|443" || echo "✅ No restrictions on outbound HTTPS"

echo ""
echo "📋 To fix email issues:"
echo "   1. Get Resend API key from https://resend.com"
echo "   2. Add to /supabase-project/.env: RESEND_API_KEY=re_xxx"
echo "   3. Verify your domain/email at https://resend.com/domains"
echo "   4. Restart: docker compose down && docker compose up -d"
