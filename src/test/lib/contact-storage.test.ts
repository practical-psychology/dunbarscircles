/**
 * Contact Storage Service Tests
 *
 * Tests for the contact storage and persistence layer implementation
 */

import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { ContactStorageService } from "../../../lib/contact-storage-service";
import { ContactStorageUtils } from "../../../lib/contact-storage-utils";
import type { ContactForm, ContactUpdate } from "../../../lib/contact-models";
import type { Person } from "../../../types/relationships";

// Mock Firebase
vi.mock("../../../firebase-config", () => ({
  auth: null,
  db: null,
}));

// Mock localStorage and sessionStorage
const mockStorage = () => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => {
      return store[key] || null;
    }),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
    // Add debug method to inspect store
    _getStore: () => store,
  };
};

Object.defineProperty(window, "localStorage", {
  value: mockStorage(),
});

Object.defineProperty(window, "sessionStorage", {
  value: mockStorage(),
});

// Mock online status
Object.defineProperty(navigator, "onLine", {
  writable: true,
  value: true,
});

describe("ContactStorageService", () => {
  let contactStorage: ContactStorageService;

  beforeEach(() => {
    // Clear storage before each test
    window.localStorage.clear();
    window.sessionStorage.clear();
    // Get fresh instance
    contactStorage = ContactStorageService.getInstance();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("CRUD Operations", () => {
    const sampleContactData: ContactForm = {
      name: "John Doe",
      email: "john@example.com",
      phone: "+1234567890",
      levelId: "inner-circle",
      platform: "work",
      contactFrequency: 7,
      strength: 0.8,
      notes: "Great colleague",
      tags: ["work", "friend"],
    };

    it("should create a new contact", async () => {
      const result = await contactStorage.createContact(sampleContactData);

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data?.name).toBe("John Doe");
      expect(result.data?.email).toBe("john@example.com");
      expect(result.data?.id).toBeDefined();
      expect(result.data?.createdAt).toBeInstanceOf(Date);
      expect(result.data?.updatedAt).toBeInstanceOf(Date);
    });

    it("should read all contacts", async () => {
      // Create a contact first
      await contactStorage.createContact(sampleContactData);

      const result = await contactStorage.readContacts();

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data?.length).toBe(1);
      expect(result.data?.[0].name).toBe("John Doe");
    });

    it("should read a single contact by ID", async () => {
      const createResult =
        await contactStorage.createContact(sampleContactData);
      const contactId = createResult.data?.id;

      expect(contactId).toBeDefined();

      const result = await contactStorage.readContact(contactId!);

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data?.name).toBe("John Doe");
    });

    it("should update an existing contact", async () => {
      const createResult =
        await contactStorage.createContact(sampleContactData);
      const contactId = createResult.data?.id;

      expect(contactId).toBeDefined();

      const updates: ContactUpdate = {
        id: contactId!,
        name: "John Smith",
        email: "johnsmith@example.com",
        strength: 0.9,
      };

      const result = await contactStorage.updateContact(contactId!, updates);

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data?.name).toBe("John Smith");
      expect(result.data?.email).toBe("johnsmith@example.com");
      expect(result.data?.strength).toBe(0.9);
      expect(result.data?.updatedAt).toBeInstanceOf(Date);
    });

    it("should delete a contact", async () => {
      // Create a fresh contact storage instance for this test
      const freshStorage = ContactStorageService.getInstance();

      const createResult = await freshStorage.createContact(sampleContactData);
      const contactId = createResult.data?.id;

      expect(contactId).toBeDefined();

      // Verify contact exists
      const beforeDelete = await freshStorage.readContact(contactId!);
      expect(beforeDelete.success).toBe(true);

      // Delete the contact
      const deleteResult = await freshStorage.deleteContact(contactId!);
      expect(deleteResult.success).toBe(true);
      expect(deleteResult.data?.deleted).toBe(true);

      // Verify contact is deleted by checking all contacts
      const allContactsAfter = await freshStorage.readContacts();
      expect(allContactsAfter.data?.length).toBe(0);

      // Verify contact cannot be found by ID
      const readResult = await freshStorage.readContact(contactId!);
      expect(readResult.success).toBe(false);
      expect(readResult.error).toContain("not found");
    });
  });

  describe("Search and Filtering", () => {
    beforeEach(async () => {
      // Create test contacts
      const contacts: ContactForm[] = [
        {
          name: "Alice Johnson",
          email: "alice@example.com",
          levelId: "inner-circle",
          platform: "work",
          contactFrequency: 3,
          strength: 0.9,
          tags: ["work", "manager"],
        },
        {
          name: "Bob Smith",
          email: "bob@example.com",
          levelId: "sympathy-group",
          platform: "facebook",
          contactFrequency: 14,
          strength: 0.7,
          tags: ["social", "college"],
        },
        {
          name: "Charlie Brown",
          phone: "+1987654321",
          levelId: "affinity-group",
          platform: "linkedin",
          contactFrequency: 30,
          strength: 0.5,
          tags: ["professional", "networking"],
        },
      ];

      for (const contact of contacts) {
        await contactStorage.createContact(contact);
      }
    });

    it("should search contacts by name", async () => {
      const result = await contactStorage.searchContacts("Alice");

      expect(result.success).toBe(true);
      expect(result.data?.length).toBe(1);
      expect(result.data?.[0].name).toBe("Alice Johnson");
    });

    it("should search contacts by email", async () => {
      const result = await contactStorage.searchContacts("bob@example.com");

      expect(result.success).toBe(true);
      expect(result.data?.length).toBe(1);
      expect(result.data?.[0].name).toBe("Bob Smith");
    });

    it("should filter contacts by level", async () => {
      const result = await contactStorage.readContacts({
        levelIds: ["inner-circle"],
      });

      expect(result.success).toBe(true);
      expect(result.data?.length).toBe(1);
      expect(result.data?.[0].name).toBe("Alice Johnson");
    });

    it("should filter contacts by platform", async () => {
      const result = await contactStorage.readContacts({
        platforms: ["facebook"],
      });

      expect(result.success).toBe(true);
      expect(result.data?.length).toBe(1);
      expect(result.data?.[0].name).toBe("Bob Smith");
    });

    it("should filter contacts by strength range", async () => {
      const result = await contactStorage.readContacts({
        minStrength: 0.8,
      });

      expect(result.success).toBe(true);
      expect(result.data?.length).toBe(1);
      expect(result.data?.[0].name).toBe("Alice Johnson");
    });

    it("should sort contacts by name", async () => {
      const result = await contactStorage.readContacts({
        sortBy: "name",
        sortOrder: "asc",
      });

      expect(result.success).toBe(true);
      expect(result.data?.length).toBe(3);
      expect(result.data?.[0].name).toBe("Alice Johnson");
      expect(result.data?.[1].name).toBe("Bob Smith");
      expect(result.data?.[2].name).toBe("Charlie Brown");
    });

    it("should limit and paginate results", async () => {
      const result = await contactStorage.readContacts({
        limit: 2,
        offset: 1,
        sortBy: "name",
        sortOrder: "asc",
      });

      expect(result.success).toBe(true);
      expect(result.data?.length).toBe(2);
      expect(result.data?.[0].name).toBe("Bob Smith");
      expect(result.data?.[1].name).toBe("Charlie Brown");
    });
  });

  describe("Data Migration", () => {
    it("should migrate from relationship data", async () => {
      const relationships: Person[] = [
        {
          id: "person1",
          name: "Jane Doe",
          levelId: "inner-circle",
          lastContact: new Date(),
          contactFrequency: 7,
          strength: 0.8,
          decayRate: 0.1,
          platform: "work",
          importDate: new Date(),
          source: "manual" as const,
        },
        {
          id: "person2",
          name: "Mike Johnson",
          levelId: "sympathy-group",
          lastContact: new Date(),
          contactFrequency: 14,
          strength: 0.6,
          decayRate: 0.15,
          platform: "facebook",
          importDate: new Date(),
          source: "facebook" as const,
        },
      ];

      const result =
        await contactStorage.migrateFromRelationshipData(relationships);

      expect(result.success).toBe(true);
      expect(result.data?.migrated).toBe(2);
      expect(result.data?.skipped).toBe(0);

      // Verify contacts were created
      const contacts = await contactStorage.readContacts();
      expect(contacts.data?.length).toBe(2);
    });

    it("should skip duplicate contacts during migration", async () => {
      // Create a contact first
      await contactStorage.createContact({
        name: "Jane Doe",
        levelId: "inner-circle",
        platform: "work",
        contactFrequency: 7,
        strength: 0.8,
      });

      const relationships: Person[] = [
        {
          id: "person1",
          name: "Jane Doe",
          levelId: "inner-circle",
          lastContact: new Date(),
          contactFrequency: 7,
          strength: 0.8,
          decayRate: 0.1,
          platform: "work",
          importDate: new Date(),
          source: "manual" as const,
        },
      ];

      const result =
        await contactStorage.migrateFromRelationshipData(relationships);

      expect(result.success).toBe(false); // No new contacts migrated
      expect(result.data?.migrated).toBe(0);
      expect(result.data?.skipped).toBe(1);
    });
  });

  describe("Statistics and Analytics", () => {
    beforeEach(async () => {
      const contacts: ContactForm[] = [
        {
          name: "Alice",
          levelId: "inner-circle",
          platform: "work",
          contactFrequency: 3,
          strength: 0.9,
          tags: ["work"],
        },
        {
          name: "Bob",
          levelId: "inner-circle",
          platform: "work",
          contactFrequency: 7,
          strength: 0.8,
          tags: ["work"],
        },
        {
          name: "Charlie",
          levelId: "sympathy-group",
          platform: "facebook",
          contactFrequency: 14,
          strength: 0.7,
          tags: ["social"],
        },
      ];

      for (const contact of contacts) {
        await contactStorage.createContact(contact);
      }
    });

    it("should calculate contact statistics", async () => {
      const result = await contactStorage.getContactStats();

      expect(result.success).toBe(true);
      expect(result.data?.total).toBe(3);
      expect(result.data?.byLevel["inner-circle"]).toBe(2);
      expect(result.data?.byLevel["sympathy-group"]).toBe(1);
      expect(result.data?.byPlatform["work"]).toBe(2);
      expect(result.data?.byPlatform["facebook"]).toBe(1);
      expect(result.data?.byTags["work"]).toBe(2);
      expect(result.data?.byTags["social"]).toBe(1);
      expect(result.data?.averageStrength).toBeCloseTo(0.8, 1);
    });

    it("should identify contacts needing attention", async () => {
      // Create a contact with old last contact date
      const oldContact: ContactForm = {
        name: "Old Friend",
        levelId: "sympathy-group",
        platform: "phone",
        contactFrequency: 7, // Should contact weekly
        strength: 0.6,
      };

      const createResult = await contactStorage.createContact(oldContact);
      const contactId = createResult.data?.id;

      // Update last contact to be overdue
      const oldDate = new Date();
      oldDate.setDate(oldDate.getDate() - 14); // 14 days ago, but should contact every 7 days

      await contactStorage.updateContact(contactId!, {
        id: contactId!,
        lastContact: oldDate,
      });

      const result = await contactStorage.getContactsNeedingAttention();

      expect(result.success).toBe(true);
      expect(result.data?.length).toBeGreaterThan(0);

      const overdueContact = result.data?.find((c) => c.name === "Old Friend");
      expect(overdueContact).toBeDefined();
      expect(overdueContact?.isOverdue).toBe(true);
      expect(overdueContact?.daysSinceContact).toBeGreaterThan(7);
    });
  });

  describe("Import/Export", () => {
    beforeEach(async () => {
      await contactStorage.createContact({
        name: "Test User",
        email: "test@example.com",
        levelId: "inner-circle",
        platform: "work",
        contactFrequency: 7,
        strength: 0.8,
        tags: ["test"],
      });
    });

    it("should export contacts to JSON", async () => {
      const result = await contactStorage.exportContacts("json");

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();

      const exportData = JSON.parse(result.data!);
      expect(exportData.totalContacts).toBe(1);
      expect(exportData.contacts).toHaveLength(1);
      expect(exportData.contacts[0].name).toBe("Test User");
    });

    it("should export contacts to CSV", async () => {
      const result = await contactStorage.exportContacts("csv");

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();

      const csvLines = result.data!.split("\n");
      expect(csvLines.length).toBeGreaterThan(1);
      expect(csvLines[0]).toContain("Name");
      expect(csvLines[1]).toContain("Test User");
    });

    it("should import contacts from JSON", async () => {
      const importData = {
        contacts: [
          {
            name: "Imported User",
            email: "imported@example.com",
            levelId: "sympathy-group",
            platform: "imported",
            contactFrequency: 14,
            strength: 0.6,
            tags: ["imported"],
          },
        ],
      };

      const result = await contactStorage.importContacts(
        JSON.stringify(importData),
        "json",
      );

      expect(result.success).toBe(true);
      expect(result.data?.imported).toBe(1);
      expect(result.data?.skipped).toBe(0);

      // Verify import
      const contacts = await contactStorage.readContacts();
      expect(contacts.data?.length).toBe(2); // Original + imported

      const importedContact = contacts.data?.find(
        (c) => c.name === "Imported User",
      );
      expect(importedContact).toBeDefined();
    });

    it("should import contacts from CSV", async () => {
      const csvData = `Name,Email,Level,Platform
Imported CSV User,csv@example.com,affinity-group,csv`;

      const result = await contactStorage.importContacts(csvData, "csv");

      expect(result.success).toBe(true);
      expect(result.data?.imported).toBe(1);

      // Verify import
      const contacts = await contactStorage.readContacts();
      const importedContact = contacts.data?.find(
        (c) => c.name === "Imported CSV User",
      );
      expect(importedContact).toBeDefined();
      expect(importedContact?.email).toBe("csv@example.com");
    });
  });

  describe("Batch Operations", () => {
    it("should create multiple contacts in batch", async () => {
      const contactsData: ContactForm[] = [
        {
          name: "Batch User 1",
          levelId: "inner-circle",
          platform: "work",
          contactFrequency: 7,
          strength: 0.8,
        },
        {
          name: "Batch User 2",
          levelId: "sympathy-group",
          platform: "social",
          contactFrequency: 14,
          strength: 0.6,
        },
      ];

      const result = await contactStorage.createContacts(contactsData);

      expect(result.success).toBe(true);
      expect(result.data?.length).toBe(2);
      expect(result.data?.[0].name).toBe("Batch User 1");
      expect(result.data?.[1].name).toBe("Batch User 2");
    });

    it("should delete multiple contacts in batch", async () => {
      // Create contacts first
      const contact1 = await contactStorage.createContact({
        name: "Delete Me 1",
        levelId: "inner-circle",
        platform: "work",
        contactFrequency: 7,
        strength: 0.8,
      });

      const contact2 = await contactStorage.createContact({
        name: "Delete Me 2",
        levelId: "sympathy-group",
        platform: "social",
        contactFrequency: 14,
        strength: 0.6,
      });

      const contactIds = [contact1.data!.id, contact2.data!.id];
      const result = await contactStorage.deleteContacts(contactIds);

      expect(result.success).toBe(true);
      expect(result.data?.deleted).toBe(2);
      expect(result.data?.failed).toBe(0);
    });
  });
});

