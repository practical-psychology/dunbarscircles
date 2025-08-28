import type { Person } from "../src/types/relationships";
import {
  collection,
  getDocs,
  doc,
  query,
  where,
  writeBatch,
  Timestamp,
} from "firebase/firestore";
import { db } from "../firebase-config";

const CONTACTS_STORAGE_KEY = "yakw_imported_contacts";
const CONTACTS_COLLECTION = "contacts";

export interface StoredContact extends Person {
  id: string;
  name: string;
  levelId: string;
  lastContact: Date;
  contactFrequency: number;
  strength: number;
  decayRate: number;
  platform: string;
  email?: string;
  phone?: string;
  notes?: string;
  importDate: Date;
  source: "facebook" | "linkedin" | "manual";
  firestoreId?: string;
  syncStatus?: "synced" | "pending" | "error";
  lastSyncAt?: Date;
  tags?: string[];
  x?: number;
  y?: number;
  vx?: number;
  vy?: number;
}

export class ContactStorage {
  private static isFirebaseAvailable(): boolean {
    return db !== null && db !== undefined;
  }

  // Firebase methods
  static async saveContactsToFirebase(
    contacts: StoredContact[],
  ): Promise<void> {
    if (!this.isFirebaseAvailable()) {
      throw new Error("Firebase is not available");
    }

    try {
      if (!db) {
        throw new Error("Firestore database is not available");
      }

      const batch = writeBatch(db);
      const contactsRef = collection(db, CONTACTS_COLLECTION);

      contacts.forEach((contact) => {
        const docRef = doc(contactsRef);
        const contactData = {
          ...contact,
          lastContact:
            contact.lastContact instanceof Date
              ? Timestamp.fromDate(contact.lastContact)
              : Timestamp.fromDate(new Date(contact.lastContact)),
          importDate:
            contact.importDate instanceof Date
              ? Timestamp.fromDate(contact.importDate)
              : Timestamp.fromDate(new Date(contact.importDate)),
          // Remove firestoreId from the data being saved
          firestoreId: undefined,
        };
        // Clean up undefined values
        Object.keys(contactData).forEach((key) => {
          if (contactData[key as keyof typeof contactData] === undefined) {
            delete contactData[key as keyof typeof contactData];
          }
        });
        batch.set(docRef, contactData);
      });

      await batch.commit();
      console.log(`Successfully saved ${contacts.length} contacts to Firebase`);
    } catch (error) {
      console.error("Failed to save contacts to Firebase:", error);
      throw error;
    }
  }

