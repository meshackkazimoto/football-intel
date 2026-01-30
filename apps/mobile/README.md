# Football Intel Mobile App

Beautiful React Native mobile app for iOS and Android, providing real-time football intelligence for the NBC Premier League.

## Features

- 🏠 **Home Screen** - Today's matches at a glance
- 📅 **Matches** - Browse all matches with filters
- 👥 **Players** - Search and browse player profiles
- 🏆 **Standings** - Real-time league table
- ⚽ **Match Details** - Detailed match information with timeline

## Getting Started

### Prerequisites

- Node.js 18+ or Bun
- Expo CLI (`bunx expo-cli` or `npm install -g expo-cli`)
- iOS Simulator (for Mac) or Android Emulator
- Physical device with Expo Go app (optional)

### Installation

1. Install dependencies:
```bash
bun install
```

2. Start the development server:
```bash
bun dev
```

3. Run on iOS:
```bash
bun ios
```

4. Run on Android:
```bash
bun android
```

## Configuration

Set the API URL in your environment:

```bash
EXPO_PUBLIC_API_URL=http://localhost:3001
```

Or create a `.env` file:
```
EXPO_PUBLIC_API_URL=http://your-api-url:3001
```

## Project Structure

```
apps/mobile/
├── app/                 # Expo Router pages
│   ├── (tabs)/         # Tab navigation screens
│   └── match/          # Match detail screen
├── src/
│   ├── services/       # API services
│   ├── theme/          # Design system
│   ├── providers/      # React providers
│   └── utils/          # Utility functions
└── assets/             # Images and icons
```

## Design

The app uses the same beautiful emerald color scheme as the admin platform:
- Primary: `#10b981` (Emerald)
- Background: `#f8fafc` (Slate 50)
- Cards: White with subtle shadows

## Building for Production

### iOS
```bash
bun run build:ios
```

### Android
```bash
bun run build:android
```

## Tech Stack

- **Expo** - React Native framework
- **Expo Router** - File-based routing
- **React Query** - Data fetching and caching
- **TypeScript** - Type safety
- **Axios** - HTTP client
