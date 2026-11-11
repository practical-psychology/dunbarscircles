# Operations runbook (WEB-023, WEB-034, WEB-042, WEB-043)

## Deploy

Merge to `main`. Workflow `Deploy to Firebase Hosting` builds, tests, deploys to the live channel, then runs `scripts/smoke-test.sh`.

## Rollback (under 2 minutes)

Dry run (do once before launch, on a preview channel so production is untouched):

```bash
npx firebase-tools hosting:channel:deploy rollback-drill --expires 1d --project dunbarscircles
npx firebase-tools hosting:clone dunbarscircles:live dunbarscircles:rollback-drill --project dunbarscircles
curl -s https://dunbarscircles--rollback-drill-<hash>.web.app/ | grep -o 'build-sha" content="[^"]*"'
```

The SHA printed should equal the live one; that proves `hosting:clone` restores a known release. Record the date here: **\_\_**.

Firebase console > Hosting > Release history > the previous good release > Rollback. CLI alternative:

```
firebase hosting:clone dunbarscircles:<previous-channel-or-version> dunbarscircles:live
```

Then revert the bad commit on `main` so the next deploy does not redeploy it.

## 404 behaviour

Known app routes rewrite to the SPA. Anything else returns HTTP 404 with `public/404.html`. Add new routes to the rewrite lists in `firebase.json` **and** `public/sitemap.xml`.

## Monitoring (WEB-034)

- `uptime.yml` probes the site every 30 minutes; a failure turns the run red and GitHub emails repository watchers. Enable Settings > Notifications > Actions failures.
- `domain-expiry.yml` runs every Monday: fails when the domain is within 45 days of expiry (currently 2027-11-07, Namecheap) or the certificate within 14 days (Firebase auto-renews).
- Firebase console > Hosting > Usage for traffic; Google Cloud > Monitoring > Uptime checks (free) can be added for the custom domain with an email alert policy.
- Calendar reminder (owner): 2027-10-01, "check dunbarscircles.com auto-renew and card".

### Error monitoring options

| Option                                                                                                     | Cost      | Privacy                                                                               | Effort            | Notes                                                                        |
| ---------------------------------------------------------------------------------------------------------- | --------- | ------------------------------------------------------------------------------------- | ----------------- | ---------------------------------------------------------------------------- |
| A. None beyond uptime + console checks                                                                     | free      | best                                                                                  | none              | Current state. Acceptable for a static, local-first app                      |
| B. GA4 `exception` events from `window.onerror` / `unhandledrejection`, consent-gated through `trackEvent` | free      | same as analytics                                                                     | ~30 lines         | Only from visitors who allowed analytics; no stack traces with personal data |
| C. Sentry (free tier, 5k errors/month)                                                                     | free tier | sends stack traces and URLs to Sentry; needs a privacy-policy line and DATA_FLOWS row | small SDK, ~25 kB | Best diagnostics; must scrub contact names from breadcrumbs                  |

Recommendation: B, once the analytics decision (ANALYTICS.md) is made. Do not add C without updating PrivacyPage and DATA_FLOWS.

## Production cutover checklist (WEB-042)

- [ ] `FIREBASE_TOKEN` secret set; `main` deploy green
- [x] Domain attached, certificate issued (checked 2026-11-10: apex 200, http->https, www->apex)
- [x] `scripts/smoke-test.sh https://dunbarscircles.com` passes (2026-11-10; only the not-yet-deployed `/circles-preview.svg` failed)
- [x] Share image loads: `https://dunbarscircles.com/og-image.png` (200)
- [ ] Search Console property verified, sitemap submitted (SEARCH_CONSOLE.md)
- [ ] Sign-in works on the custom domain (add it to Firebase Auth > Authorized domains)

## 24-72 hour observation log (WEB-043)

Run at each checkpoint: `npm run smoke -- https://dunbarscircles.com`, look at the last uptime runs (`gh run list --workflow uptime.yml -L 10`), open the site with DevTools console open on `/`, `/contacts`, `/dashboard`, and check Firebase Hosting usage.

| Time  | Check                                      | Result | Action |
| ----- | ------------------------------------------ | ------ | ------ |
| T+1h  | smoke test, home, sign-in                  |        |        |
| T+24h | uptime runs, Hosting usage, console errors |        |        |
| T+72h | Search Console coverage, analytics events  |        |        |

## Known accepted behaviour

Firebase applies header rules by URL path, including on 404s, so a missing `/assets/*` file returns a real 404 but with the long-lived `immutable` header. Asset names are content-hashed and releases are atomic, so a missing hash never becomes valid later; this is harmless. `scripts/smoke-test.sh` checks the status code (404), not the cache header.
