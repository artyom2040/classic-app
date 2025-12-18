# Context Composer - Deployment Guide

This guide covers deploying Context Composer to your VPS with proper Supabase configuration.

## 🚀 Quick Start for VPS Deployment

### 1. Environment Setup

Create a `.env` file in your project root:

```bash
cp .env.example .env
```

Fill in your environment variables:

```bash
# Production environment
NODE_ENV=production

# Your Supabase configuration
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here

# Your VPS API endpoint
EXPO_PUBLIC_API_URL=https://api.artyom2040.com

# Disable debug features for production
EXPO_PUBLIC_ENABLE_DEBUG_LOGGING=false
EXPO_PUBLIC_ENABLE_PERFORMANCE_MONITORING=false
EXPO_PUBLIC_ENABLE_NETWORK_LOGGING=false
```

### 2. Build for Production

```bash
# Install dependencies
npm install

# Build for Android
eas build --platform android --profile production

# Build for iOS
eas build --platform ios --profile production

# Build for web
npm run build:web
```

### 3. Supabase Configuration

#### Environment Variables in Supabase

Set these in your Supabase project settings:

1. Go to your Supabase project
2. Navigate to Settings → Config
3. Add your environment variables:
   - `PUBLIC_SUPABASE_URL`: Your project URL
   - `PUBLIC_SUPABASE_ANON_KEY`: Your anon key
   - `SUPABASE_SERVICE_ROLE_KEY`: Service role key (for server functions)

#### CORS Configuration

Ensure your Supabase project allows requests from your domain:

1. Go to Settings → API
2. Add your domains to "Allowed URLs":
   - `https://api.artyom2040.com`
   - `https://yourapp.com`
   - `https://*.yourapp.com`

#### Database Setup

Run the migration scripts:

```bash
# Apply database schema
psql -d your_database_url -f supabase/migrations/*.sql

# Seed initial data
psql -d your_database_url -f supabase/seeds/*.sql
```

### 4. VPS Configuration

#### Caddy Web Server Configuration

Create a `Caddyfile`:

```caddyfile
api.artyom2040.com {
    reverse_proxy localhost:3000
    
    # CORS headers for Supabase
    header Access-Control-Allow-Origin *
    header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS"
    header Access-Control-Allow-Headers "Content-Type, Authorization, x-supabase-api-version"
    
    # Health check endpoint
    handle /health {
        respond "OK" 200
    }
}
```

#### Environment Variables on VPS

Set environment variables on your VPS:

```bash
# Add to your shell profile (~/.bashrc, ~/.zshrc, or systemd service)
export EXPO_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
export EXPO_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"
export NODE_ENV="production"
export EXPO_PUBLIC_API_URL="https://api.artyom2040.com"
```

### 5. Application Monitoring

#### Health Checks

Test your deployment:

```bash
# Check Supabase connection
curl -X GET "https://api.artyom2040.com/health"

# Test Supabase connectivity
npx expo start --config
```

#### Logging

Monitor application logs:

```bash
# View app logs
pm2 logs context-composer

# View system logs
journalctl -u context-composer -f
```

## 🔄 Environment Switching

The app automatically detects the environment and configures accordingly:

### Development
- Uses local Supabase or staging
- Debug logging enabled
- Performance monitoring active

### Staging
- Uses staging Supabase project
- Analytics and error tracking enabled
- Moderate debug logging

### Production
- Uses production Supabase project
- All debug features disabled
- Optimized performance settings

## 🛠️ Troubleshooting

### Common Issues

#### 1. Supabase Connection Errors

**Symptoms**: App crashes on startup with "Supabase not configured"

**Solutions**:
- Verify `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_ANON_KEY` are set
- Check that your Supabase project is running
- Ensure CORS settings allow your domain
- Test connection with: `await testSupabaseConnection()`

#### 2. Environment Variables Not Loading

**Symptoms**: App uses default values instead of your configuration

