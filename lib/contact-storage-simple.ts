// Simplified contact storage using basic Firestore operations
// Avoids real-time listeners that cause 400 errors

import type { Person } from "../src/types/relationships";
import {
  collection,
  getDocs,
  doc,
  writeBatch,
  Timestamp,
  query,
  where,
} from "firebase/firestore";
import { simpleDb, isSimpleFirebaseAvailable } from "./firebase-simple";

const CONTACTS_STORAGE_KEY = "yakw_imported_contacts";
const CONTACTS_COLLECTION = "contacts";

export interface StoredContact extends Person {
  importDate: Date;
  source: "facebook" | "linkedin" | "manual";
  firestoreId?: string;
}

export class SimpleContactStorage {
  // Basic Firebase operations without real-time listeners
  static async saveContactsToFirebase(
    contacts: StoredContact[],
  ): Promise<void> {
    if (!isSimpleFirebaseAvailable() || !simpleDb) {
      throw new Error("Simple Firebase is not available");
    }

    try {
      console.log(`💾 Saving ${contacts.length} contacts to Firebase...`);

      const batch = writeBatch(simpleDb);
      const contactsRef = collection(simpleDb, CONTACTS_COLLECTION);

      contacts.forEach((contact, index) => {
        const docRef = doc(contactsRef, `contact_${Date.now()}_${index}`);
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
      console.log(
        `✅ Successfully saved ${contacts.length} contacts to Firebase`,
      );
    } catch (error) {
      console.error("❌ Failed to save contacts to Firebase:", error);
      throw error;
    }
  }

  static async loadContactsFromFirebase(): Promise<StoredContact[]> {
    if (!isSimpleFirebaseAvailable() || !simpleDb) {
      console.warn(
        "⚠️ Simple Firebase is not available, returning empty array",
      );
      return [];
    }

    try {
      console.log("📖 Loading contacts from Firebase...");

      const contactsRef = collection(simpleDb, CONTACTS_COLLECTION);
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

      console.log(`✅ Loaded ${contacts.length} contacts from Firebase`);
      return contacts;
    } catch (error) {
      console.error("❌ Failed to load contacts from Firebase:", error);
      return [];
    }
  }

  static async addContactsToFirebase(
    newContacts: Person[],
    source: "facebook" | "linkedin" | "manual",
  ): Promise<void> {
    if (!isSimpleFirebaseAvailable()) {
      throw new Error("Simple Firebase is not available");
    }

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
      } else {
        console.log("ℹ️ No new contacts to add (all duplicates)");
      }
    } catch (error) {
      console.error("❌ Failed to add contacts to Firebase:", error);
      throw error;
    }
  }

  static async clearContactsFromFirebase(): Promise<void> {
    if (!isSimpleFirebaseAvailable() || !simpleDb) {
      throw new Error("Simple Firebase is not available");
    }

    try {
      console.log("🗑️ Clearing all contacts from Firebase...");

      const contactsRef = collection(simpleDb, CONTACTS_COLLECTION);
      const querySnapshot = await getDocs(contactsRef);

      const batch = writeBatch(simpleDb);
      querySnapshot.forEach((document) => {
        batch.delete(document.ref);
      });

      await batch.commit();
      console.log("✅ All contacts cleared from Firebase");
    } catch (error) {
      console.error("❌ Failed to clear contacts from Firebase:", error);
      throw error;
    }
  }

  static async getContactsBySourceFromFirebase(
    source: "facebook" | "linkedin" | "manual",
  ): Promise<StoredContact[]> {
    if (!isSimpleFirebaseAvailable() || !simpleDb) {
      return [];
    }

    try {
      const contactsRef = collection(simpleDb, CONTACTS_COLLECTION);
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
      console.error(
        "❌ Failed to get contacts by source from Firebase:",
        error,
      );
      return [];
    }
  }

  // Test connection with a simple operation
  static async testConnection(): Promise<boolean> {
    if (!isSimpleFirebaseAvailable() || !simpleDb) {
      return false;
    }

    try {
      console.log("🧪 Testing Firebase connection...");

      // Try to read from the collection (this is a simple operation)
      const contactsRef = collection(simpleDb, CONTACTS_COLLECTION);
      await getDocs(contactsRef);

      console.log("✅ Firebase connection test successful");
      return true;
    } catch (error) {
      console.error("❌ Firebase connection test failed:", error);
      return false;
    }
  }

  // Hybrid methods that work with both Firebase and localStorage
  static async loadAllContacts(): Promise<StoredContact[]> {
    try {
      // Try simple Firebase first
      if (isSimpleFirebaseAvailable()) {
        const firebaseContacts = await this.loadContactsFromFirebase();
        if (firebaseContacts.length > 0) {
          return firebaseContacts;
        }
      }

      // Fallback to localStorage
      return this.loadContactsFromLocalStorage();
    } catch (error) {
      console.error(
        "❌ Failed to load from Firebase, using localStorage:",
        error,
      );
      return this.loadContactsFromLocalStorage();
    }
  }

  static async addAllContacts(
    newContacts: Person[],
    source: "facebook" | "linkedin" | "manual",
  ): Promise<void> {
    try {
      // Try simple Firebase first
      if (isSimpleFirebaseAvailable()) {
        await this.addContactsToFirebase(newContacts, source);
      }

      // Also save to localStorage as backup
      this.addContactsToLocalStorage(newContacts, source);
    } catch (error) {
      console.error(
        "❌ Failed to save to Firebase, using localStorage only:",
        error,
      );
      this.addContactsToLocalStorage(newContacts, source);
    }
  }

  // localStorage methods (backup)
  private static loadContactsFromLocalStorage(): StoredContact[] {
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
      console.error("❌ Failed to load contacts from localStorage:", error);
      return [];
    }
  }

  private static addContactsToLocalStorage(
    newContacts: Person[],
    source: "facebook" | "linkedin" | "manual",
  ): void {
    try {
      const existingContacts = this.loadContactsFromLocalStorage();
      const contactsToAdd: StoredContact[] = newContacts.map((contact) => ({
        ...contact,
        importDate: new Date(),
        source,
      }));

      // Avoid duplicates
      const filteredContacts = contactsToAdd.filter(
        (newContact) =>
          !existingContacts.some(
            (existing) =>
              existing.name === newContact.name &&
              existing.platform === newContact.platform,
          ),
      );

      const allContacts = [...existingContacts, ...filteredContacts];

      const serializedContacts = allContacts.map((contact) => ({
        ...contact,
        lastContact: contact.lastContact.toISOString(),
        importDate: contact.importDate.toISOString(),
      }));

      localStorage.setItem(
        CONTACTS_STORAGE_KEY,
        JSON.stringify(serializedContacts),
      );
    } catch (error) {
      console.error("❌ Failed to save contacts to localStorage:", error);
    }
  }
}
