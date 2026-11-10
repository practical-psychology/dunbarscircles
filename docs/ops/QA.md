# QA, accessibility and launch gates (WEB-028, WEB-038, WEB-039, WEB-041)

## 1. Automated

`npm run type-check && npm run lint && npm test` (CI enforces). 3 integration tests are quarantined with `it.skip` and marked `TODO quarantined`:

- `complete-user-journey` full journey: radial diagram test id not found after navigation (mock path mismatch for lazy `RadialPage`).
- `complete-user-journey` auth failure and recovery: depends on mocked auth state that `PageLayout` does not read.
- `user-workflows` authentication workflow: same auth-state mock issue.
  Un-skip each once the mocks are rewritten to drive `onAuthStateChanged`.

## 2. Accessibility pass (WCAG 2.2 AA)

- [x] Keyboard only: diagram nodes are focusable buttons with labels; Enter/Space selects and the selection is announced (`aria-live`, 2026-11-10). Skip link present. Dialogs use Radix (focus trap, Escape closes)
- [ ] Screen reader (VoiceOver + Safari, NVDA + Firefox): headings, landmarks, diagram descriptions, route changes (owner)
- [x] Contrast: Lighthouse color-contrast audit passes on the live home page (a11y score 100, 2026-11-10). Dark theme not yet audited by tool
- [x] 360, 390 and 768 px: no horizontal scroll on /, /contacts, /dashboard, /lifecycle, /contacts/edit/new, /evidence, /privacy (2026-11-10). 200% zoom still to check by hand
- [x] Touch targets at least 44 px on the pages above (nav, sign-in, card buttons, FAQ rows, dashboard row menus, Contacts tabs fixed 2026-11-10). Reduced motion honoured by the diagram intro pulse
- [x] Text alternatives: home diagram has `<title>`, `<desc>` and a screen-reader table; landing preview image has alt text; layer stats have `role="progressbar"` labels

## 3. Manual flow

Home -> tour -> add contact -> import -> export -> sign in -> backup -> sign out -> delete.

Automated part: `src/test/integration/main-journey.test.ts` covers add -> import (with de-duplication and invalid rows) -> export -> wipe -> restore -> re-restore, plus sample-data cleanup. Browser-checked 2026-11-10: sample data -> add a real contact -> "Remove the 10 sample people?" -> only samples removed, toast shown. Sign-in and backup still need a manual pass.

## Live smoke test (#75)

`npm run smoke -- https://dunbarscircles.com` checks every route, sitemap URL, static asset, security header, real 404s, removed debug routes, canonical and noindex, HTTP->HTTPS and www->apex, and prints the live build SHA. 2026-11-10: all passed except `/circles-preview.svg` (added in this change, not yet deployed). Live home page has no console errors (Lighthouse "errors-in-console" audit passes). Mobile layout and keyboard were checked on the local build, which has the same routes.

## 4. Browser/device matrix (WEB-039)

| Browser | Desktop | Mobile      |
| ------- | ------- | ----------- |
| Chrome  | [ ]     | [ ] Android |
| Safari  | [ ]     | [ ] iOS     |
| Firefox | [ ]     | [ ] Android |
| Edge    | [ ]     | -           |

## 5. Launch sign-off (WEB-041)

- [ ] Scientific review of Evidence page and CLAIMS.md: **\_\_** date **\_\_**
- [x] Asset rights confirmed (ASSETS.md): audited 2026-11-10, owner to initial **\_\_**
- [ ] Accessibility QA complete: **\_\_**
- [x] Privacy policy matches DATA_FLOWS.md: audited 2026-11-10; legal review **\_\_**
      Approved by: **\_\_** Date: **\_\_**