**Solutions**:
- Rebuild the app after changing `.env` file
- Check that `.env` file is in project root
- Verify variable names match `EXPO_PUBLIC_*` pattern
- For EAS builds, set variables in `eas.json`

#### 3. Network Timeouts

**Symptoms**: Slow loading or timeout errors

**Solutions**:
- Check VPS network connectivity
- Verify Supabase project region is optimal
- Add retry logic for network requests
- Monitor API response times

#### 4. CORS Errors

**Symptoms**: "Cross-Origin Request Blocked" in browser

**Solutions**:
- Add your domain to Supabase CORS settings
- Configure Caddy/NGINX CORS headers
- Check for mixed content (HTTP/HTTPS)

### Debug Commands

```bash
# Test Supabase connection
node -e "
const { testSupabaseConnection } = require('./src/services/supabaseClient');
testSupabaseConnection().then(console.log);
"

# Check environment configuration
node -e "
const { config } = require('./src/config/environment');
console.log(JSON.stringify(config, null, 2));
"

# Validate environment variables
node -e "
console.log('SUPABASE_URL:', process.env.EXPO_PUBLIC_SUPABASE_URL);
console.log('SUPABASE_ANON_KEY:', process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY?.substring(0, 10));
console.log('NODE_ENV:', process.env.NODE_ENV);
"
```

## 📦 Build Configuration

### EAS Build Profiles

Update `eas.json` for different environments:

```json
{
  "build": {
    "development": {
      "env": {
        "NODE_ENV": "development",
        "EXPO_PUBLIC_SUPABASE_URL": "https://dev-project.supabase.co",
        "EXPO_PUBLIC_SUPABASE_ANON_KEY": "dev-key"
      }
    },
    "staging": {
      "env": {
        "NODE_ENV": "staging",
        "EXPO_PUBLIC_SUPABASE_URL": "https://staging-project.supabase.co",
        "EXPO_PUBLIC_SUPABASE_ANON_KEY": "staging-key"
      }
    },
    "production": {
      "env": {
        "NODE_ENV": "production",
        "EXPO_PUBLIC_SUPABASE_URL": "https://your-project.supabase.co",
        "EXPO_PUBLIC_SUPABASE_ANON_KEY": "your-production-key"
      }
    }
  }
}
```

### Build Commands

```bash
# Development build
eas build --profile development

# Staging build
eas build --profile staging

# Production build
eas build --profile production
```

## 🔒 Security Considerations

### Environment Variables
- Never commit `.env` files to version control
- Use different Supabase projects for each environment
- Rotate API keys regularly
- Use service role keys only in trusted environments

### Supabase Security
- Enable Row Level Security (RLS) on all tables
- Use proper authentication policies
- Limit API rate limiting
- Monitor usage and set alerts

### VPS Security
- Use HTTPS with valid SSL certificates
- Set up firewall rules
- Regular system updates
- Monitor access logs

## 📊 Monitoring & Analytics

### Performance Monitoring
The app includes built-in performance monitoring:

- Component render times
- Network request durations
- Database query performance
- Memory usage tracking

### Error Tracking
Enable error tracking in production:

```bash
EXPO_PUBLIC_ENABLE_ERROR_TRACKING=true
```

### Health Endpoints
Monitor application health:

- `/health` - Basic health check
- `/api/health` - Detailed system status
- `/api/metrics` - Performance metrics

## 🚀 Scaling Considerations

### Database Scaling
- Use connection pooling
- Implement read replicas for high traffic
- Optimize queries and indexes
- Monitor database performance

### Application Scaling
- Use load balancers for multiple instances
- Implement caching strategies
- Monitor resource usage
- Set up auto-scaling

### CDN Integration
- Serve static assets via CDN
- Cache API responses appropriately
- Use edge locations for global users

## 📞 Support

If you encounter issues:

1. Check the [troubleshooting section](#troubleshooting)
2. Review application logs
3. Test individual components
4. Verify environment configuration
5. Check Supabase project status

For additional help:
- Check the [main README](README.md)
- Review [Supabase documentation](https://supabase.com/docs)
- Contact the development team
