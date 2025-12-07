#!/bin/bash
# Quick Caddy Setup Script for VPS
# Run this on your VPS: bash setup-caddy-vps.sh

set -e

echo "========================================="
echo "  CADDY SETUP FOR SUPABASE"
echo "========================================="
echo ""

# Check if running as root
if [ "$EUID" -ne 0 ]; then
    echo "⚠️  This script needs sudo access"
    echo "Run with: sudo bash setup-caddy-vps.sh"
    exit 1
fi

# Step 1: Install Caddy
echo "📦 Step 1: Installing Caddy..."
apt install -y debian-keyring debian-archive-keyring apt-transport-https curl
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | tee /etc/apt/sources.list.d/caddy-stable.list
apt update
apt install -y caddy

echo "✅ Caddy installed: $(caddy version)"
echo ""

# Step 2: Create log directory
echo "📁 Step 2: Creating log directory..."
mkdir -p /var/log/caddy
chown caddy:caddy /var/log/caddy
echo "✅ Log directory created"
echo ""

# Step 3: Backup existing config
echo "💾 Step 3: Backing up existing Caddyfile..."
if [ -f /etc/caddy/Caddyfile ]; then
    mv /etc/caddy/Caddyfile /etc/caddy/Caddyfile.backup.$(date +%Y%m%d_%H%M%S)
    echo "✅ Backup created"
else
    echo "ℹ️  No existing Caddyfile to backup"
fi
echo ""

# Step 4: Create new Caddyfile
echo "⚙️  Step 4: Creating Caddyfile..."
cat > /etc/caddy/Caddyfile << 'EOF'
# Main Supabase API (Kong gateway)
api.artyom2040.com {
    reverse_proxy localhost:8000

    # Security headers
    header {
        X-Content-Type-Options "nosniff"
        X-Frame-Options "SAMEORIGIN"
        Referrer-Policy "strict-origin-when-cross-origin"
        -Server
    }

    # CORS for mobile app
    @options {
        method OPTIONS
    }
    header @options Access-Control-Allow-Origin "*"
    header @options Access-Control-Allow-Methods "GET, POST, PUT, PATCH, DELETE, OPTIONS"
    header @options Access-Control-Allow-Headers "Authorization, Content-Type, apikey, x-client-info"
    respond @options 204

    # Logging
    log {
        output file /var/log/caddy/api.log
        format json
    }
}

# Studio Dashboard (optional separate subdomain)
studio.artyom2040.com {
    reverse_proxy localhost:8000

    # Password protect (optional)
    # Uncomment to add basic auth:
    # basicauth /project/* {
    #     admin $2a$14$ugotZb3LHhiSOCK7U5QAm.fFmZ56Yb0nBIubrW1XJKQqCHVrHikEW
    # }

    header {
        X-Content-Type-Options "nosniff"
        X-Frame-Options "SAMEORIGIN"
        -Server
    }

    log {
        output file /var/log/caddy/studio.log
        format json
    }
}

# Portfolio placeholder
artyom2040.com, www.artyom2040.com {
    respond "Portfolio coming soon!" 200

    header {
        X-Content-Type-Options "nosniff"
        X-Frame-Options "SAMEORIGIN"
        -Server
    }
}
EOF

echo "✅ Caddyfile created"
echo ""

# Step 5: Validate configuration
echo "🔍 Step 5: Validating Caddy configuration..."
if caddy validate --config /etc/caddy/Caddyfile; then
    echo "✅ Configuration is valid"
else
    echo "❌ Configuration validation failed!"
    echo "Check /etc/caddy/Caddyfile for errors"
    exit 1
fi
echo ""

# Step 6: Configure firewall
echo "🔥 Step 6: Configuring firewall..."
ufw allow 80/tcp comment 'HTTP for Let\'s Encrypt'
ufw allow 443/tcp comment 'HTTPS'

# Make sure port 8000 is NOT open
if ufw status | grep -q "8000"; then
    echo "⚠️  Port 8000 is open to public - closing it..."
    ufw delete allow 8000
    echo "✅ Port 8000 closed (accessible only via localhost)"
fi

echo "✅ Firewall configured"
echo ""

# Step 7: Restart Caddy
echo "🔄 Step 7: Restarting Caddy..."
systemctl restart caddy
sleep 3

if systemctl is-active --quiet caddy; then
    echo "✅ Caddy is running"
else
    echo "❌ Caddy failed to start!"
    echo "Check logs: journalctl -u caddy -n 50"
    exit 1
fi
echo ""

# Step 8: Test endpoints
echo "🧪 Step 8: Testing endpoints..."
echo ""

echo "Testing Kong (localhost:8000):"
if curl -s http://localhost:8000/rest/v1/ | grep -q "PostgREST"; then
    echo "  ✅ Kong is responding"
else
    echo "  ⚠️  Kong not responding - check Supabase containers"
fi

echo ""
echo "Testing Caddy (localhost:80):"
if curl -s -H "Host: api.artyom2040.com" http://localhost/rest/v1/ | grep -q "PostgREST"; then
    echo "  ✅ Caddy proxy is working"
else
    echo "  ⚠️  Caddy proxy not working - check logs"
fi

echo ""
echo "========================================="
echo "  SETUP COMPLETE!"
echo "========================================="
echo ""
echo "📋 Next Steps:"
echo ""
echo "1. Configure DNS on Porkbun:"
echo "   - A record: api → 185.194.140.57"
echo "   - A record: studio → 185.194.140.57"
echo "   - A record: @ → 185.194.140.57"
echo ""
echo "2. Wait 5-10 minutes for DNS propagation"
echo "   Check with: dig api.artyom2040.com +short"
echo ""
echo "3. Once DNS is ready, test HTTPS:"
echo "   curl https://api.artyom2040.com/rest/v1/"
echo ""
echo "4. Access Studio Dashboard:"
echo "   https://api.artyom2040.com/project/default"
echo "   or"
echo "   https://studio.artyom2040.com/project/default"
echo ""
echo "5. Update mobile app .env:"
echo "   EXPO_PUBLIC_SUPABASE_URL=https://api.artyom2040.com"
echo ""
echo "📝 View Caddy logs:"
echo "   sudo journalctl -u caddy -f"
echo ""
echo "📁 Caddyfile location:"
echo "   /etc/caddy/Caddyfile"
echo ""
echo "✅ Caddy is now running and ready for HTTPS!"
echo ""
