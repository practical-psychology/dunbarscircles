# Firebase integration

Current design (2026-11-10). Replaces the earlier two-collection design.

## Principle

The browser store is the source of truth. Firestore is an optional backup mirror for signed-in users.

| Layer         | Where                                                      | Who uses it                                                                                                                                 |
| ------------- | ---------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| Browser store | `localStorage["yakw_contacts"]` (session storage fallback) | Every page, via `ContactStorageService` (`lib/contact-storage-service.ts`) and `EnhancedContactStorage` (`lib/contact-storage-enhanced.ts`) |
| Cloud mirror  | Firestore collection `user_contacts`                       | Only `lib/cloud-sync.ts` / `lib/cloud-sync-core.ts`                                                                                         |
| Sign-in       | Firebase Authentication, Google provider                   | `lib/auth-utils.ts`, loaded on demand by `PageLayout`                                                                                       |
| Analytics     | Google Analytics for Firebase, after consent only          | `lib/analytics.ts`                                                                                                                          |

No other module may import `firebase/firestore` for contact data.

## Cloud document format

- Collection: `user_contacts` (the only contacts collection).
- Document id: `<uid>_<contactId>` (`cloudDocId()`), so one contact is always one document and saves are idempotent.
- Fields: the contact exactly as stored in the browser (dates as ISO strings), plus `userId` (owner uid) and `syncedAt` (server timestamp). Local-only fields (`firestoreId`, `syncStatus`, `lastSyncAt`, layout coordinates) are never uploaded.
- Built-in demo people (ids starting `sample_`) are never uploaded.

## Sync behaviour

1. **Sign-in** (`syncUser`): read the user's `user_contacts` documents and any documents in the retired `contacts` collection; merge with the browser store by contact id (newer `updatedAt` wins, local wins ties, duplicates collapse); write the merged list to the browser; make `user_contacts` equal to it; delete the retired documents.
2. **After any local change** (`notifyLocalChange`, debounced 0.8 s): upsert every contact and delete cloud documents whose contact no longer exists (`pushUser`). Clearing all contacts therefore also clears the cloud copy.
3. **Offline or failure**: contacts stay in the browser; the next change or reconnect retries. The dashboard shows the real state ("Local only", "Backing up…", "backed up", "failed; it will retry").
4. **Sign-out**: syncing stops; the browser copy stays.

## Security rules

`firestore.rules`: owner-only access; document id must start with the caller's uid; required fields `id`, `userId`, `name`, `levelId` with size limits; `userId` can never change; the retired `contacts` collection is read/delete only (for migration); everything else is closed.

## Tests

- `src/test/lib/cloud-sync.test.ts`: document ids, field mapping, merge rules (Vitest).
- `tests/firestore/rules.test.mjs`: rules plus end-to-end sync against the emulator, including legacy migration, de-duplication, idempotent pushes, deletions and a second device (`npm run test:rules`, Java 11+, Node 22.18+).

## Configuration

`.env.local` (copy `.env.example`): `VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_AUTH_DOMAIN`, `VITE_FIREBASE_PROJECT_ID`, `VITE_FIREBASE_STORAGE_BUCKET`, `VITE_FIREBASE_MESSAGING_SENDER_ID`, `VITE_FIREBASE_APP_ID`, optional `VITE_FIREBASE_MEASUREMENT_ID`. Check with `npm run check-firebase`. The Realtime Database is not used; `VITE_FIREBASE_DATABASE_URL` was removed.
