#!/bin/bash
# HTTPS Diagnosis Script
# Run on VPS to check DNS, Caddy, and Let's Encrypt status

echo "========================================="
echo "  HTTPS & DNS DIAGNOSTIC"
echo "========================================="
echo ""

# Step 1: Check DNS from VPS
echo "🌐 Step 1: Checking DNS resolution..."
echo ""

for domain in artyom2040.com api.artyom2040.com studio.artyom2040.com; do
    echo "Checking: $domain"
    IP=$(dig +short $domain @8.8.8.8 | tail -1)
    if [ -z "$IP" ]; then
        echo "  ❌ Not resolving"
    elif [ "$IP" = "185.194.140.57" ]; then
        echo "  ✅ Resolves to: $IP (CORRECT)"
    else
        echo "  ⚠️  Resolves to: $IP (WRONG - should be 185.194.140.57)"
    fi
done
echo ""

# Step 2: Check Caddy installation
echo "🔧 Step 2: Checking Caddy installation..."
if command -v caddy &> /dev/null; then
    echo "  ✅ Caddy installed: $(caddy version)"

    # Check if running
    if systemctl is-active --quiet caddy; then
        echo "  ✅ Caddy is running"
    else
        echo "  ❌ Caddy is NOT running"
        echo "     Start with: sudo systemctl start caddy"
    fi
else
    echo "  ❌ Caddy is NOT installed"
    echo "     Install with: sudo apt install caddy"
fi
echo ""

# Step 3: Check Caddyfile
echo "📄 Step 3: Checking Caddyfile..."
if [ -f /etc/caddy/Caddyfile ]; then
    echo "  ✅ Caddyfile exists"
    echo ""
    echo "  Contents:"
    cat /etc/caddy/Caddyfile | head -20
    echo "  ... (showing first 20 lines)"
else
    echo "  ❌ Caddyfile NOT found at /etc/caddy/Caddyfile"
fi
echo ""

# Step 4: Check firewall
echo "🔥 Step 4: Checking firewall rules..."
ufw status | grep -E "80|443|8000"
echo ""

# Step 5: Test Kong directly
echo "🐉 Step 5: Testing Kong (localhost:8000)..."
KONG_RESPONSE=$(curl -s -H "apikey: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyAgCiAgICAicm9sZSI6ICJhbm9uIiwKICAgICJpc3MiOiAic3VwYWJhc2UtZGVtbyIsCiAgICAiaWF0IjogMTY0MTc2OTIwMCwKICAgICJleHAiOiAxNzk5NTM1NjAwCn0.dc_X5iR_VP_qT0zsiyj_I_OZ2T9FtRU2BBNWN8Bu4GE" http://localhost:8000/rest/v1/)

if [ ! -z "$KONG_RESPONSE" ]; then
    echo "  ✅ Kong responding with API key"
    echo "  Response: $KONG_RESPONSE"
else
    echo "  ⚠️  Kong not responding"
fi
echo ""

# Step 6: Test Caddy proxy (HTTP)
echo "🔗 Step 6: Testing Caddy proxy (HTTP:80)..."
if command -v caddy &> /dev/null && systemctl is-active --quiet caddy; then
    HTTP_TEST=$(curl -s -H "Host: api.artyom2040.com" http://localhost:80/rest/v1/ || echo "FAILED")
    if [[ "$HTTP_TEST" == *"No API key"* ]] || [[ "$HTTP_TEST" != "FAILED" ]]; then
        echo "  ✅ Caddy proxy working (HTTP)"
    else
        echo "  ❌ Caddy proxy not working"
        echo "  Response: $HTTP_TEST"
    fi
else
    echo "  ⚠️  Caddy not running - skipping test"
fi
echo ""

# Step 7: Check SSL certificates
echo "🔐 Step 7: Checking SSL certificates..."
if [ -d /var/lib/caddy/.local/share/caddy/certificates ]; then
    echo "  Certificates directory exists"
    echo "  Contents:"
    find /var/lib/caddy/.local/share/caddy/certificates -name "*.crt" 2>/dev/null | head -5

    if [ -z "$(find /var/lib/caddy/.local/share/caddy/certificates -name "*.crt" 2>/dev/null)" ]; then
        echo "  ⚠️  No certificates found yet"
        echo "     This is normal if DNS isn't propagated"
    fi
else
    echo "  ⚠️  Certificate directory doesn't exist"
fi
echo ""

# Step 8: Check Caddy logs
echo "📋 Step 8: Recent Caddy logs..."
if systemctl is-active --quiet caddy; then
    journalctl -u caddy -n 20 --no-pager
else
    echo "  ⚠️  Caddy not running"
fi
echo ""

# Step 9: External connectivity test
echo "🌍 Step 9: Testing external connectivity..."
echo "  Testing if port 80 is reachable from outside..."
timeout 5 nc -zv 185.194.140.57 80 2>&1 | tail -1

echo "  Testing if port 443 is reachable from outside..."
timeout 5 nc -zv 185.194.140.57 443 2>&1 | tail -1
echo ""

# Summary
echo "========================================="
echo "  SUMMARY & RECOMMENDATIONS"
echo "========================================="
echo ""

# Check DNS
DNS_OK=false
if dig +short api.artyom2040.com @8.8.8.8 | grep -q "185.194.140.57"; then
    DNS_OK=true
    echo "✅ DNS is configured correctly"
else
    echo "❌ DNS NOT configured"
    echo "   ACTION: Add A records on Porkbun:"
    echo "   - A record: api → 185.194.140.57"
    echo "   - A record: studio → 185.194.140.57"
    echo "   - A record: @ → 185.194.140.57"
fi
echo ""

# Check Caddy
CADDY_OK=false
if command -v caddy &> /dev/null && systemctl is-active --quiet caddy; then
    CADDY_OK=true
    echo "✅ Caddy is installed and running"
else
    echo "❌ Caddy NOT running"
    echo "   ACTION: Install and configure Caddy:"
    echo "   - Follow: docs/CORRECTED_CADDY_CONFIG.md"
    echo "   - Or run automated script"
fi
echo ""

# Check Kong
if curl -s http://localhost:8000/rest/v1/ | grep -q "No API key"; then
    echo "✅ Kong (Supabase) is working"
else
    echo "⚠️  Kong not responding correctly"
    echo "   ACTION: Check Supabase containers:"
    echo "   - docker compose ps"
    echo "   - docker compose logs kong"
fi
echo ""

# Overall status
echo "🎯 NEXT STEPS:"
echo ""

if [ "$DNS_OK" = false ]; then
    echo "1. ⚡ Configure DNS on Porkbun (URGENT)"
    echo "   - Login to Porkbun dashboard"
    echo "   - Add the A records listed above"
    echo "   - Wait 5-10 minutes for propagation"
    echo ""
fi

if [ "$CADDY_OK" = false ]; then
    echo "2. ⚡ Install and configure Caddy"
    echo "   - Follow: docs/CORRECTED_CADDY_CONFIG.md"
    echo "   - Or use: sudo bash setup-caddy-vps.sh"
    echo ""
fi

if [ "$DNS_OK" = true ] && [ "$CADDY_OK" = true ]; then
    echo "✅ All components ready!"
    echo ""
    echo "Test HTTPS with:"
    echo "  curl https://api.artyom2040.com/rest/v1/"
    echo ""
    echo "If still not working, check Caddy logs:"
    echo "  sudo journalctl -u caddy -f"
    echo ""
fi

echo "========================================="
