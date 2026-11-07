# Environments and secrets (WEB-015, WEB-017)

## GitHub environments

Create two under Settings > Environments:

- `production`: add required reviewer (optional) and restrict to branch `main`.
- `preview`: no restrictions.

## Secrets (Settings > Secrets and variables > Actions)

| Name                                                                                                               | Where from                                                                                                                                                 | Used by               |
| ------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------- |
| `FIREBASE_SERVICE_ACCOUNT_DUNBARSCIRCLES`                                                                          | Run `firebase init hosting:github` once, or create a service account with the "Firebase Hosting Admin" and "Cloud Run Viewer" roles and paste its JSON key | deploy                |
| `VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_APP_ID`, `VITE_FIREBASE_MESSAGING_SENDER_ID`, `VITE_FIREBASE_DATABASE_URL` | Firebase console > Project settings > Your apps                                                                                                            | build                 |
| `VITE_FIREBASE_MEASUREMENT_ID`                                                                                     | Same page (Google Analytics)                                                                                                                               | production build only |

The old `FIREBASE_TOKEN` secret does not work with `action-hosting-deploy`; delete it after the new secret is set.
Firebase web API keys are not secret, but restrict them (HTTP referrers: `dunbarscircles.com`, `dunbarscircles.web.app`, `dunbarscircles.firebaseapp.com`) in Google Cloud console > Credentials.

## Separation

Preview channels build without the analytics measurement ID, so previews never send analytics. Previews and local builds are `noindex` (see `usePageMeta`).
