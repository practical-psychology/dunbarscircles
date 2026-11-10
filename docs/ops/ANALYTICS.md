# Analytics, events and UTM taxonomy (WEB-032, WEB-033)

Analytics is opt-in (`lib/analytics.ts`). Events fire only after consent and never include contact data.

## Event dictionary

| Event             | When                                | Parameters                     |
| ----------------- | ----------------------------------- | ------------------------------ |
| `cta_click`       | A primary call-to-action is clicked | `cta` (e.g. `explore_network`) |
| `start_tour`      | "Start Interactive Tour" clicked    | -                              |
| `add_contact`     | First contact added in a session    | -                              |
| `import_contacts` | An import completes                 | `format`                       |
| `export_data`     | An export completes                 | `format`                       |
| `sign_in`         | Optional cloud sign-in succeeds     | -                              |
| `view_evidence`   | Evidence page opened                | -                              |
| `first_map`       | Contacts map shown with >= 1 contact (once per session) | -        |
| `share_click`     | Reserved: fires when a share control exists (none yet) | -             |

Add a new event name to `AnalyticsEvent` and to this table in the same pull request.

## Funnel

Visit `/` -> `cta_click`/`start_tour` -> `add_contact` -> `export_data`.

## UTM convention (links we publish)

Lowercase, hyphen-separated. `utm_source` = platform (`reddit`, `newsletter`, `x`), `utm_medium` = `social` | `email` | `referral`, `utm_campaign` = `yyyy-mm-short-name` (e.g. `2026-12-launch`), `utm_content` = variant. Build links with `withUtm()`.

## Console settings to verify

Firebase > Analytics > Data retention 14 months; disable Google signals and ads personalization; review data-sharing settings.
