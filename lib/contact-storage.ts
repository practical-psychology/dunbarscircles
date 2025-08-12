import type { Person } from "@/types/relationships";

const CONTACTS_STORAGE_KEY = "yakw_imported_contacts";

export interface StoredContact extends Person {
  importDate: Date;
  source: "facebook" | "linkedin" | "manual";
}

export class ContactStorage {
  static saveContacts(contacts: StoredContact[]): void {
    try {
      const serializedContacts = contacts.map(contact => ({
        ...contact,
        lastContact: contact.lastContact.toISOString(),
        importDate: contact.importDate.toISOString(),
      }));
      localStorage.setItem(CONTACTS_STORAGE_KEY, JSON.stringify(serializedContacts));
    } catch (error) {
      console.error("Failed to save contacts:", error);
    }
  }

  static loadContacts(): StoredContact[] {
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
      console.error("Failed to load contacts:", error);
      return [];
    }
  }

  static addContacts(newContacts: Person[], source: "facebook" | "linkedin" | "manual"): void {
    const existingContacts = this.loadContacts();
    const contactsToAdd: StoredContact[] = newContacts.map(contact => ({
      ...contact,
      importDate: new Date(),
      source,
    }));

    // Avoid duplicates based on name and platform
    const filteredContacts = contactsToAdd.filter(newContact => 
      !existingContacts.some(existing => 
        existing.name === newContact.name && existing.platform === newContact.platform
      )
    );

    const allContacts = [...existingContacts, ...filteredContacts];
    this.saveContacts(allContacts);
  }

  static clearContacts(): void {
    localStorage.removeItem(CONTACTS_STORAGE_KEY);
  }

  static getContactsBySource(source: "facebook" | "linkedin" | "manual"): StoredContact[] {
    return this.loadContacts().filter(contact => contact.source === source);
  }

  static getContactStats() {
    const contacts = this.loadContacts();
    const total = contacts.length;
    const bySource = {
      facebook: contacts.filter(c => c.source === "facebook").length,
      linkedin: contacts.filter(c => c.source === "linkedin").length,
      manual: contacts.filter(c => c.source === "manual").length,
    };
    const byLevel = contacts.reduce((acc, contact) => {
      acc[contact.levelId] = (acc[contact.levelId] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return { total, bySource, byLevel };
  }
}