/**
 * Contact Storage Utilities
 *
 * Provides a simplified interface for contact storage operations
 * with automatic fallback handling and error recovery.
 */

import { contactStorage } from "./contact-storage-service";
import type { ContactForm, ContactUpdate, Contact } from "./contact-models";
import type {
  ContactSearchOptions,
  StoredContact,
  ContactOperationResult,
} from "./contact-storage-service";
import type { Person } from "@/types/relationships";

// Re-export types for convenience
export type {
  ContactForm,
  ContactUpdate,
  Contact,
  StoredContact,
  ContactSearchOptions,
  ContactOperationResult,
};

/**
 * Simplified contact storage interface with automatic error handling
 */
export class ContactStorageUtils {
  /**
   * Create a new contact with validation and error handling
   */
  static async createContact(
    contactData: ContactForm,
  ): Promise<StoredContact | null> {
    try {
      const result = await contactStorage.createContact(contactData);
      if (result.success && result.data) {
        return result.data;
      }
      console.error("Failed to create contact:", result.error);
      return null;
    } catch (error) {
      console.error("Error creating contact:", error);
      return null;
    }
  }

  /**
   * Get all contacts with optional filtering
   */
  static async getAllContacts(
    options?: ContactSearchOptions,
  ): Promise<StoredContact[]> {
    try {
      const result = await contactStorage.readContacts(options);
      if (result.success && result.data) {
        return result.data;
      }
      console.error("Failed to load contacts:", result.error);
      return [];
    } catch (error) {
      console.error("Error loading contacts:", error);
      return [];
    }
  }

  /**
   * Get a single contact by ID
   */
  static async getContact(contactId: string): Promise<StoredContact | null> {
    try {
      const result = await contactStorage.readContact(contactId);
      if (result.success && result.data) {
        return result.data;
      }
      console.error("Failed to load contact:", result.error);
      return null;
    } catch (error) {
      console.error("Error loading contact:", error);
      return null;
    }
  }

  /**
   * Update an existing contact
   */
  static async updateContact(
    contactId: string,
    updates: ContactUpdate,
  ): Promise<StoredContact | null> {
    try {
      const result = await contactStorage.updateContact(contactId, updates);
      if (result.success && result.data) {
        return result.data;
      }
      console.error("Failed to update contact:", result.error);
      return null;
    } catch (error) {
      console.error("Error updating contact:", error);
      return null;
    }
  }

  /**
   * Delete a contact
   */
  static async deleteContact(contactId: string): Promise<boolean> {
    try {
      const result = await contactStorage.deleteContact(contactId);
      if (result.success) {
        return true;
      }
      console.error("Failed to delete contact:", result.error);
      return false;
    } catch (error) {
      console.error("Error deleting contact:", error);
      return false;
    }
  }

  /**
   * Search contacts with text query
   */
  static async searchContacts(
    query: string,
    options?: Omit<ContactSearchOptions, "query">,
  ): Promise<StoredContact[]> {
    try {
      const result = await contactStorage.searchContacts(query, options);
      if (result.success && result.data) {
        return result.data;
      }
      console.error("Failed to search contacts:", result.error);
      return [];
    } catch (error) {
      console.error("Error searching contacts:", error);
      return [];
    }
  }

  /**
   * Get contacts by relationship level
   */
  static async getContactsByLevel(levelId: string): Promise<StoredContact[]> {
    return this.getAllContacts({ levelIds: [levelId] });
  }

  /**
   * Get contacts by platform
   */
  static async getContactsByPlatform(
    platform: string,
  ): Promise<StoredContact[]> {
    return this.getAllContacts({ platforms: [platform] });
  }

  /**
   * Get contacts that need attention (overdue for contact)
   */
  static async getContactsNeedingAttention(): Promise<
    Array<StoredContact & { daysSinceContact: number; isOverdue: boolean }>
  > {
    try {
      const result = await contactStorage.getContactsNeedingAttention();
      if (result.success && result.data) {
        return result.data;
      }
      console.error("Failed to get contacts needing attention:", result.error);
      return [];
    } catch (error) {
      console.error("Error getting contacts needing attention:", error);
      return [];
    }
  }

