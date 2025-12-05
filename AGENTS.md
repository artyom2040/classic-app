# Repository Guidelines

## Project Structure & Module Organization
- `App.tsx` wires navigation, providers (`Theme`, `Settings`, `Favorites`, `Audio`), and the tab/stack layout.
- `src/components` holds reusable UI; `src/screens` contains page-level flows; `src/context` manages global state hooks.
- `src/data` stores static JSON for periods, composers, glossary, forms, albums, and onboarding; update here for content changes.
- `src/theme` centralizes tokens; `src/utils` covers storage/helpers; `assets/` contains icons and images; `docs/` tracks improvement notes.
- Path aliases (`@/*`, `@data/*`, etc.) come from `tsconfig.json`; prefer them over relative imports.

## Build, Test, and Development Commands
- `npm start` runs the Expo dev server; `npm run ios` / `npm run android` / `npm run web` target a platform; use `npm run start:tunnel` for remote devices.
- `npm run build` launches the interactive `scripts/build.sh` helper (choose EAS cloud vs local, platform, and profile).
- Direct EAS builds: `npm run build:android:preview|prod`, `npm run build:ios:preview|prod`, or `npm run build:all:*`.
- Local native builds: `npm run build:local:android` (Gradle) and `npm run build:local:ios` (prebuild + Xcode).
- Web export + PM2 hosting on a VPS: `./scripts/deploy-vps.sh` for first-time setup, `./scripts/update-vps.sh` after pulls.

## Coding Style & Naming Conventions
- TypeScript-first with functional components and hooks; keep props/state typed and derived data memoized when needed.
- 2-space indentation, single quotes, semicolons, and grouped imports (React/Expo → third-party → local).
- `PascalCase` for components/screens, `camelCase` for functions/variables, `SCREAMING_SNAKE_CASE` for constants; hook files prefixed with `use`.
- Keep theming via `src/theme` tokens and respect dark/glass mode branches already present in navigation styles.

## Testing Guidelines
- No automated suite is present; smoke-test in Expo Go and web export before merging.
- Validate navigation flows, audio playback (native vs web paths), persistence (`src/utils/storage`), and content loading from `src/data`.
- If adding tests, prefer Jest with React Native Testing Library; co-locate `__tests__` beside modules and mock static JSON where practical.

## Commit & Pull Request Guidelines
- Follow the existing history: short, imperative subjects describing the change (“Add in-app audio player”, “Update audio URLs...”); avoid multi-topic commits.
- PRs should include: a concise summary, linked issue (if any), platform notes/screenshots for UI updates, impacted data files, and the manual test steps you ran.
- Keep branches rebased on main; call out breaking changes or new build steps in the description.

## Security & Configuration Tips
- Do not commit secrets or EAS tokens; this app relies on static data and client-only config.
- Ensure new audio/assets are license-cleared and referenced in `src/data` with accurate metadata.
