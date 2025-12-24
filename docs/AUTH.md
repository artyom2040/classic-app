# Authentication System

Complete guide to the authentication system in Context Composer.

## 🎯 Overview

The app uses **Supabase** for authentication with **React Context** for state management. Features include:
- Email/password sign up and sign in
- Social login (Apple Sign-In, Google Sign-In, Facebook Login)
- User profiles with avatars
- Admin roles
- Profile management

---

## 🚀 Quick Start

### For Users

**Sign In:**
1. Go to Profile tab
2. Tap "Sign In"
3. Enter email and password
4. See user dashboard

**Create Account:**
1. Go to Profile tab
2. Tap "Create Account"
3. Fill in details and verify email
4. You're logged in!

**Sign Out:**
1. Go to Profile tab (when logged in)
2. Tap "Sign Out" button
3. Back to sign in prompt

### For Developers

**Use auth in your component:**
```typescript
import { useAuth } from '../context/AuthContext';

function MyComponent() {
  const { user, isAuthenticated, isLoading, isAdmin } = useAuth();

  if (isLoading) return <Text>Loading...</Text>;
  if (!isAuthenticated) return <Text>Sign in first</Text>;

  return <Text>Welcome, {user?.displayName || user?.email}</Text>;
}
```

---

## 📚 API Reference

### useAuth() Hook

Returns an object with:

**Properties:**
```typescript
user: UserProfile | null           // Current user
isLoading: boolean                 // Auth initializing
isAuthenticated: boolean           // User logged in
isAdmin: boolean                   // User is admin
```

**Methods:**
```typescript
// Email/Password
signInWithEmail(email, password)      // Sign in
signUpWithEmail(email, password, name) // Sign up
resetPassword(email)                  // Send reset email
updatePassword(newPassword)           // Change password

// OAuth
signInWithApple()                     // Apple Sign-In (iOS)
signInWithGoogle()                    // Google Sign-In
signInWithFacebook()                  // Facebook Login (native)

// Account
signOut()                             // Sign out
updateProfile({ displayName, avatarUrl }) // Update profile
refreshProfile()                      // Refresh from DB
```

---

## 🔐 How It Works

### Architecture

```
┌─────────────────────────────────────┐
│  React Components                   │
│  (use useAuth() hook)               │
└────────────┬────────────────────────┘
             │
┌────────────▼────────────────────────┐
│  AuthContext                        │
│  (manages auth state)               │
└────────────┬────────────────────────┘
             │
┌────────────▼────────────────────────┐
│  Supabase Client                    │
│  (handles auth operations)          │
└────────────┬────────────────────────┘
             │
┌────────────▼────────────────────────┐
│  Supabase Backend                   │
│  (stores users, profiles, sessions) │
└─────────────────────────────────────┘
```

### Flow

**Sign Up Flow:**
1. User enters email, password, display name
2. App calls `signUpWithEmail()`
3. Supabase creates user account
4. Profile created in profiles table
5. User receives verification email
6. After verification, user can sign in

**Sign In Flow:**
1. User enters email and password
2. App calls `signInWithEmail()`
3. Supabase verifies credentials
4. Session token stored locally
5. User profile loaded from DB
6. `isAuthenticated` becomes `true`
7. Auth state change triggered
8. UI updates to show dashboard

**Sign Out Flow:**
1. User taps "Sign Out"
2. App calls `signOut()`
3. Session cleared from device
4. `isAuthenticated` becomes `false`
5. User state cleared
6. UI shows auth prompt

---

## 💻 Usage Examples

### Protecting Routes
```typescript
function ProtectedScreen() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) return <LoadingScreen />;
  if (!isAuthenticated) return <AuthPrompt />;

  return <SecureContent />;
}
```

### Admin Only
```typescript
function AdminPanel() {
  const { isAdmin, isLoading } = useAuth();

  if (isLoading) return <LoadingScreen />;
  if (!isAdmin) return <Text>Access Denied</Text>;

  return <AdminContent />;
}
```

