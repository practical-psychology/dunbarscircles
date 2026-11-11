# Rights register: images, icons, fonts, data (WEB-026, #55)

Audited 2026-11-10 against what the production build actually ships (`dist/` and `public/`). Rule: no stock photos or third-party images without a row here.

## Images and icons

| Asset                            | Path                                                                        | Origin                                                            | License / permission                                                                                                          | Verified |
| -------------------------------- | --------------------------------------------------------------------------- | ----------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- | -------- |
| Favicon / logo mark              | `public/favicon.svg`, `public/favicon.ico`                                  | Made for this project (commit 5c9268d)                            | Project-owned                                                                                                                 | [x]      |
| App icons                        | `public/icon-192.png`, `public/icon-512.png`, `public/apple-touch-icon.png` | Rendered from the favicon mark (5c9268d)                          | Project-owned                                                                                                                 | [x]      |
| Share image 1200 x 630           | `public/og-image.png`                                                       | Made for this project (5c9268d); text and circles only, no photos | Project-owned                                                                                                                 | [x]      |
| Landing-page circles preview     | `public/circles-preview.svg`                                                | Hand-written SVG (2026-11-10)                                     | Project-owned                                                                                                                 | [x]      |
| Interactive diagrams             | `components/*-diagram.tsx`, `components/life-stage-comparison.tsx`          | Original SVG/React code                                           | Project-owned                                                                                                                 | [x]      |
| UI icons                         | `lucide-react` v1 (npm)                                                     | Lucide contributors                                               | ISC                                                                                                                           | [x]      |
| Facebook and LinkedIn glyphs     | `components/brand-icons.tsx`                                                | SVG paths from lucide-react v0 (before v1 removed brand icons)    | Code: ISC. Marks: trademarks of Meta and LinkedIn, used only to label import sources (nominative use, no endorsement implied) | [x]      |
| Google "G" on the sign-in button | `src/components/PageLayout.tsx`                                             | Google's sign-in branding                                         | Used as required by Google sign-in branding guidelines                                                                        | [x]      |

## Fonts

No web fonts are shipped. The site uses the visitor's system font stack (`system-ui, -apple-system, Segoe UI, Roboto, ...` in `src/index.css`). No Google Fonts or other font CDN requests. [x]

## Data and text

| Asset                            | Path                                                 | Origin                                  | License / permission                                      | Verified |
| -------------------------------- | ---------------------------------------------------- | --------------------------------------- | --------------------------------------------------------- | -------- |
| Layer names, sizes, descriptions | `src/data/dunbarLevels.ts` (mirrored in `data/`)     | Project text summarising cited research | Project-owned; sources cited on /evidence                 | [x]      |
| Sample people                    | `lib/sample-contacts.ts`                             | Fictional names written for the project | Project-owned                                             | [x]      |
| Example import files             | `data/facebook_friends*.json`, `data/linkedin_*.csv` | Synthetic test fixtures                 | Project-owned; not served by the site (outside `public/`) | [x]      |

## Third-party code shipped in the bundle

React, React Router, Radix UI, framer-motion, sonner, date-fns, zod (MIT); Firebase JS SDK (Apache-2.0); lucide-react (ISC). Licences are preserved in `node_modules`; none require attribution in the UI.

## Project licence

Code: MIT (`LICENSE`, added 2026-11-10; About page links to it). Copyright holder: "practical-psychology contributors". Change the holder line in `LICENSE` if the code should be owned by a named person or company.
