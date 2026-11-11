/**
 * Firestore core for contact backup: pure helpers plus the pull/merge/push
 * algorithm. No browser or app imports, so the emulator tests in
 * tests/firestore/ can run it against the real security rules.
 */
import {
  collection,
  doc,
  getDocs,
  query,
  where,
  writeBatch,
  serverTimestamp,
  type Firestore,
  type DocumentData,
} from "firebase/firestore";

/** The single Firestore collection for contacts. */
export const CONTACTS_COLLECTION = "user_contacts";
/** Retired collection; read once per sign-in for migration, then emptied. */
export const LEGACY_CONTACTS_COLLECTION = "contacts";

export type RawContact = Record<string, unknown> & { id: string };

/** Local-only fields that never go to the cloud. */
const LOCAL_ONLY_FIELDS = [
  "firestoreId",
  "syncStatus",
  "lastSyncAt",
  "x",
  "y",
  "vx",
  "vy",
  "fx",
  "fy",
  "index",
] as const;
/** Fields the cloud adds that never go into the browser store. */
const CLOUD_ONLY_FIELDS = ["userId", "syncedAt"] as const;
const BATCH_LIMIT = 400;

// ---------------------------------------------------------------------------
// Pure helpers (unit tested in src/test/lib/cloud-sync.test.ts; emulator-tested in tests/firestore)
// ---------------------------------------------------------------------------

/** Firestore document id for a contact. Stable across devices and saves. */
export function cloudDocId(uid: string, contactId: string): string {
  return `${uid}_${String(contactId).replace(/\//g, "_")}`;
}

/** Built-in demo people shown on an empty dashboard; never stored or synced. */
export function isBuiltInDemo(c: { id?: unknown }): boolean {
  return String(c.id ?? "").startsWith("sample_");
}

function toIso(v: unknown): unknown {
  if (v instanceof Date) return v.toISOString();
  // Firestore Timestamp (legacy documents) or anything with toDate().
  if (
    v &&
    typeof v === "object" &&
    typeof (v as { toDate?: unknown }).toDate === "function"
  ) {
    return (v as { toDate: () => Date }).toDate().toISOString();
  }
  return v;
}

/** Browser-store object -> Firestore document data. */
export function toCloud(
  contact: Record<string, unknown>,
  uid: string,
): DocumentData {
  const out: DocumentData = {};
  for (const [k, v] of Object.entries(contact)) {
    if ((LOCAL_ONLY_FIELDS as readonly string[]).includes(k)) continue;
    if (v === undefined || typeof v === "function") continue;
    out[k] = v instanceof Date ? v.toISOString() : v;
  }
  out.userId = uid;
  return out;
}

/**
 * Firestore document -> browser-store object. Accepts both the current
 * format (ISO date strings) and legacy documents (Firestore Timestamps).
 */
export function fromCloud(docId: string, data: DocumentData): RawContact {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(data)) {
    if ((CLOUD_ONLY_FIELDS as readonly string[]).includes(k)) continue;
    out[k] = toIso(v);
  }
  if (!out.id) out.id = docId;
  return out as RawContact;
}

function updatedMs(c: Record<string, unknown>): number {
  for (const k of ["updatedAt", "importDate", "createdAt"]) {
    const t = Date.parse(String(c[k] ?? ""));
    if (!Number.isNaN(t)) return t;
  }
  return 0;
}

/**
 * Merge cloud contacts into local ones by contact id. The newer `updatedAt`
 * wins; on a tie the local copy wins. Duplicates within `cloud` (possible in
 * the legacy collection) collapse to the newest.
 */
export function mergeContacts(
  local: RawContact[],
  cloud: RawContact[],
): RawContact[] {
  const byId = new Map<string, RawContact>();
  for (const c of cloud) {
    if (isBuiltInDemo(c)) continue;
    const prev = byId.get(c.id);
    if (!prev || updatedMs(c) > updatedMs(prev)) byId.set(c.id, c);
  }
  for (const c of local) {
    if (isBuiltInDemo(c)) continue;
    const remote = byId.get(c.id);
    if (!remote || updatedMs(c) >= updatedMs(remote)) {
      byId.set(c.id, c);
    }
  }
  // Keep local order first, then contacts that exist only in the cloud.
  const localIds = new Set(local.map((c) => c.id));
  return [
    ...local.filter((c) => byId.has(c.id)).map((c) => byId.get(c.id)!),
    ...[...byId.values()].filter((c) => !localIds.has(c.id)),
  ];
}

