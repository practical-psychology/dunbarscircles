// Enhanced contact storage with database integration, authorization, and fallback
import type { Person } from "../src/types/relationships";
import { DatabaseService } from "./database-service";
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

const CONTACTS_STORAGE_KEY = "yakw_imported_contacts";
const MIN_CONTACTS_FOR_MEANINGFUL_DATA = 3;

export interface ContactOperationResult<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  fallbackUsed?: boolean;
  source: "database" | "localStorage" | "sample";
}

export class EnhancedContactStorage {
  // Load contacts with fallback mechanism
  static async loadContacts(): Promise<
    ContactOperationResult<StoredContact[]>
  > {
    try {
      // Try database first
      const dbResponse = await DatabaseService.getUserContacts();

      if (dbResponse.success && dbResponse.data) {
        const contacts = dbResponse.data;

        // Check if we have meaningful data
        if (contacts.length >= MIN_CONTACTS_FOR_MEANINGFUL_DATA) {
          return {
            success: true,
            data: contacts,
            source: "database",
          };
        }

        // If we have some data but not enough, supplement with sample data
        if (contacts.length > 0) {
          const supplementedContacts = [
            ...contacts,
            ...SAMPLE_CONTACTS.slice(
              0,
              MIN_CONTACTS_FOR_MEANINGFUL_DATA - contacts.length,
            ),
          ];

          return {
            success: true,
            data: supplementedContacts,
            fallbackUsed: true,
            source: "database",
          };
        }
      }

      // Database failed or empty, try localStorage
      const localContacts = this.loadFromLocalStorage();
      if (localContacts.length >= MIN_CONTACTS_FOR_MEANINGFUL_DATA) {
        return {
          success: true,
          data: localContacts,
          source: "localStorage",
        };
      }

      // Supplement localStorage data if insufficient
      if (localContacts.length > 0) {
        const supplementedContacts = [
          ...localContacts,
          ...SAMPLE_CONTACTS.slice(
            0,
            MIN_CONTACTS_FOR_MEANINGFUL_DATA - localContacts.length,
          ),
        ];

        return {
          success: true,
          data: supplementedContacts,
          fallbackUsed: true,
          source: "localStorage",
        };
      }

      // Fall back to sample data
      return {
        success: true,
        data: SAMPLE_CONTACTS,
        fallbackUsed: true,
        source: "sample",
      };
    } catch (error) {
      console.error("Failed to load contacts:", error);

      // Try localStorage as final fallback
      try {
        const localContacts = this.loadFromLocalStorage();
        if (localContacts.length > 0) {
          return {
            success: true,
            data: localContacts,
            error: `Database error: ${error instanceof Error ? error.message : "Unknown error"}`,
            fallbackUsed: true,
            source: "localStorage",
          };
        }
      } catch (localError) {
        console.error("localStorage fallback also failed:", localError);
      }

      // Ultimate fallback to sample data
      return {
        success: true,
        data: SAMPLE_CONTACTS,
        error: `All storage methods failed: ${error instanceof Error ? error.message : "Unknown error"}`,
        fallbackUsed: true,
        source: "sample",
      };
    }
  }

  // Get specific contact by ID with proper error handling
  static async getContactById(
    contactId: string,
  ): Promise<ContactOperationResult<StoredContact>> {
    try {
      const dbResponse = await DatabaseService.getContactById(contactId);

      if (dbResponse.success && dbResponse.data) {
        return {
          success: true,
          data: dbResponse.data,
          source: "database",
        };
      }

      // If database fails, try localStorage
      const localContacts = this.loadFromLocalStorage();
      const contact = localContacts.find(
        (c) => c.id === contactId || c.firestoreId === contactId,
      );

      if (contact) {
        return {
          success: true,
          data: contact,
          source: "localStorage",
        };
      }

      // Check sample data
      const sampleContact = SAMPLE_CONTACTS.find((c) => c.id === contactId);
      if (sampleContact) {
        return {
          success: true,
          data: sampleContact,
          fallbackUsed: true,
          source: "sample",
        };
      }

      return {
        success: false,
        error: `Contact with ID '${contactId}' not found`,
        source: "database",
      };
    } catch (error) {
      return {
        success: false,
        error: `Failed to retrieve contact: ${error instanceof Error ? error.message : "Unknown error"}`,
        source: "database",
      };
    }
  }

