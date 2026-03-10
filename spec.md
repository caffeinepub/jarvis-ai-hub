# Jarvis AI Hub

## Current State

The app currently loads directly into the main dashboard layout (sidebar + section content) regardless of whether the user is logged in or not. Authentication is handled via Internet Identity (`useInternetIdentity`). The `identity` value is `undefined` when the user is not logged in. There is a loading spinner shown during the `isInitializing` phase, but no dedicated login/landing page for unauthenticated users.

## Requested Changes (Diff)

### Add
- A full-screen login/landing page that is shown when the user is NOT authenticated (`identity` is undefined and `isInitializing` is false). This page should:
  - Display the JARVIS branding (logo, name, tagline)
  - Show a prominent "Login with Internet Identity" button that calls the `login()` function from `useInternetIdentity`
  - Show a brief feature overview (chat, games, image generator, token system)
  - Match the existing dark holographic Iron Man JARVIS aesthetic (dark background, cyan glow, hex pattern)
  - Show a loading/spinner state while `isLoggingIn` is true

### Modify
- `App.tsx`: Add a conditional render -- if `!identity` and `!isInitializing`, render the new `<LoginPage>` component instead of the main dashboard layout.

### Remove
- Nothing removed.

## Implementation Plan

1. Create `src/frontend/src/components/sections/LoginPage.tsx` -- full-screen login page with JARVIS branding, feature highlights, and "Connect with Internet Identity" button. Wire `login()` and `isLoggingIn` from `useInternetIdentity`.
2. Update `App.tsx` to import `LoginPage` and conditionally render it when `!identity && !isInitializing`.
3. Ensure all interactive elements have `data-ocid` markers (login button, feature cards if interactive).
