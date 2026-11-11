/**
 * The one hook every writer of the contact store calls before saving
 * (ContactStorageService, EnhancedContactStorage, cloud-sync merge):
 * upgrade records to the current schema and append the change history.
 */
import { migrateContactsUp } from "./schema-migrations";
import { readRawContacts, recordContactChanges } from "./relationship-log";
import type { ChangeSource } from "./relationship-model";

export function prepareStoreWrite<T>(next: T[], source?: ChangeSource): T[] {
  const upgraded = migrateContactsUp(
    next as unknown as Record<string, unknown>[],
  );
  try {
    // Compare in JSON form, as the store holds it.
    recordContactChanges(
      readRawContacts(),
      JSON.parse(JSON.stringify(upgraded)),
      source,
    );
  } catch (e) {
    console.warn("Could not record contact history:", e);
  }
  return upgraded as unknown as T[];
}
