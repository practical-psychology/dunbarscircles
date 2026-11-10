# Forms and public input (WEB-037, #60)

Reviewed 2026-11-10. Result: not applicable. Nothing below changes that.

**Decision: public submission forms are not applicable.** The site has no contact form, newsletter signup, comments or any form that sends data to the owners. The only flow that talks to a server on the visitor's behalf is Google sign-in, which runs on Google's own pages (popup or redirect); we never see or handle a password.

The forms that exist (add/edit contact page, the Contacts page dialog, the dashboard quick-add panel, CSV/JSON import, backup restore) write only to the visitor's own browser storage, or to their own Firestore documents after optional sign-in.

- Client validation: `components/contact-form.tsx` (react-hook-form + zod).
- Server enforcement: `firestore.rules` allow create/update only when `userId == request.auth.uid`, and block reassigning a document to another user.
- Support requests go through GitHub Issues (About page).
  If a public form is ever added: require server-side validation, rate limiting (Cloud Function or reCAPTCHA Enterprise), spam protection, and update PRIVACY and DATA_FLOWS.
