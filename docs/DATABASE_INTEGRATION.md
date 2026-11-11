# Database integration (superseded)

`DatabaseService` (`lib/database-service.ts`) and the `contacts` Firestore collection were retired on 2026-11-10. They duplicated documents on every save and disagreed with the `user_contacts` sync path.

See [FIREBASE_INTEGRATION.md](FIREBASE_INTEGRATION.md) for the current design: browser storage is the source of truth and `lib/cloud-sync.ts` mirrors it to the single `user_contacts` collection. Existing documents in `contacts` are migrated automatically the next time their owner signs in.
