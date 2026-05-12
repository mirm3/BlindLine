# BlindLine

**Travel together, travel freely.**

BlindLine is a mobile application connecting visually impaired travelers (VIPs) with dedicated volunteers for safe and confident train journeys across Belgium. It bridges the gap in accessible travel by providing human-to-human assistance for navigation within train stations and boarding the correct train — without requiring 24-hour advance notice.

### Check Out <a href="https://blindline-cc9309.gitlab.io/">The BlindLine Website</a> For More Info

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Environment Setup](#environment-setup)
- [Running the App](#running-the-app)
- [Building for Distribution](#building-for-distribution)
- [Architecture Overview](#architecture-overview)
- [Navigation Flow](#navigation-flow)
- [Database Schema](#database-schema)
- [Matching Logic](#matching-logic)
- [Location Sharing](#location-sharing)
- [Internationalization](#internationalization)
- [Security & Privacy](#security--privacy)
- [Known Issues](#known-issues)

---

## Features

### For Travelers (VIPs)
- Request a trip by selecting departure/arrival station and time
- Personalized onboarding (visual impairment level, mobility aids, assistance needs, language)
- View upcoming and past trips with status tracking
- Share live GPS location with matched volunteer
- Call volunteer directly from the app once matched
- Review volunteer after trip completion

### For Volunteers
- Auto-matched to compatible trip requests based on preferred routes and availability
- Set recurring availability windows (day-of-week + time range) and preferred routes
- Accept or decline pending match requests
- Track traveler's live GPS position on a map
- Call traveler directly once a match is accepted
- View trip history and impact statistics
- Review traveler after trip completion

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React Native via [Expo](https://expo.dev/) SDK 54 |
| Language | TypeScript (strict mode) |
| Routing | [Expo Router](https://docs.expo.dev/router/introduction/) (file-based) |
| State Management | React Context API |
| Backend | [Supabase](https://supabase.com/) (Auth, PostgreSQL, Realtime) |
| Maps | Google Maps API + `react-native-maps` |
| Location | `expo-location` (foreground GPS) |
| Internationalization | `i18next` + `react-i18next` + `expo-localization` |
| Session Storage | `expo-secure-store` |
| Build & Distribution | [EAS (Expo Application Services)](https://expo.dev/eas) |

---

## Project Structure

```
.
├── BlindLine/                  # Main Expo application
│   ├── src/
│   │   ├── app/                # File-based routing (Expo Router)
│   │   │   ├── (auth)/         # Pre-login screens: intro, landing, login, register
│   │   │   ├── (onboarding)/   # Traveler onboarding: welcome, vision, mobility, assistance, language
│   │   │   ├── (tabs)/         # Main app tabs (role-specific)
│   │   │   ├── (main)/         # Legacy/unused route group
│   │   │   ├── request-trip.tsx    # Trip request modal
│   │   │   └── traveler-location.tsx  # Live map (volunteer tracks VIP)
│   │   ├── components/         # Reusable UI components (ReviewModal, Themed, etc.)
│   │   ├── constants/          # Color palette (light/dark)
│   │   ├── context/            # AuthContext, OnboardingContext
│   │   ├── core/               # i18n setup + locale files (en, nl, fr, de, pl, tr)
│   │   ├── lib/                # Supabase client + TypeScript DB types
│   │   └── services/           # tripService.ts, locationService.ts
│   ├── assets/                 # App icons, splash screen, images
│   ├── app.config.ts           # Expo configuration (reads env vars)
│   ├── eas.json                # EAS build profiles
│   ├── babel.config.js         # Babel config (path alias @/ → src/)
│   └── tsconfig.json           # TypeScript configuration
├── ERD.png                     # Entity Relationship Diagram
├── build.gradle.kts            # Android root build config
├── gradlew / gradlew.bat       # Gradle wrapper (Android native builds)
└── README.md                   # This file
```

---

## Prerequisites

Before you can run or build BlindLine, ensure you have the following installed:

| Tool | Version | Notes |
|---|---|---|
| [Node.js](https://nodejs.org/) | 18 or later | LTS recommended |
| [npm](https://www.npmjs.com/) | Included with Node.js | |
| [Expo CLI](https://docs.expo.dev/workflow/expo-cli/) | Latest | `npm install -g expo-cli` |
| [EAS CLI](https://docs.expo.dev/eas-update/getting-started/) | >= 18.0.1 | `npm install -g eas-cli` (for builds) |
| [Android Studio](https://developer.android.com/studio) | Latest | Required for Android emulator or local native builds |
| [Java JDK](https://adoptium.net/) | 17 | Required for Android Gradle builds |
| [Git](https://git-scm.com/) | Any | |

**Expo Go vs Dev Client:**
Several native packages (`react-native-maps`, `expo-location`, `expo-localization`, `@react-native-community/datetimepicker`) **do not work in Expo Go** — they require a custom dev client. You must use either `npx expo run:android` (local native build) or an EAS development build.

---

## Environment Setup

### 1. Clone the repository

```bash
git clone <repository-url>
cd mobile-app
```

### 2. Install dependencies

All commands are run from the `BlindLine/` subdirectory:

```bash
cd BlindLine
npm install
```

### 3. Configure environment variables

Create a `.env.local` file in `BlindLine/`:

```env
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
GOOGLE_MAPS_API_KEY=your-google-maps-api-key
```

| Variable | Description |
|---|---|
| `EXPO_PUBLIC_SUPABASE_URL` | Your Supabase project URL (Settings → API) |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY` | Supabase public anon key (Settings → API) |
| `GOOGLE_MAPS_API_KEY` | Google Maps API key (used for Android map tiles at build time — not a JS variable) |

> The `GOOGLE_MAPS_API_KEY` is injected into the Android native build via `app.config.ts`. It is **not** prefixed with `EXPO_PUBLIC_` because it is consumed by the native build, not JavaScript at runtime.

### 4. Supabase Setup

The app requires a Supabase project with the following tables and configuration applied:

**Tables:** `users`, `vip_profile`, `volunteer_profile`, `trip_request`, `matches`, `messages`, `reviews`, `locations`

**Required server-side functions (security definer):**
- `create_matches_for_trip(p_trip_id uuid)` — auto-matches a PENDING trip to the best volunteer
- `volunteer_accept_match(p_match_id uuid)` — confirms a volunteer match
- `volunteer_decline_match(p_match_id uuid)` — declines a match (leaves trip PENDING)
- `submit_review(trip_id, rating, comment)` — submits a post-trip review

**Required DB trigger:**
- `trg_match_on_trip_insert` — AFTER INSERT on `trip_request`, calls `create_matches_for_trip`

**Required realtime setup:**
```sql
ALTER PUBLICATION supabase_realtime ADD TABLE locations;
ALTER PUBLICATION supabase_realtime ADD TABLE trip_request;
ALTER PUBLICATION supabase_realtime ADD TABLE matches;
```

**Required permissions:**
```sql
GRANT SELECT, INSERT ON locations TO authenticated;
```

Row Level Security (RLS) must be enabled on all tables. See [Security & Privacy](#security--privacy) for full policy details.

---

## Running the App

All commands are run from `BlindLine/`:

### Start the Expo dev server (metro bundler)

```bash
npm start
```

This opens the Expo dev menu. From here you can connect a physical device via QR code or launch an emulator. Note that screens requiring native modules (maps, location, date picker) **will crash in Expo Go** — use a dev client build.

### Run on Android (with native build)

```bash
npm run android
# or
npx expo run:android
```

Requires Android Studio and a running emulator or connected device. Triggers a local Gradle build.

### Run on iOS (Mac only)

```bash
npm run ios
# or
npx expo run:ios
```

Requires Xcode and an iOS simulator or connected iPhone.

### Run on Web

```bash
npm run web
```

Web mode has limited functionality — native-only modules (maps, location) will not work.

---

## Building for Distribution

Builds are managed via EAS (Expo Application Services). Ensure you are logged in:

```bash
eas login
```

### Development build (dev client — recommended for testing native modules)

```bash
eas build --platform android --profile development
```

Install this APK on your device to get a fully functional development environment with all native modules.

### Preview build (internal distribution)

```bash
eas build --platform android --profile preview
```

### Production build

```bash
eas build --platform android --profile production
```

### Android native build (via Gradle)

From the **repo root** (not `BlindLine/`):

```bash
# Unix
./gradlew assembleDebug

# Windows
gradlew.bat assembleDebug
```

---

## Architecture Overview

### Routing

Expo Router uses file-based routing in `src/app/`. Route groups use parenthesized folders:

| Group | Path | Purpose |
|---|---|---|
| `(auth)` | `/(auth)/` | Pre-login: intro, landing, login, register |
| `(onboarding)` | `/(onboarding)/` | Traveler onboarding wizard (5 steps) |
| `(tabs)` | `/(tabs)/` | Main app with role-specific bottom tab navigator |
| `(main)` | `/(main)/` | Unused legacy route group |
| Root modals | `/request-trip`, `/traveler-location` | Trip request modal, live map |

### State Management

React Context only — no Redux or external state library.

- **`AuthContext`** (`src/context/AuthContext.tsx`) — user session, `signIn`, `signUp`, `signOut`. Handles stale token refresh.
- **`OnboardingContext`** (`src/context/OnboardingContext.tsx`) — traveler onboarding wizard state.

### User Model

```ts
{
  id: string;           // Supabase auth UID
  email: string;
  phone: string;
  userType: 'traveler' | 'volunteer';
  onboardingCompleted: boolean;
}
```

User type is determined at login by checking for a `vip_profile` row. If one exists the user is a traveler; otherwise a volunteer.

### Path Aliases

`@/` maps to `./src/` (configured in `tsconfig.json` and `babel.config.js`). Example: `import { supabase } from '@/lib/supabase'`.

### Theming

Light/dark mode via `useColorScheme` hook. Themed components in `src/components/Themed.tsx`. Color constants in `src/constants/Colors.ts`.

---

## Navigation Flow

```
Not authenticated:
  (auth)/index (intro)
    → (auth)/landing (role selection cards)
      → (auth)/login
        → (auth)/register

Post-login:
  Traveler, onboarding incomplete  → (onboarding)/welcome → vision → mobility → assistance → language → (tabs)
  Traveler, onboarding complete    → (tabs)
  Volunteer                        → (tabs)

Traveler tabs:   Home (request trip) | My Trips | Profile
Volunteer tabs:  Home (browse trips) | My Volunteering | Profile
```

The root layout (`_layout.tsx`) handles all auth-based redirects automatically using `useSegments` + `useRouter`. Individual screens never call `router.replace` for auth transitions.

---

## Database Schema

Eight tables in Supabase:

| Table | Key Columns | Purpose |
|---|---|---|
| `users` | `id` (FK auth.users), `email`, `phone` | Core user data |
| `vip_profile` | `user_id`, `mobility_aids` (jsonb), `preferences` (jsonb) | Traveler profile & onboarding data |
| `volunteer_profile` | `user_id`, `experience`, `is_available`, `preferences` (jsonb) | Volunteer availability & preferences |
| `trip_request` | `vip_user_id`, `departure_station`, `arrival_station`, `departure_time`, `status` | Traveler trip requests |
| `matches` | `trip_request_id`, `volunteer_id`, `vip_user_id`, `status` | Links trips to volunteers |
| `messages` | `match_id`, `sender_id`, `content` | In-match chat (schema only — no UI yet) |
| `reviews` | `trip_id`, `reviewer_id`, `rating`, `comment` | Post-trip ratings |
| `locations` | `match_id`, `user_id`, `lat`, `lng` | Real-time GPS rows from traveler |

**Trip status enum:** `PENDING` → `MATCHED` → `COMPLETED` / `CANCELED`
**Match status enum:** `ACTIVE` → `CANCELED` / `COMPLETED`

**Volunteer `preferences` jsonb format:**
```json
{
  "active": true,
  "availability": [{ "dow": 1, "start": "08:00", "end": "18:00" }],
  "preferred_routes": [{ "from": "Antwerp-Central", "to": "Brussels-North" }],
  "languages": ["english", "dutch"],
  "assistance": ["finding_platform", "boarding_train"],
  "contact": "phone"
}
```
(`dow` = day of week: 0=Sun, 1=Mon, ..., 6=Sat)

> When writing jsonb columns, pass plain JavaScript objects — **do not** `JSON.stringify()`. Supabase handles serialization.

---

## Matching Logic

### Auto-matching (primary flow — server-side)

1. Traveler creates a trip → status `PENDING`
2. DB trigger `trg_match_on_trip_insert` fires automatically
3. `create_matches_for_trip` RPC scans volunteers by: matching preferred routes, availability windows (dow + time), and `is_available = true`
4. Best volunteer gets an `ACTIVE` match created; trip stays `PENDING`
5. Volunteer sees the trip in "Pending Requests" in My Volunteering
6. Volunteer **accepts** → `volunteer_accept_match` RPC → trip becomes `MATCHED`
7. Volunteer **declines** → `volunteer_decline_match` RPC → match `CANCELED`, trip stays `PENDING` for re-matching

### Manual matching (legacy flow — still functional)

Volunteer browses PENDING trips on the Home tab → taps "Offer to Help" → `offerHelpForTrip` creates match directly and sets trip to `MATCHED` (bypasses accept/decline flow).

### Supported Belgian Stations (15)

Brussels-Central, Brussels-Midi, Brussels-North, Antwerp-Central, Ghent-Sint-Pieters, Bruges, Leuven, Liège-Guillemins, Charleroi-South, Namur, Mechelen, Ostend, Hasselt, Mons, Kortrijk

---

## Location Sharing

### Traveler side

On a `MATCHED` trip in My Trips, the traveler can toggle **"Share My Location"**:
- Requests foreground location permission
- Polls GPS every 10 seconds and writes rows to the `locations` table
- Only one trip can share at a time; interval is cleared on unmount

### Volunteer side

On an Active Commitment in My Volunteering, the volunteer taps **"Track Traveler"**:
- Opens `/traveler-location?matchId=...&vipUserId=...`
- Shows a Google Maps `MapView` with a blue marker at the VIP's last known position
- Subscribes to real-time Supabase channel for live `locations` INSERT events
- Displays "Waiting for location..." until the first GPS row arrives

### Services

- `src/services/locationService.ts` — `requestLocationPermission`, `getCurrentPosition`, `upsertVipLocation`, `getLastKnownLocation`, `subscribeToMatchLocation`

---

## Internationalization

The app fully supports 6 languages, auto-detected from device locale:

| Code | Language |
|---|---|
| `en` | English |
| `nl` | Dutch |
| `fr` | French |
| `de` | German |
| `pl` | Polish |
| `tr` | Turkish |

**Setup:**
- Config: `src/core/i18n.ts` — initializes i18next, detects device language via `expo-localization`, falls back to `en`
- Translations: `src/core/locales/{en,nl,fr,de,pl,tr}.ts`
- Usage: `const { t } = useTranslation();` then `t('key.path')`

**Adding a new language:**
1. Create `src/core/locales/<code>.ts` with all translation keys
2. Register it in `src/core/languages.ts`

> All translation keys must exist in every locale file. Missing keys render as raw key strings.

---

## Security & Privacy

**Row Level Security (RLS)** is enabled on all tables. Key policies:

- **`users`** — users can only read their own row, or the row of their matched partner
- **`vip_profile`** — travelers read their own; matched volunteer can read their matched traveler's profile
- **`volunteer_profile`** — volunteers read/write their own only
- **`trip_request`** — traveler reads own trips; volunteer reads trips where they are matched
- **`matches`** — participants (traveler or volunteer) read their own matches
- **`locations`** — VIP inserts only when an ACTIVE match exists; volunteer reads only during ACTIVE match

**No circular RLS policies** — `matches` uses a denormalized `vip_user_id` column to avoid recursive policy queries between `matches` and `trip_request` (which previously caused PostgreSQL error `42P17`).

**Secure storage** — user sessions are persisted via `expo-secure-store` (encrypted on-device storage).

---

## Known Issues

- `src/app/(main)/_layout.tsx` has a TypeScript error (`isOnboardingCompleted` doesn't exist on `AuthContextType`). This route group is unused and can be ignored.
- `react-native-maps`, `expo-location`, `expo-localization`, and `@react-native-community/datetimepicker` require a native dev-client build. These screens will crash in Expo Go.

---

## Key Config Reference

| Setting | Value |
|---|---|
| Package ID | `kdg.markgrave.BlindLine` |
| Expo SDK | 54 |
| React Native | 0.81.5 |
| URL Scheme | `blindline` |
| TypeScript | Strict mode |
| New Architecture | Enabled |
| Typed Routes | Enabled |