  /**
   * Get contact statistics
   */
  static async getContactStats() {
    try {
      const result = await contactStorage.getContactStats();
      if (result.success && result.data) {
        return result.data;
      }
      console.error("Failed to get contact stats:", result.error);
      return null;
    } catch (error) {
      console.error("Error getting contact stats:", error);
      return null;
    }
  }

  /**
   * Migrate existing relationship data to contacts
   */
  static async migrateFromRelationships(
    relationships: Person[],
  ): Promise<{ migrated: number; skipped: number }> {
    try {
      const result =
        await contactStorage.migrateFromRelationshipData(relationships);
      if (result.success && result.data) {
        return result.data;
      }
      console.error("Failed to migrate relationships:", result.error);
      return { migrated: 0, skipped: relationships.length };
    } catch (error) {
      console.error("Error migrating relationships:", error);
      return { migrated: 0, skipped: relationships.length };
    }
  }

  /**
   * Migrate from legacy storage formats
   */
  static async migrateLegacyData(): Promise<{
    migrated: number;
    errors: string[];
  }> {
    try {
      const result = await contactStorage.migrateFromLegacyStorage();
      if (result.success && result.data) {
        return result.data;
      }
      console.error("Failed to migrate legacy data:", result.error);
      return { migrated: 0, errors: [result.error || "Unknown error"] };
    } catch (error) {
      console.error("Error migrating legacy data:", error);
      return {
        migrated: 0,
        errors: [error instanceof Error ? error.message : "Unknown error"],
      };
    }
  }

  /**
   * Export contacts to JSON format
   */
  static async exportToJSON(): Promise<string | null> {
    try {
      const result = await contactStorage.exportContacts("json");
      if (result.success && result.data) {
        return result.data;
      }
      console.error("Failed to export contacts:", result.error);
      return null;
    } catch (error) {
      console.error("Error exporting contacts:", error);
      return null;
    }
  }

  /**
   * Export contacts to CSV format
   */
  static async exportToCSV(): Promise<string | null> {
    try {
      const result = await contactStorage.exportContacts("csv");
      if (result.success && result.data) {
        return result.data;
      }
      console.error("Failed to export contacts:", result.error);
      return null;
    } catch (error) {
      console.error("Error exporting contacts:", error);
      return null;
    }
  }

  /**
   * Import contacts from JSON data
   */
  static async importFromJSON(
    jsonData: string,
  ): Promise<{ imported: number; skipped: number; errors: string[] }> {
    try {
      const result = await contactStorage.importContacts(jsonData, "json");
      if (result.success && result.data) {
        return result.data;
      }
      console.error("Failed to import contacts:", result.error);
      return {
        imported: 0,
        skipped: 0,
        errors: [result.error || "Unknown error"],
      };
    } catch (error) {
      console.error("Error importing contacts:", error);
      return {
        imported: 0,
        skipped: 0,
        errors: [error instanceof Error ? error.message : "Unknown error"],
      };
    }
  }

  /**
   * Import contacts from CSV data
   */
  static async importFromCSV(
    csvData: string,
  ): Promise<{ imported: number; skipped: number; errors: string[] }> {
    try {
      const result = await contactStorage.importContacts(csvData, "csv");
      if (result.success && result.data) {
        return result.data;
      }
      console.error("Failed to import contacts:", result.error);
      return {
        imported: 0,
        skipped: 0,
        errors: [result.error || "Unknown error"],
      };
    } catch (error) {
      console.error("Error importing contacts:", error);
      return {
        imported: 0,
        skipped: 0,
        errors: [error instanceof Error ? error.message : "Unknown error"],
      };
    }
  }

  /**
   * Clear all contacts (requires confirmation)
   */
  static async clearAllContacts(): Promise<boolean> {
    try {
      const result =
        await contactStorage.clearAllContacts("CLEAR_ALL_CONTACTS");
      if (result.success) {
        return true;
      }
      console.error("Failed to clear contacts:", result.error);
      return false;
    } catch (error) {
      console.error("Error clearing contacts:", error);
      return false;
    }
  }

  /**
   * Get sync status information
   */
  static getSyncStatus() {
    return contactStorage.getSyncStatus();
  }