// ---------------------------------------------------------------------------
// Firestore I/O
// ---------------------------------------------------------------------------

export async function fetchCollection(
  firestore: Firestore,
  name: string,
  uid: string,
): Promise<{ id: string; data: DocumentData }[]> {
  const snap = await getDocs(
    query(collection(firestore, name), where("userId", "==", uid)),
  );
  return snap.docs.map((d) => ({ id: d.id, data: d.data() }));
}

type Op =
  | { kind: "set"; col: string; id: string; data: DocumentData }
  | { kind: "delete"; col: string; id: string };

async function commitOps(firestore: Firestore, ops: Op[]): Promise<void> {
  for (let i = 0; i < ops.length; i += BATCH_LIMIT) {
    const batch = writeBatch(firestore);
    for (const op of ops.slice(i, i + BATCH_LIMIT)) {
      const ref = doc(firestore, op.col, op.id);
      if (op.kind === "set") batch.set(ref, op.data);
      else batch.delete(ref);
    }
    await batch.commit();
  }
}

/** Make the cloud mirror equal to `contacts` for this user. */
export async function mirror(
  firestore: Firestore,
  uid: string,
  contacts: RawContact[],
  existingIds: string[],
  legacyIds: string[],
): Promise<{ upserted: number; deleted: number }> {
  const wanted = new Set<string>();
  const ops: Op[] = [];
  for (const c of contacts) {
    if (isBuiltInDemo(c)) continue;
    const id = cloudDocId(uid, c.id);
    wanted.add(id);
    ops.push({
      kind: "set",
      col: CONTACTS_COLLECTION,
      id,
      data: { ...toCloud(c, uid), syncedAt: serverTimestamp() },
    });
  }
  let deleted = 0;
  for (const id of existingIds) {
    if (!wanted.has(id)) {
      ops.push({ kind: "delete", col: CONTACTS_COLLECTION, id });
      deleted++;
    }
  }
  for (const id of legacyIds) {
    ops.push({ kind: "delete", col: LEGACY_CONTACTS_COLLECTION, id });
  }
  await commitOps(firestore, ops);
  return { upserted: wanted.size, deleted };
}

export interface SyncResult {
  merged: RawContact[];
  upserted: number;
  deleted: number;
  migrated: number;
}

/**
 * Sign-in sync: pull the user's cloud copy and any legacy documents, merge
 * with `local`, make the cloud equal to the merged set, delete legacy docs.
 * Returns the merged list for the caller to store locally.
 */
export async function syncUser(
  firestore: Firestore,
  uid: string,
  local: RawContact[],
  /** Upgrade cloud records to the app schema before merging. */
  normalize: (list: RawContact[]) => RawContact[] = (l) => l,
): Promise<SyncResult> {
  const current = await fetchCollection(firestore, CONTACTS_COLLECTION, uid);
  let legacy: { id: string; data: DocumentData }[] = [];
  try {
    legacy = await fetchCollection(firestore, LEGACY_CONTACTS_COLLECTION, uid);
  } catch {
    legacy = []; // retired collection unreadable: nothing to migrate
  }
  const cloud = normalize([
    ...legacy.map((d) => fromCloud(d.id, d.data)),
    ...current.map((d) => fromCloud(d.id, d.data)),
  ]);
  const merged = mergeContacts(local, cloud);
  const { upserted, deleted } = await mirror(
    firestore,
    uid,
    merged,
    current.map((d) => d.id),
    legacy.map((d) => d.id),
  );
  return { merged, upserted, deleted, migrated: legacy.length };
}

/** Make the cloud copy equal to `local` (after the first sync). */
export async function pushUser(
  firestore: Firestore,
  uid: string,
  local: RawContact[],
): Promise<{ upserted: number; deleted: number }> {
  const existing = await fetchCollection(firestore, CONTACTS_COLLECTION, uid);
  return mirror(
    firestore,
    uid,
    local,
    existing.map((d) => d.id),
    [],
  );
}
