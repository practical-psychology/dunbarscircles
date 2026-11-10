# Dependencies, secrets and security checks (WEB-013, WEB-040)

## Done in this change

- Lockfile committed; CI uses `npm ci`.
- `firebase-admin` and `puppeteer` moved to devDependencies (not needed at runtime).
- Hosting headers: HSTS, nosniff, frame, referrer, permissions policy, COOP for Google popup, and CSP in **report-only** mode.
- Firestore rules require ownership (`firestore.rules`).
- Debug routes `/firebase-test` and `/color-contrast-test` are development-only.

## Open items (owner)

- [x] Secret scan of git history (manual `git log -S` for `AIza`, admin SDK and service-account files, 2026-11-10): the only hit is the Firebase **web** API key of the OLD project `yakw-aab4f`, committed in `.env` in 641975a and removed in 2032164. No admin SDK keys or service-account files were ever committed. GitHub secret-scanning alert #1 covers this key.
- [ ] Close GitHub alert #1 after the old key is deleted or restricted (see docs/ops/OWNER_STEPS.md, section 1). Also run gitleaks for a second opinion.
- [ ] Restrict the Firebase web API key by HTTP referrer (ENVIRONMENT.md).
- [x] Rules tested against the Firestore emulator: 13 tests in `tests/firestore/rules.test.mjs` (owner CRUD, no cross-user read/write/delete, no reassigning `userId`, no anonymous access, unfiltered list denied, other collections closed) pass on 2026-11-10 for both `user_contacts` and `contacts`. Run with `npm run test:rules` (needs Java 11+); CI job `firestore rules` runs them on every PR.
- [ ] Deploy the tested rules to the live project (owner): `npx firebase-tools@latest deploy --only firestore:rules --project dunbarscircles`.
- [ ] Remaining `npm audit` findings are upstream (`firebase`/gRPC, `react-router`, `zod`, `esbuild` dev server). Update these packages in a separate PR, then make the CI audit step blocking.
- [ ] Watch CSP reports in the browser console on a preview, then switch `Content-Security-Policy-Report-Only` to `Content-Security-Policy`.

## Performance (#76)

Lighthouse 12.2.1, mobile emulation (Moto G Power, slow 4G), headless Chrome.

| Date       | URL                                | Build                | Perf | A11y | Best practices | SEO | LCP   | TBT    | CLS |
| ---------- | ---------------------------------- | -------------------- | ---- | ---- | -------------- | --- | ----- | ------ | --- |
| 2026-11-10 | https://dunbarscircles.com/ (live) | before quick wins    | 72   | 100  | 100            | 100 | 6.0 s | 140 ms | 0   |
| 2026-11-10 | local `vite preview`               | Firebase lazy-loaded | 78   | 100  | -              | -   | 4.7 s | 220 ms | -   |

Targets: LCP under 2.5 s, CLS under 0.1, TBT under 200 ms. Re-run on the live site after the next deploy and add a row.

Quick wins done 2026-11-10:

- The `firebase` chunk (~186 kB gzip) and the Google Auth iframe no longer load on first paint. `PageLayout` loads Auth when the browser is idle; `lib/analytics.ts` imports Firebase only after consent; the welcome dialog and sample-cleanup prompt import the storage service on demand. `dist/index.html` now preloads only `react` and `motion`.
- Removed the artificial 600 ms splash in `App.tsx` (index.html already shows an inline loader) and the fade-in on first route render.

Remaining opportunities: the main `index` chunk (~122 kB gzip) still bundles every eagerly imported page component; `framer-motion` (~50 kB gzip) is on the critical path for the home page animation; Lighthouse flags ~29 kB of unminified code inside the Firebase chunk (vendor, not ours).
