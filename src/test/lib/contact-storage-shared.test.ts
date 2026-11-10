import { describe, it, expect, beforeEach } from "vitest";
import { EnhancedContactStorage } from "../../../lib/contact-storage-enhanced";

const mk = (i: number) => ({
  id: `contact_${i}`,
  name: `Person ${i}`,
  levelId: "active-network",
  platform: "LinkedIn",
  lastContact: new Date().toISOString(),
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  contactFrequency: 90,
  strength: 0.3,
  decayRate: 0.1,
});

describe("dashboard storage reads the same store as import", () => {
  beforeEach(() => localStorage.clear());

  it("shows all 42 contacts written by the import service, not sample data", async () => {
    localStorage.setItem(
      "yakw_contacts",
      JSON.stringify(Array.from({ length: 42 }, (_, i) => mk(i))),
    );
    const r = await EnhancedContactStorage.loadContacts();
    expect(r.data).toHaveLength(42);
    expect(r.fallbackUsed).toBeFalsy();
    expect(r.data!.every((c) => c.source === "linkedin")).toBe(true);
  });

  it("add and delete keep the shared store consistent", async () => {
    localStorage.setItem(
      "yakw_contacts",
      JSON.stringify(Array.from({ length: 5 }, (_, i) => mk(i))),
    );
    const loaded = (await EnhancedContactStorage.loadContacts()).data!;
    await EnhancedContactStorage.saveContacts([
      ...loaded,
      { ...loaded[0], id: "contact_new" },
    ]);
    expect(JSON.parse(localStorage.getItem("yakw_contacts")!)).toHaveLength(6);
    await EnhancedContactStorage.deleteContact("contact_new");
    expect(JSON.parse(localStorage.getItem("yakw_contacts")!)).toHaveLength(5);
  });
});
