/**
 * Versioned JSON backup: export, validate, preview and de-duplicate.
 *
 * Pure functions only (no DOM, no storage) so a wipe-and-restore round trip
 * can be unit tested. See docs/ops/BACKUP_RESTORE.md.
 */

export const BACKUP_APP = "dunbarscircles";
export const BACKUP_SCHEMA_VERSION = 1;

export interface BackupContact {
  name: string;
  levelId: string;
  platform: string;
  email?: string;
  phone?: string;
  notes?: string;
  tags?: string[];
  contactFrequency: number;
  strength: number;
}

export interface BackupFile {
  app: typeof BACKUP_APP;
  schemaVersion: number;
  exportedAt: string;
  contacts: BackupContact[];
}

export interface ImportPreview {
  /** New contacts that will be added. */
  toAdd: BackupContact[];
  /** Contacts already present (same name + level), skipped. */
  duplicates: BackupContact[];
  /** Entries that could not be read, with a reason. */
  invalid: { index: number; reason: string }[];
}

export type ParseResult =
  | { ok: true; file: BackupFile }
  | { ok: false; error: string };

const MAX_IMPORT_BYTES = 5 * 1024 * 1024;

/** Case- and space-insensitive identity used to detect duplicates. */
export function contactKey(c: { name: string; levelId?: string }): string {
  return `${c.name.trim().replace(/\s+/g, " ").toLowerCase()}|${c.levelId ?? ""}`;
}

function str(v: unknown): string | undefined {
  return typeof v === "string" && v.trim() ? v.trim() : undefined;
}

function num(v: unknown, fallback: number, min: number, max: number): number {
  const n = typeof v === "number" && Number.isFinite(v) ? v : fallback;
  return Math.min(max, Math.max(min, n));
}

/** Normalise one raw entry, or explain why it is unusable. */
export function normalizeContact(
  raw: unknown,
  validLevelIds: readonly string[],
): { contact: BackupContact } | { error: string } {
  if (!raw || typeof raw !== "object") return { error: "not an object" };
  const r = raw as Record<string, unknown>;
  const name = str(r.name);
  if (!name) return { error: "missing name" };
  const levelId = str(r.levelId);
  if (!levelId || !validLevelIds.includes(levelId)) {
    return { error: `unknown level "${levelId ?? ""}"` };
  }
  return {
    contact: {
      name: name.slice(0, 100),
      levelId,
      platform: str(r.platform) ?? "manual",
      email: str(r.email),
      phone: str(r.phone),
      notes: str(r.notes)?.slice(0, 500),
      tags: Array.isArray(r.tags)
        ? r.tags
            .filter((t): t is string => typeof t === "string")
            .map((t) => t.slice(0, 30)).slice(0, 10)
        : undefined,
      contactFrequency: num(r.contactFrequency, 90, 1, 3650),
      strength: num(r.strength, 0.3, 0, 1),
    },
  };
}

/** Build the backup document from the app's current contacts. */
export function buildBackup(
  contacts: ReadonlyArray<Record<string, any>>,
  now: Date = new Date(),
): BackupFile {
  return {
    app: BACKUP_APP,
    schemaVersion: BACKUP_SCHEMA_VERSION,
    exportedAt: now.toISOString(),
    contacts: contacts.map((c) => ({
      name: String(c.name ?? ""),
      levelId: String(c.levelId ?? ""),
      platform: String(c.platform ?? "manual"),
      email: c.email || undefined,
      phone: c.phone || undefined,
      notes: c.notes || undefined,
      tags: Array.isArray(c.tags) ? c.tags : undefined,
      contactFrequency: Number(c.contactFrequency ?? 90),
      strength: Number(c.strength ?? 0.3),
    })),
  };
}

/** Parse and structurally validate backup text. Never throws. */
export function parseBackup(text: string): ParseResult {
  if (text.length > MAX_IMPORT_BYTES) {
    return { ok: false, error: "File is larger than 5 MB." };
  }
  let data: unknown;
  try {
    data = JSON.parse(text);
  } catch {
    return { ok: false, error: "This file is not valid JSON." };
  }
  if (!data || typeof data !== "object") {
    return { ok: false, error: "This file is not a Dunbar's Circles backup." };
  }
  const d = data as Record<string, unknown>;
  if (d.app !== BACKUP_APP) {
    return { ok: false, error: "This file is not a Dunbar's Circles backup." };
  }
  if (
    typeof d.schemaVersion !== "number" ||
    d.schemaVersion > BACKUP_SCHEMA_VERSION
  ) {
    return {
      ok: false,
      error:
        "This backup was made by a newer version of the app. Update and try again.",
    };
  }
  if (!Array.isArray(d.contacts)) {
    return { ok: false, error: "The backup has no contacts list." };
  }
  return {
    ok: true,
    file: {
      app: BACKUP_APP,
      schemaVersion: d.schemaVersion,
      exportedAt: typeof d.exportedAt === "string" ? d.exportedAt : "",
      contacts: d.contacts as BackupContact[],
    },
  };
}

/**
 * Compare a parsed backup with what is already stored. Also removes
 * duplicates inside the file itself.
 */
export function previewImport(
  file: BackupFile,
  existing: ReadonlyArray<{ name: string; levelId?: string }>,
  validLevelIds: readonly string[],
): ImportPreview {
  const seen = new Set(existing.map(contactKey));
  const preview: ImportPreview = { toAdd: [], duplicates: [], invalid: [] };
  file.contacts.forEach((raw, index) => {
    const result = normalizeContact(raw, validLevelIds);
    if ("error" in result) {
      preview.invalid.push({ index: index + 1, reason: result.error });
      return;
    }
    const key = contactKey(result.contact);
    if (seen.has(key)) {
      preview.duplicates.push(result.contact);
    } else {
      seen.add(key);
      preview.toAdd.push(result.contact);
    }
  });
  return preview;
}
