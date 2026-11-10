/**
 * Consent-gated, privacy-first analytics (WEB-032, WEB-033).
 *
 * - Nothing is loaded or sent until the visitor explicitly accepts.
 * - "Do Not Track" and Global Privacy Control are honoured.
 * - Event names are a closed set so the event dictionary in docs/ANALYTICS.md
 *   stays the single source of truth.
 */

export type AnalyticsEvent =
  | "cta_click"
  | "start_tour"
  | "add_contact"
  | "import_contacts"
  | "export_data"
  | "sign_in"
  | "view_evidence"
  | "first_map"
  | "share_click";

export type ConsentState = "granted" | "denied" | "unset";

const CONSENT_KEY = "dc.analytics.consent";
export const OPEN_CONSENT_EVENT = "dc:open-consent";

let analyticsInstance: import("firebase/analytics").Analytics | null = null;
let initPromise: Promise<void> | null = null;

export function getConsent(): ConsentState {
  try {
    const v = localStorage.getItem(CONSENT_KEY);
    return v === "granted" || v === "denied" ? v : "unset";
  } catch {
    return "unset";
  }
}

function browserForbidsTracking(): boolean {
  if (typeof navigator === "undefined") return true;
  const nav = navigator as Navigator & { globalPrivacyControl?: boolean };
  return nav.doNotTrack === "1" || nav.globalPrivacyControl === true;
}

export function setConsent(value: "granted" | "denied"): void {
  try {
    localStorage.setItem(CONSENT_KEY, value);
  } catch {
    /* storage unavailable: consent simply does not persist */
  }
  if (value === "granted") void initAnalytics();
  else analyticsInstance = null;
}

export function initAnalytics(): Promise<void> {
  if (initPromise) return initPromise;
  if (getConsent() !== "granted" || browserForbidsTracking()) {
    return Promise.resolve();
  }
  // Firebase is imported only after consent, so it never loads on first
  // paint for visitors who have not opted in (#76).
  initPromise = Promise.all([
    import("../firebase-config"),
    import("firebase/analytics"),
  ])
    .then(([{ app, firebaseConfig }, { getAnalytics }]) => {
      if (!app || !firebaseConfig.measurementId) return;
      analyticsInstance = getAnalytics(app);
    })
    .catch(() => {
      analyticsInstance = null;
    });
  return initPromise;
}

/** Append UTM parameters to a link we control (see docs/ANALYTICS.md). */
export function withUtm(
  url: string,
  p: { source: string; medium: string; campaign: string; content?: string },
): string {
  const u = new URL(url);
  u.searchParams.set("utm_source", p.source);
  u.searchParams.set("utm_medium", p.medium);
  u.searchParams.set("utm_campaign", p.campaign);
  if (p.content) u.searchParams.set("utm_content", p.content);
  return u.toString();
}

export function trackEvent(
  name: AnalyticsEvent,
  params?: Record<string, string | number | boolean>,
): void {
  if (!analyticsInstance) return;
  void import("firebase/analytics").then(({ logEvent }) => {
    if (analyticsInstance) logEvent(analyticsInstance, name, params);
  });
}
