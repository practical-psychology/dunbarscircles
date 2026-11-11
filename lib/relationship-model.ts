/**
 * Emotional-relationship model (spec: docs/RELATIONSHIP_MODEL.md).
 *
 *   R_i = (D_i, V_i, A_i, F_i, Q_i, T_i)
 *   D  assigned cumulative social layer       -> contact.levelId (user-assigned)
 *   V  emotional direction (stage)            -> contact.stage
 *   A  personal importance, 0-100             -> contact.attachmentScore
 *   F  frequency / motivation                 -> interactions by type + desiredContactPerMonth
 *   Q  trust, support, reciprocity (separate) -> contact.trust / .support / .reciprocity
 *   T  observed change                        -> change history
 *
 * None of these measurements alone predicts closeness or relationship
 * quality, so nothing here derives one from another: valence never changes
 * attachment, frequency never changes attachment or layer, and no function
 * assigns a layer.
 *
 * Pure functions only; unit tested in src/test/lib/relationship-model.test.ts.
 */

export const STAGES = [
  "love",
  "like",
  "indifferent",
  "dislike",
  "hate",
  "mixed",
  "unknown",
] as const;
export type Stage = (typeof STAGES)[number];

export const STAGE_LABELS: Record<Stage, string> = {
  love: "Love",
  like: "Like",
  indifferent: "Indifferent",
  dislike: "Dislike",
  hate: "Hate",
  mixed: "Mixed feelings",
  unknown: "Not sure",
};

/** Whether the person counts in the circle counts and map. */
export const CONTACT_STATUSES = ["active", "excluded", "no-contact"] as const;
export type ContactStatus = (typeof CONTACT_STATUSES)[number];

export const CONTACT_STATUS_LABELS: Record<ContactStatus, string> = {
  active: "In my circles",
  excluded: "Excluded from my circles",
  "no-contact": "No contact (my choice)",
};

export const INTERACTION_TYPES = [
  "voluntary",
  "obligatory",
  "conflict",
  "unclassified",
] as const;
export type InteractionType = (typeof INTERACTION_TYPES)[number];

export const INTERACTION_TYPE_LABELS: Record<InteractionType, string> = {
  voluntary: "Voluntary (we chose to)",
  obligatory: "Obligatory (work, family duty, logistics)",
  conflict: "Conflict-driven",
  unclassified: "Not classified",
};

export const INITIATORS = ["me", "them", "both", "unknown"] as const;
export type Initiator = (typeof INITIATORS)[number];

export const CHANGE_SOURCES = ["user-entry", "import"] as const;
export type ChangeSource = (typeof CHANGE_SOURCES)[number];

/** Relationship fields stored on a contact (all optional; never inferred). */
export interface RelationshipProfile {
  stage?: Stage;
  /** A: personal importance, 0-100. Independent of stage and frequency. */
  attachmentScore?: number;
  trust?: number;
  support?: number;
  reciprocity?: number;
  desiredContactPerMonth?: number;
  contactStatus?: ContactStatus;
  /**
   * Show this person on the "important but difficult" overlay instead of
   * placing them in a circle. Never set automatically.
   */
  overlay?: boolean;
}

export interface Interaction {
  interaction_id: string;
  person_id: string;
  /** ISO date, YYYY-MM-DD */
  date: string;
  type: InteractionType;
  duration_minutes?: number;
  initiated_by?: Initiator;
}

export interface ChangeRecord {
  change_id: string;
  person_id: string;
  timestamp: string;
  changed_fields: Record<string, { from: unknown; to: unknown }>;
  source: ChangeSource;
}

// ---------------------------------------------------------------- parsing

const isOneOf = <T extends string>(list: readonly T[], v: unknown): v is T =>
  typeof v === "string" && (list as readonly string[]).includes(v);

export const parseStage = (v: unknown): Stage | undefined =>
  isOneOf(STAGES, v) ? v : undefined;
export const parseStatus = (v: unknown): ContactStatus | undefined =>
  isOneOf(CONTACT_STATUSES, v) ? v : undefined;
export const parseInteractionType = (v: unknown): InteractionType =>
  isOneOf(INTERACTION_TYPES, v) ? v : "unclassified";
export const parseInitiator = (v: unknown): Initiator | undefined =>
  isOneOf(INITIATORS, v) ? v : undefined;