describe("ContactStorageUtils", () => {
  beforeEach(() => {
    window.localStorage.clear();
    window.sessionStorage.clear();
  });

  it("should create a contact using utils", async () => {
    const contactData: ContactForm = {
      name: "Utils Test",
      levelId: "inner-circle",
      platform: "work",
      contactFrequency: 7,
      strength: 0.8,
    };

    const contact = await ContactStorageUtils.createContact(contactData);

    expect(contact).toBeDefined();
    expect(contact?.name).toBe("Utils Test");
  });

  it("should get all contacts using utils", async () => {
    await ContactStorageUtils.createContact({
      name: "Test Contact",
      levelId: "inner-circle",
      platform: "work",
      contactFrequency: 7,
      strength: 0.8,
    });

    const contacts = await ContactStorageUtils.getAllContacts();

    expect(contacts).toHaveLength(1);
    expect(contacts[0].name).toBe("Test Contact");
  });

  it("should search contacts using utils", async () => {
    await ContactStorageUtils.createContact({
      name: "Searchable Contact",
      levelId: "inner-circle",
      platform: "work",
      contactFrequency: 7,
      strength: 0.8,
    });

    const results = await ContactStorageUtils.searchContacts("Searchable");

    expect(results).toHaveLength(1);
    expect(results[0].name).toBe("Searchable Contact");
  });

  it("should convert between Person and ContactForm", () => {
    const person: Person = {
      id: "test-id",
      name: "Test Person",
      levelId: "inner-circle",
      lastContact: new Date(),
      contactFrequency: 7,
      strength: 0.8,
      decayRate: 0.1,
      platform: "work",
      importDate: new Date(),
      source: "manual" as const,
    };

    const contactForm = ContactStorageUtils.personToContactForm(person);

    expect(contactForm.name).toBe("Test Person");
    expect(contactForm.levelId).toBe("inner-circle");
    expect(contactForm.platform).toBe("work");
    expect(contactForm.contactFrequency).toBe(7);
    expect(contactForm.strength).toBe(0.8);
  });

  it("should perform health check", async () => {
    const health = await ContactStorageUtils.healthCheck();

    expect(health.localStorage).toBe(true);
    expect(health.sessionStorage).toBe(true);
    expect(health.firestore).toBe(false); // Mocked as unavailable
    expect(health.contactCount).toBe(0);
    expect(health.syncStatus).toBeDefined();
  });
});