  // Save contacts with dual storage
  static async saveContacts(
    contacts: StoredContact[],
  ): Promise<ContactOperationResult<{ saved: number; skipped: number }>> {
    let dbResult: { saved: number; skipped: number } = { saved: 0, skipped: 0 };
    let dbError: string | undefined;

    try {
      // Try database first
      const dbResponse = await DatabaseService.saveUserContacts(contacts);

      if (dbResponse.success && dbResponse.data) {
        dbResult = dbResponse.data;
      } else {
        dbError = dbResponse.error?.message || "Database save failed";
      }
    } catch (error) {
      dbError = `Database error: ${error instanceof Error ? error.message : "Unknown error"}`;
    }

    // Always save to localStorage as backup
    try {
      this.saveToLocalStorage(contacts);
    } catch (localError) {
      console.error("Failed to save to localStorage:", localError);
    }

    if (dbResult.saved > 0) {
      return {
        success: true,
        data: dbResult,
        source: "database",
      };
    }

    return {
      success: false,
      error: dbError || "Failed to save contacts",
      data: { saved: 0, skipped: contacts.length },
      source: "database",
    };
  }

  // Add new contacts with deduplication
  static async addContacts(
    newContacts: Person[],
    source: "facebook" | "linkedin" | "manual",
  ): Promise<ContactOperationResult<{ added: number; skipped: number }>> {
    try {
      // Load existing contacts
      const existingResult = await this.loadContacts();
      const existingContacts = existingResult.data || [];

      // Convert to StoredContact format
      const contactsToAdd: StoredContact[] = newContacts.map((contact) => ({
        ...contact,
        importDate: new Date(),
        source,
      }));

      // Deduplicate based on name and platform
      const filteredContacts = contactsToAdd.filter(
        (newContact) =>
          !existingContacts.some(
            (existing) =>
              existing.name.toLowerCase() === newContact.name.toLowerCase() &&
              existing.platform === newContact.platform,
          ),
      );

      if (filteredContacts.length === 0) {
        return {
          success: true,
          data: { added: 0, skipped: contactsToAdd.length },
          source: "database",
        };
      }

      // Save new contacts
      const saveResult = await this.saveContacts(filteredContacts);

      return {
        success: saveResult.success,
        data: {
          added: saveResult.data?.saved || 0,
          skipped:
            contactsToAdd.length -
            filteredContacts.length +
            (saveResult.data?.skipped || 0),
        },
        error: saveResult.error,
        source: saveResult.source,
      };
    } catch (error) {
      return {
        success: false,
        error: `Failed to add contacts: ${error instanceof Error ? error.message : "Unknown error"}`,
        data: { added: 0, skipped: newContacts.length },
        source: "database",
      };
    }
  }

