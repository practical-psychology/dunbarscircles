# Deployment decision record (WEB-004)

- **Status:** Accepted (proposed 2026-11-07, pending owner sign-off)
- **Decision:** Host the Vite/React single-page app on Firebase Hosting (project `dunbarscircles`), deployed from GitHub Actions.
- **Context:** The app already uses Firebase Auth and Firestore for optional backup. Output is static (`dist`). Needs free TLS, a CDN, preview channels and custom domains.
- **Options considered:**
  1. Firebase Hosting (chosen): same console as Auth/Firestore, free managed certificates, preview channels, instant rollback, per-route headers.
  2. Netlify / Vercel: comparable features, but a second vendor and a second account for no added capability.
  3. GitHub Pages: no custom response headers and no real 404 for SPA routes.
- **Consequences:** Vendor lock-in is low (static files). Firebase rewrites serve known routes only; everything else returns a real 404 (`public/404.html`). Secrets live in GitHub environments. Rollback via Hosting release history (RUNBOOK.md).
- **Revisit when:** monthly egress approaches the free tier, or server-side rendering is needed for SEO.
