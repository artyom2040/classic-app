# Design & Navigation Map

This project uses a Stack navigator (`App.tsx`) hosting a Tab navigator for the core surfaces plus detail screens on top.

## Navigation Structure
- **Stack (RootStackParamList)**
  - `MainTabs` (tab container)
  - Detail screens: `ComposerDetail`, `PeriodDetail`, `FormDetail`, `TermDetail`
  - Content hubs: `Composers`, `MonthlySpotlight`, `WeeklyAlbum`, `NewReleases`, `ConcertHalls`, `Badges`, `Search`, `Quiz`
  - Onboarding: `Kickstart`, `KickstartDay`
  - Settings: `Settings`

- **Tabs (TabParamList)**
  - `Home` (currently `HomeScreenV2`)
  - `Timeline`
  - `Glossary`
  - `Forms`
  - `Profile`

## Home (V2) Layout & Flows
- Header actions → `Search`, `Settings`.
- Featured cards (Kickstart, Weekly Album, Monthly Spotlight) tap through to their stack screens.
- Term of the Day → `TermDetail`.
- Stats row shows counts from stored progress.
- Explore grid links:
  - Tabs: `Timeline`, `Glossary`, `Forms`, `Profile` (via `MainTabs`).
  - Stack: `Composers`, `MonthlySpotlight`, `NewReleases`, `ConcertHalls`, `Quiz`, `Badges`.
- New Released Albums horizontal rail:
  - Tap card → `NewReleases` list.
  - “Listen” pill → opens preferred music service.
- Concert Halls rail:
  - Tap card → `ConcertHalls` list.
  - “Open map” pill → native maps link.
- Featured composer teaser → `ComposerDetail`.

## New Screens
- **NewReleasesScreen**: filter by listener level; opens preferred service from each card.
- **ConcertHallsScreen**: hall list with signature sound and map CTA.

## Listener Level Tagging
- Type: `ListenerLevel = 'beginner' | 'intermediate' | 'advanced'`.
- Displayed on: Home weekly album card, WeeklyAlbum screen, New Releases cards.

## Data Sources (current vs future)
- Current: static JSON in `src/data/*`.
- `DataService` supports `local` and stubbed `supabase` mode; default is local.
- Supabase plan documented in `docs/DB_PLAN.md`.
