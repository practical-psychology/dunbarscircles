# Environments and secrets (WEB-015, WEB-017)

## GitHub environments

Create two under Settings > Environments:

- `production`: add required reviewer (optional) and restrict to branch `main`.
- `preview`: no restrictions.

## Secrets (Settings > Secrets and variables > Actions)

| Name                                                                                 | Where from                                                                                                                             | Used by                    |
| ------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------- | -------------------------- |
| `FIREBASE_TOKEN`                                                                     | Run `npx firebase-tools login:ci` on your Mac, sign in with the Google account that owns the Firebase project, paste the printed token | deploy (Firebase CLI only) |
| `VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_APP_ID`, `VITE_FIREBASE_MESSAGING_SENDER_ID` | Firebase console > Project settings > Your apps                                                                                        | build                      |
| `VITE_FIREBASE_MEASUREMENT_ID`                                                       | Same page (Google Analytics)                                                                                                           | production build only      |

`FIREBASE_TOKEN` is the existing secret name. The workflow uses the Firebase CLI directly, so no Google Cloud service account or gcloud is involved. Note: Firebase marks `login:ci` tokens as deprecated (they still work). If they stop working, run `npx firebase-tools init hosting:github`, which creates a service account for you without gcloud.
Firebase web API keys are not secret, but restrict them (HTTP referrers: `dunbarscircles.com`, `dunbarscircles.web.app`, `dunbarscircles.firebaseapp.com`) in Google Cloud console > Credentials.

## Separation

Preview channels build without the analytics measurement ID, so previews never send analytics. Previews and local builds are `noindex` (see `usePageMeta`).