### Display User Info
```typescript
function UserCard() {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated || !user) return null;

  return (
    <View>
      <Text>{user.displayName || 'User'}</Text>
      <Text>{user.email}</Text>
      {user.role === 'admin' && <Text>👑 Admin</Text>}
    </View>
  );
}
```

### Error Handling
```typescript
const [error, setError] = useState<string | null>(null);
const { signInWithEmail } = useAuth();

const handleLogin = async (email: string, password: string) => {
  const { error } = await signInWithEmail(email, password);

  if (error) {
    setError(error.message);
    return;
  }

  navigation.navigate('MainTabs');
};
```

---

## 🔑 Environment Setup

Required in `.env.local`:

```
# Supabase
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_anon_key

# Google OAuth
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=your_google_web_client_id.apps.googleusercontent.com
EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID=your_google_ios_client_id.apps.googleusercontent.com

# Facebook OAuth (optional)
EXPO_PUBLIC_FACEBOOK_APP_ID=your_facebook_app_id
EXPO_PUBLIC_FACEBOOK_CLIENT_TOKEN=your_facebook_client_token

# Redirect URLs
EXPO_PUBLIC_AUTH_REDIRECT_URL=contextcomposer://auth-callback
```

---

## 🔐 OAuth Provider Setup

### Google Sign-In

1. **Google Cloud Console Setup:**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create or select a project
   - Enable **Google+ API** and **Google Identity Toolkit API**
   - Go to **Credentials** → **Create Credentials** → **OAuth 2.0 Client IDs**

2. **Create OAuth Clients:**

   **Web Client (required for all platforms):**
   - Application type: Web application
   - Authorized redirect URIs: Add your Supabase project callback URL:
     `https://your-project.supabase.co/auth/v1/callback`
   - Copy the Client ID → `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID`

   **iOS Client:**
   - Application type: iOS
   - Bundle ID: `com.contextcomposer.app`
   - Copy the Client ID → `EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID`
   - Update `app.json` → `iosUrlScheme`: `com.googleusercontent.apps.<IOS_CLIENT_ID>`

   **Android Client:**
   - Application type: Android
   - Package name: `com.contextcomposer.app`
   - SHA-1 fingerprint: Get from EAS build logs or run:
     ```bash
     eas credentials --platform android
     ```

3. **Supabase Configuration:**
   - Go to Supabase Dashboard → **Authentication** → **Providers** → **Google**
   - Enable Google provider
   - Enter Web Client ID and Client Secret

### Apple Sign-In (iOS only)