  // Update specific contact
  static async updateContact(
    contactId: string,
    updates: Partial<StoredContact>,
  ): Promise<ContactOperationResult<StoredContact>> {
    try {
      const dbResponse = await DatabaseService.updateContact(
        contactId,
        updates,
      );

      if (dbResponse.success && dbResponse.data) {
        // Also update localStorage
        try {
          const localContacts = this.loadFromLocalStorage();
          const updatedContacts = localContacts.map((contact) =>
            contact.id === contactId || contact.firestoreId === contactId
              ? { ...contact, ...updates }
              : contact,
          );
          this.saveToLocalStorage(updatedContacts);
        } catch (localError) {
          console.warn("Failed to update localStorage:", localError);
        }

        return {
          success: true,
          data: dbResponse.data,
          source: "database",
        };
      }

      // If update failed (e.g., when working with sample/local contacts or offline), try updating localStorage directly
      try {
        const localContacts = this.loadFromLocalStorage();
        const existsLocally = localContacts.some(
          (c) => c.id === contactId || c.firestoreId === contactId,
        );
        if (existsLocally) {
          const updatedContacts = localContacts.map((contact) =>
            contact.id === contactId || contact.firestoreId === contactId
              ? { ...contact, ...updates }
              : contact,
          );
          this.saveToLocalStorage(updatedContacts);
          const updated = updatedContacts.find(
            (c) => c.id === contactId || c.firestoreId === contactId,
          )!;
          return {
            success: true,
            data: updated,
            fallbackUsed: true,
            source: "localStorage",
          };
        }

        // If not in local storage, see if this is one of our sample contacts and persist it locally with the updates applied
        const sample = SAMPLE_CONTACTS.find((c) => c.id === contactId);
        if (sample) {
          const updatedSample: StoredContact = {
            ...sample,
            ...updates,
          } as StoredContact;
          const next = [...localContacts, updatedSample];
          this.saveToLocalStorage(next);
          return {
            success: true,
            data: updatedSample,
            fallbackUsed: true,
            source: "localStorage",
          };
        }
      } catch (localError) {
        console.warn("Local fallback update failed:", localError);
      }

      return {
        success: false,
        error: dbResponse.error?.message || "Failed to update contact",
        source: "database",
      };
    } catch (error) {
      return {
        success: false,
        error: `Failed to update contact: ${error instanceof Error ? error.message : "Unknown error"}`,
        source: "database",
      };
    }
  }

  // Delete contact
  static async deleteContact(
    contactId: string,
  ): Promise<ContactOperationResult<{ deleted: boolean }>> {
    try {
      const dbResponse = await DatabaseService.deleteContact(contactId);

      if (dbResponse.success) {
        // Also remove from localStorage
        try {
          const localContacts = this.loadFromLocalStorage();
          const filteredContacts = localContacts.filter(
            (contact) =>
              contact.id !== contactId && contact.firestoreId !== contactId,
          );
          this.saveToLocalStorage(filteredContacts);
        } catch (localError) {
          console.warn("Failed to update localStorage:", localError);
        }

        return {
          success: true,
          data: { deleted: true },
          source: "database",
        };
      }

      // If delete failed (e.g., sample or local-only contact), try deleting from localStorage
      try {
        const localContacts = this.loadFromLocalStorage();
        const existsLocally = localContacts.some(
          (c) => c.id === contactId || c.firestoreId === contactId,
        );
        if (existsLocally) {
          const filteredContacts = localContacts.filter(
            (contact) =>
              contact.id !== contactId && contact.firestoreId !== contactId,
          );
          this.saveToLocalStorage(filteredContacts);
          return {
            success: true,
            data: { deleted: true },
            fallbackUsed: true,
            source: "localStorage",
          };
        }

        // If this is one of our sample contacts, treat as deleted to avoid blocking the UI
        if (SAMPLE_CONTACTS.find((c) => c.id === contactId)) {
          return {
            success: true,
            data: { deleted: true },
            fallbackUsed: true,
            source: "sample",
          };
        }
      } catch (localError) {
        console.warn("Local fallback delete failed:", localError);
      }

      return {
        success: false,
        error: dbResponse.error?.message || "Failed to delete contact",
        source: "database",
      };
    } catch (error) {
      return {
        success: false,
        error: `Failed to delete contact: ${error instanceof Error ? error.message : "Unknown error"}`,
        source: "database",
      };
    }
  }

  // Get contacts by source
  static async getContactsBySource(
    source: "facebook" | "linkedin" | "manual",
  ): Promise<ContactOperationResult<StoredContact[]>> {
    try {
      const dbResponse = await DatabaseService.getContactsBySource(source);

      if (dbResponse.success && dbResponse.data) {
        return {
          success: true,
          data: dbResponse.data,
          source: "database",
        };
      }

      // Fallback to localStorage
      const localContacts = this.loadFromLocalStorage();
      const filteredContacts = localContacts.filter(
        (contact) => contact.source === source,
      );

      return {
        success: true,
        data: filteredContacts,
        fallbackUsed: true,
        source: "localStorage",
      };
    } catch (error) {
      return {
        success: false,
        error: `Failed to get contacts by source: ${error instanceof Error ? error.message : "Unknown error"}`,
        source: "database",
      };
    }
  }

