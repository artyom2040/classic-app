# OAuth Setup & App Store Publishing Guide

Complete guide for configuring OAuth providers and publishing Context Composer to app stores.

---

## Part 1: OAuth Provider Configuration

### Self-Hosted Supabase OAuth Setup

Since you're running self-hosted Supabase, OAuth providers are configured via environment variables in `docker-compose.yml` under the `supabase-auth` service.

SSH to your VPS and edit:
```bash
cd /root/supabase-project
nano docker-compose.yml
```

Add these under `supabase-auth` → `environment`:

---

### 1.1 Google OAuth

**Step 1: Google Cloud Console Setup**

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create new project or select existing
3. Go to **APIs & Services** → **OAuth consent screen**
   - User Type: **External**
   - App name: `Context Composer`
   - User support email: your email
   - Developer contact: your email
   - Click **Save and Continue**
   - Scopes: Add `email`, `profile`, `openid`
   - Test users: Add your email for testing
   - Click **Save and Continue** → **Back to Dashboard**

4. Go to **APIs & Services** → **Credentials** → **+ Create Credentials** → **OAuth client ID**

**Create 3 OAuth Clients:**

| Type | Name | Configuration |
|------|------|---------------|
| Web | Context Composer Web | Redirect URI: `https://api.artyom2040.com/auth/v1/callback` |
| iOS | Context Composer iOS | Bundle ID: `com.contextcomposer.app` |
| Android | Context Composer Android | Package: `com.contextcomposer.app`, SHA-1: (from EAS) |

**Get SHA-1 for Android:**
```bash
eas credentials --platform android
# Or from EAS build logs
```

**Step 2: Add to docker-compose.yml**

```yaml
# Under supabase-auth → environment:
GOTRUE_EXTERNAL_GOOGLE_ENABLED: "true"
GOTRUE_EXTERNAL_GOOGLE_CLIENT_ID: "YOUR_WEB_CLIENT_ID.apps.googleusercontent.com"
GOTRUE_EXTERNAL_GOOGLE_SECRET: "YOUR_WEB_CLIENT_SECRET"
GOTRUE_EXTERNAL_GOOGLE_REDIRECT_URI: "https://api.artyom2040.com/auth/v1/callback"
```

**Step 3: Add to app .env**

```env
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=YOUR_WEB_CLIENT_ID.apps.googleusercontent.com
EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID=YOUR_IOS_CLIENT_ID.apps.googleusercontent.com
```

**Step 4: Update app.json**

Replace the placeholder in `@react-native-google-signin/google-signin` plugin:
```json
"iosUrlScheme": "com.googleusercontent.apps.YOUR_IOS_CLIENT_ID"
```

---

### 1.2 Apple Sign-In

**Step 1: Apple Developer Setup**

