/**
 * Contact schema versions and reversible migrations.
 *
 * v1 (before 2026-11-11): valence (positive|neutral|negative|mixed) and an
 *    attachment STYLE category (secure|anxious|avoidant|unsure).
 * v2: stage (love|like|indifferent|dislike|hate|mixed|unknown), attachment
 *    as 0-100 importance, trust/support/reciprocity, desired contact per
 *    month, contact status, overlay. See lib/relationship-model.ts.
 *
 * Every migration is reversible without loss: `up` keeps the v1 fields in
 * `_v1`, and `down` keeps the v2 fields in `_v2`, so up(down(x)) == x and
 * down(up(x)) == x. Old importance-like data (`strength`) is never converted
 * into attachment, because they measure different things.
 */
import { parseStage, type Stage } from "./relationship-model";

export const CONTACT_SCHEMA_VERSION = 2;
export const SCHEMA_KEY = "dc_schema_version";
export const PRE_MIGRATION_BACKUP_KEY = "dc_contacts_v1_backup";

type Raw = Record<string, unknown>;

const V2_FIELDS = [
  "stage",
  "attachmentScore",
  "trust",
  "support",
  "reciprocity",
  "desiredContactPerMonth",
  "contactStatus",
  "overlay",
] as const;

const VALENCE_TO_STAGE: Record<string, Stage> = {
  positive: "like",
  neutral: "indifferent",
  negative: "dislike",
  mixed: "mixed",
};

export function contactSchemaVersion(c: Raw): number {
  return typeof c.schemaVersion === "number" ? c.schemaVersion : 1;
}

export function migrateContactUp(c: Raw): Raw {
  if (contactSchemaVersion(c) >= 2) return c;
  const out: Raw = { ...c };
  const v1: Raw = {};
  for (const k of ["valence", "attachment"]) {
    if (out[k] !== undefined) v1[k] = out[k];
    delete out[k];
  }
  if (Object.keys(v1).length) out._v1 = v1;
  const saved = (c._v2 ?? undefined) as Raw | undefined;
  if (saved && typeof saved === "object") {
    Object.assign(out, saved); // lossless re-upgrade after a downgrade
    delete out._v2;
  }
  if (
    out.stage === undefined &&
    typeof v1.valence === "string" &&
    VALENCE_TO_STAGE[v1.valence]
  ) {
    out.stage = VALENCE_TO_STAGE[v1.valence];
  }
  if (out.stage !== undefined && !parseStage(out.stage)) delete out.stage;
  out.schemaVersion = 2;
  return out;
}

export function migrateContactDown(c: Raw): Raw {
  if (contactSchemaVersion(c) < 2) return c;
  const out: Raw = { ...c };
  const v2: Raw = {};
  const v1 = (c._v1 ?? undefined) as Raw | undefined;
  // A stage that `up` derived from the v1 valence is not v2-only data.
  const derivedStage =
    v1 && typeof v1.valence === "string"
      ? VALENCE_TO_STAGE[v1.valence]
      : undefined;
  for (const k of V2_FIELDS) {
    const derived = k === "stage" && out[k] === derivedStage;
    if (out[k] !== undefined && !derived) v2[k] = out[k];
    delete out[k];
  }
  if (Object.keys(v2).length) out._v2 = v2;
  if (v1 && typeof v1 === "object") Object.assign(out, v1);
  delete out._v1;
  delete out.schemaVersion;
  return out;
}

export const migrateContactsUp = (list: Raw[]) => list.map(migrateContactUp);
export const migrateContactsDown = (list: Raw[]) =>
  list.map(migrateContactDown);

/**
 * Upgrade the browser store in place. Keeps a one-time copy of the original
 * v1 data (`dc_contacts_v1_backup`) and records the store version.
 * Migrations are not user changes, so they are not written to history.
 */
export function ensureLocalSchema(key = "yakw_contacts"): void {
  if (typeof localStorage === "undefined") return;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) {
      localStorage.setItem(SCHEMA_KEY, String(CONTACT_SCHEMA_VERSION));
      return;
    }
    const list = JSON.parse(raw);
    if (!Array.isArray(list)) return;
    if (list.every((c: Raw) => contactSchemaVersion(c) >= 2)) {
      localStorage.setItem(SCHEMA_KEY, String(CONTACT_SCHEMA_VERSION));
      return;
    }
    if (!localStorage.getItem(PRE_MIGRATION_BACKUP_KEY)) {
      localStorage.setItem(PRE_MIGRATION_BACKUP_KEY, raw);
    }
    localStorage.setItem(key, JSON.stringify(migrateContactsUp(list)));
    localStorage.setItem(SCHEMA_KEY, String(CONTACT_SCHEMA_VERSION));
  } catch (e) {
    console.warn("Contact schema migration skipped:", e);
  }
}

/** Reverse the store to v1 (support tool; data is kept in `_v2`). */
export function downgradeLocalSchema(key = "yakw_contacts"): void {
  const raw = localStorage.getItem(key);
  if (!raw) return;
  const list = JSON.parse(raw);
  if (!Array.isArray(list)) return;
  localStorage.setItem(key, JSON.stringify(migrateContactsDown(list)));
  localStorage.setItem(SCHEMA_KEY, "1");
}
