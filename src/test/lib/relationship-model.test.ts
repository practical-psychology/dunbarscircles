import { describe, it, expect, beforeEach } from "vitest";
import {
  attachmentContactMismatch,
  cleanProfile,
  contactRhythm,
  countsInCircles,
  dataCompleteness,
  overlayMembers,
  overlaySuggestions,
  MISMATCH_MIN_PEOPLE,
  type Interaction,
} from "../../../lib/relationship-model";
import {
  migrateContactDown,
  migrateContactUp,
  ensureLocalSchema,
  PRE_MIGRATION_BACKUP_KEY,
} from "../../../lib/schema-migrations";
import {
  addInteraction,
  diffContacts,
  readHistory,
  readInteractions,
  recordContactChanges,
  withChangeSource,
  HISTORY_KEY,
  INTERACTIONS_KEY,
} from "../../../lib/relationship-log";
import {
  getCloudConsent,
  hasCloudConsent,
  setCloudConsent,
} from "../../../lib/cloud-consent";
import { sanitizeParams } from "../../../lib/analytics";

const NOW = new Date("2026-06-30T00:00:00Z");
const int = (
  person_id: string,
  date: string,
  type: Interaction["type"],
): Interaction => ({
  interaction_id: `${person_id}-${date}-${type}-${Math.random()}`,
  person_id,
  date,
  type,
});

describe("relationship model: separate measurements", () => {
  it("validates and clamps fields without inferring any", () => {
    expect(
      cleanProfile({
        stage: "hate",
        attachmentScore: 120,
        trust: -5,
        support: "50",
        desiredContactPerMonth: -1,
        contactStatus: "nope",
        overlay: "yes",
      }),
    ).toEqual({ stage: "hate", attachmentScore: 100, trust: 0, support: 50 });
    // Valence never fills in attachment, and vice versa.
    expect(cleanProfile({ stage: "dislike" }).attachmentScore).toBeUndefined();
    expect(cleanProfile({ attachmentScore: 95 }).stage).toBeUndefined();
  });

  it("counts voluntary contact separately from obligatory and conflict", () => {
    const xs = [
      int("a", "2026-06-01", "voluntary"),
      int("a", "2026-06-02", "obligatory"),
      int("a", "2026-06-03", "obligatory"),
      int("a", "2026-06-04", "conflict"),
      int("a", "2026-01-01", "voluntary"), // outside 90 days
    ];
    const r = contactRhythm("a", xs, undefined, NOW);
    expect(r.total).toBe(4);
    expect(r.voluntaryPerMonth).toBeCloseTo(0.3, 1);
    expect(r.obligatoryPerMonth).toBeCloseTo(0.7, 1);
    expect(r.conflictPerMonth).toBeCloseTo(0.3, 1);
    // No desired rate: no judgement at all.
    expect(r.status).toBe("unknown");
  });

  it("compares only voluntary contact with the user's own wish", () => {
    const lots = Array.from({ length: 9 }, (_, i) =>
      int("a", `2026-06-${String(i + 1).padStart(2, "0")}`, "obligatory"),
    );
    // Lots of obligatory contact does not satisfy a wish for voluntary contact.
    expect(contactRhythm("a", lots, 2, NOW).status).toBe("below-desired");
    const vol = Array.from({ length: 6 }, (_, i) =>
      int("a", `2026-06-${String(i + 1).padStart(2, "0")}`, "voluntary"),
    );
    expect(contactRhythm("a", vol, 2, NOW).status).toBe("on-track");
  });

  it("excludes excluded, no-contact and overlay people from circle counts", () => {
    expect(countsInCircles({})).toBe(true);
    expect(countsInCircles({ contactStatus: "excluded" })).toBe(false);
    expect(countsInCircles({ contactStatus: "no-contact" })).toBe(false);
    expect(countsInCircles({ overlay: true })).toBe(false);
  });

  it("never places anyone on the overlay automatically; only suggests", () => {
    const people = [
      { id: "1", stage: "hate" as const, attachmentScore: 90 },
      { id: "2", stage: "like" as const, attachmentScore: 90 },
      { id: "3", stage: "dislike" as const, attachmentScore: 20 },
      { id: "4", stage: "mixed" as const, attachmentScore: 70, overlay: true },
    ];
    expect(overlayMembers(people).map((p) => p.id)).toEqual(["4"]);
    expect(overlaySuggestions(people).map((p) => p.id)).toEqual(["1"]);
  });
});

