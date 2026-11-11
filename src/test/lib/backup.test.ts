import { describe, it, expect } from "vitest";
import {
  buildBackup,
  parseBackup,
  previewImport,
  BACKUP_SCHEMA_VERSION,
} from "../../../lib/backup";

const LEVELS = ["inner-circle", "sympathy-group", "active-network"];

const stored = [
  {
    id: "1",
    name: "Ada Lovelace",
    levelId: "inner-circle",
    platform: "manual",
    email: "ada@example.com",
    contactFrequency: 7,
    strength: 0.9,
    lastContact: new Date(),
  },
  {
    id: "2",
    name: "Grace Hopper",
    levelId: "active-network",
    platform: "linkedin",
    contactFrequency: 90,
    strength: 0.4,
    tags: ["work"],
  },
];

describe("backup", () => {
  it("writes a schema version and app marker", () => {
    const file = buildBackup(stored, new Date("2026-01-01T00:00:00Z"));
    expect(file.app).toBe("dunbarscircles");
    expect(file.schemaVersion).toBe(BACKUP_SCHEMA_VERSION);
    expect(file.exportedAt).toBe("2026-01-01T00:00:00.000Z");
  });

  it("round trips: wipe and restore gives back the same contacts", () => {
    const text = JSON.stringify(buildBackup(stored));
    const parsed = parseBackup(text);
    expect(parsed.ok).toBe(true);
    if (!parsed.ok) return;
    // Wiped store is empty, so everything is new
    const preview = previewImport(parsed.file, [], LEVELS);
    expect(preview.duplicates).toHaveLength(0);
    expect(preview.invalid).toHaveLength(0);
    expect(preview.toAdd.map((c) => c.name)).toEqual([
      "Ada Lovelace",
      "Grace Hopper",
    ]);
    expect(preview.toAdd[0]).toMatchObject({
      levelId: "inner-circle",
      email: "ada@example.com",
      contactFrequency: 7,
      strength: 0.9,
    });
  });

  it("skips duplicates already stored (case and spacing insensitive)", () => {
    const parsed = parseBackup(JSON.stringify(buildBackup(stored)));
    if (!parsed.ok) throw new Error("parse failed");
    const preview = previewImport(
      parsed.file,
      [{ name: "  ada   LOVELACE ", levelId: "inner-circle" }],
      LEVELS,
    );
    expect(preview.duplicates).toHaveLength(1);
    expect(preview.toAdd).toHaveLength(1);
  });

  it("de-duplicates repeats inside the file", () => {
    const file = buildBackup([stored[0], stored[0]]);
    const preview = previewImport(file, [], LEVELS);
    expect(preview.toAdd).toHaveLength(1);
    expect(preview.duplicates).toHaveLength(1);
  });

  it("reports invalid entries without failing the whole import", () => {
    const file = {
      ...buildBackup(stored),
      contacts: [
        { name: "", levelId: "inner-circle" },
        { name: "X", levelId: "nope" },
        ...buildBackup(stored).contacts,
      ],
    };
    const preview = previewImport(file as any, [], LEVELS);
    expect(preview.invalid).toHaveLength(2);
    expect(preview.toAdd).toHaveLength(2);
  });

  it("rejects bad input with a readable error", () => {
    expect(parseBackup("not json")).toMatchObject({ ok: false });
    expect(parseBackup('{"foo":1}')).toMatchObject({ ok: false });
    expect(
      parseBackup('{"app":"dunbarscircles","schemaVersion":99,"contacts":[]}'),
    ).toMatchObject({ ok: false });
    expect(
      parseBackup('{"app":"dunbarscircles","schemaVersion":1}'),
    ).toMatchObject({ ok: false });
  });
});

describe("relationship model (schema v2)", () => {
  it("migrates a v1 file: valence becomes stage, attachment style is kept in _v1", () => {
    const v1 = JSON.stringify({
      app: "dunbarscircles",
      schemaVersion: 1,
      exportedAt: "",
      contacts: [
        {
          name: "Ann",
          levelId: "inner-circle",
          valence: "negative",
          attachment: "anxious",
        },
        { name: "Bob", levelId: "inner-circle", valence: "bogus" },
      ],
    });
    const parsed = parseBackup(v1);
    expect(parsed.ok).toBe(true);
    if (!parsed.ok) return;
    const preview = previewImport(parsed.file, [], LEVELS);
    expect(preview.toAdd[0].stage).toBe("dislike");
    expect(preview.toAdd[0].attachmentScore).toBeUndefined(); // never inferred
    expect(preview.toAdd[0]._v1).toEqual({
      valence: "negative",
      attachment: "anxious",
    });
    expect(preview.toAdd[1].stage).toBeUndefined();
  });

  it("round-trips v2 fields, interactions and history, dropping invalid values", () => {
    const file = buildBackup(
      [
        {
          id: "p1",
          name: "Ann",
          levelId: "inner-circle",
          stage: "hate",
          attachmentScore: 90,
          trust: 10,
          support: 140, // clamped
          desiredContactPerMonth: 2,
          contactStatus: "no-contact",
          overlay: true,
        },
        { id: "p2", name: "Bob", levelId: "inner-circle", stage: "bogus" },
      ],
      new Date("2026-01-01T00:00:00Z"),
      {
        interactions: [
          {
            interaction_id: "i1",
            person_id: "p1",
            date: "2026-01-01",
            type: "conflict",
          },
          {
            interaction_id: "i2",
            person_id: "gone",
            date: "2026-01-01",
            type: "voluntary",
          },
        ],
        history: [
          {
            change_id: "c1",
            person_id: "p1",
            timestamp: "2026-01-01T00:00:00Z",
            changed_fields: { stage: { from: "like", to: "hate" } },
            source: "user-entry",
          },
        ],
      },
    );
    expect(file.schemaVersion).toBe(2);
    const parsed = parseBackup(JSON.stringify(file));
    expect(parsed.ok).toBe(true);
    if (!parsed.ok) return;
    const [ann, bob] = previewImport(parsed.file, [], LEVELS).toAdd;
    expect(ann).toMatchObject({
      id: "p1",
      stage: "hate",
      attachmentScore: 90,
      trust: 10,
      support: 100,
      desiredContactPerMonth: 2,
      contactStatus: "no-contact",
      overlay: true,
    });
    expect(bob.stage).toBeUndefined();
    // Only logs for exported people
    expect(parsed.file.interactions?.map((i) => i.interaction_id)).toEqual([
      "i1",
    ]);
    expect(parsed.file.history?.map((h) => h.change_id)).toEqual(["c1"]);
  });
});
