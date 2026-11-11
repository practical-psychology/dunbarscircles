// Enhanced contact storage with database integration, authorization, and fallback
import type { Person } from "../src/types/relationships";
import { notifyLocalChange, startCloudSync } from "./cloud-sync";
import type { StoredContact } from "./contact-storage";

// Sample data for fallback when user data is incomplete
const SAMPLE_CONTACTS: StoredContact[] = [
  {
    id: "sample_1",
    name: "Sarah Johnson",
    levelId: "inner-circle",
    lastContact: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    contactFrequency: 1,
    strength: 0.95,
    decayRate: 0.001,
    platform: "Real Life",
    importDate: new Date(),
    source: "manual",
  },
  {
    id: "sample_2",
    name: "Mike Chen",
    levelId: "sympathy-group",
    lastContact: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    contactFrequency: 7,
    strength: 0.8,
    decayRate: 0.005,
    platform: "Work",
    importDate: new Date(),
    source: "manual",
  },
  {
    id: "sample_3",
    name: "Emma Davis",
    levelId: "affinity-group",
    lastContact: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    contactFrequency: 30,
    strength: 0.6,
    decayRate: 0.01,
    platform: "Social Media",
    importDate: new Date(),
    source: "manual",
  },
  {
    id: "sample_4",
    name: "John Smith",
    levelId: "active-network",
    lastContact: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
    contactFrequency: 90,
    strength: 0.4,
    decayRate: 0.02,
    platform: "LinkedIn",
    importDate: new Date(),
    source: "manual",
  },
  {
    id: "sample_5",
    name: "Lisa Wong",
    levelId: "recognition-group",
    lastContact: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000),
    contactFrequency: 365,
    strength: 0.2,
    decayRate: 0.03,
    platform: "Conference",
    importDate: new Date(),
    source: "manual",
  },
];

// Single source of truth shared with ContactStorageService (imports, contacts page).
const CONTACTS_STORAGE_KEY = "yakw_contacts";
// Older key that earlier versions of this class wrote to; merged in and retired.
const LEGACY_CONTACTS_KEY = "yakw_imported_contacts";
const MIN_CONTACTS_FOR_MEANINGFUL_DATA = 3;

export interface ContactOperationResult<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  fallbackUsed?: boolean;
  source: "database" | "localStorage" | "sample";
}

export class EnhancedContactStorage {
  /*
   * The browser store is the source of truth; the optional cloud backup is
   * a mirror kept by lib/cloud-sync.ts. No method here talks to Firestore.
   */

  private static matches(c: StoredContact, contactId: string): boolean {
    return c.id === contactId || c.firestoreId === contactId;
  }

  // Load contacts, padding with built-in demo people when there are very few
  static async loadContacts(): Promise<
    ContactOperationResult<StoredContact[]>
  > {
    startCloudSync();
    try {
      const localContacts = this.loadFromLocalStorage();
      if (localContacts.length >= MIN_CONTACTS_FOR_MEANINGFUL_DATA) {
        return { success: true, data: localContacts, source: "localStorage" };
      }
      if (localContacts.length > 0) {
        return {
          success: true,
          data: [
            ...localContacts,
            ...SAMPLE_CONTACTS.slice(
              0,
              MIN_CONTACTS_FOR_MEANINGFUL_DATA - localContacts.length,
            ),
          ],
          fallbackUsed: true,
          source: "localStorage",
        };
      }
      return {
        success: true,
        data: SAMPLE_CONTACTS,
        fallbackUsed: true,
        source: "sample",
      };
    } catch (error) {
      console.error("Failed to load contacts:", error);
      return {
        success: true,
        data: SAMPLE_CONTACTS,
        error: `Storage error: ${error instanceof Error ? error.message : "Unknown error"}`,
        fallbackUsed: true,
        source: "sample",
      };
    }
  }

  static async getContactById(
    contactId: string,
  ): Promise<ContactOperationResult<StoredContact>> {
    const contact = this.loadFromLocalStorage().find((c) =>
      this.matches(c, contactId),
    );
    if (contact)
      return { success: true, data: contact, source: "localStorage" };
    const sample = SAMPLE_CONTACTS.find((c) => c.id === contactId);
    if (sample) {
      return {
        success: true,
        data: sample,
        fallbackUsed: true,
        source: "sample",
      };
    }
    return {
      success: false,
      error: `Contact with ID '${contactId}' not found`,
      source: "localStorage",
    };
  }

  /** Replace the stored list. Cloud backup follows automatically. */
  static async saveContacts(
    contacts: StoredContact[],
  ): Promise<ContactOperationResult<{ saved: number; skipped: number }>> {
    try {
      const now = new Date().toISOString();
      const previous = new Map(
        this.loadFromLocalStorage().map((c) => [c.id, c]),
      );
      const stamped = contacts.map((c) => {
        const before = previous.get(c.id);
        const changed = !before || JSON.stringify(before) !== JSON.stringify(c);
        return changed ? ({ ...c, updatedAt: now } as StoredContact) : c;
      });
      this.saveToLocalStorage(stamped);
      const saved = stamped.filter(
        (c) => !String(c.id).startsWith("sample_"),
      ).length;
      return {
        success: true,
        data: { saved, skipped: contacts.length - saved },
        source: "localStorage",
      };
    } catch (error) {
      return {
        success: false,
        error: `Failed to save contacts: ${error instanceof Error ? error.message : "Unknown error"}`,
        data: { saved: 0, skipped: contacts.length },
        source: "localStorage",
      };
    }
  }

