#!/bin/bash

# ==============================================================================
# Setup SMTP for Supabase Auth (VPS)
# ==============================================================================
# This script generates the configuration needed to enable Signup Confirmation emails
# using Resend as the SMTP provider.
#
# Usage:
# 1. Copy the output to your VPS .env file in the supabase directory
# 2. Restart services
# ==============================================================================

echo "📧 Generatng SMTP Configuration for Supabase Auth..."
echo ""

# Check for Resend API Key in local .env
if [ -f .env ]; then
    RESEND_KEY=$(grep "^RESEND_API_KEY" .env | cut -d'=' -f2- | tr -d '"' | tr -d "'")
else
    echo "⚠️  .env file not found. Please verify you have a RESEND_API_KEY."
    RESEND_KEY="re_your_key_here"
fi

echo "Add the following lines to your VPS '.env' file (in ~/supabase/classic-app/):"
echo "--------------------------------------------------------------------------------"
echo ""
echo "# Auth Email Configuration (SMTP via Resend)"
echo "GOTRUE_SMTP_HOST=smtp.resend.com"
echo "GOTRUE_SMTP_PORT=465"
echo "GOTRUE_SMTP_USER=resend"
echo "GOTRUE_SMTP_PASS=$RESEND_KEY"
echo "GOTRUE_SMTP_ADMIN_EMAIL=admin@yourdomain.com"
echo "GOTRUE_SMTP_SENDER_NAME=Classical Music Companion"
echo "GOTRUE_MAILER_SECURE_CONTENT_TYPE=true"
echo ""
echo "--------------------------------------------------------------------------------"
echo ""
echo "After saving the .env file on your VPS, restart the Auth service:"
echo "   docker compose restart auth"
echo ""
echo "📝 NOTE: To DISABLE email confirmation (allow instant login), add this instead:"
echo "   GOTRUE_MAILER_AUTOCONFIRM=true"
echo ""
