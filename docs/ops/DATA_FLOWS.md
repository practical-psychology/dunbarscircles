# Data flow inventory (WEB-005)

| Data                           | Where collected               | Stored where                                 | Processor          | Purpose          | Retention                      | Deletion                                 |
| ------------------------------ | ----------------------------- | -------------------------------------------- | ------------------ | ---------------- | ------------------------------ | ---------------------------------------- |
| Contacts, levels, notes        | Contact forms, imports        | Browser local storage                        | none (device only) | The app itself   | Until user clears              | Clear site data or in-app delete         |
| Contacts (backup)              | After optional Google sign-in | Cloud Firestore `user_contacts`              | Google (Firebase)  | Cloud backup     | Until user deletes             | In-app delete; request via GitHub Issues |
| Google account ID, name, email | Sign-in                       | Firebase Authentication                      | Google             | Sign-in          | Until account removed          | Request via GitHub Issues                |
| Usage events (page, CTA)       | After analytics consent only  | Google Analytics for Firebase                | Google             | Improve the site | 14 months max (set in console) | Revoke consent; Analytics user deletion  |
| Consent choice                 | Consent banner                | Browser local storage `dc.analytics.consent` | none               | Remember choice  | Until cleared                  | Clear site data                          |
| Source and CI logs             | Git push                      | GitHub                                       | GitHub             | Build and deploy | GitHub defaults                | n/a                                      |

Firestore rules (`firestore.rules`) restrict reads/writes to the owning signed-in user. Deployed rules must be verified after each change: `firebase deploy --only firestore:rules` then run the emulator tests in SECURITY.md.
