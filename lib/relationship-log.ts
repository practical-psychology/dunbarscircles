/**
 * Browser-only stores for interactions and the additive change history.
 * Firebase-free; both are included in JSON export (schema v2) and are not
 * uploaded by cloud backup.
 *
 * History is append-only: entries are never edited or removed, except by
 * the user's explicit "Clear all", which wipes everything.
 */
import {
  parseInitiator,
  parseInteractionType,
  type ChangeRecord,
  type ChangeSource,
  type Interaction,
  type InteractionType,
  type Initiator,
} from "./relationship-model";
import { CONTACTS_CHANGED_EVENT } from "./contact-events";

export const INTERACTIONS_KEY = "dc_interactions";
export const HISTORY_KEY = "dc_history";
export const CONTACTS_KEY = "yakw_contacts";

/** Fields whose changes are recorded (T). Noise such as sync state is not. */
export const TRACKED_FIELDS = [
  "name",
  "levelId",
  "stage",
  "attachmentScore",
  "trust",
  "support",
  "reciprocity",
  "desiredContactPerMonth",
  "contactStatus",
  "overlay",
  "notes",
] as const;

const newId = (prefix: string) =>
  `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;

function readArray<T>(key: string): T[] {
  try {
    const raw = localStorage.getItem(key);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeArray(key: string, value: unknown[]): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.warn(`Could not save ${key}:`, e);
  }
}

// ------------------------------------------------------------ change source

let currentSource: ChangeSource = "user-entry";

/** Run `fn` with history entries attributed to `source` (e.g. imports). */
export async function withChangeSource<T>(
  source: ChangeSource,
  fn: () => Promise<T> | T,
): Promise<T> {
  const prev = currentSource;
  currentSource = source;
  try {
    return await fn();
  } finally {
    currentSource = prev;
  }
}

// ----------------------------------------------------------------- history

type RawContact = Record<string, unknown> & { id?: unknown };

// Empty text counts as "not set", so blank fields are not logged as changes.
const norm = (v: unknown) => (v === "" || v === undefined ? null : v);
const same = (a: unknown, b: unknown) =>
  JSON.stringify(norm(a)) === JSON.stringify(norm(b));

/** Pure diff of two contact lists -> change records (no ids/timestamps). */
export function diffContacts(
  before: readonly RawContact[],
  after: readonly RawContact[],
): { person_id: string; changed_fields: ChangeRecord["changed_fields"] }[] {
  const prev = new Map(before.map((c) => [String(c.id), c]));
  const next = new Map(after.map((c) => [String(c.id), c]));
  const out: {
    person_id: string;
    changed_fields: ChangeRecord["changed_fields"];
  }[] = [];
  for (const [id, c] of next) {
    if (id.startsWith("sample_")) continue;
    const old = prev.get(id);
    const changed: ChangeRecord["changed_fields"] = {};
    for (const f of TRACKED_FIELDS) {
      const from = old ? old[f] : undefined;
      const to = c[f];
      if (!same(from, to) && !(old === undefined && to === undefined)) {
        changed[f] = { from: from ?? null, to: to ?? null };
      }
    }
    if (!old) changed._created = { from: null, to: true };
    if (Object.keys(changed).length > 0)
      out.push({ person_id: id, changed_fields: changed });
  }
  for (const [id] of prev) {
    if (!next.has(id) && !id.startsWith("sample_")) {
      out.push({
        person_id: id,
        changed_fields: { _deleted: { from: false, to: true } },
      });
    }
  }
  return out;
}

export function readHistory(): ChangeRecord[] {
  return readArray<ChangeRecord>(HISTORY_KEY);
}

function appendHistory(records: ChangeRecord[]): void {
  if (records.length === 0) return;
  writeArray(HISTORY_KEY, [...readHistory(), ...records]);
}

/** Read the current contact store as raw objects. */
export function readRawContacts(): RawContact[] {
  try {
    const raw =
      localStorage.getItem(CONTACTS_KEY) ??
      sessionStorage.getItem(CONTACTS_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/**
 * Record what changed between the stored list and `next`. Call right before
 * writing `next` to the contact store. Additive only.
 */
export function recordContactChanges(
  before: readonly RawContact[],
  next: readonly RawContact[],
  source: ChangeSource = currentSource,
  now: Date = new Date(),
): void {
  const ts = now.toISOString();
  appendHistory(
    diffContacts(before, next).map((d) => ({
      change_id: newId("chg"),
      person_id: d.person_id,
      timestamp: ts,
      changed_fields: d.changed_fields,
      source,
    })),
  );
}

export function historyFor(personId: string): ChangeRecord[] {
  return readHistory().filter((h) => h.person_id === personId);
}

/** Add imported history records (backup restore). Skips known change_ids. */
export function importHistory(records: ChangeRecord[]): number {
  const known = new Set(readHistory().map((h) => h.change_id));
  const fresh = records.filter((r) => r.change_id && !known.has(r.change_id));
  appendHistory(fresh);
  return fresh.length;
}

// ------------------------------------------------------------ interactions

export function readInteractions(): Interaction[] {
  return readArray<Interaction>(INTERACTIONS_KEY);
}

export function interactionsFor(personId: string): Interaction[] {
  return readInteractions()
    .filter((i) => i.person_id === personId)
    .sort((a, b) => b.date.localeCompare(a.date));
}

function notify() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent(CONTACTS_CHANGED_EVENT, { detail: "interactions" }),
    );
  }
}

export function addInteraction(input: {
  person_id: string;
  date: string;
  type: InteractionType;
  duration_minutes?: number;
  initiated_by?: Initiator;
}): Interaction {
  const date = /^\d{4}-\d{2}-\d{2}$/.test(input.date)
    ? input.date
    : new Date().toISOString().slice(0, 10);
  const item: Interaction = {
    interaction_id: newId("int"),
    person_id: input.person_id,
    date,
    type: parseInteractionType(input.type),
  };
  if (
    input.duration_minutes !== undefined &&
    Number.isFinite(input.duration_minutes) &&
    input.duration_minutes >= 0
  ) {
    item.duration_minutes = Math.round(
      Math.min(input.duration_minutes, 24 * 60),
    );
  }
  const by = parseInitiator(input.initiated_by);
  if (by) item.initiated_by = by;
  writeArray(INTERACTIONS_KEY, [...readInteractions(), item]);
  notify();
  return item;
}

export function deleteInteraction(interactionId: string): void {
  writeArray(
    INTERACTIONS_KEY,
    readInteractions().filter((i) => i.interaction_id !== interactionId),
  );
  notify();
}

/** Restore interactions from a backup. Skips known interaction_ids. */
export function importInteractions(items: Interaction[]): number {
  const known = new Set(readInteractions().map((i) => i.interaction_id));
  const fresh = items.filter(
    (i) => i.interaction_id && !known.has(i.interaction_id),
  );
  writeArray(INTERACTIONS_KEY, [...readInteractions(), ...fresh]);
  if (fresh.length) notify();
  return fresh.length;
}

/** Used only by "Clear all": wipes interactions and history too. */
export function clearRelationshipLogs(): void {
  try {
    localStorage.removeItem(INTERACTIONS_KEY);
    localStorage.removeItem(HISTORY_KEY);
  } catch {
    /* ignore */
  }
}