describe("insights: completeness first, no mismatch on tiny or invariant data", () => {
  const people = (n: number, score: (i: number) => number) =>
    Array.from({ length: n }, (_, i) => ({
      id: `p${i}`,
      attachmentScore: score(i),
    }));
  const contactsFor = (n: number, perPerson: (i: number) => number) =>
    Array.from({ length: n }).flatMap((_, i) =>
      Array.from({ length: perPerson(i) }, (_, k) =>
        int(`p${i}`, `2026-06-${String(k + 1).padStart(2, "0")}`, "voluntary"),
      ),
    );

  it("reports completeness per measurement", () => {
    const c = dataCompleteness(
      [
        { id: "a", stage: "like", attachmentScore: 50 },
        { id: "b", stage: "unknown" },
      ],
      [int("a", "2026-06-01", "voluntary")],
    );
    expect(c).toMatchObject({
      people: 2,
      stage: 0.5, // "unknown" does not count as set
      attachment: 0.5,
      quality: 0,
      desired: 0,
      interactions: 0.5,
    });
  });

  it("refuses with too few people", () => {
    const n = MISMATCH_MIN_PEOPLE - 1;
    const r = attachmentContactMismatch(
      people(n, (i) => i * 10),
      contactsFor(n, (i) => i + 1),
      NOW,
    );
    expect(r.available).toBe(false);
  });

  it("refuses when importance or contact does not vary", () => {
    const n = MISMATCH_MIN_PEOPLE + 2;
    expect(
      attachmentContactMismatch(
        people(n, () => 50),
        contactsFor(n, (i) => i + 1),
        NOW,
      ).available,
    ).toBe(false);
    expect(
      attachmentContactMismatch(
        people(n, (i) => i * 10),
        contactsFor(n, () => 2),
        NOW,
      ).available,
    ).toBe(false);
  });

  it("flags a large standardized gap when data is sufficient and varied", () => {
    const n = 10;
    // Importance rises with i, contact rises with i, except p9: very
    // important but almost no voluntary contact.
    const r = attachmentContactMismatch(
      people(n, (i) => 10 + i * 9),
      contactsFor(n, (i) => (i === 9 ? 1 : i + 1)),
      NOW,
    );
    expect(r.available).toBe(true);
    if (!r.available) return;
    expect(r.items[0].id).toBe("p9");
    expect(r.items[0].z).toBeGreaterThan(1.5);
  });
});

describe("schema migration v1 <-> v2", () => {
  beforeEach(() => localStorage.clear());

  it("is reversible without loss in both directions", () => {
    const v1 = {
      id: "a",
      name: "A",
      valence: "negative",
      attachment: "anxious",
      strength: 0.8,
    };
    const up = migrateContactUp(v1);
    expect(up).toMatchObject({
      stage: "dislike",
      schemaVersion: 2,
      strength: 0.8,
    });
    expect(up).not.toHaveProperty("attachmentScore"); // strength is not converted
    expect(migrateContactDown(up)).toEqual(v1);

    const v2 = {
      id: "b",
      name: "B",
      schemaVersion: 2,
      stage: "love",
      attachmentScore: 70,
      overlay: true,
    };
    expect(migrateContactUp(migrateContactDown(v2))).toEqual(v2);

    // v1 contact edited after upgrade (derived stage + new v2 data)
    const edited = { ...up, attachmentScore: 40 };
    expect(migrateContactUp(migrateContactDown(edited))).toEqual(edited);
  });

  it("upgrades the browser store once and keeps a copy of the v1 data", () => {
    const raw = JSON.stringify([{ id: "a", name: "A", valence: "positive" }]);
    localStorage.setItem("yakw_contacts", raw);
    ensureLocalSchema();
    expect(JSON.parse(localStorage.getItem("yakw_contacts")!)[0]).toMatchObject(
      {
        stage: "like",
        schemaVersion: 2,
      },
    );
    expect(localStorage.getItem(PRE_MIGRATION_BACKUP_KEY)).toBe(raw);
  });
});

