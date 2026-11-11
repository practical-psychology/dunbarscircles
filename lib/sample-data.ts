/**
 * Sample-data helpers (#48).
 *
 * Sample people loaded from the welcome modal are marked with
 * `platform: "sample"` AND the tag `"sample"` (see lib/sample-contacts.ts).
 * Both markers must be present, so a real contact the user happens to tag
 * "sample" is never treated as sample data.
 */

export const SAMPLE_TAG = "sample";
export const SAMPLE_PLATFORM = "sample";
const OFFER_DISMISSED_KEY = "dc.sample-cleanup-dismissed";
export const CONTACT_SAVED_EVENT = "dc:contact-saved";

export interface SampleMarked {
  platform?: string;
  tags?: string[];
}

export function isSampleContact(c: SampleMarked): boolean {
  return (
    c.platform === SAMPLE_PLATFORM &&
    Array.isArray(c.tags) &&
    c.tags.includes(SAMPLE_TAG)
  );
}

/** Keep only real contacts. Pure, so it can be unit tested. */
export function withoutSamples<T extends SampleMarked>(contacts: T[]): T[] {
  return contacts.filter((c) => !isSampleContact(c));
}

export function countSamples(contacts: SampleMarked[]): number {
  return contacts.filter(isSampleContact).length;
}

export function isCleanupOfferDismissed(): boolean {
  try {
    return localStorage.getItem(OFFER_DISMISSED_KEY) === "1";
  } catch {
    return false;
  }
}

export function dismissCleanupOffer(): void {
  try {
    localStorage.setItem(OFFER_DISMISSED_KEY, "1");
  } catch {
    /* storage unavailable: the offer may show again, which is harmless */
  }
}

/**
 * Tell the app a contact was saved. Fires only for real (non-sample)
 * contacts; SampleCleanupPrompt listens for it.
 */
export function notifyContactSaved(contact: SampleMarked): void {
  if (isSampleContact(contact)) return;
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(CONTACT_SAVED_EVENT));
}
