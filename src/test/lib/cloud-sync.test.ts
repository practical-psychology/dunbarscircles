import { describe, it, expect } from "vitest";
import {
  cloudDocId,
  toCloud,
  fromCloud,
  mergeContacts,
  isBuiltInDemo,
} from "../../../lib/cloud-sync-core";

const c = (id: string, extra: Record<string, unknown> = {}) => ({
  id,
  name: id,
  levelId: "inner-circle",
  ...extra,
});

describe("cloud-sync core", () => {
  it("builds deterministic, slash-free document ids", () => {
    expect(cloudDocId("u1", "contact_1")).toBe("u1_contact_1");
    expect(cloudDocId("u1", "a/b")).toBe("u1_a_b");
  });

  it("strips local-only fields and stamps the owner", () => {
    const out = toCloud(
      c("x", {
        firestoreId: "f",
        syncStatus: "pending",
        x: 1,
        note: undefined,
      }),
      "u1",
    );
    expect(out).toEqual({
      id: "x",
      name: "x",
      levelId: "inner-circle",
      userId: "u1",
    });
  });

  it("reads legacy Timestamp-like values as ISO strings and drops cloud fields", () => {
    const ts = { toDate: () => new Date("2026-02-03T04:05:06Z") };
    const out = fromCloud("doc1", {
      ...c("x"),
      lastContact: ts,
      userId: "u1",
      syncedAt: ts,
    });
    expect(out.lastContact).toBe("2026-02-03T04:05:06.000Z");
    expect(out).not.toHaveProperty("userId");
    expect(out).not.toHaveProperty("syncedAt");
  });

  it("falls back to the document id when a legacy doc has no id field", () => {
    expect(fromCloud("doc9", { name: "n" }).id).toBe("doc9");
  });

  it("merges by id: newer updatedAt wins, local wins ties, demo people dropped", () => {
    const local = [
      c("a", { name: "local-a", updatedAt: "2026-01-02T00:00:00Z" }),
      c("b", { name: "local-b", updatedAt: "2026-01-01T00:00:00Z" }),
      c("t", { name: "local-t", updatedAt: "2026-01-01T00:00:00Z" }),
      c("sample_1"),
    ];
    const cloud = [
      c("a", { name: "cloud-a", updatedAt: "2026-01-01T00:00:00Z" }),
      c("b", { name: "cloud-b", updatedAt: "2026-02-01T00:00:00Z" }),
      c("t", { name: "cloud-t", updatedAt: "2026-01-01T00:00:00Z" }),
      c("n", { name: "cloud-only" }),
    ];
    const merged = mergeContacts(local, cloud);
    expect(merged.map((m) => [m.id, m.name])).toEqual([
      ["a", "local-a"],
      ["b", "cloud-b"],
      ["t", "local-t"],
      ["n", "cloud-only"],
    ]);
    expect(merged.some(isBuiltInDemo)).toBe(false);
  });
});
