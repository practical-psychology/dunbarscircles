# Release process and launch gates (WEB-022, WEB-041, #64, #66)

## Which commit is live?

Every build writes its git SHA into the page: `<meta name="build-sha" content="...">` (injected by `vite.config.ts`; CI uses `GITHUB_SHA`, local builds use `git rev-parse HEAD` and add `-dirty` for uncommitted changes).

```bash
curl -s https://dunbarscircles.com/ | grep -o 'name="build-sha" content="[^"]*"'
```

`scripts/smoke-test.sh` prints it as `info live build-sha`.

| Date       | Live SHA                                                                                                                     | How verified                                                                                                                   |
| ---------- | ---------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| 2026-11-10 | Not recorded. The live build predates the build-sha meta tag; its bundle is `index-DECLyc_s.js`, and `main` was at `393035c` | First deploy after this change records the SHA automatically                                                                   |
| 2026-11-11 | `0dd141d` (main)                                                                                                             | `build-sha` meta on https://dunbarscircles.com/; deploy run 42937437181 released hosting and Firestore rules; smoke test 56/56 |

## Release-tag procedure

Tags mark what went live, so a rollback target is always one command away.

1. Merge the pull request to `main`. CI (`ci.yml`) and the deploy workflow run type-check, lint, tests and build, deploy to the live channel, then run the smoke test.
2. Wait for the `production smoke test` job to go green.
3. Confirm the live SHA matches `main`:
   ```bash
   git fetch origin && git rev-parse origin/main
   curl -s https://dunbarscircles.com/ | grep -o 'build-sha" content="[^"]*"'
   ```
4. Tag that commit with a date-based version and push the tag:
   ```bash
   git tag -a v2026.11.10 -m "Release 2026-11-10: <one-line summary>" <sha>
   git push origin v2026.11.10
   ```
   Second release on the same day: `v2026.11.10.2`.
5. Optional: `gh release create v2026.11.10 --generate-notes` for a changelog.
6. Add a row to the "Which commit is live?" table above.

Rollback: see RUNBOOK.md. After a rollback, the last good tag tells you which commit to redeploy or revert to.

## Launch gates G0–G6

Each gate needs every box ticked, with a name and date, before the next gate starts.

### G0: Ownership and access

- [ ] Repo owners/admins screenshot saved outside the repo (OWNER_STEPS.md 4b)
- [ ] Firebase project IAM screenshot saved; at least two owners or a recovery path
- [ ] Registrar account screenshot saved; MFA and recovery codes stored
- [x] Registrar transfer lock on (`clientTransferProhibited`, WHOIS 2026-11-10)

### G1: Build and security baseline

- [x] `npm run type-check && npm run lint && npm test` green
- [x] Firestore rules owner-only (`firestore.rules`), tests in `tests/firestore/` (`npm run test:rules`)
- [ ] Rules deployed to the live project (`npx firebase-tools deploy --only firestore:rules --project dunbarscircles`)
- [ ] Old `yakw-aab4f` key deleted; GitHub secret alert #1 closed; live key referrer-restricted
- [ ] `npm audit` high findings resolved or accepted in SECURITY.md

### G2: Domain, TLS and headers

- [x] Apex serves the site; `http` -> `https`; `www` -> apex (smoke test, 2026-11-10)
- [x] Certificate valid (Google Trust Services, expires 2027-02-05, auto-renewed by Firebase)
- [x] HSTS, nosniff, frame, referrer, permissions headers present; CSP present (report-only)
- [ ] CSP switched to enforcing after a clean preview (OWNER_STEPS.md 6)

### G3: Content and claims

- [x] Numbers match CLAIMS.md (fact-check 2026-11-10)
- [ ] Scientific reviewer sign-off on /evidence and CLAIMS.md
- [x] Rights register complete (ASSETS.md)
- [x] Privacy policy matches DATA_FLOWS.md (audit 2026-11-10)
- [ ] Legal review of the privacy policy

### G4: Quality

- [x] Main-journey regression test (`src/test/integration/main-journey.test.ts`)
- [x] Live smoke test passes (`npm run smoke -- https://dunbarscircles.com`)
- [x] Lighthouse mobile recorded in SECURITY.md
- [x] Automated accessibility pass (Lighthouse a11y 100; keyboard access to diagram nodes)
- [ ] Screen-reader test (VoiceOver + Safari, NVDA + Firefox)
- [ ] Real-device matrix (QA.md section 4), including iOS Safari

### G5: Measurement and monitoring

- [ ] Analytics choice recorded (ANALYTICS.md)
- [ ] Search Console domain property verified, sitemap submitted
- [x] Uptime probe every 30 minutes (`uptime.yml`)
- [x] Domain and certificate expiry check (`domain-expiry.yml`)
- [ ] Cloud budget alert set

### G6: Go-live sign-off

- [ ] Pilot: first-time users reach a first map in 5 minutes or less
- [ ] All gates above complete
- [ ] Launch tag pushed (procedure above)
- [ ] 24–72 hour observation log filled in (RUNBOOK.md)

Approved for launch by: **\_\_** Date: **\_\_**
