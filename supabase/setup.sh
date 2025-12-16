#!/bin/bash
# ============================================
# Supabase Migration Runner
# ============================================
# Usage: ./setup.sh <supabase-db-connection-string>
# Or run migrations manually in order via Supabase Studio SQL Editor

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "========================================="
echo "  Classic App - Supabase Setup Script"
echo "========================================="
echo ""

# Check if connection string is provided
if [ -z "$1" ]; then
    echo -e "${YELLOW}No connection string provided.${NC}"
    echo ""
    echo "Usage:"
    echo "  ./setup.sh 'postgresql://postgres:PASSWORD@HOST:5432/postgres'"
    echo ""
    echo "Alternative: Run migrations manually via Supabase Studio SQL Editor"
    echo "in the following order:"
    echo ""
    echo "  1. migrations/000_core_content_tables.sql"
    echo "  2. migrations/001_create_profiles_table.sql"
    echo "  3. migrations/001_admin_dashboard.sql"
    echo "  4. migrations/002_gamification_tables.sql"
    echo "  5. migrations/003_user_progress_extensions.sql"
    echo "  6. migrations/004_fix_profiles_rls.sql"
    echo ""
    echo "Then run seed files to populate data:"
    echo "  seeds/seed_*.sql"
    echo ""
    exit 0
fi

DB_URL=$1
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "Running migrations..."
echo ""

# Migration files in order
MIGRATIONS=(
    "000_core_content_tables.sql"
    "001_create_profiles_table.sql"
    "001_admin_dashboard.sql"
    "002_gamification_tables.sql"
    "003_user_progress_extensions.sql"
    "004_fix_profiles_rls.sql"
)

for migration in "${MIGRATIONS[@]}"; do
    echo -e "${YELLOW}Running: $migration${NC}"
    psql "$DB_URL" -f "$SCRIPT_DIR/migrations/$migration"
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓ $migration completed${NC}"
    else
        echo -e "${RED}✗ $migration failed${NC}"
        exit 1
    fi
    echo ""
done

echo "========================================="
echo -e "${GREEN}All migrations completed successfully!${NC}"
echo "========================================="
echo ""

# Ask about seeds
read -p "Do you want to run seed files to populate data? (y/n) " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo ""
    echo "Running seed files..."
    
    SEEDS=(
        "seed_periods.sql"
        "seed_composers.sql"
        "seed_terms.sql"
        "seed_forms.sql"
        "seed_releases.sql"
        "seed_concert_halls.sql"
        "seed_weekly_albums.sql"
        "seed_monthly_spotlights.sql"
        "seed_badges.sql"
        "seed_kickstart_lessons.sql"
    )
    
    for seed in "${SEEDS[@]}"; do
        echo -e "${YELLOW}Seeding: $seed${NC}"
        psql "$DB_URL" -f "$SCRIPT_DIR/seeds/$seed"
        if [ $? -eq 0 ]; then
            echo -e "${GREEN}✓ $seed completed${NC}"
        else
            echo -e "${RED}✗ $seed failed${NC}"
        fi
    done
    
    echo ""
    echo -e "${GREEN}Data seeding complete!${NC}"
fi

echo ""
echo "========================================="
echo "  Setup Complete!"
echo "========================================="
echo ""
echo "Next steps:"
echo "  1. Update your app's .env with Supabase credentials"
echo "  2. Set EXPO_PUBLIC_DATA_SOURCE=supabase"
echo "  3. Run: npx expo start"
echo ""
