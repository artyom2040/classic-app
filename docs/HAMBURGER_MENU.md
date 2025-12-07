# Hamburger Menu (☰)

Quick navigation drawer accessible from any tab via the hamburger icon (☰).

## 🎯 Quick Start

### Open the Menu
Tap the ☰ icon in the top-left of any tab screen (Home, Timeline, Glossary, Forms, Profile)

### Navigation
- **Guests:** See Sign In / Create Account buttons
- **Users:** See profile info + View Profile button
- **Admins:** See admin badge + Admin Dashboard link

### Close the Menu
- Tap the ✕ button, or
- Tap the overlay (dark area), or
- Tap a navigation item

---

## 🎨 Visual

### Menu Icon (Closed)
```
Home Screen
┌──────────────────────────┐
│ ☰  Home     🔍  ⚙️      │  ← Tap the ☰ icon
│                          │
│  [Screen Content]        │
│                          │
│ 🏠 🕐 📖 🎵 👤         │
└──────────────────────────┘
```

### Menu Drawer (Open)

**For Guests:**
```
┌──────────────────────────┐
│ ☰ Menu              ✕   │
├──────────────────────────┤
│  [Sign In →]             │
│  Don't have account?     │
│  [Create Account →]      │
├──────────────────────────┤
│  NAVIGATION              │
│  • Home                 │
│  • Timeline             │
│  • Glossary             │
│  • Forms                │
│  • Settings             │
│  • Badges               │
│  • Search               │
├──────────────────────────┤
│  App Info               │
└──────────────────────────┘
```

**For Authenticated Users:**
```
┌──────────────────────────┐
│ ☰ Menu              ✕   │
├──────────────────────────┤
│  👤 John Doe            │
│     john@email.com       │
│                          │
│  [View Profile →]        │
├──────────────────────────┤
│  NAVIGATION              │
│  • Home                 │
│  • Timeline             │
│  • Glossary             │
│  • Forms                │
│  • Settings             │
│  • Badges               │
│  • Search               │
├──────────────────────────┤
│  [Sign Out - Red]        │
├──────────────────────────┤
│  App Info               │
└──────────────────────────┘
```

**For Admin Users:**
```
Same as above +
├──────────────────────────┤
│  👑 Admin Dashboard  →  │  ← Extra link for admins
├──────────────────────────┤
```

---

## 🚀 Features

✅ Beautiful slide-out drawer
✅ Auth-aware (different UI for guests/users/admins)
✅ Theme-aware (all themes supported)
✅ Smooth animations
✅ Quick navigation to 7 sections
✅ User profile display
✅ Admin dashboard access
✅ Easy to close
✅ Scrollable for small screens

---

## 🔐 Auth Integration

The menu shows different content based on authentication state:

| State | Shows |
|-------|-------|
| **Loading** | "Loading..." text |
| **Guest** | Sign In / Create Account buttons |
| **User** | Profile info + navigation |
| **Admin** | Profile info + Admin Dashboard + navigation |

---

## 🗂️ Navigation Items

| Item | Action |
|------|--------|
| Home | Navigate to Home tab |
| Timeline | Navigate to Timeline tab |
| Glossary | Navigate to Glossary tab |
| Forms | Navigate to Forms tab |
| Settings | Navigate to Settings screen |
| Badges | Navigate to Badges screen |
| Search | Navigate to Search screen |

Additional options:
- **Sign In / Create Account** (guests only)
- **View Profile** (authenticated users)
- **Admin Dashboard** (admins only)
- **Sign Out** (authenticated users)

---

## 💻 Implementation

### Component Location
`src/components/HamburgerMenu.tsx` (320 lines)

### How It's Integrated
The menu is added to the Tab Navigator header:

```typescript
<Tab.Navigator
  screenOptions={{
    headerLeft: () => <HamburgerMenu />,
    // ... other options
  }}
>
```

This makes the hamburger icon appear on all 5 tab screens:
- Home
- Timeline
- Glossary
- Forms
- Profile

### Using the Component

**In Tab Navigator:**
Already integrated - no action needed!

