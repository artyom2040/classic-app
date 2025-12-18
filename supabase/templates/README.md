# Email Templates for Supabase

Beautiful, branded email templates for Context Composer.

## Templates

| Template | File | Purpose |
|----------|------|---------|
| Welcome/Confirm | `confirm.html` | Sent when new user signs up |
| Password Reset | `recovery.html` | Sent when user requests password reset (includes OTP code) |
| Invitation | `invite.html` | Sent when admin invites a user |
| Email Change | `email_change.html` | Sent when user changes email address |

## Deployment to VPS

### Step 1: Copy templates to VPS

```bash
# From your local machine
cd supabase/templates
scp *.html root@185.194.140.57:/root/supabase-project/volumes/templates/
```

### Step 2: Update Supabase .env on VPS

```bash
ssh root@185.194.140.57
cd /root/supabase-project

# Add these lines to .env (or edit existing ones)
cat >> .env << 'EOF'

# Custom Email Templates
GOTRUE_MAILER_TEMPLATES_CONFIRMATION=/templates/confirm.html
GOTRUE_MAILER_TEMPLATES_RECOVERY=/templates/recovery.html
GOTRUE_MAILER_TEMPLATES_INVITE=/templates/invite.html
GOTRUE_MAILER_TEMPLATES_EMAIL_CHANGE=/templates/email_change.html
EOF
```

### Step 3: Mount templates volume in docker-compose.yml

Edit `/root/supabase-project/docker-compose.yml` and add the volumes mount to the `auth` service:

```yaml
services:
  auth:
    # ... existing config ...
    volumes:
      - ./volumes/templates:/templates:ro
```

### Step 4: Create templates directory and copy files

```bash
mkdir -p /root/supabase-project/volumes/templates
# Copy templates from your project
```

### Step 5: Restart Supabase

```bash
docker compose down
docker compose up -d
```

## Template Variables

Supabase GoTrue uses Go templating. Available variables:

| Variable | Description |
|----------|-------------|
| `{{ .ConfirmationURL }}` | Full URL for confirmation/action |
| `{{ .Token }}` | OTP token (6-digit code) |
| `{{ .SiteURL }}` | Your site URL |
| `{{ .Email }}` | User's email address |

## Design

- **Color Scheme**: Purple (#8b5cf6) to match app theme
- **Background**: Dark (#0f0a1a)
- **Style**: Modern, gradient-based, glassmorphism-inspired
- **Mobile-friendly**: Uses table-based layout for email client compatibility
