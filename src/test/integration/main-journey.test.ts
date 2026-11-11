/**
 * Functional regression test for the main journey (#74, #50):
 * add a contact -> import a backup -> export -> wipe -> restore,
 * plus the sample-data cleanup (#48).
 *
 * Runs against the real storage services and backup functions, with only
 * Firebase mocked (src/test/setup.ts), so it exercises the same code paths
 * the Contacts page and BackupPanel use.
 */
import { describe, it, expect, beforeEach } from "vitest";
import { ContactStorageService } from "../../../lib/contact-storage-service";
import { EnhancedContactStorage } from "../../../lib/contact-storage-enhanced";
import {
  buildBackup,
  parseBackup,
  previewImport,
  contactKey,
} from "../../../lib/backup";
import { SAMPLE_CONTACTS } from "../../../lib/sample-contacts";
import {
  isSampleContact,
  countSamples,
  withoutSamples,
} from "../../../lib/sample-data";
import { dunbarLevels } from "../../data/dunbarLevels";

const LEVEL_IDS = dunbarLevels.map((l) => l.id);
const service = () => ContactStorageService.getInstance();

async function all() {
  const r = await service().readContacts();
  expect(r.success).toBe(true);
  return r.data ?? [];
}

async function wipe() {
  for (const c of await all()) await service().deleteContact(c.id);
  localStorage.removeItem("yakw_contacts");
  sessionStorage.removeItem("yakw_contacts");
}

/** Mirrors BackupPanel: parse, preview, add only new contacts. */
async function restore(text: string) {
  const parsed = parseBackup(text);
  if (!parsed.ok) throw new Error(parsed.error);
  const preview = previewImport(parsed.file, await all(), LEVEL_IDS);
  for (const c of preview.toAdd) {
    const r = await service().createContact(c);
    expect(r.success).toBe(true);
  }
  return preview;
}

const signature = (list: Array<Record<string, any>>) =>
  list
    .map((c) => ({
      key: contactKey(c as { name: string; levelId: string }),
      platform: c.platform,
      notes: c.notes ?? undefined,
      tags: c.tags ?? undefined,
      contactFrequency: c.contactFrequency,
      strength: c.strength,
    }))
    .sort((a, b) => a.key.localeCompare(b.key));

describe("main journey: add, import, export, wipe, restore", () => {
  beforeEach(async () => {
    await wipe();
  });

  it("round-trips every contact through export, wipe and restore", async () => {
    // 1. Add a contact by hand
    const added = await service().createContact({
      name: "Ada Lovelace",
      levelId: "inner-circle",
      platform: "manual",
      notes: "Weekly call",
      contactFrequency: 7,
      strength: 0.9,
    });
    expect(added.success).toBe(true);

    // 2. Import a backup that contains one duplicate and one new person
    const incoming = JSON.stringify({
      app: "dunbarscircles",
      schemaVersion: 1,
      exportedAt: "2026-11-01T00:00:00.000Z",
      contacts: [
        { name: "ada  lovelace", levelId: "inner-circle", platform: "manual" },
        {
          name: "Grace Hopper",
          levelId: "active-network",
          platform: "linkedin",
          tags: ["work"],
          contactFrequency: 90,
          strength: 0.4,
        },
        { name: "Nobody", levelId: "not-a-level" },
      ],
    });
    const firstImport = await restore(incoming);
    expect(firstImport.toAdd.map((c) => c.name)).toEqual(["Grace Hopper"]);
    expect(firstImport.duplicates).toHaveLength(1);
    expect(firstImport.invalid).toHaveLength(1);
    const before = await all();
    expect(before).toHaveLength(2);

    // 3. Export
    const exported = JSON.stringify(buildBackup(before));

    // 4. Wipe
    await wipe();
    expect(await all()).toHaveLength(0);
    // The dashboard shows built-in demo people (ids "sample_*") when the
    // store is empty; no real contact may survive the wipe.
    const dashAfterWipe = (await EnhancedContactStorage.loadContacts()).data;
    expect(
      (dashAfterWipe ?? []).filter((c) => !c.id.startsWith("sample_")),
    ).toEqual([]);

    // 5. Restore: same people, same fields
    const restored = await restore(exported);
    expect(restored.toAdd).toHaveLength(2);
    expect(restored.duplicates).toHaveLength(0);
    const after = await all();
    expect(signature(after)).toEqual(signature(before));

    // 6. Restoring the same file again adds nothing (de-duplication)
    const again = await restore(exported);
    expect(again.toAdd).toHaveLength(0);
    expect(await all()).toHaveLength(2);
  });

  it("dashboard storage sees contacts written by the contacts page", async () => {
    await service().createContact({
      name: "Shared Store",
      levelId: "affinity-group",
      platform: "manual",
      contactFrequency: 30,
      strength: 0.5,
    });
    const dash = await EnhancedContactStorage.loadContacts();
    expect(dash.data?.map((c) => c.name)).toContain("Shared Store");
  });
});

