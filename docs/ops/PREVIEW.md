# Preview environments (WEB-016, WEB-018)

- Every same-repo pull request deploys to a Firebase preview channel (7-day expiry); the action comments the URL on the PR. Forked PRs build only (no secrets).
- Previews are **not indexed**: the app sets `noindex, nofollow` on preview hosts (`*--*.web.app`) and localhost, and canonical always points to `https://dunbarscircles.com`.
- Previews contain no analytics (measurement ID withheld at build).
- Access: preview URLs are unguessable but public. Do not put real personal data in previews. For stricter access, restrict the repo to collaborators and share URLs only inside the team.
- Test procedure: open the PR comment URL in a private window; confirm `<meta name="robots" content="noindex, nofollow">` in DevTools and that no request to `google-analytics.com` fires.
