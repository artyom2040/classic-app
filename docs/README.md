# Documentation

Complete guide to the Context Composer app's key features.

## 📚 Contents

### [Authentication (AUTH.md)](./AUTH.md)
- User authentication with Supabase
- Email/password, Apple, and Google sign-in
- Profile management
- Admin roles and features
- Implementation details and usage examples

### [Hamburger Menu (HAMBURGER_MENU.md)](./HAMBURGER_MENU.md)
- Quick navigation drawer
- Auth-aware menu (different for guests/users/admins)
- Navigation to all main sections
- Visual guide and usage

---

## 🎯 Quick Start

### I want to...

**Sign in to the app**
→ Go to Profile tab → Tap "Sign In"
→ See [Authentication](./AUTH.md#signing-in)

**Use the hamburger menu**
→ Tap ☰ icon on any tab
→ See [Hamburger Menu](./HAMBURGER_MENU.md#how-to-use)

**Understand authentication flow**
→ See [AUTH.md - How It Works](./AUTH.md#how-it-works)

**Use auth in my components**
→ See [AUTH.md - Usage Examples](./AUTH.md#usage-examples)

**Integrate hamburger menu elsewhere**
→ See [Hamburger Menu - Implementation](./HAMBURGER_MENU.md#implementation)

---

## 🏗️ Architecture

### Authentication System
- **Provider:** `src/context/AuthContext.tsx`
- **Hook:** `useAuth()`
- **Screens:** `src/screens/Auth/`
- **Backend:** Supabase

### Navigation (Hamburger Menu)
- **Component:** `src/components/HamburgerMenu.tsx`
- **Header:** `src/components/AppHeader.tsx`
- **Exported:** `src/components/index.ts`

---

## ✨ Key Features

### Auth
- ✅ Email/password authentication
- ✅ Social login (Apple, Google)
- ✅ User profiles with avatars
- ✅ Admin role support
- ✅ Profile management
- ✅ Error handling with logging

### Hamburger Menu
- ✅ Quick navigation from any tab
- ✅ Shows login/profile based on auth state
- ✅ Admin access for admins
- ✅ All themes supported
- ✅ Smooth animations

---

## 📱 Screens & Features

| Screen | Auth Required | Features |
|--------|---------------|----------|
| Home | No | Daily learning content |
| Timeline | No | Music history timeline |
| Glossary | No | Musical terms |
| Forms | No | Musical forms |
| Profile | No* | User dashboard / Progress |
| Settings | No | Theme & preferences |
| Login | - | Email/password auth |
| Register | - | Create account |

*Shows auth prompt if not logged in

---

## 🔧 Common Tasks

### Using Auth in a Component
```typescript
import { useAuth } from '../context/AuthContext';

function MyComponent() {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (!isAuthenticated) return <Text>Sign in first</Text>;
  return <Text>Welcome, {user?.displayName}</Text>;
}
```

### Navigating from Hamburger Menu
The menu automatically closes and navigates when you tap items.

### Adding Items to Menu
Edit `src/components/HamburgerMenu.tsx`:
```typescript
const menuItems: MenuItem[] = [
  { icon: 'home-outline', label: 'Home', action: 'home' },
  // Add more here
];
```

---

## 🆘 Troubleshooting

**Auth not working?**
- Check Supabase credentials in `.env.local`
- See [AUTH.md - Troubleshooting](./AUTH.md#troubleshooting)

**Hamburger menu issues?**
- See [HAMBURGER_MENU.md - Troubleshooting](./HAMBURGER_MENU.md#troubleshooting)

**Type errors?**
- Run `npm run type-check`
- Check that all imports are correct

---

## 📖 Full Documentation

For detailed information, see:
- [AUTH.md](./AUTH.md) - Complete authentication guide
- [HAMBURGER_MENU.md](./HAMBURGER_MENU.md) - Menu guide with visual diagrams

---

## 🎓 Learning Resources

### About the Auth System
The authentication system uses Supabase for backend, with React Context for state management. See [AUTH.md - How It Works](./AUTH.md#how-it-works).

### About the Menu
The hamburger menu is a React Native modal that integrates with React Navigation. See [HAMBURGER_MENU.md - Implementation](./HAMBURGER_MENU.md#implementation).

---

Last updated: 2024
