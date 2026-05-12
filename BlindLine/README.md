# BlindLine Mobile (Expo)

This directory contains the mobile application for BlindLine, built with React Native and Expo.

## 🚀 Commands

```bash
# Install dependencies
npm install

# Start development server
npm start

# Platform-specific runners
npm run android
npm run ios
npm run web

# EAS builds (Development Client)
# Note: This app requires native modules for location and maps
eas build --platform android --profile development
eas build --platform ios --profile development
```

## 🛠 Features

- **File-based Routing:** Powered by `expo-router`.
- **Internationalization:** Multi-language support (EN, NL, FR, DE, PL, TR) using `i18next`.
- **Theming:** Light and dark mode support with themed components.
- **Backend Sync:** Real-time data and auth using **Supabase**.
- **Location Services:** GPS tracking for VIP safety and navigation using `expo-location`.
- **Integrated Maps:** Real-time visual tracking on `react-native-maps`.

## 📦 Directory Structure

- `src/app/`: The core navigation and screens (Expo Router).
- `src/components/`: Common UI elements (Cards, Buttons, Modals).
- `src/context/`: Global states for Authentication and Onboarding.
- `src/services/`: Direct interaction with the Supabase API (Trip logic, Location sharing).
- `src/lib/`: External library configurations (Supabase, Database types).
- `src/core/`: Application core (i18n, locales).

## ⚙️ Environment Configuration

Create a `.env.local` file in this directory with the following variables:

```env
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
GOOGLE_MAPS_API_KEY=your_google_maps_key
```

## 🔐 Authentication & Data

We use Supabase for Auth and RLS (Row Level Security). The data flow follows strict privacy rules:
- **Travelers (VIPs)** must complete a 4-step onboarding before requesting trips.
- **Volunteers** can browse trips or be auto-matched based on their set availability and routes.
- **Location data** is only shared between matched pairs during an active trip.

## 🇧🇪 Supported Stations

The app currently supports 15 major Belgian train stations including:
- Brussels-Central, Midi, North
- Antwerp-Central
- Ghent-Sint-Pieters
- Liège-Guillemins
- (Full list in `src/constants/Stations.ts` or similar)

## 🏗 Build Requirements

Due to the use of native modules like `expo-location` and `react-native-maps`, this project requires a **Development Client** for testing on physical devices or simulators. Use `npm run android` or `npm run ios` to trigger a local native build if your environment is configured.
