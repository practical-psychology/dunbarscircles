# QA, accessibility and launch gates (WEB-028, WEB-038, WEB-039, WEB-041)

## 1. Automated

`npm run type-check && npm run lint && npm test` (CI enforces). 3 integration tests are quarantined with `it.skip` and marked `TODO quarantined`:

- `complete-user-journey` full journey: radial diagram test id not found after navigation (mock path mismatch for lazy `RadialPage`).
- `complete-user-journey` auth failure and recovery: depends on mocked auth state that `PageLayout` does not read.
- `user-workflows` authentication workflow: same auth-state mock issue.
  Un-skip each once the mocks are rewritten to drive `onAuthStateChanged`.

## 2. Accessibility pass (WCAG 2.2 AA)

- [ ] Keyboard only: skip link, nav, visualizations menu (Escape closes), modals trap focus
- [ ] Screen reader (VoiceOver + Safari, NVDA + Firefox): headings, landmarks, diagram descriptions, route changes
- [ ] Contrast: run `/color-contrast-test` in dev, both themes
- [ ] 200% zoom and 320 px width, no horizontal scroll
- [ ] Touch targets at least 44 px; reduced motion honoured
- [ ] Text alternatives exist for every diagram (list or table equivalent)

## 3. Manual flow

Home -> tour -> add contact -> import -> export -> sign in -> backup -> sign out -> delete.

## 4. Browser/device matrix (WEB-039)

| Browser | Desktop | Mobile      |
| ------- | ------- | ----------- |
| Chrome  | [ ]     | [ ] Android |
| Safari  | [ ]     | [ ] iOS     |
| Firefox | [ ]     | [ ] Android |
| Edge    | [ ]     | -           |

## 5. Launch sign-off (WEB-041)

- [ ] Scientific review of Evidence page and CLAIMS.md: **\_\_** date **\_\_**
- [ ] Asset rights confirmed (ASSETS.md): **\_\_**
- [ ] Accessibility QA complete: **\_\_**
- [ ] Privacy policy matches DATA_FLOWS.md: **\_\_**
      Approved by: **\_\_** Date: **\_\_**