describe("sample data cleanup (#48)", () => {
  beforeEach(async () => {
    await wipe();
  });

  it("marks every sample contact and removes only those", async () => {
    expect(SAMPLE_CONTACTS).toHaveLength(10);
    expect(SAMPLE_CONTACTS.every(isSampleContact)).toBe(true);

    for (const c of SAMPLE_CONTACTS) await service().createContact(c);
    await service().createContact({
      name: "Real Person",
      levelId: "inner-circle",
      platform: "manual",
      tags: ["sample"], // a real tag must not make it a sample
      contactFrequency: 7,
      strength: 0.8,
    });

    const stored = await all();
    expect(countSamples(stored)).toBe(10);

    const sampleIds = stored.filter(isSampleContact).map((c) => c.id);
    const r = await service().deleteContacts(sampleIds);
    expect(r.data?.deleted).toBe(10);

    const left = await all();
    expect(left.map((c) => c.name)).toEqual(["Real Person"]);
    expect(withoutSamples(left)).toHaveLength(1);
  });
});

describe("change history through the real storage service", () => {
  beforeEach(async () => {
    await wipe();
    localStorage.removeItem("dc_history");
  });

  it("records creation, edits and deletion additively, with the source", async () => {
    const { readHistory, withChangeSource } = await import(
      "../../../lib/relationship-log"
    );
    const created = await service().createContact({
      name: "Hist Person",
      levelId: "inner-circle",
      platform: "manual",
      contactFrequency: 7,
      strength: 0.5,
      stage: "like",
    });
    const id = created.data!.id;
    await service().updateContact(id, {
      id,
      stage: "hate",
      attachmentScore: 80,
    });
    await withChangeSource("import", () =>
      service().updateContact(id, { id, trust: 20 }),
    );
    await service().deleteContact(id);

    const mine = readHistory().filter((h) => h.person_id === id);
    expect(mine.map((h) => Object.keys(h.changed_fields))).toEqual([
      expect.arrayContaining(["_created", "name", "stage"]),
      expect.arrayContaining(["stage", "attachmentScore"]),
      ["trust"],
      ["_deleted"],
    ]);
    expect(mine.map((h) => h.source)).toEqual([
      "user-entry",
      "user-entry",
      "import",
      "user-entry",
    ]);
    expect(mine[1].changed_fields.stage).toEqual({ from: "like", to: "hate" });

    // Stored contacts are always written at schema v2
    await service().createContact({
      name: "V2",
      levelId: "inner-circle",
      platform: "manual",
      contactFrequency: 7,
      strength: 0.5,
    });
    const stored = JSON.parse(localStorage.getItem("yakw_contacts")!);
    expect(
      stored.every((c: { schemaVersion?: number }) => c.schemaVersion === 2),
    ).toBe(true);
  });
});
