# Analytics, events and UTM taxonomy (WEB-032, WEB-033)

Analytics is opt-in (`lib/analytics.ts`). Events fire only after consent and never include contact data.

## Event dictionary

Checked against the code on 2026-11-10 (`grep -rn trackEvent`). Every name below is in the `AnalyticsEvent` union in `lib/analytics.ts`.

| Event             | Fired from                                                               | When                                                   | Parameters                |
| ----------------- | ------------------------------------------------------------------------ | ------------------------------------------------------ | ------------------------- |
| `cta_click`       | `src/pages/HomePage.tsx`                                                 | "Map My Circles" clicked                               | `cta: "map_my_circles"`   |
| `start_tour`      | `src/pages/HomePage.tsx`                                                 | "Take the 10 minute tour" link clicked                 | -                         |
| `add_contact`     | `ContactEditPage.tsx`, `ContactsPage.tsx` (modal), `contact-manager.tsx` | Every contact added by hand                            | -                         |
| `import_contacts` | `ContactImportPage.tsx`, `components/backup-panel.tsx`                   | An import completes                                    | `format`                  |
| `export_data`     | `components/backup-panel.tsx`, `components/contacts-dashboard.tsx`       | A JSON or CSV export completes                         | `format: "json" \| "csv"` |
| `sign_in`         | `src/components/PageLayout.tsx`                                          | Google sign-in succeeds (popup or redirect)            | -                         |
| `view_evidence`   | `src/pages/EvidencePage.tsx`                                             | Evidence page opened                                   | -                         |
| `first_map`       | `src/pages/ContactsPage.tsx`                                             | Contacts shown with >= 1 contact, once per tab session | -                         |
| `share_click`     | none yet                                                                 | Reserved for a future share control                    | -                         |

No event carries names, notes, emails or any other contact data. This is enforced in code: `sanitizeParams` (lib/analytics.ts) drops every parameter except `cta` and `format`, and any value that is not a short lowercase token, so a name cannot be sent even by mistake.

Fixed in this audit: `sign_in` and `view_evidence` were documented but never fired; dashboard exports did not send `export_data`; adding a contact from the Contacts page modal did not send `add_contact`; the `cta_click` example value was out of date.

Add a new event name to `AnalyticsEvent` and to this table in the same pull request.

## Funnel

Visit `/` -> `cta_click` or `start_tour` -> `add_contact` -> `first_map` -> `export_data`.

## UTM convention (links we publish)

Lowercase, hyphen-separated. `utm_source` = platform (`reddit`, `newsletter`, `x`), `utm_medium` = `social` | `email` | `referral`, `utm_campaign` = `yyyy-mm-short-name` (e.g. `2026-12-launch`), `utm_content` = variant. Build links with `withUtm()`.

## Decision (owner, #67)

GA4 through Firebase is wired and consent-gated. Alternative: Plausible or Umami (cookieless, could drop the consent banner). Record the choice here: **\_\_** (date **\_\_**).

## Console settings to verify

Firebase > Analytics > Data retention 14 months; disable Google signals and ads personalization; review data-sharing settings.