describe("change history and interactions", () => {
  beforeEach(() => localStorage.clear());

  it("diffs only tracked fields and marks creation and deletion", () => {
    const d = diffContacts(
      [
        { id: "a", name: "A", stage: "like", syncStatus: "x" },
        { id: "b", name: "B" },
      ],
      [
        { id: "a", name: "A", stage: "hate", syncStatus: "y" },
        { id: "c", name: "C" },
      ],
    );
    const byId = Object.fromEntries(
      d.map((x) => [x.person_id, x.changed_fields]),
    );
    expect(byId.a).toEqual({ stage: { from: "like", to: "hate" } });
    expect(byId.b).toEqual({ _deleted: { from: false, to: true } });
    expect(byId.c._created).toBeDefined();
  });

  it("is append-only and records the source", async () => {
    recordContactChanges([], [{ id: "a", name: "A" }]);
    await withChangeSource("import", async () => {
      recordContactChanges([{ id: "a", name: "A" }], [{ id: "a", name: "A2" }]);
    });
    recordContactChanges([{ id: "a", name: "A2" }], [{ id: "a", name: "A2" }]); // no change
    const h = readHistory();
    expect(h).toHaveLength(2);
    expect(h.map((x) => x.source)).toEqual(["user-entry", "import"]);
    expect(localStorage.getItem(HISTORY_KEY)).toContain("A2");
  });

  it("validates logged interactions", () => {
    addInteraction({
      person_id: "a",
      date: "2026-06-01",
      type: "conflict",
      duration_minutes: 5000,
    });
    addInteraction({
      person_id: "a",
      date: "not a date",
      type: "bogus" as never,
    });
    const xs = readInteractions();
    expect(xs[0]).toMatchObject({ type: "conflict", duration_minutes: 1440 });
    expect(xs[1].type).toBe("unclassified");
    expect(xs[1].date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(JSON.parse(localStorage.getItem(INTERACTIONS_KEY)!)).toHaveLength(2);
  });
});

describe("privacy: consent and analytics", () => {
  beforeEach(() => localStorage.clear());

  it("records an explicit, per-account cloud choice with a timestamp", () => {
    expect(hasCloudConsent("u1")).toBe(false);
    setCloudConsent("u1", "granted");
    expect(hasCloudConsent("u1")).toBe(true);
    expect(hasCloudConsent("u2")).toBe(false);
    expect(getCloudConsent("u1")).toMatchObject({
      uid: "u1",
      choice: "granted",
      textVersion: 1,
    });
    setCloudConsent("u1", "declined");
    expect(hasCloudConsent("u1")).toBe(false);
  });

  it("never sends names or free text in analytics parameters", () => {
    expect(sanitizeParams({ cta: "map_my_circles", format: "csv" })).toEqual({
      cta: "map_my_circles",
      format: "csv",
    });
    expect(
      sanitizeParams({ cta: "Ada Lovelace", name: "Ada", format: "json" }),
    ).toEqual({
      format: "json",
    });
    expect(sanitizeParams({ person: "x" })).toBeUndefined();
  });
});

describe("visual insights (items 101-103)", () => {
  beforeEach(() => localStorage.clear());

  it("builds the circle x feeling matrix from circle members only", async () => {
    const { layerFeelingMatrix } = await import(
      "../../../lib/relationship-model"
    );
    const m = layerFeelingMatrix(
      [
        { levelId: "inner", stage: "love" },
        { levelId: "inner" },
        { levelId: "outer", stage: "hate" },
        { levelId: "outer", stage: "hate", contactStatus: "excluded" },
        { levelId: "outer", stage: "hate", overlay: true },
      ],
      ["inner", "outer"],
    );
    expect(m.inner.love).toBe(1);
    expect(m.inner.unset).toBe(1);
    expect(m.outer.hate).toBe(1);
  });

  it("plots only people with importance and logged interactions", async () => {
    const { scatterPoints } = await import("../../../lib/relationship-model");
    const pts = scatterPoints(
      [
        { id: "a", attachmentScore: 80, stage: "love" },
        { id: "b", attachmentScore: 20 },
        { id: "c" },
      ],
      [
        int("a", "2026-06-01", "voluntary"),
        int("c", "2026-06-01", "voluntary"),
      ],
      NOW,
    );
    expect(pts).toEqual([
      { id: "a", importance: 80, voluntaryPerMonth: 0.3, stage: "love" },
    ]);
  });

  it("prompts only on meaningful changes, and dismissal keys are stable", async () => {
    const { trendPrompts } = await import("../../../lib/relationship-model");
    const { dismissPrompt, readDismissedPrompts } = await import(
      "../../../lib/relationship-log"
    );
    const h = (
      person_id: string,
      ts: string,
      f: Record<string, [unknown, unknown]>,
    ) => ({
      change_id: `${person_id}${ts}`,
      person_id,
      timestamp: ts,
      source: "user-entry" as const,
      changed_fields: Object.fromEntries(
        Object.entries(f).map(([k, [from, to]]) => [k, { from, to }]),
      ),
    });
    const people = [
      { id: "a", name: "Ann" },
      { id: "b", name: "Bob" },
      { id: "c", name: "Cy", desiredContactPerMonth: 4 },
      { id: "d", name: "Di" },
    ];
    const history = [
      // like -> indifferent -> hate: net positive -> negative
      h("a", "2026-06-01T00:00:00Z", { stage: ["like", "indifferent"] }),
      h("a", "2026-06-10T00:00:00Z", { stage: ["indifferent", "hate"] }),
      // small importance wobble: no prompt
      h("b", "2026-06-05T00:00:00Z", { attachmentScore: [50, 60] }),
      // big importance change + circle move
      h("d", "2026-06-05T00:00:00Z", {
        attachmentScore: [90, 40],
        levelId: ["inner", "outer"],
      }),
      // outside the 90-day window
      h("b", "2025-01-01T00:00:00Z", { stage: ["love", "hate"] }),
    ];
    const interactions = [int("c", "2026-06-01", "obligatory")];
    const ps = trendPrompts(people, history, interactions, NOW);
    expect(ps.map((p) => `${p.personId}:${p.kind}`).sort()).toEqual([
      "a:feeling",
      "c:below-desired",
      "d:circle",
      "d:importance",
    ]);
    expect(
      trendPrompts(people, history, interactions, NOW).map((p) => p.key),
    ).toEqual(ps.map((p) => p.key));
    dismissPrompt(ps[0].key);
    expect(readDismissedPrompts().has(ps[0].key)).toBe(true);
  });
});
