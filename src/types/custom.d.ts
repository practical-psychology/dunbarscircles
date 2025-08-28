// Type definitions for module aliases
declare module "@/lib/contact-storage" {
  import { StoredContact } from "../../../lib/contact-storage";
  export { StoredContact };
}

declare module "@/lib/contact-storage-enhanced" {
  import { EnhancedContactStorage } from "../../../lib/contact-storage-enhanced";
  export { EnhancedContactStorage };
}

declare module "@/components/firebase-status" {
  import { FC } from "react";
  const FirebaseStatus: FC;
  export default FirebaseStatus;
}

declare module "@/lib/contact-storage-simple" {
  import { StoredContact } from "../../../lib/contact-storage";

  class ContactStorageSimple {
    static getContacts(): Promise<StoredContact[]>;
    static saveContacts(contacts: StoredContact[]): Promise<void>;
    static addContact(contact: Omit<StoredContact, "id">): Promise<string>;
    static updateContact(
      id: string,
      updates: Partial<StoredContact>,
    ): Promise<void>;
    static deleteContact(id: string): Promise<void>;
  }

  export { ContactStorageSimple };
}

declare module "@/lib/firebase-simple" {
  export function initializeFirebase(): Promise<void>;
  export function getFirebaseApp(): any;
  export function getFirestore(): any;
  export function getAuth(): any;
}