  // Clear all contacts with confirmation
  static async clearAllContacts(
    confirmationToken: string,
  ): Promise<ContactOperationResult<{ deleted: number }>> {
    try {
      const dbResponse = await DatabaseService.clearUserContacts(
        undefined,
        confirmationToken,
      );

      // Also clear localStorage
      try {
        localStorage.removeItem(CONTACTS_STORAGE_KEY);
      } catch (localError) {
        console.warn("Failed to clear localStorage:", localError);
      }

      if (dbResponse.success && dbResponse.data) {
        return {
          success: true,
          data: { deleted: dbResponse.data.deleted },
          source: "database",
        };
      }

      return {
        success: false,
        error: dbResponse.error?.message || "Failed to clear contacts",
        source: "database",
      };
    } catch (error) {
      return {
        success: false,
        error: `Failed to clear contacts: ${error instanceof Error ? error.message : "Unknown error"}`,
        source: "database",
      };
    }
  }

  // Get user statistics
  static async getStats(): Promise<
    ContactOperationResult<{
      total: number;
      bySource: Record<string, number>;
      byLevel: Record<string, number>;
      lastUpdated: Date;
    }>
  > {
    try {
      const dbResponse = await DatabaseService.getUserStats();

      if (dbResponse.success && dbResponse.data) {
        return {
          success: true,
          data: dbResponse.data,
          source: "database",
        };
      }

      // Fallback to calculating from loaded contacts
      const contactsResult = await this.loadContacts();
      if (contactsResult.success && contactsResult.data) {
        const contacts = contactsResult.data;
        const total = contacts.length;
        const bySource: Record<string, number> = {};
        const byLevel: Record<string, number> = {};
        let lastUpdated = new Date(0);

        contacts.forEach((contact) => {
          bySource[contact.source] = (bySource[contact.source] || 0) + 1;
          byLevel[contact.levelId] = (byLevel[contact.levelId] || 0) + 1;
          if (contact.importDate > lastUpdated) {
            lastUpdated = contact.importDate;
          }
        });

        return {
          success: true,
          data: { total, bySource, byLevel, lastUpdated },
          fallbackUsed: contactsResult.fallbackUsed,
          source: contactsResult.source,
        };
      }

      return {
        success: false,
        error: "Failed to calculate statistics",
        source: "database",
      };
    } catch (error) {
      return {
        success: false,
        error: `Failed to get statistics: ${error instanceof Error ? error.message : "Unknown error"}`,
        source: "database",
      };
    }
  }

  // Private localStorage methods
  private static loadFromLocalStorage(): StoredContact[] {
    try {
      const stored = localStorage.getItem(CONTACTS_STORAGE_KEY);
      if (!stored) return [];

      const parsed = JSON.parse(stored);
      return parsed.map((contact: any) => ({
        ...contact,
        lastContact: new Date(contact.lastContact),
        importDate: new Date(contact.importDate),
      }));
    } catch (error) {
      console.error("Failed to load from localStorage:", error);
      return [];
    }
  }

  private static saveToLocalStorage(contacts: StoredContact[]): void {
    try {
      const serializedContacts = contacts.map((contact) => {
        const last =
          contact.lastContact instanceof Date
            ? contact.lastContact
            : new Date(contact.lastContact as any);
        const imp =
          contact.importDate instanceof Date
            ? contact.importDate
            : new Date(contact.importDate as any);
        const safeLast = isNaN(last.getTime()) ? new Date() : last;
        const safeImp = isNaN(imp.getTime()) ? new Date() : imp;
        return {
          ...contact,
          lastContact: safeLast.toISOString(),
          importDate: safeImp.toISOString(),
        };
      });
      localStorage.setItem(
        CONTACTS_STORAGE_KEY,
        JSON.stringify(serializedContacts),
      );
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
