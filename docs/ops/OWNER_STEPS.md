# Owner steps (things only the account owner can do)

Code-side work is done and merged to `main`. These items need logins, payments or
registrar access that cannot be automated from the repo. Do them in this order.

## 1. Leaked key (GitHub secret alert #1, Google API key)

The key `AIzaSyDF…CMKM` belongs to the OLD Firebase project `yakw-aab4f`. A Firebase web API key is an identifier, not a password, but an unrestricted one can be abused for quota and billing.

1. Google Cloud console, project `yakw-aab4f`, APIs & Services, Credentials: **delete** the key (or regenerate it). If that project is retired, delete the whole project instead.
2. For the live project `dunbarscircles`: open the browser key and set Application restrictions to HTTP referrers (`https://dunbarscircles.com/*`, `https://www.dunbarscircles.com/*`, `https://dunbarscircles.web.app/*`, `https://dunbarscircles.firebaseapp.com/*`). Restrict APIs to Identity Toolkit, Firebase Installations, Firestore, Token Service.
3. Check the key's usage under APIs & Services, Metrics, and Cloud Logging for the old project (that is the "check logs" step).
4. GitHub, Security, Secret scanning, alert #1: Close as **Revoked**.
5. Do not rewrite git history: the key is public by design and revoking it is enough.

## 2. CI deploy credential (FIREBASE_TOKEN)

```bash
npx firebase-tools@latest login:ci
```

Copy the printed token, then GitHub repo, Settings, Secrets and variables, Actions: add `FIREBASE_TOKEN`. Also add the `VITE_FIREBASE_*` secrets listed in ENVIRONMENT.md. Create the `production` and `preview` environments (Settings, Environments); add required reviewers to `production` if you want a manual gate. After this, merges to `main` deploy and pull requests get a 7-day preview.

## 3. Deploy Firestore rules to the live project (together with the app)

The rules now require the new document ids written by `lib/cloud-sync.ts`. Deploy the rules in the same release as the hosting change that introduced it, so the old app and new rules never meet:

```bash
npm run build
npx firebase-tools@latest deploy --only hosting,firestore:rules --project dunbarscircles
```

If only the rules go out first, the old live app's cloud writes are refused (contacts stay safe in the browser). Existing documents in the retired `contacts` collection migrate automatically when each user next signs in.

## 4. Domain, DNS and registrar

1. Registrar: turn on MFA, save recovery codes, enable registrar lock, auto-renew and contact privacy.
2. Firebase console, Hosting, Add custom domain. Enter the exact A/TXT records Firebase shows (see DOMAIN_AND_DNS.md). Keep existing MX/SPF/DKIM/DMARC records if you use email.
3. Wait for the certificate, then run `bash scripts/smoke-test.sh https://dunbarscircles.com` to check DNS, HTTPS, redirects and headers.

## 5. Search Console and analytics

1. Search Console: add a Domain property, verify with the DNS TXT record, submit `https://dunbarscircles.com/sitemap.xml`.
2. Analytics: GA4 is already wired behind the consent banner. To use Plausible or Umami instead, see ANALYTICS.md; decide before launch and record it there.

## 4b. Ownership checklist (gate G0)

Take screenshots of the GitHub repo owners, Firebase project IAM and the registrar account page, and save them outside the repo. Do not commit them.

## 6. Switch CSP to enforcing

Load the preview URL, open the browser console, and confirm there are no CSP report-only violations. Then rename `Content-Security-Policy-Report-Only` to `Content-Security-Policy` in `firebase.json`.

## 7. Real-device checks

Check the Life Stages labels and tap targets (44 px) on a phone at 360, 390 and 768 px widths. Run Lighthouse mobile on the preview and record scores in SECURITY.md.

## 8. Dependencies

- `lucide-react` is on v1; its removed brand icons (Facebook, LinkedIn) now live in `components/brand-icons.tsx`.
- `npm audit` still reports 15 prod findings (firebase/gRPC, react-router, zod, esbuild). They need breaking upgrades; handle in a separate PR with tests.
