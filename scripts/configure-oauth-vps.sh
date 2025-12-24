#!/bin/bash
# Configure OAuth providers for self-hosted Supabase on VPS
# Run this script on your VPS: bash configure-oauth-vps.sh

set -e

SUPABASE_DIR="/root/supabase-project"
COMPOSE_FILE="$SUPABASE_DIR/docker-compose.yml"

echo "============================================"
echo "Supabase OAuth Configuration Script"
echo "============================================"

# Check if docker-compose.yml exists
if [ ! -f "$COMPOSE_FILE" ]; then
    echo "Error: $COMPOSE_FILE not found"
    exit 1
fi

# Backup existing config
cp "$COMPOSE_FILE" "$COMPOSE_FILE.backup.$(date +%Y%m%d_%H%M%S)"
echo "✓ Backed up docker-compose.yml"

echo ""
echo "Enter your OAuth credentials (leave blank to skip a provider):"
echo ""

# Google OAuth
read -p "Google Client ID (Web): " GOOGLE_CLIENT_ID
read -p "Google Client Secret: " GOOGLE_SECRET

# Apple OAuth
read -p "Apple Service ID (e.g., com.contextcomposer.auth): " APPLE_CLIENT_ID
read -p "Apple Team ID: " APPLE_TEAM_ID
read -p "Apple Key ID: " APPLE_KEY_ID
echo "Paste Apple Private Key (.p8 content), then press Ctrl+D:"
APPLE_SECRET=$(cat)

# Facebook OAuth
read -p "Facebook App ID: " FACEBOOK_CLIENT_ID
read -p "Facebook App Secret: " FACEBOOK_SECRET

echo ""
echo "Generating OAuth configuration..."

# Create a temp file with OAuth env vars
OAUTH_CONFIG=$(mktemp)
cat > "$OAUTH_CONFIG" << 'EOFMARKER'
      # ============================================
      # OAuth Providers Configuration
      # ============================================
EOFMARKER

if [ -n "$GOOGLE_CLIENT_ID" ] && [ -n "$GOOGLE_SECRET" ]; then
cat >> "$OAUTH_CONFIG" << EOF
      GOTRUE_EXTERNAL_GOOGLE_ENABLED: "true"
      GOTRUE_EXTERNAL_GOOGLE_CLIENT_ID: "$GOOGLE_CLIENT_ID"
      GOTRUE_EXTERNAL_GOOGLE_SECRET: "$GOOGLE_SECRET"
      GOTRUE_EXTERNAL_GOOGLE_REDIRECT_URI: "https://api.artyom2040.com/auth/v1/callback"
EOF
echo "✓ Google OAuth configured"
fi

if [ -n "$APPLE_CLIENT_ID" ] && [ -n "$APPLE_SECRET" ]; then
# Escape the private key for YAML (indent each line)
APPLE_SECRET_ESCAPED=$(echo "$APPLE_SECRET" | sed 's/^/        /')
cat >> "$OAUTH_CONFIG" << EOF
      GOTRUE_EXTERNAL_APPLE_ENABLED: "true"
      GOTRUE_EXTERNAL_APPLE_CLIENT_ID: "$APPLE_CLIENT_ID"
      GOTRUE_EXTERNAL_APPLE_TEAM_ID: "$APPLE_TEAM_ID"
      GOTRUE_EXTERNAL_APPLE_KEY_ID: "$APPLE_KEY_ID"
      GOTRUE_EXTERNAL_APPLE_SECRET: |
$APPLE_SECRET_ESCAPED
      GOTRUE_EXTERNAL_APPLE_REDIRECT_URI: "https://api.artyom2040.com/auth/v1/callback"
EOF
echo "✓ Apple OAuth configured"
fi

if [ -n "$FACEBOOK_CLIENT_ID" ] && [ -n "$FACEBOOK_SECRET" ]; then
cat >> "$OAUTH_CONFIG" << EOF
      GOTRUE_EXTERNAL_FACEBOOK_ENABLED: "true"
      GOTRUE_EXTERNAL_FACEBOOK_CLIENT_ID: "$FACEBOOK_CLIENT_ID"
      GOTRUE_EXTERNAL_FACEBOOK_SECRET: "$FACEBOOK_SECRET"
      GOTRUE_EXTERNAL_FACEBOOK_REDIRECT_URI: "https://api.artyom2040.com/auth/v1/callback"
EOF
echo "✓ Facebook OAuth configured"
fi

echo ""
echo "============================================"
echo "OAuth Configuration Generated"
echo "============================================"
echo ""
echo "Add the following to your docker-compose.yml under"
echo "supabase-auth → environment section:"
echo ""
cat "$OAUTH_CONFIG"
echo ""
echo "============================================"
echo ""
echo "After adding to docker-compose.yml, restart Supabase:"
echo "  cd $SUPABASE_DIR"
echo "  docker compose down"
echo "  docker compose up -d"
echo "  docker compose logs -f supabase-auth"
echo ""

# Cleanup
rm -f "$OAUTH_CONFIG"