/** 0-100 integer, or undefined when not rated. */
export function parseScore(v: unknown): number | undefined {
  if (v === "" || v === null || v === undefined) return undefined;
  const n = typeof v === "number" ? v : Number(v);
  if (!Number.isFinite(n)) return undefined;
  return Math.round(Math.min(100, Math.max(0, n)));
}

export function parsePerMonth(v: unknown): number | undefined {
  if (v === "" || v === null || v === undefined) return undefined;
  const n = typeof v === "number" ? v : Number(v);
  if (!Number.isFinite(n) || n < 0) return undefined;
  return Math.min(1000, Math.round(n * 10) / 10);
}

/** Keep only valid relationship fields; drop empty ones. */
export function cleanProfile(
  raw: Record<string, unknown>,
): RelationshipProfile {
  const p: RelationshipProfile = {
    stage: parseStage(raw.stage),
    attachmentScore: parseScore(raw.attachmentScore),
    trust: parseScore(raw.trust),
    support: parseScore(raw.support),
    reciprocity: parseScore(raw.reciprocity),
    desiredContactPerMonth: parsePerMonth(raw.desiredContactPerMonth),
    contactStatus: parseStatus(raw.contactStatus),
    overlay: raw.overlay === true ? true : undefined,
  };
  for (const k of Object.keys(p) as (keyof RelationshipProfile)[]) {
    if (p[k] === undefined) delete p[k];
  }
  return p;
}

// ------------------------------------------------------- circle membership

/** Counted in circle sizes and the map. Excluded / no-contact people are not. */
export function countsInCircles(c: RelationshipProfile): boolean {
  return (c.contactStatus ?? "active") === "active" && c.overlay !== true;
}

/**
 * The "important but difficult" overlay: only people the user explicitly
 * put there. Suggestions are listed separately and never applied.
 */
export function overlayMembers<T extends RelationshipProfile>(list: T[]): T[] {
  return list.filter((c) => c.overlay === true);
}

/** Candidates the user MAY choose to move to the overlay (never automatic). */
export function overlaySuggestions<T extends RelationshipProfile>(
  list: T[],
): T[] {
  return list.filter(
    (c) =>
      !c.overlay &&
      (c.stage === "dislike" || c.stage === "hate" || c.stage === "mixed") &&
      (c.attachmentScore ?? 0) >= 60,
  );
}

// ------------------------------------------------------------- F: rhythm

const DAY = 24 * 60 * 60 * 1000;

export interface ContactRhythm {
  /** Interactions per type in the window, per month. */
  voluntaryPerMonth: number;
  obligatoryPerMonth: number;
  conflictPerMonth: number;
  unclassifiedPerMonth: number;
  total: number;
  desiredPerMonth?: number;
  /**
   * Comparison of VOLUNTARY contact with the user's own wish. No target or
   * no logged interactions -> "unknown". Never a judgement of attachment.
   */
  status: "unknown" | "below-desired" | "on-track" | "above-desired";
}

export function contactRhythm(
  personId: string,
  interactions: readonly Interaction[],
  desiredPerMonth: number | undefined,
  now: Date = new Date(),
  windowDays = 90,
): ContactRhythm {
  const since = now.getTime() - windowDays * DAY;
  const mine = interactions.filter(
    (i) => i.person_id === personId && Date.parse(i.date) >= since,
  );
  const months = windowDays / 30;
  const per = (t: InteractionType) =>
    Math.round((mine.filter((i) => i.type === t).length / months) * 10) / 10;
  const voluntaryPerMonth = per("voluntary");
  let status: ContactRhythm["status"] = "unknown";
  if (desiredPerMonth !== undefined && mine.length > 0) {
    if (voluntaryPerMonth < desiredPerMonth * 0.75) status = "below-desired";
    else if (voluntaryPerMonth > desiredPerMonth * 1.5)
      status = "above-desired";
    else status = "on-track";
  }
  return {
    voluntaryPerMonth,
    obligatoryPerMonth: per("obligatory"),
    conflictPerMonth: per("conflict"),
    unclassifiedPerMonth: per("unclassified"),
    total: mine.length,
    desiredPerMonth,
    status,
  };
}

// ------------------------------------------------------------- T: change

export interface ObservedChange {
  changes: number;
  lastChange?: string;
  fields: string[];
}