  // Add new contacts with deduplication (name + platform)
  static async addContacts(
    newContacts: Person[],
    source: "facebook" | "linkedin" | "manual",
  ): Promise<ContactOperationResult<{ added: number; skipped: number }>> {
    try {
      const existing = this.loadFromLocalStorage();
      const contactsToAdd: StoredContact[] = newContacts.map((contact) => ({
        ...contact,
        importDate: new Date(),
        source,
      }));
      const filtered = contactsToAdd.filter(
        (n) =>
          !existing.some(
            (e) =>
              e.name.toLowerCase() === n.name.toLowerCase() &&
              e.platform === n.platform,
          ),
      );
      if (filtered.length > 0) {
        await this.saveContacts([...existing, ...filtered]);
      }
      return {
        success: true,
        data: {
          added: filtered.length,
          skipped: contactsToAdd.length - filtered.length,
        },
        source: "localStorage",
      };
    } catch (error) {
      return {
        success: false,
        error: `Failed to add contacts: ${error instanceof Error ? error.message : "Unknown error"}`,
        data: { added: 0, skipped: newContacts.length },
        source: "localStorage",
      };
    }
  }

  static async updateContact(
    contactId: string,
    updates: Partial<StoredContact>,
  ): Promise<ContactOperationResult<StoredContact>> {
    try {
      const local = this.loadFromLocalStorage();
      if (local.some((c) => this.matches(c, contactId))) {
        const next = local.map((c) =>
          this.matches(c, contactId)
            ? ({ ...c, ...updates } as StoredContact)
            : c,
        );
        await this.saveContacts(next);
        const updated = this.loadFromLocalStorage().find((c) =>
          this.matches(c, contactId),
        )!;
        return { success: true, data: updated, source: "localStorage" };
      }
      // Editing a built-in demo person promotes it to a real stored contact.
      const sample = SAMPLE_CONTACTS.find((c) => c.id === contactId);
      if (sample) {
        const promoted = {
          ...sample,
          ...updates,
          id: `contact_${Date.now()}`,
        } as StoredContact;
        await this.saveContacts([...local, promoted]);
        return {
          success: true,
          data: promoted,
          fallbackUsed: true,
          source: "localStorage",
        };
      }
      return {
        success: false,
        error: `Contact with ID '${contactId}' not found`,
        source: "localStorage",
      };
    } catch (error) {
      return {
        success: false,
        error: `Failed to update contact: ${error instanceof Error ? error.message : "Unknown error"}`,
        source: "localStorage",
      };
    }
  }

  static async deleteContact(
    contactId: string,
  ): Promise<ContactOperationResult<{ deleted: boolean }>> {
    try {
      const local = this.loadFromLocalStorage();
      if (local.some((c) => this.matches(c, contactId))) {
        this.saveToLocalStorage(
          local.filter((c) => !this.matches(c, contactId)),
        );
        return {
          success: true,
          data: { deleted: true },
          source: "localStorage",
        };
      }
      if (SAMPLE_CONTACTS.find((c) => c.id === contactId)) {
        // Built-in demo people are not stored; nothing to delete.
        return {
          success: true,
          data: { deleted: true },
          fallbackUsed: true,
          source: "sample",
        };
      }
      return {
        success: false,
        error: `Contact with ID '${contactId}' not found`,
        source: "localStorage",
      };
    } catch (error) {
      return {
        success: false,
        error: `Failed to delete contact: ${error instanceof Error ? error.message : "Unknown error"}`,
        source: "localStorage",
      };
    }
  }

  static async getContactsBySource(
    source: "facebook" | "linkedin" | "manual",
  ): Promise<ContactOperationResult<StoredContact[]>> {
    return {
      success: true,
      data: this.loadFromLocalStorage().filter((c) => c.source === source),
      source: "localStorage",
    };
  }

  /** Delete every contact in this browser; the cloud copy follows. */
  static async clearAllContacts(
    confirmationToken: string,
  ): Promise<ContactOperationResult<{ deleted: number }>> {
    if (
      confirmationToken !== "DELETE_ALL_CONTACTS" &&
      confirmationToken !== "CLEAR_ALL_CONTACTS"
    ) {
      return {
        success: false,
        error: "Invalid confirmation token",
        source: "localStorage",
      };
    }
    try {
      const deleted = this.loadFromLocalStorage().length;
      localStorage.removeItem(CONTACTS_STORAGE_KEY);
      localStorage.removeItem(LEGACY_CONTACTS_KEY);
      try {
        sessionStorage.removeItem(CONTACTS_STORAGE_KEY);
      } catch {
        /* ignore */
      }
      notifyLocalChange();
      return { success: true, data: { deleted }, source: "localStorage" };
    } catch (error) {
      return {
        success: false,
        error: `Failed to clear contacts: ${error instanceof Error ? error.message : "Unknown error"}`,
        source: "localStorage",
      };
    }
  }

