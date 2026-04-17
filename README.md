# Kaleem Mobile App

Expo + React Native app for Kaleem consultations.

## Getting started

```bash
npm install
npm start
```

## Config

- API base URL: `extra.apiBaseUrl` in `app.json` (defaults to `https://api.kaleemai.com`).
- Auth token is stored with `expo-secure-store` on native and `AsyncStorage` on web.

## Project structure

```
app/
  (auth)/        login, register
  (tabs)/        home, consultants, chats, profile
  chat/[id]      conversation screen
  consultant/[id] consultant profile
lib/             api client, auth context, storage, auto-update hook
components/ui    shared Button, Input, Screen
constants/       Colors + Config
```

## API surface used

- `POST /auth/login`, `POST /auth/register`, `POST /auth/logout`, `GET /auth/me`
- `GET /consultants`, `GET /consultants/:id`, `GET /consultants/featured`
- `GET /chats`, `POST /chats`, `GET /chats/:id/messages`, `POST /chats/:id/messages`

## Auto-update (EAS Update)

1. Install EAS CLI locally and run once: `eas login && eas init`. This fills in `eas.projectId` and the `updates.url` in `app.json`.
2. Generate a robot access token in Expo dashboard (Access Tokens) and add it to GitHub at
   **Settings → Secrets and variables → Actions → New repository secret** named `EXPO_TOKEN`.
3. Every push to `main` publishes an OTA update via `.github/workflows/eas-update.yml`.
4. Native builds can be triggered manually via `.github/workflows/eas-build.yml`.

The app calls `Updates.checkForUpdateAsync()` at launch (see `lib/useAutoUpdate.ts`) so
published updates are downloaded and applied automatically on the next app start.