1. Go to [Apple Developer](https://developer.apple.com/account)
2. **Certificates, Identifiers & Profiles** → **Identifiers**
3. Select your App ID (`com.contextcomposer.app`)
4. Enable **Sign In with Apple** → **Configure**
   - Primary App ID: Select your app
   - Click **Save**

**Step 2: Create Service ID (for Supabase callback)**

1. **Identifiers** → **+** → **Services IDs** → **Continue**
2. Description: `Context Composer Auth`
3. Identifier: `com.contextcomposer.auth` (different from app bundle ID)
4. Click **Register**
5. Click on the new Service ID → Enable **Sign In with Apple** → **Configure**
   - Primary App ID: `com.contextcomposer.app`
   - Domains: `api.artyom2040.com`
   - Return URLs: `https://api.artyom2040.com/auth/v1/callback`
   - Click **Save** → **Continue** → **Save**

**Step 3: Create Private Key**

1. **Keys** → **+**
2. Key Name: `Context Composer Auth Key`
3. Enable **Sign In with Apple** → **Configure**
   - Primary App ID: `com.contextcomposer.app`
   - Click **Save**
4. Click **Continue** → **Register**
5. **Download** the `.p8` file (only chance!)
6. Note the **Key ID** shown

**Step 4: Get Team ID**

Your Team ID is in the top-right of the Apple Developer portal, or in **Membership** → **Team ID**

**Step 5: Add to docker-compose.yml**

```yaml
GOTRUE_EXTERNAL_APPLE_ENABLED: "true"
GOTRUE_EXTERNAL_APPLE_CLIENT_ID: "com.contextcomposer.auth"
GOTRUE_EXTERNAL_APPLE_SECRET: |
  -----BEGIN PRIVATE KEY-----
  MIGTAgEA... (contents of your .p8 file)
  -----END PRIVATE KEY-----
GOTRUE_EXTERNAL_APPLE_REDIRECT_URI: "https://api.artyom2040.com/auth/v1/callback"
```

Also add these for JWT generation:
```yaml
GOTRUE_EXTERNAL_APPLE_TEAM_ID: "YOUR_TEAM_ID"
GOTRUE_EXTERNAL_APPLE_KEY_ID: "YOUR_KEY_ID"
```

---

### 1.3 Facebook Login

**Step 1: Facebook Developer Setup**

1. Go to [Facebook Developers](https://developers.facebook.com/)
2. **My Apps** → **Create App**
3. Select **Consumer** → **Next**
4. App name: `Context Composer`
5. Click **Create App**

**Step 2: Configure Facebook Login**

1. In your app dashboard, click **Add Product** → **Facebook Login** → **Set Up**
2. Skip the quickstart, go to **Facebook Login** → **Settings**
3. Add Valid OAuth Redirect URIs:
   ```
   https://api.artyom2040.com/auth/v1/callback
   ```
4. Click **Save Changes**

**Step 3: Get Credentials**

1. Go to **Settings** → **Basic**
2. Copy **App ID**
3. Copy **App Secret** (click Show)
4. Scroll down, copy **Client Token**

**Step 4: Add Platform Configuration**

Still in **Settings** → **Basic**, scroll to bottom:

**Add iOS:**
- Bundle ID: `com.contextcomposer.app`

**Add Android:**
- Package Name: `com.contextcomposer.app`
- Class Name: `com.contextcomposer.app.MainActivity`
- Key Hashes: Convert SHA-1 to base64:
  ```bash
  echo "YOUR_SHA1_HEX" | xxd -r -p | base64
  ```

**Step 5: Add to docker-compose.yml**

```yaml
GOTRUE_EXTERNAL_FACEBOOK_ENABLED: "true"
GOTRUE_EXTERNAL_FACEBOOK_CLIENT_ID: "YOUR_FACEBOOK_APP_ID"
GOTRUE_EXTERNAL_FACEBOOK_SECRET: "YOUR_FACEBOOK_APP_SECRET"
GOTRUE_EXTERNAL_FACEBOOK_REDIRECT_URI: "https://api.artyom2040.com/auth/v1/callback"
```

**Step 6: Update app.json**

Replace placeholders in `expo-facebook` plugin:
```json
{
  "facebookAppId": "YOUR_FACEBOOK_APP_ID",
  "facebookDisplayName": "Context Composer",
  "facebookClientToken": "YOUR_CLIENT_TOKEN"
}
```

**Step 7: Add to .env**

```env
EXPO_PUBLIC_FACEBOOK_APP_ID=YOUR_FACEBOOK_APP_ID
EXPO_PUBLIC_FACEBOOK_CLIENT_TOKEN=YOUR_CLIENT_TOKEN
```

---

### 1.4 Apply Supabase Changes

After updating docker-compose.yml:

```bash
cd /root/supabase-project
docker compose down
docker compose up -d
docker compose logs -f supabase-auth
```

Check for errors. Auth service should start successfully.

---

## Part 2: Google Play Store Publishing

### 2.1 Create Google Play Developer Account

1. Go to [Google Play Console](https://play.google.com/console)
2. Pay one-time $25 registration fee
3. Complete identity verification (may take 48 hours)
4. Accept Developer Distribution Agreement

### 2.2 Create App Listing

1. **All apps** → **Create app**
2. Fill in:
   - App name: `Context Composer`
   - Default language: English
   - App or game: App
   - Free or paid: Free
   - Accept declarations
3. Click **Create app**

### 2.3 Store Listing Setup

Go to **Grow** → **Store presence** → **Main store listing**:

| Field | Value |
|-------|-------|
| App name | Context Composer |
| Short description | Learn classical music with curated content and interactive guides |
| Full description | (Your detailed description, 4000 chars max) |

**Graphics:**
| Asset | Size |
|-------|------|
| App icon | 512x512 PNG |
| Feature graphic | 1024x500 PNG |
| Phone screenshots | Min 2, 16:9 or 9:16, 320-3840px |
| Tablet screenshots | 7" and 10" recommended |

### 2.4 App Content (Required before release)

Go to **Policy** → **App content** and complete:

1. **Privacy policy** - Add URL (required)
2. **Ads** - Declare if app has ads
3. **App access** - If login required, provide test credentials
4. **Content ratings** - Complete IARC questionnaire
5. **Target audience** - Select age groups
6. **News apps** - Not a news app
7. **COVID-19** - Not COVID-related
8. **Data safety** - Declare data collection practices
9. **Government apps** - Not a government app
10. **Financial features** - None

### 2.5 Build Release APK/AAB

```bash
# Production build (AAB for Play Store)
eas build --platform android --profile production

# This creates an .aab file
```

### 2.6 Create Release

1. Go to **Release** → **Production** (or Testing tracks first)
2. **Create new release**
3. Upload your `.aab` file
4. Add release notes
5. Click **Review release**
6. Click **Start rollout to Production**

### 2.7 Testing Tracks (Recommended)

Before production, use testing tracks:

| Track | Purpose |
|-------|---------|
| Internal testing | Up to 100 testers, instant approval |
| Closed testing | Invite-only, Play Store review |
| Open testing | Public opt-in beta |

---

## Part 3: Apple App Store Publishing

### 3.1 Create Apple Developer Account

1. Go to [Apple Developer Program](https://developer.apple.com/programs/)
2. Click **Enroll**
3. Sign in with Apple ID
4. Select account type:
   - Individual: $99/year, uses your name
   - Organization: $99/year, requires D-U-N-S number
5. Pay annual fee
6. Wait for approval (24-48 hours)

### 3.2 App Store Connect Setup

1. Go to [App Store Connect](https://appstoreconnect.apple.com/)
2. **My Apps** → **+** → **New App**
3. Fill in:
   - Platform: iOS
   - Name: Context Composer
   - Primary Language: English
   - Bundle ID: `com.contextcomposer.app`
   - SKU: `contextcomposer001`
   - User Access: Full Access

### 3.3 App Information

Go to **App Store** tab → **App Information**:

| Field | Value |
|-------|-------|
| Name | Context Composer |
| Subtitle | Classical Music Learning |
| Category | Education (Primary), Music (Secondary) |
| Content Rights | Declare all rights owned/licensed |
| Age Rating | Complete questionnaire |

### 3.4 Prepare Submission

**App Store** → **iOS App** → **Version**:

| Section | Requirements |
|---------|--------------|
| Screenshots | 6.7", 6.5", 5.5" iPhone required; iPad recommended |
| Description | App description (4000 chars max) |
| Keywords | Comma-separated, 100 chars max |
| Support URL | Required |
| Marketing URL | Optional |
| Privacy Policy URL | Required |

**Screenshot Sizes:**
| Device | Size |
|--------|------|
| iPhone 6.7" | 1290 x 2796 or 1284 x 2778 |
| iPhone 6.5" | 1242 x 2688 or 1284 x 2778 |
| iPhone 5.5" | 1242 x 2208 |
| iPad Pro 12.9" | 2048 x 2732 |
| iPad Pro 11" | 1668 x 2388 |

### 3.5 Build for App Store

```bash
# Production build for App Store
eas build --platform ios --profile production

# Submit directly to App Store
eas submit --platform ios
```

Or upload manually via Transporter app.

### 3.6 TestFlight (Beta Testing)

1. Build appears in **TestFlight** after processing
2. Add internal testers (up to 100)
3. Add external testers (requires Beta App Review)
4. Share public link for open beta

### 3.7 Submit for Review

1. **App Store** → Your version → **Add for Review**
2. Answer review questions:
   - Sign-in required? Provide demo account
   - Uses encryption? (Yes for HTTPS)
   - Third-party content? Declare rights
3. Click **Submit for Review**
4. Wait 24-48 hours (first review may take longer)

---

## Part 4: EAS Build Configuration

### 4.1 Current eas.json

Your `eas.json` should have:

```json
{
  "cli": {
    "version": ">= 3.0.0"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "distribution": "internal",
      "android": {
        "buildType": "apk"
      }
    },
    "production": {
      "android": {
        "buildType": "app-bundle"
      },
      "ios": {
        "autoIncrement": true
      }
    }
  },
  "submit": {
    "production": {
      "android": {
        "serviceAccountKeyPath": "./google-play-key.json",
        "track": "production"
      },
      "ios": {
        "appleId": "your@email.com",
        "ascAppId": "YOUR_APP_STORE_CONNECT_APP_ID"
      }
    }
  }
}
```

### 4.2 Automated Submission

**Google Play:**
1. Create service account in Google Cloud
2. Download JSON key
3. Add to project as `google-play-key.json`
4. Grant access in Play Console → **Users and permissions**

**App Store:**
```bash
eas submit --platform ios
# Follow prompts for Apple ID and app-specific password
```

---

## Part 5: Checklist

### Before First Release

- [ ] OAuth providers configured in docker-compose.yml
- [ ] Google Cloud OAuth clients created (Web, iOS, Android)
- [ ] Apple Sign-In configured (Service ID, Key)
- [ ] Facebook App created with platforms configured
- [ ] App icons and screenshots prepared
- [ ] Privacy policy URL live
- [ ] App description written
- [ ] Test accounts created for app review

### Google Play

- [ ] Developer account verified
- [ ] Store listing complete
- [ ] App content declarations done
- [ ] Content rating completed
- [ ] AAB uploaded
- [ ] Internal testing successful

### App Store

- [ ] Developer account active
- [ ] App Store Connect app created
- [ ] TestFlight beta tested
- [ ] All screenshots uploaded
- [ ] App Review submission complete

---

## Troubleshooting

### OAuth not working after Supabase restart

```bash
docker compose logs supabase-auth | grep -i error
```

Common issues:
- Missing quotes around values in YAML
- Invalid redirect URI
- Expired Apple private key

### Google Sign-In fails on Android

- Verify SHA-1 fingerprint matches EAS build
- Check package name is exact match
- Ensure Web Client ID is used for token validation

### Apple Sign-In shows "invalid_client"

- Service ID must be different from Bundle ID
- Return URL must match exactly
- Private key must be valid and not expired

### Facebook shows "App not set up"

- Ensure app is in "Live" mode (not Development)
- Add your email to Roles → Testers for dev mode testing