  /**
   * Force synchronization with Firestore
   */
  static async forceSync(): Promise<{ synced: number; failed: number }> {
    try {
      const result = await contactStorage.forcSync();
      if (result.success && result.data) {
        return result.data;
      }
      console.error("Failed to force sync:", result.error);
      return { synced: 0, failed: 0 };
    } catch (error) {
      console.error("Error forcing sync:", error);
      return { synced: 0, failed: 0 };
    }
  }

  /**
   * Batch operations for multiple contacts
   */
  static async createMultipleContacts(
    contactsData: ContactForm[],
  ): Promise<StoredContact[]> {
    try {
      const result = await contactStorage.createContacts(contactsData);
      if (result.success && result.data) {
        return result.data;
      }
      console.error("Failed to create multiple contacts:", result.error);
      return [];
    } catch (error) {
      console.error("Error creating multiple contacts:", error);
      return [];
    }
  }

  /**
   * Update multiple contacts in batch
   */
  static async updateMultipleContacts(
    updates: Array<{ id: string; data: ContactUpdate }>,
  ): Promise<StoredContact[]> {
    try {
      const result = await contactStorage.updateContacts(updates);
      if (result.success && result.data) {
        return result.data;
      }
      console.error("Failed to update multiple contacts:", result.error);
      return [];
    } catch (error) {
      console.error("Error updating multiple contacts:", error);
      return [];
    }
  }

  /**
   * Delete multiple contacts in batch
   */
  static async deleteMultipleContacts(
    contactIds: string[],
  ): Promise<{ deleted: number; failed: number }> {
    try {
      const result = await contactStorage.deleteContacts(contactIds);
      if (result.success && result.data) {
        return result.data;
      }
      console.error("Failed to delete multiple contacts:", result.error);
      return { deleted: 0, failed: contactIds.length };
    } catch (error) {
      console.error("Error deleting multiple contacts:", error);
      return { deleted: 0, failed: contactIds.length };
    }
  }

  /**
   * Utility function to convert Person to ContactForm
   */
  static personToContactForm(person: Person): ContactForm {
    return {
      name: person.name,
      levelId: person.levelId,
      platform: person.platform,
      contactFrequency: person.contactFrequency,
      strength: person.strength,
      // Default values for new fields
      email: undefined,
      phone: undefined,
      notes: undefined,
      tags: undefined,
    };
  }

  /**
   * Utility function to convert StoredContact to Person
   */
  static contactToPerson(contact: StoredContact): Person {
    return {
      id: contact.id,
      name: contact.name,
      levelId: contact.levelId,
      lastContact: contact.lastContact,
      contactFrequency: contact.contactFrequency,
      strength: contact.strength,
      decayRate: contact.decayRate,
      platform: contact.platform,
    };
  }

  /**
   * Get contacts formatted for visualization components
   */
  static async getContactsForVisualization(): Promise<Person[]> {
    const contacts = await this.getAllContacts();
    return contacts.map((contact) => this.contactToPerson(contact));
  }

  /**
   * Health check for storage system
   */
  static async healthCheck(): Promise<{
    localStorage: boolean;
    sessionStorage: boolean;
    firestore: boolean;
    contactCount: number;
    syncStatus: any;
  }> {
    const syncStatus = this.getSyncStatus();
    let contactCount = 0;
    let localStorage = false;
    let sessionStorage = false;
    let firestore = false;

    try {
      // Test localStorage
      const testKey = "yakw_health_check";
      window.localStorage.setItem(testKey, "test");
      window.localStorage.removeItem(testKey);
      localStorage = true;
    } catch (error) {
      console.warn("localStorage not available:", error);
    }

    try {
      // Test sessionStorage
      const testKey = "yakw_health_check";
      window.sessionStorage.setItem(testKey, "test");
      window.sessionStorage.removeItem(testKey);
      sessionStorage = true;
    } catch (error) {
      console.warn("sessionStorage not available:", error);
    }

    try {
      // Test Firestore by getting contact count
      const contacts = await this.getAllContacts();
      contactCount = contacts.length;
      firestore = syncStatus.isAuthenticated && syncStatus.isOnline;
    } catch (error) {
      console.warn("Error getting contact count:", error);
    }

    return {
      localStorage,
      sessionStorage,
      firestore,
      contactCount,
      syncStatus,
    };
  }
}

// Export default instance for convenience
export default ContactStorageUtils;
