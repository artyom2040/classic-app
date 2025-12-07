# Context Composer

**Your Classical Music Companion**

A mobile app that transforms passive listening into active, contextual learning for curious classical music lovers.

## 🎼 Features

### Phase 1 (MVP) - Implemented

- **Timeline Explorer**: Browse classical periods (Baroque, Classical, Romantic, etc.) and discover key composers
- **Glossary**: 150 searchable musical terms with definitions and examples
- **Form Explorer**: Learn about musical structures (Symphony, Concerto, Fugue, etc.)
- **Weekly Album Pick**: Curated album suggestions rotating weekly
- **Monthly Spotlight**: Deep dives into composers or eras rotating monthly
- **Term of the Day**: Daily vocabulary building
- **5-Day Kickstart**: Structured onboarding for beginners
- **Badge System**: Track progress and earn achievements

### Coming in Future Phases

- Brahms Symphonies Challenge (gamification)
- Personal Listening Journal
- Home Screen Widget
- Premium content (Composer Maps, Visual Diagrams)

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Expo CLI (`npm install -g expo-cli`)
- iOS Simulator (Mac) or Android Emulator, or Expo Go app on your phone

### Installation

```bash
# Navigate to project directory
cd classic-app

# Install dependencies
npm install

# Configure environment (optional - for Supabase)
cp .env.example .env
# Edit .env with your Supabase credentials

# Start the development server
npm start
```

**Note:** The app works offline with local JSON data by default. Supabase configuration is optional for backend features.

### Running on Device

1. Install **Expo Go** on your iOS or Android device
2. Scan the QR code shown in the terminal
3. The app will load on your device

### Running on Simulator

```bash
# iOS (Mac only)
npm run ios

# Android
npm run android
```

## 📁 Project Structure

```
classic-app/
├── App.tsx                 # Main app entry with navigation
├── src/
│   ├── data/              # Static JSON data files
│   │   ├── periods.json   # Musical eras
│   │   ├── composers.json # Composer biographies
│   │   ├── glossary.json  # 150 musical terms
│   │   ├── forms.json     # Musical structures
│   │   ├── albums.json    # Weekly/monthly content
│   │   └── kickstart.json # 5-day onboarding
│   ├── screens/           # All app screens
│   ├── theme/             # Colors, spacing, typography
│   ├── types/             # TypeScript definitions
│   └── utils/             # Storage and helpers
├── assets/                # App icons and images
└── package.json
```

## 🎨 Design Philosophy

- **Dark Theme**: Easy on the eyes for extended reading
- **Card-Based UI**: Clear information hierarchy
- **Period Colors**: Each era has a signature color
- **External Links**: Directs to Spotify/YouTube for listening

## 📱 Technology Stack

- **React Native** with Expo
- **TypeScript** for type safety
- **React Navigation** for routing
- **AsyncStorage** for local persistence
- **Supabase** (optional) for backend and authentication
- **Static JSON** for offline-first experience

## 📊 Data Model

### Offline-First Architecture
All content is stored in static JSON files:
- No backend required for basic functionality
- Instant loading
- Fully offline capable
- Easy to update

### Optional Backend (Supabase)
For advanced features like authentication and user progress sync:
- PostgreSQL database with Row Level Security
- Real-time subscriptions
- Email authentication (Magic Link)
- Secure file storage

**Setup Instructions:**
- See [QUICK_START_SECURITY.md](./docs/QUICK_START_SECURITY.md) for domain and SSL setup
- See [DOMAIN_SECURITY_SETUP.md](./docs/DOMAIN_SECURITY_SETUP.md) for complete guide
- See [SUPABASE_SETUP.md](./docs/SUPABASE_SETUP.md) for VPS deployment

## 🎯 Target Audience

The "Curious Amateur" - people who:
- Want to understand classical music better
- Find mainstream streaming apps lack context
- Appreciate structured learning paths
- Want a handy reference tool

## 🔒 Security

This project follows security best practices:
- HTTPS-only communication with backend
- Environment variables for credentials (never committed)
- Row Level Security (RLS) on database tables
- Password-protected admin dashboard
- Automatic SSL certificate management

See [SECURITY_ARCHITECTURE.md](./docs/SECURITY_ARCHITECTURE.md) for details.

## 📚 Documentation

- [ARCHITECTURE.md](./docs/ARCHITECTURE.md) - Complete codebase design guide
- [QUICK_START_SECURITY.md](./docs/QUICK_START_SECURITY.md) - 30-min security setup
- [DOMAIN_SECURITY_SETUP.md](./docs/DOMAIN_SECURITY_SETUP.md) - Full security guide
- [SECURITY_ARCHITECTURE.md](./docs/SECURITY_ARCHITECTURE.md) - Infrastructure diagrams
- [SUPABASE_SETUP.md](./docs/SUPABASE_SETUP.md) - VPS deployment guide
- [CODE_REVIEW.md](./docs/CODE_REVIEW.md) - Initial code review

## 📄 License

MIT License - feel free to use and modify.

---

*Simplifying the learning curve of classical music*
