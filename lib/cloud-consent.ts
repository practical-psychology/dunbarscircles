/**
 * Explicit, recorded choice before any cloud sync (Firebase-free).
 *
 * Signing in alone never uploads anything. The user must choose "Turn on
 * cloud backup"; the choice is stored per account in this browser with a
 * timestamp, and can be withdrawn at any time.
 */
export const CLOUD_CONSENT_KEY = "dc.cloud-backup-consent";
export const CLOUD_CONSENT_CHANGED_EVENT = "dc:cloud-consent-changed";
/** Ask the app to show the consent dialog (detail: { uid }). */
export const CLOUD_CONSENT_REQUEST_EVENT = "dc:cloud-consent-request";

export type CloudChoice = "granted" | "declined";

export interface CloudConsentRecord {
  uid: string;
  choice: CloudChoice;
  /** ISO timestamp of the choice */
  at: string;
  /** Version of the consent text the user saw */
  textVersion: number;
}

export const CONSENT_TEXT_VERSION = 1;

function readAll(): CloudConsentRecord[] {
  try {
    const raw = localStorage.getItem(CLOUD_CONSENT_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function getCloudConsent(
  uid: string | null | undefined,
): CloudConsentRecord | null {
  if (!uid) return null;
  return readAll().find((r) => r.uid === uid) ?? null;
}

export function hasCloudConsent(uid: string | null | undefined): boolean {
  return getCloudConsent(uid)?.choice === "granted";
}

export function setCloudConsent(uid: string, choice: CloudChoice): void {
  const record: CloudConsentRecord = {
    uid,
    choice,
    at: new Date().toISOString(),
    textVersion: CONSENT_TEXT_VERSION,
  };
  try {
    localStorage.setItem(
      CLOUD_CONSENT_KEY,
      JSON.stringify([...readAll().filter((r) => r.uid !== uid), record]),
    );
  } catch {
    /* storage unavailable: no consent is stored, so nothing syncs */
  }
  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent(CLOUD_CONSENT_CHANGED_EVENT, { detail: record }),
    );
  }
}

export function requestCloudConsent(uid: string): void {
  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent(CLOUD_CONSENT_REQUEST_EVENT, { detail: { uid } }),
    );
  }
}
