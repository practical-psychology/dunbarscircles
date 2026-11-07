# Dependencies, secrets and security checks (WEB-013, WEB-040)

## Done in this change

- Lockfile committed; CI uses `npm ci`.
- `firebase-admin` and `puppeteer` moved to devDependencies (not needed at runtime).
- Hosting headers: HSTS, nosniff, frame, referrer, permissions policy, COOP for Google popup, and CSP in **report-only** mode.
- Firestore rules require ownership (`firestore.rules`).
- Debug routes `/firebase-test` and `/color-contrast-test` are development-only.

## Open items (owner)

- [ ] Secret scan of git history: `docker run --rm -v "$PWD:/repo" zricethezav/gitleaks detect -s /repo` ; rotate anything found.
- [ ] Restrict the Firebase web API key by HTTP referrer (ENVIRONMENT.md).
- [ ] Verify deployed rules: `firebase deploy --only firestore:rules` and test with the emulator.
- [ ] Remaining `npm audit` findings are upstream (`firebase`/gRPC, `react-router`, `zod`, `esbuild` dev server). Update these packages in a separate PR, then make the CI audit step blocking.
- [ ] Watch CSP reports in the browser console on a preview, then switch `Content-Security-Policy-Report-Only` to `Content-Security-Policy`.

## Performance

Run Lighthouse (mobile) on the preview URL and record scores here. Targets: LCP under 2.5 s, CLS under 0.1, TBT under 200 ms. Known gap: the `firebase` chunk is still about 679 kB (170 kB gzip) and is loaded on first paint because `PageLayout` imports Auth. Analytics now loads lazily, only after consent. Follow-up: load Auth/Firestore on demand (sign-in click or Contacts page) to cut first-load JavaScript.
Result: Perf ** A11y ** Best practices ** SEO **
