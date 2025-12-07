#!/bin/bash
# Supabase Configuration Checker for VPS
# Run this on your VPS to find all Supabase credentials

echo "========================================="
echo "  SUPABASE CONFIGURATION CHECKER"
echo "========================================="
echo ""

# Find Supabase directory
echo "🔍 Step 1: Locating Supabase installation..."
if [ -d ~/supabase-project ]; then
    SUPABASE_DIR=~/supabase-project
elif [ -d ~/supabase/classic-app ]; then
    SUPABASE_DIR=~/supabase/classic-app
elif [ -d /root/supabase-project ]; then
    SUPABASE_DIR=/root/supabase-project
else
    echo "❌ Supabase directory not found!"
    echo "   Please run: cd <your-supabase-directory>"
    exit 1
fi

echo "✅ Found: $SUPABASE_DIR"
cd "$SUPABASE_DIR"
echo ""

# Check Docker Compose
echo "🐳 Step 2: Checking Docker containers..."
if ! docker compose ps 2>/dev/null | grep -q "Up"; then
    echo "⚠️  No containers running!"
    echo "   Try: docker compose up -d"
    echo ""
    echo "Available containers in docker-compose.yml:"
    docker compose ps -a
    exit 1
fi

echo "✅ Containers status:"
docker compose ps
echo ""

# Check for .env file
echo "📄 Step 3: Checking for .env file..."
if [ -f .env ]; then
    echo "✅ Found .env file"
    echo ""
    echo "Contents (secrets masked):"
    cat .env | sed 's/\(.*=\).*/\1***MASKED***/'
else
    echo "⚠️  No .env file found"
fi
echo ""

# Check docker-compose.yml for secrets
echo "🔑 Step 4: Extracting keys from docker-compose.yml..."
if [ -f docker-compose.yml ]; then
    echo "Searching for JWT_SECRET..."
    JWT_SECRET=$(grep -i "JWT_SECRET" docker-compose.yml | head -1 | sed 's/.*: *"\?\([^"]*\)"\?.*/\1/' | xargs)

    echo "Searching for ANON_KEY..."
    ANON_KEY=$(grep -i "ANON_KEY" docker-compose.yml | head -1 | sed 's/.*: *"\?\([^"]*\)"\?.*/\1/' | xargs)

    echo "Searching for SERVICE_ROLE_KEY..."
    SERVICE_KEY=$(grep -i "SERVICE.*ROLE.*KEY" docker-compose.yml | head -1 | sed 's/.*: *"\?\([^"]*\)"\?.*/\1/' | xargs)

    if [ ! -z "$JWT_SECRET" ]; then
        echo "✅ JWT_SECRET: ${JWT_SECRET:0:20}...${JWT_SECRET: -10}"
    else
        echo "⚠️  JWT_SECRET not found in docker-compose.yml"
    fi

    if [ ! -z "$ANON_KEY" ]; then
        echo "✅ ANON_KEY found (${#ANON_KEY} characters)"
        echo "   Full key: $ANON_KEY"
    else
        echo "⚠️  ANON_KEY not found in docker-compose.yml"
    fi

    if [ ! -z "$SERVICE_KEY" ]; then
        echo "✅ SERVICE_ROLE_KEY found (${#SERVICE_KEY} characters)"
        echo "   ⚠️  Keep this secret! (not displaying)"
    else
        echo "⚠️  SERVICE_ROLE_KEY not found in docker-compose.yml"
    fi
else
    echo "❌ docker-compose.yml not found!"
fi
echo ""

# Check Studio credentials
echo "🎨 Step 5: Checking Studio credentials..."
STUDIO_USER=$(grep -i "DASHBOARD.*USERNAME\|STUDIO.*USERNAME" docker-compose.yml 2>/dev/null | head -1 | sed 's/.*: *"\?\([^"]*\)"\?.*/\1/' | xargs)
STUDIO_PASS=$(grep -i "DASHBOARD.*PASSWORD\|STUDIO.*PASSWORD" docker-compose.yml 2>/dev/null | head -1 | sed 's/.*: *"\?\([^"]*\)"\?.*/\1/' | xargs)

if [ ! -z "$STUDIO_USER" ]; then
    echo "✅ Studio Username: $STUDIO_USER"