**In Other Screens:**
```typescript
import { HamburgerMenu } from '../components';

<Stack.Screen
  name="MyScreen"
  component={MyScreen}
  options={{
    headerLeft: () => <HamburgerMenu />
  }}
/>
```

---

## 🎨 Theme Support

Works with all themes:
- ✅ Default theme
- ✅ Dark mode
- ✅ Glass morphism
- ✅ Neo-brutalist

Colors and styling automatically adapt to the selected theme.

---

## 📱 Responsive Design

- **Phone (small):** 75% of screen width
- **Phone (large):** 75% of screen width
- **Tablet:** 75% of screen width (capped at 320px max)
- **Scrollable:** Content scrolls on small screens

---

## ✨ Animations

**Menu Open:**
- Overlay fades in (transparent → 50% black)
- Drawer slides in from left
- Duration: ~300ms
- Smooth easing

**Menu Close:**
- Overlay fades out
- Drawer slides out to left
- Duration: ~300ms
- Smooth easing

---

## 🔄 User Flows

### Flow 1: Guest → Sign In
```
Tap ☰ Menu
    ↓
See "Sign In" button
    ↓
Tap "Sign In"
    ↓
LoginScreen
    ↓
Menu now shows user profile
```

### Flow 2: Guest → Create Account
```
Tap ☰ Menu
    ↓
See "Create Account" button
    ↓
Tap "Create Account"
    ↓
RegisterScreen
    ↓
Menu now shows user profile
```

### Flow 3: Navigate
```
Tap ☰ Menu
    ↓
Tap navigation item
    ↓
Navigate to screen
    ↓
Menu closes automatically
```

### Flow 4: Sign Out
```
Tap ☰ Menu
    ↓
Scroll to bottom
    ↓
Tap "Sign Out"
    ↓
Menu shows auth buttons again
```

---

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| Menu doesn't appear | Make sure you're on a tab screen (not detail screens) |
| Menu doesn't open | Tap directly on the ☰ icon, not the header area |
| Auth buttons don't work | Check AuthProvider wraps your app, Supabase configured |
| Profile info missing | Sign in first |
| Admin options missing | Set user role to 'admin' in Supabase, sign out/in again |
| Menu looks broken | Try changing theme in settings |
| Navigation doesn't work | Check navigation setup in App.tsx |

---

## 📊 Component Structure

```
HamburgerMenu
├─ Icon Button (☰)
└─ Modal (Menu Drawer)
   ├─ Header
   │  ├─ Close Button (✕)
   │  └─ "Menu" Title
   ├─ User Section (dynamic)
   │  ├─ User Info (if authenticated)
   │  │  ├─ Avatar
   │  │  ├─ Name
   │  │  ├─ Email
   │  │  └─ Admin Badge
   │  ├─ View Profile Button
   │  └─ Auth Buttons (if guest)
   ├─ Admin Section (if admin)
   │  └─ Admin Dashboard Link
   ├─ Navigation Section
   │  ├─ "NAVIGATION" Title
   │  └─ 7 Navigation Items
   ├─ Sign Out Button (if authenticated)
   └─ Footer
      ├─ App Name
      └─ Version
```

---

## 📁 Files

```
src/components/
  ├─ HamburgerMenu.tsx       # Main menu component
  ├─ AppHeader.tsx           # Optional header wrapper
  └─ index.ts                # Exports

App.tsx                        # Integration in Tab.Navigator

docs/HAMBURGER_MENU.md        # This file
```

---

## ⚡ Quick Commands

**Navigate to Home:**
```
Tap ☰ → Tap "Home"
```

**Sign In:**
```
Tap ☰ → Tap "Sign In"
```

**View Profile:**
```
Tap ☰ → Tap "View Profile"
```

**Access Admin Panel:**
```
Tap ☰ → Tap "Admin Dashboard" (if admin)
```

---

## 💡 Tips

1. **Quick Navigation** - Use menu for fast screen switching
2. **Check Auth Status** - See if logged in at a glance
3. **One-Tap Access** - No need to go through settings
4. **Always Available** - Menu on every tab
5. **Smooth Experience** - Animations are polished

---

See also: [Authentication](./AUTH.md) for auth-related features
