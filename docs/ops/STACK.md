# Repo and stack inventory (WEB-001, WEB-014, #7)

Recorded 2026-11-10 from `package-lock.json`, config files and the live site.

## Application

| Layer      | Choice                                                | Version        | Where                                  |
| ---------- | ----------------------------------------------------- | -------------- | -------------------------------------- |
| UI         | React + React DOM                                     | 19.3.1         | `src/`, `components/`                  |
| Routing    | react-router-dom (client-side, lazy routes)           | 6.30.6         | `src/App.tsx`                          |
| Language   | TypeScript (strict type-check in CI)                  | 5.9.3          | `tsconfig.json`                        |
| Build      | Vite + @vitejs/plugin-react                           | 5.4.21 / 4.7.0 | `vite.config.ts`; output `dist/`       |
| Styling    | Tailwind CSS, Radix UI primitives (shadcn/ui pattern) | 3.4.19         | `tailwind.config.ts`, `components/ui/` |
| Motion     | framer-motion                                         | 14.10.1        | own chunk `motion-*.js`                |
| Icons      | lucide-react; local brand icons                       | 1.71.0         | `components/brand-icons.tsx`           |
| Toasts     | sonner (+ legacy shadcn toaster on the dashboard)     | 1.7.4          | `components/ui/sonner.tsx`             |
| Validation | zod, react-hook-form                                  | 3.25.76        | `lib/contact-models.ts`                |
| Fonts      | System font stack, no web fonts                       | -              | `src/index.css`                        |

## Data and services

| Concern         | Choice                                     | Notes                                                                 |
| --------------- | ------------------------------------------ | --------------------------------------------------------------------- |
| Primary storage | Browser `localStorage` key `yakw_contacts` | Shared by `ContactStorageService` and `EnhancedContactStorage`        |
| Optional backup | Cloud Firestore `user_contacts`            | Mirror of the browser store via `lib/cloud-sync.ts`; owner-only rules |
| Auth            | Firebase Authentication, Google provider   | Loaded on idle, not on first paint                                    |
| Analytics       | Google Analytics for Firebase              | Loaded only after consent; DNT/GPC honoured                           |
| Firebase SDK    | firebase 12.19.0                           | own chunk `firebase-*.js` (~186 kB gzip), lazy                        |
| Hosting         | Firebase Hosting, project `dunbarscircles` | DEPLOYMENT_DECISION.md                                                |
| Domain          | `dunbarscircles.com` at Namecheap          | DOMAIN_AND_DNS.md                                                     |

## Tooling and CI

| Concern                | Choice                                                                                                                              |
| ---------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| Node                   | 20 in CI (`actions/setup-node`). No `engines` field or `.nvmrc`; local dev has run on Node 26                                       |
| Package manager        | npm with committed `package-lock.json`; CI uses `npm ci`                                                                            |
| Lint                   | ESLint 8.57 (`.eslintrc.json`)                                                                                                      |
| Unit/integration tests | Vitest 3.2.7 + jsdom + Testing Library (`src/test/`)                                                                                |
| Firestore rules tests  | `@firebase/rules-unit-testing` 5 + emulator (`tests/firestore/`, `npm run test:rules`)                                              |
| Smoke test             | `scripts/smoke-test.sh` (`npm run smoke -- <url>`)                                                                                  |
| Workflows              | `ci.yml` (PR + main), `deploy.yml` (live on main, preview channel on PR), `uptime.yml` (every 30 min), `domain-expiry.yml` (weekly) |
| Dependency updates     | Dependabot                                                                                                                          |

## Rendering and SEO

Client-rendered single-page app. Titles, descriptions, Open Graph, canonical and JSON-LD for the home page are in static `index.html`; per-route titles are set at runtime (`usePageMeta`). Page body content needs JavaScript; a `<noscript>` message covers that case. Known routes rewrite to `index.html`; unknown paths return a real HTTP 404 (`public/404.html`).

## Known structural debt

- Two browser-store services (`ContactStorageService`, `EnhancedContactStorage`) over the same key; Firestore access is now only in `lib/cloud-sync.ts`.
- `data/dunbarLevels.ts` duplicates `src/data/dunbarLevels.ts`; edit both until one is removed.
- Several unused components (`contact-form-demo.tsx`, `LiquidShowcase.tsx`, `contact-storage-simple.ts`) are still in the repo.
