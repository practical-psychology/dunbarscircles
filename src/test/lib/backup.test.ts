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
      contacts: [{ name: "", levelId: "inner-circle" }, { name: "X", levelId: "nope" }, ...buildBackup(stored).contacts],
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
