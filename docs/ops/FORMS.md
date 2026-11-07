# Forms and public input (WEB-037)

**Decision: public submission forms are not applicable.** The site has no contact form, newsletter signup, comments or any form that sends data to the owners.

The forms that exist (add/edit contact, import) write only to the visitor's own browser storage, or to their own Firestore documents after optional sign-in.

- Client validation: `components/contact-form.tsx` (react-hook-form + zod).
- Server enforcement: `firestore.rules` allow create/update only when `userId == request.auth.uid`, and block reassigning a document to another user.
- Support requests go through GitHub Issues (About page).
  If a public form is ever added: require server-side validation, rate limiting (Cloud Function or reCAPTCHA Enterprise), spam protection, and update PRIVACY and DATA_FLOWS.