else
    echo "⚠️  No custom username set (might use 'supabase' or 'admin')"
fi

if [ ! -z "$STUDIO_PASS" ]; then
    echo "✅ Studio Password: $STUDIO_PASS"
else
    echo "⚠️  No custom password set"
    echo "   Default might be: this_password_is_insecure_and_should_be_updated"
fi
echo ""

# Check PostgreSQL
echo "🐘 Step 6: Checking PostgreSQL credentials..."
PG_PASS=$(grep -i "POSTGRES_PASSWORD" docker-compose.yml 2>/dev/null | head -1 | sed 's/.*: *"\?\([^"]*\)"\?.*/\1/' | xargs)
if [ ! -z "$PG_PASS" ]; then
    echo "✅ PostgreSQL Password: $PG_PASS"
else
    echo "⚠️  PostgreSQL password not found"
fi
echo ""

# Try to get keys from running containers
echo "🔧 Step 7: Querying running containers..."

# Try Kong
if docker compose ps | grep -q "kong.*Up"; then
    echo "Checking Kong container..."
    KONG_ANON=$(docker compose exec -T kong env 2>/dev/null | grep "ANON_KEY" | cut -d'=' -f2 | tr -d '\r')
    KONG_SERVICE=$(docker compose exec -T kong env 2>/dev/null | grep "SERVICE.*ROLE" | cut -d'=' -f2 | tr -d '\r')

    if [ ! -z "$KONG_ANON" ]; then
        echo "✅ Found ANON_KEY in Kong: $KONG_ANON"
    fi
    if [ ! -z "$KONG_SERVICE" ]; then
        echo "✅ Found SERVICE_ROLE_KEY in Kong (not displaying)"
    fi
fi

# Try Auth container
if docker compose ps | grep -q "auth.*Up"; then
    echo "Checking Auth container..."
    AUTH_SECRET=$(docker compose exec -T auth env 2>/dev/null | grep "JWT_SECRET" | cut -d'=' -f2 | tr -d '\r')
    if [ ! -z "$AUTH_SECRET" ]; then
        echo "✅ Found JWT_SECRET in Auth container"
    fi
fi
echo ""

# Network connectivity test
echo "🌐 Step 8: Testing endpoints..."
echo "Studio (port 54323):"
curl -s -o /dev/null -w "   HTTP Status: %{http_code}\n" http://localhost:54323 2>/dev/null || echo "   ❌ Not reachable"

echo "Kong/API (port 54321):"
curl -s -o /dev/null -w "   HTTP Status: %{http_code}\n" http://localhost:54321 2>/dev/null || echo "   ❌ Not reachable"

echo "Auth (port 54322):"
curl -s -o /dev/null -w "   HTTP Status: %{http_code}\n" http://localhost:54322 2>/dev/null || echo "   ❌ Not reachable"
echo ""

# Summary
echo "========================================="
echo "  SUMMARY"
echo "========================================="
echo ""

if [ ! -z "$ANON_KEY" ]; then
    echo "📱 FOR YOUR MOBILE APP (.env file):"
    echo ""
    echo "EXPO_PUBLIC_SUPABASE_URL=https://api.artyom2040.com"
    echo "EXPO_PUBLIC_SUPABASE_ANON_KEY=$ANON_KEY"
    echo "EXPO_PUBLIC_DATA_SOURCE=supabase"
    echo ""
else
    echo "⚠️  Could not find ANON_KEY!"
    echo "   You may need to:"
    echo "   1. Check docker-compose.yml manually"
    echo "   2. Generate new keys"
    echo "   3. Or use Supabase CLI: supabase start"
    echo ""
fi

if [ ! -z "$STUDIO_USER" ] && [ ! -z "$STUDIO_PASS" ]; then
    echo "🎨 STUDIO ACCESS:"
    echo "   URL: https://studio.artyom2040.com (or http://185.194.140.57:54323)"
    echo "   Username: $STUDIO_USER"
    echo "   Password: $STUDIO_PASS"
    echo ""
else
    echo "🎨 STUDIO ACCESS:"
    echo "   URL: http://185.194.140.57:54323"
    echo "   Try default credentials or check docker-compose.yml"
    echo ""
fi

echo "========================================="
echo ""
echo "✅ Configuration check complete!"
echo ""
