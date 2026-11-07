# Operations runbook (WEB-023, WEB-034, WEB-042, WEB-043)

## Deploy

Merge to `main`. Workflow `Deploy to Firebase Hosting` builds, tests, deploys to the live channel, then runs `scripts/smoke-test.sh`.

## Rollback (under 2 minutes)

Firebase console > Hosting > Release history > the previous good release > Rollback. CLI alternative:

```
firebase hosting:clone dunbarscircles:<previous-channel-or-version> dunbarscircles:live
```

Then revert the bad commit on `main` so the next deploy does not redeploy it.

## 404 behaviour

Known app routes rewrite to the SPA. Anything else returns HTTP 404 with `public/404.html`. Add new routes to the rewrite lists in `firebase.json` **and** `public/sitemap.xml`.

## Monitoring (WEB-034)

- `uptime.yml` probes the site every 30 minutes; a failure turns the run red and GitHub emails repository watchers. Enable Settings > Notifications > Actions failures.
- Firebase console > Hosting > Usage for traffic; Google Cloud > Monitoring > Uptime checks (free) can be added for the custom domain with an email alert policy.

## Production cutover checklist (WEB-042)

- [ ] Service account secret set; `main` deploy green
- [ ] Domain attached, certificate "Connected"
- [ ] `scripts/smoke-test.sh https://dunbarscircles.com` passes
- [ ] Share image loads: `https://dunbarscircles.com/og-image.png`
- [ ] Search Console property verified, sitemap submitted (SEARCH_CONSOLE.md)
- [ ] Sign-in works on the custom domain (add it to Firebase Auth > Authorized domains)

## 24-72 hour observation log (WEB-043)

| Time  | Check                                      | Result | Action |
| ----- | ------------------------------------------ | ------ | ------ |
| T+1h  | smoke test, home, sign-in                  |        |        |
| T+24h | uptime runs, Hosting usage, console errors |        |        |
| T+72h | Search Console coverage, analytics events  |        |        |

## Known accepted behaviour

Firebase applies header rules by URL path, including on 404s, so a missing `/assets/*` file returns a real 404 but with the long-lived `immutable` header. Asset names are content-hashed and releases are atomic, so a missing hash never becomes valid later; this is harmless. `scripts/smoke-test.sh` checks the status code (404), not the cache header.