export function observedChange(
  personId: string,
  history: readonly ChangeRecord[],
  now: Date = new Date(),
  windowDays = 90,
): ObservedChange {
  const since = now.getTime() - windowDays * DAY;
  const mine = history.filter(
    (h) => h.person_id === personId && Date.parse(h.timestamp) >= since,
  );
  const fields = new Set<string>();
  for (const h of mine)
    Object.keys(h.changed_fields).forEach((f) => fields.add(f));
  return {
    changes: mine.length,
    lastChange: mine
      .map((h) => h.timestamp)
      .sort()
      .slice(-1)[0],
    fields: [...fields],
  };
}

// --------------------------------------------------- completeness + insight

export interface Completeness {
  people: number;
  /** Share 0-1 of people with each measurement. */
  stage: number;
  attachment: number;
  quality: number;
  desired: number;
  interactions: number;
}

export function dataCompleteness(
  people: ReadonlyArray<{ id: string } & RelationshipProfile>,
  interactions: readonly Interaction[],
): Completeness {
  const n = people.length;
  const share = (pred: (p: (typeof people)[number]) => boolean) =>
    n === 0 ? 0 : people.filter(pred).length / n;
  const withInteractions = new Set(interactions.map((i) => i.person_id));
  return {
    people: n,
    stage: share((p) => p.stage !== undefined && p.stage !== "unknown"),
    attachment: share((p) => p.attachmentScore !== undefined),
    quality: share(
      (p) =>
        p.trust !== undefined ||
        p.support !== undefined ||
        p.reciprocity !== undefined,
    ),
    desired: share((p) => p.desiredContactPerMonth !== undefined),
    interactions: share((p) => withInteractions.has(p.id)),
  };
}

/** Minimum people with both measures before any standardized comparison. */
export const MISMATCH_MIN_PEOPLE = 8;

export type MismatchResult =
  | { available: false; reason: string; eligible: number }
  | {
      available: true;
      eligible: number;
      /** z(attachment) - z(voluntary contact). Only |z| >= threshold listed. */
      items: { id: string; z: number }[];
    };

function meanSd(xs: number[]): { mean: number; sd: number } {
  const mean = xs.reduce((a, b) => a + b, 0) / xs.length;
  const variance =
    xs.reduce((a, b) => a + (b - mean) ** 2, 0) / Math.max(1, xs.length - 1);
  return { mean, sd: Math.sqrt(variance) };
}

/**
 * Standardized mismatch between personal importance (A) and voluntary
 * contact (F). Refuses to compute for tiny or invariant data.
 */
export function attachmentContactMismatch(
  people: ReadonlyArray<{ id: string } & RelationshipProfile>,
  interactions: readonly Interaction[],
  now: Date = new Date(),
  threshold = 1.5,
): MismatchResult {
  const rows = people
    .filter(
      (p) =>
        p.attachmentScore !== undefined &&
        interactions.some((i) => i.person_id === p.id),
    )
    .map((p) => ({
      id: p.id,
      a: p.attachmentScore as number,
      f: contactRhythm(p.id, interactions, undefined, now).voluntaryPerMonth,
    }));
  const eligible = rows.length;
  if (eligible < MISMATCH_MIN_PEOPLE) {
    return {
      available: false,
      eligible,
      reason: `Needs at least ${MISMATCH_MIN_PEOPLE} people with an importance rating and logged interactions (you have ${eligible}).`,
    };
  }
  const A = meanSd(rows.map((r) => r.a));
  const F = meanSd(rows.map((r) => r.f));
  // Tolerance: identical decimals give a floating-point SD near 1e-16.
  const INVARIANT = 1e-9;
  if (A.sd < INVARIANT || F.sd < INVARIANT) {
    return {
      available: false,
      eligible,
      reason:
        A.sd < INVARIANT
          ? "All importance ratings are the same, so there is nothing to compare."
          : "Voluntary contact is the same for everyone, so there is nothing to compare.",
    };
  }
  const items = rows
    .map((r) => ({
      id: r.id,
      z:
        Math.round(((r.a - A.mean) / A.sd - (r.f - F.mean) / F.sd) * 100) / 100,
    }))
    .filter((r) => Math.abs(r.z) >= threshold)
    .sort((x, y) => Math.abs(y.z) - Math.abs(x.z));
  return { available: true, eligible, items };
}