  static async getStats(): Promise<
    ContactOperationResult<{
      total: number;
      bySource: Record<string, number>;
      byLevel: Record<string, number>;
      lastUpdated: Date;
    }>
  > {
    const contactsResult = await this.loadContacts();
    const contacts = contactsResult.data ?? [];
    const bySource: Record<string, number> = {};
    const byLevel: Record<string, number> = {};
    let lastUpdated = new Date(0);
    contacts.forEach((contact) => {
      bySource[contact.source] = (bySource[contact.source] || 0) + 1;
      byLevel[contact.levelId] = (byLevel[contact.levelId] || 0) + 1;
      if (contact.importDate > lastUpdated) lastUpdated = contact.importDate;
    });
    return {
      success: true,
      data: { total: contacts.length, bySource, byLevel, lastUpdated },
      fallbackUsed: contactsResult.fallbackUsed,
      source: contactsResult.source,
    };
  }

  // Private localStorage methods (shared store with ContactStorageService)
  private static readArray(key: string): any[] {
    try {
      const stored = localStorage.getItem(key) ?? sessionStorage.getItem(key);
      if (!stored) return [];
      const parsed = JSON.parse(stored);
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      console.error(`Failed to read ${key}:`, error);
      return [];
    }
  }

  private static toStoredContact(raw: any): StoredContact {
    const created = raw.createdAt ? new Date(raw.createdAt) : undefined;
    const platform = String(raw.platform ?? "").toLowerCase();
    const source: StoredContact["source"] =
      raw.source === "facebook" ||
      raw.source === "linkedin" ||
      raw.source === "manual"
        ? raw.source
        : platform.includes("linkedin")
          ? "linkedin"
          : platform.includes("facebook")
            ? "facebook"
            : "manual";
    const last = new Date(raw.lastContact);
    const imp = new Date(raw.importDate ?? raw.createdAt);
    const importDate = isNaN(imp.getTime()) ? (created ?? new Date()) : imp;
    return {
      ...raw,
      createdAt: raw.createdAt ?? importDate.toISOString(),
      updatedAt: raw.updatedAt ?? importDate.toISOString(),
      source,
      lastContact: isNaN(last.getTime()) ? new Date() : last,
      importDate,
    };
  }

  private static loadFromLocalStorage(): StoredContact[] {
    const byId = new Map<string, StoredContact>();
    for (const key of [LEGACY_CONTACTS_KEY, CONTACTS_STORAGE_KEY]) {
      for (const raw of this.readArray(key)) {
        if (raw && raw.id && !String(raw.id).startsWith("sample_")) {
          byId.set(raw.id, this.toStoredContact(raw));
        }
      }
    }
    return [...byId.values()];
  }

  private static saveToLocalStorage(contacts: StoredContact[]): void {
    try {
      const serialized = contacts
        // Never persist the built-in sample fallbacks as if they were real.
        .filter((c) => !String(c.id).startsWith("sample_"))
        .map((contact) => {
          const last = new Date(contact.lastContact as any);
          const imp = new Date(contact.importDate as any);
          return {
            ...contact,
            lastContact: (isNaN(last.getTime())
              ? new Date()
              : last
            ).toISOString(),
            importDate: (isNaN(imp.getTime()) ? new Date() : imp).toISOString(),
          };
        });
      localStorage.setItem(CONTACTS_STORAGE_KEY, JSON.stringify(serialized));
      localStorage.removeItem(LEGACY_CONTACTS_KEY);
      notifyLocalChange();
    } catch (error) {
      console.error("Failed to save to localStorage:", error);
      throw error;
    }
  }

  // Utility method to check data completeness
  static async checkDataCompleteness(): Promise<{
    hasData: boolean;
    source: string;
    contactCount: number;
    isComplete: boolean;
    recommendations: string[];
  }> {
    const result = await this.loadContacts();
    const contacts = result.data || [];
    const recommendations: string[] = [];

    if (contacts.length === 0) {
      recommendations.push("Import your social media data to get started");
    } else if (contacts.length < MIN_CONTACTS_FOR_MEANINGFUL_DATA) {
      recommendations.push("Add more contacts for better insights");
    }

    if (result.fallbackUsed) {
      recommendations.push(
        "Some sample data is being used - import your real data for accurate analysis",
      );
    }

    const levelCounts = contacts.reduce(
      (acc, contact) => {
        acc[contact.levelId] = (acc[contact.levelId] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );

    const hasAllLevels = Object.keys(levelCounts).length >= 3;
    if (!hasAllLevels) {
      recommendations.push(
        "Try categorizing contacts across different relationship levels",
      );
    }

    return {
      hasData: contacts.length > 0,
      source: result.source,
      contactCount: contacts.length,
      isComplete:
        contacts.length >= MIN_CONTACTS_FOR_MEANINGFUL_DATA &&
        !result.fallbackUsed &&
        hasAllLevels,
      recommendations,
    };
  }
}