  static async loadContactsFromFirebase(): Promise<StoredContact[]> {
    if (!this.isFirebaseAvailable()) {
      throw new Error("Firebase is not available");
    }

    try {
      if (!db) {
        throw new Error("Firestore database is not available");
      }

      const contactsRef = collection(db, CONTACTS_COLLECTION);
      const querySnapshot = await getDocs(contactsRef);

      const contacts: StoredContact[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        contacts.push({
          ...data,
          firestoreId: doc.id,
          lastContact: data.lastContact?.toDate
            ? data.lastContact.toDate()
            : new Date(data.lastContact),
          importDate: data.importDate?.toDate
            ? data.importDate.toDate()
            : new Date(data.importDate),
        } as StoredContact);
      });

      console.log(`Loaded ${contacts.length} contacts from Firebase`);
      return contacts;
    } catch (error) {
      console.error("Failed to load contacts from Firebase:", error);
      return [];
    }
  }

  static async addContactsToFirebase(
    newContacts: Person[],
    source: "facebook" | "linkedin" | "manual",
  ): Promise<void> {
    try {
      const existingContacts = await this.loadContactsFromFirebase();
      const contactsToAdd: StoredContact[] = newContacts.map((contact) => ({
        ...contact,
        importDate: new Date(),
        source,
      }));

      // Avoid duplicates based on name and platform
      const filteredContacts = contactsToAdd.filter(
        (newContact) =>
          !existingContacts.some(
            (existing) =>
              existing.name === newContact.name &&
              existing.platform === newContact.platform,
          ),
      );

      if (filteredContacts.length > 0) {
        await this.saveContactsToFirebase(filteredContacts);
      }
    } catch (error) {
      console.error("Failed to add contacts to Firebase:", error);
      throw error;
    }
  }

  static async clearContactsFromFirebase(): Promise<void> {
    if (!this.isFirebaseAvailable()) {
      throw new Error("Firebase is not available");
    }

    try {
      if (!db) {
        throw new Error("Firestore database is not available");
      }

      const contactsRef = collection(db, CONTACTS_COLLECTION);
      const querySnapshot = await getDocs(contactsRef);

      const batch = writeBatch(db);
      querySnapshot.forEach((document) => {
        batch.delete(document.ref);
      });

      await batch.commit();
      console.log("All contacts cleared from Firebase");
    } catch (error) {
      console.error("Failed to clear contacts from Firebase:", error);
      throw error;
    }
  }

  static async getContactsBySourceFromFirebase(
    source: "facebook" | "linkedin" | "manual",
  ): Promise<StoredContact[]> {
    if (!this.isFirebaseAvailable()) {
      throw new Error("Firebase is not available");
    }

    try {
      if (!db) {
        throw new Error("Firestore database is not available");
      }

      const contactsRef = collection(db, CONTACTS_COLLECTION);
      const q = query(contactsRef, where("source", "==", source));
      const querySnapshot = await getDocs(q);

      const contacts: StoredContact[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        contacts.push({
          ...data,
          firestoreId: doc.id,
          lastContact: data.lastContact.toDate(),
          importDate: data.importDate.toDate(),
        } as StoredContact);
      });

      return contacts;
    } catch (error) {
      console.error("Failed to get contacts by source from Firebase:", error);
      return [];
    }
  }

  // Legacy localStorage methods (kept for backward compatibility)
  static saveContacts(contacts: StoredContact[]): void {
    try {
      const serializedContacts = contacts.map((contact) => ({
        ...contact,
        lastContact: contact.lastContact.toISOString(),
        importDate: contact.importDate.toISOString(),
      }));
      localStorage.setItem(
        CONTACTS_STORAGE_KEY,
        JSON.stringify(serializedContacts),
      );
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

  static addContacts(
    newContacts: Person[],
    source: "facebook" | "linkedin" | "manual",
  ): void {
    const existingContacts = this.loadContacts();
    const contactsToAdd: StoredContact[] = newContacts.map((contact) => ({
      ...contact,
      importDate: new Date(),
      source,
    }));

    // Avoid duplicates based on name and platform
    const filteredContacts = contactsToAdd.filter(
      (newContact) =>
        !existingContacts.some(
          (existing) =>
            existing.name === newContact.name &&
            existing.platform === newContact.platform,
        ),
    );

    const allContacts = [...existingContacts, ...filteredContacts];
    this.saveContacts(allContacts);
  }

  static clearContacts(): void {
    localStorage.removeItem(CONTACTS_STORAGE_KEY);
  }

  static getContactsBySource(
    source: "facebook" | "linkedin" | "manual",
  ): StoredContact[] {
    return this.loadContacts().filter((contact) => contact.source === source);
  }

  static getContactStats() {
    const contacts = this.loadContacts();
    const total = contacts.length;
    const bySource = {
      facebook: contacts.filter((c) => c.source === "facebook").length,
      linkedin: contacts.filter((c) => c.source === "linkedin").length,
      manual: contacts.filter((c) => c.source === "manual").length,
    };
    const byLevel = contacts.reduce(
      (acc, contact) => {
        acc[contact.levelId] = (acc[contact.levelId] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );

    return { total, bySource, byLevel };
  }

  // Hybrid methods that work with both Firebase and localStorage
  static async loadAllContacts(): Promise<StoredContact[]> {
    try {
      // Try Firebase first
      const firebaseContacts = await this.loadContactsFromFirebase();
      if (firebaseContacts.length > 0) {
        return firebaseContacts;
      }

      // Fallback to localStorage
      return this.loadContacts();
    } catch (error) {
      console.error("Failed to load from Firebase, using localStorage:", error);
      return this.loadContacts();
    }
  }

  static async addAllContacts(
    newContacts: Person[],
    source: "facebook" | "linkedin" | "manual",
  ): Promise<void> {
    try {
      // Try Firebase first
      await this.addContactsToFirebase(newContacts, source);

      // Also save to localStorage as backup
      this.addContacts(newContacts, source);
    } catch (error) {
      console.error(
        "Failed to save to Firebase, using localStorage only:",
        error,
      );
      this.addContacts(newContacts, source);
    }
  }

  static async clearAllContacts(): Promise<void> {
    try {
      // Clear from Firebase
      await this.clearContactsFromFirebase();

      // Also clear localStorage
      this.clearContacts();
    } catch (error) {
      console.error(
        "Failed to clear Firebase, clearing localStorage only:",
        error,
      );
      this.clearContacts();
    }
  }

  static async getAllContactStats() {
    try {
      const contacts = await this.loadAllContacts();
      const total = contacts.length;
      const bySource = {
        facebook: contacts.filter((c) => c.source === "facebook").length,
        linkedin: contacts.filter((c) => c.source === "linkedin").length,
        manual: contacts.filter((c) => c.source === "manual").length,
      };
      const byLevel = contacts.reduce(
        (acc, contact) => {
          acc[contact.levelId] = (acc[contact.levelId] || 0) + 1;
          return acc;
        },
        {} as Record<string, number>,
      );

      return { total, bySource, byLevel };
    } catch (error) {
      console.error("Failed to get stats, using localStorage:", error);
      return this.getContactStats();
    }
  }
}
