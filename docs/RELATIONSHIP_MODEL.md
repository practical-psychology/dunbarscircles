# Emotional-relationship model (schema v2)

Implemented 2026-11-11. Code: `lib/relationship-model.ts` (model and insights), `lib/relationship-log.ts` (interactions and history), `lib/schema-migrations.ts` (v1 to v2 and back), `lib/cloud-consent.ts` (sync consent). Tests: `src/test/lib/relationship-model.test.ts`, `src/test/lib/backup.test.ts`, `src/test/integration/main-journey.test.ts`.

## Model

R_i = (D_i, V_i, A_i, F_i, Q_i, T_i). None of these measurements alone predicts social closeness or relationship quality, so the app never derives one from another.

| Symbol | Meaning                                           | Stored as                                                            |
| ------ | ------------------------------------------------- | -------------------------------------------------------------------- |
| D      | Assigned cumulative social layer                  | `levelId`, chosen by the user (imports start in the outermost layer) |
| V      | Emotional direction                               | `stage` in {love, like, indifferent, dislike, hate, mixed, unknown}  |
| A      | Personal importance, 0–100                        | `attachmentScore`                                                    |
| F      | Frequency and motivation                          | interactions by type, plus `desiredContactPerMonth`                  |
| Q      | Trust, support, reciprocity, 0–100 each, optional | `trust`, `support`, `reciprocity`                                    |
| T      | Observed change                                   | change history                                                       |

## Records (spec field → implementation)

**Relationship record** (`yakw_contacts`, one object per person):

| Spec                                           | Field                                             |
| ---------------------------------------------- | ------------------------------------------------- |
| person_id (local opaque ID)                    | `id`                                              |
| display_name                                   | `name`                                            |
| user_assigned_circle                           | `levelId`                                         |
| stage                                          | `stage`                                           |
| attachment 0–100                               | `attachmentScore`                                 |
| trust / support / reciprocity 0–100 (optional) | `trust`, `support`, `reciprocity`                 |
| desired_contact_per_month (optional)           | `desiredContactPerMonth`                          |
| notes (optional)                               | `notes`                                           |
| last_updated                                   | `updatedAt`                                       |
| excluded / no-contact status                   | `contactStatus` in {active, excluded, no-contact} |
| optional overlay                               | `overlay: true`                                   |
| schema version                                 | `schemaVersion: 2`                                |

**Interaction** (`dc_interactions`): `interaction_id`, `person_id`, `date` (YYYY-MM-DD), `type` in {voluntary, obligatory, conflict, unclassified}, optional `duration_minutes`, optional `initiated_by` in {me, them, both, unknown}.

**History** (`dc_history`, append-only): `change_id`, `person_id`, `timestamp`, `changed_fields` ({field: {from, to}}; `_created` and `_deleted` mark creation and deletion), `source` in {user-entry, import}. Imports, backup restores, sample data and cloud merges record `import`; everything else records `user-entry`. Only relationship fields are tracked (not sync bookkeeping).

## Rules and where they are enforced

| Rule                                                                    | Implementation                                                                                                                                                                                                       |
| ----------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Valence is separate from attachment                                     | Separate fields and inputs; `cleanProfile` never fills one from the other; migration does not turn the old "strength" into importance (the edit page offers it as a one-click choice instead)                        |
| Voluntary contact is separate from obligatory and conflict contact      | `contactRhythm` reports each type separately; only voluntary contact is compared with the user's desired rate                                                                                                        |
| Low frequency does not imply weak attachment                            | Strength, decay and "network health" scores were removed; the old "Decaying" badge is now "Below your desired contact" and appears only when the user set a desired rate                                             |
| No auto-placement                                                       | No function assigns a layer; imports land in Recognition Group; the old strength-based circle suggestion and import auto-categorisation were removed                                                                 |
| Optional overlay, excluded and no-contact status                        | `overlay` and `contactStatus`; such people are not counted in circles (`countsInCircles`), and overlay candidates are only suggested, never moved                                                                    |
| History additive, migrations reversible                                 | `relationship-log` only appends; `migrateContactUp`/`Down` round-trip without loss (`_v1`/`_v2`); the first upgrade keeps a copy of the v1 store in `dc_contacts_v1_backup`                                          |
| Export with schema_version, import preview and de-duplication           | Backup files are `schemaVersion: 2` with contacts, interactions and history; v1 files still import; preview shows counts first; duplicates (same name and circle) are skipped; logs are re-linked to restored people |
| No standardized mismatch for tiny or invariant data; completeness first | `attachmentContactMismatch` needs at least 8 people with importance and logged interactions and non-zero variance in both; the insights panel always shows completeness first                                        |
| Explicit choice before cloud sync                                       | Signing in uploads nothing; `cloud-consent` stores a per-account choice with timestamp and text version; sync, pushes and "Back up now" require it; it can be withdrawn on the dashboard                             |
| Research opt-in                                                         | No research feature exists; nothing is collected for research                                                                                                                                                        |
| No third-party names in analytics                                       | `sanitizeParams` allows only `cta` and `format` with short lowercase tokens; events never include contact data                                                                                                       |

## Storage and sync scope

Contacts (including the v2 fields) are mirrored to Firestore only after the user turns on cloud backup. Interactions and history stay in the browser and are included in the JSON export.