1. **Apple Developer Setup:**
   - Go to [Apple Developer Portal](https://developer.apple.com/account)
   - Select your app under **Identifiers**
   - Enable **Sign In with Apple** capability

2. **Create Service ID (for Supabase):**
   - Go to **Identifiers** → **+** → **Services IDs**
   - Configure with your domain and return URL:
     `https://your-project.supabase.co/auth/v1/callback`

3. **Create Private Key:**
   - Go to **Keys** → **+**
   - Enable **Sign In with Apple**
   - Download the `.p8` key file

4. **Supabase Configuration:**
   - Go to Supabase Dashboard → **Authentication** → **Providers** → **Apple**
   - Enter Service ID, Team ID, Key ID, and the private key content

5. **app.json Configuration:**
   - `usesAppleSignIn: true` is already set
   - The `expo-apple-authentication` plugin is included

### Facebook Login

1. **Facebook Developer Setup:**
   - Go to [Facebook Developers](https://developers.facebook.com/)
   - Create a new app → **Consumer**

2. **Configure App:**
   - In your app dashboard, go to **Settings** → **Basic**
   - Copy **App ID** → `EXPO_PUBLIC_FACEBOOK_APP_ID`
   - Copy **Client Token** → `EXPO_PUBLIC_FACEBOOK_CLIENT_TOKEN`

3. **Add Facebook Login Product:**
   - Go to **Products** → **Add Product** → **Facebook Login**
   - Under **Settings** → **Valid OAuth Redirect URIs**, add:
     `https://your-project.supabase.co/auth/v1/callback`

4. **Platform Configuration:**
   
   **iOS:**
   - Go to **Settings** → **Basic** → scroll to **iOS**
   - Add Bundle ID: `com.contextcomposer.app`
   
   **Android:**
   - Add Package Name: `com.contextcomposer.app`
   - Add Key Hashes (SHA-1 converted to base64):
     ```bash
     echo SHA1_HEX | xxd -r -p | base64
     ```

5. **app.json Configuration:**
   - Update the `expo-facebook` plugin placeholders with your App ID and Client Token

6. **Supabase Configuration:**
   - Go to Supabase Dashboard → **Authentication** → **Providers** → **Facebook**
   - Enable and enter App ID and App Secret

---

## 📊 Data Types

### UserProfile
```typescript
interface UserProfile {
  id: string;                    // UUID from Supabase
  email: string;                 // User email
  displayName: string | null;    // Optional name
  avatarUrl: string | null;      // Optional avatar
  role: 'user' | 'admin';        // User role
  createdAt: string;             // ISO timestamp
  updatedAt: string;             // ISO timestamp
}
```

### AuthState
```typescript
interface AuthState {
  user: UserProfile | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
}
```

---

## 🎭 UI Components

### Profile Tab (Unauthenticated)
Shows auth prompt with:
- Sign In button
- Create Account button
- Continue without signing in link

### Profile Tab (Authenticated)
Shows user dashboard with:
- User avatar + name + email
- Admin badge (if admin)
- Learning progress
- Settings link
- Sign Out button

### Login Screen
Email/password form with:
- Email input
- Password input (with show/hide toggle)
- Forgot password link
- Apple Sign-In button (iOS)
- Google Sign-In button
- Facebook Login button (native)
- Sign up link

### Register Screen
Sign up form with:
- Display name input (optional)
- Email input
- Password input
- Confirm password input
- Create account button
- Sign in link

---

## 🐛 Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| "Supabase not configured" | Check `.env.local` has all variables |
| "Invalid credentials" | Verify email and password |
| "User already registered" | Email exists - use sign in or password reset |
| "Profile not created" | Check profiles table RLS policies |
| "Session expires quickly" | Check Supabase session timeout settings |

---

## 🔍 Debugging

### Check Auth State
```typescript
const { user, isAuthenticated, isLoading } = useAuth();
console.log('Auth state:', { user, isAuthenticated, isLoading });
```

### View Console Logs
Auth operations log with `[Auth]` prefix:
```
[Auth] Session found for user: abc123
[Auth] User signed in: abc123
[Auth] Failed to fetch user profile: ...
```

### Test Auth Flow
1. Sign up with test email
2. Verify email (check email inbox)
3. Sign in with credentials
4. See user dashboard
5. Check console for logs
6. Sign out
7. Verify back to auth prompt

---

## 📁 Files

```
src/context/AuthContext.tsx     # Auth provider and hook
src/screens/Auth/
  ├─ LoginScreen.tsx            # Sign in form
  ├─ RegisterScreen.tsx          # Sign up form
  └─ ForgotPasswordScreen.tsx    # Password reset

src/services/supabaseClient.ts  # Supabase setup

docs/AUTH.md                     # This file
```

---

## ✅ Checklist for Implementation

- [x] Supabase configured
- [x] Auth context created
- [x] Login/Register screens
- [x] Profile management
- [x] OAuth integration (Apple, Google, Facebook)
- [x] Error handling with logging
- [x] Type-safe API
- [x] Profile tab integration
- [x] Hamburger menu integration

---

## 🚀 Next Steps

1. **Test signup** - Create test account
2. **Verify email** - Check that email verification works
3. **Test login** - Sign in with credentials
4. **Test OAuth** - Try Apple/Google/Facebook sign-in
5. **Test profile** - Check profile info displays correctly
6. **Test admin** - Set user role to admin in Supabase and verify features
7. **Test sign out** - Verify clean logout

---

## 💡 Tips

- Always check `isLoading` before checking `isAuthenticated`
- Profile creation happens automatically on signup
- OAuth doesn't require password verification
- Admin status requires manual role change in Supabase
- Sessions persist across app restarts
- Password reset tokens expire after 24 hours

---

See also: [Hamburger Menu](./HAMBURGER_MENU.md) for auth-aware navigation
