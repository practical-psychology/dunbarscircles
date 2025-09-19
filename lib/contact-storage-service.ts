/**
 * Enhanced Contact Storage Service
 *
 * Provides comprehensive contact storage and persistence with:
 * - CRUD operations (create, read, update, delete)
 * - localStorage persistence with sessionStorage fallback
 * - Firebase Firestore integration for authenticated users with offline support
 * - Data migration utilities for existing relationship data
 * - Contact search and filtering functionality
 *
 * Requirements: FR-11 (User Authentication), NFR-7 (Data Privacy), DR-1 (Relationship Data Model)
 */

import type { Person } from "../src/types/relationships";
import type { Contact, ContactForm, ContactUpdate } from "./contact-models";
import { sanitizeContactData, validateContactData } from "./contact-models";
import { auth, db } from "../firebase-config";
import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  writeBatch,
  Timestamp,
  type Unsubscribe,
} from "firebase/firestore";
import { onAuthStateChanged, type User } from "firebase/auth";

// Storage keys
const CONTACTS_STORAGE_KEY = "yakw_contacts";

// Firestore collection name
const CONTACTS_COLLECTION = "user_contacts";

// Storage interfaces
export interface StoredContact extends Contact {
  firestoreId?: string;
  syncStatus?: "synced" | "pending" | "error";
  lastSyncAt?: Date;
}

export interface ContactSearchOptions {
  query?: string;
  levelIds?: string[];
  platforms?: string[];
  tags?: string[];
  minStrength?: number;
  maxStrength?: number;
  lastContactBefore?: Date;
  lastContactAfter?: Date;
  sortBy?: "name" | "lastContact" | "strength" | "createdAt" | "updatedAt";
  sortOrder?: "asc" | "desc";
  limit?: number;
  offset?: number;
}

export interface ContactOperationResult<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  source: "firestore" | "localStorage" | "sessionStorage";
  offline?: boolean;
}

export interface ContactStats {
  total: number;
  byLevel: Record<string, number>;
  byPlatform: Record<string, number>;
  byTags: Record<string, number>;
  averageStrength: number;
  lastUpdated: Date;
  syncStatus: {
    synced: number;
    pending: number;
    errors: number;
  };
}

export class ContactStorageService {
  private static instance: ContactStorageService;
  private currentUser: User | null = null;
  private isOnline: boolean = navigator.onLine;
  private syncQueue: StoredContact[] = [];
  private authUnsubscribe: Unsubscribe | null = null;
  private contactsUnsubscribe: Unsubscribe | null = null;

  private constructor() {
    this.initializeService();
  }

  public static getInstance(): ContactStorageService {
    if (!ContactStorageService.instance) {
      ContactStorageService.instance = new ContactStorageService();
    }
    return ContactStorageService.instance;
  }

  private initializeService(): void {
    // Monitor authentication state
    if (auth) {
      this.authUnsubscribe = onAuthStateChanged(auth, (user) => {
        this.currentUser = user;
        if (user) {
          this.enableFirestoreSync();
        } else {
          this.disableFirestoreSync();
        }
      });
    }

    // Monitor online/offline status
    window.addEventListener("online", () => {
      this.isOnline = true;
      this.processSyncQueue();
    });

    window.addEventListener("offline", () => {
      this.isOnline = false;
    });
  }

  private enableFirestoreSync(): void {
    // Enable Firestore sync when user is authenticated
    console.log("Firestore sync enabled");
  }

  private disableFirestoreSync(): void {
    // Disable Firestore sync when user is not authenticated
    console.log("Firestore sync disabled");
    if (this.contactsUnsubscribe) {
      this.contactsUnsubscribe();
      this.contactsUnsubscribe = null;
    }
  }

  private async processSyncQueue(): Promise<void> {
    if (
      !this.currentUser ||
      !this.isOnline ||
      !db ||
      this.syncQueue.length === 0
    ) {
      return;
    }

    const batch = writeBatch(db);
    const processedContacts: StoredContact[] = [];

    for (const contact of this.syncQueue) {
      try {
        const docRef = contact.firestoreId
          ? doc(db, CONTACTS_COLLECTION, contact.firestoreId)
          : doc(collection(db, CONTACTS_COLLECTION));

        const firestoreData = this.prepareForFirestore(contact);
        batch.set(docRef, firestoreData);

        contact.firestoreId = docRef.id;
        contact.syncStatus = "synced";
        contact.lastSyncAt = new Date();
        processedContacts.push(contact);
      } catch (error) {
        console.error("Failed to prepare contact for sync:", error);
        contact.syncStatus = "error";
      }
    }

    try {
      await batch.commit();
      this.syncQueue = this.syncQueue.filter(
        (c) => !processedContacts.includes(c),
      );

      // Update local storage with sync status
      for (const contact of processedContacts) {
        await this.updateLocalContact(contact.id, {
          firestoreId: contact.firestoreId,
          syncStatus: contact.syncStatus,
          lastSyncAt: contact.lastSyncAt,
        });
      }
    } catch (error) {
      console.error("Failed to sync contacts to Firestore:", error);
    }
  }

  private addToSyncQueue(contact: StoredContact): void {
    const existingIndex = this.syncQueue.findIndex((c) => c.id === contact.id);
    if (existingIndex >= 0) {
      this.syncQueue[existingIndex] = contact;
    } else {
      this.syncQueue.push(contact);
    }
  }

  private prepareForFirestore(contact: StoredContact): any {
    const { firestoreId, syncStatus, lastSyncAt, ...firestoreData } = contact;
    return {
      ...firestoreData,
      createdAt: Timestamp.fromDate(contact.createdAt),
      updatedAt: Timestamp.fromDate(contact.updatedAt),
      lastContact: Timestamp.fromDate(contact.lastContact),
      userId: this.currentUser?.uid,
    };
  }

  private parseFromFirestore(data: any, docId: string): StoredContact {
    return {
      ...data,
      firestoreId: docId,
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date(),
      lastContact: data.lastContact?.toDate() || new Date(),
      syncStatus: "synced" as const,
      lastSyncAt: new Date(),
    };
  }

  private async saveToLocalStorage(
    contacts: StoredContact[],
  ): Promise<ContactOperationResult<StoredContact[]>> {
    try {
      let existingContacts: StoredContact[] = [];

      // Load existing contacts
      const existingResult = await this.loadFromLocalStorage();
      if (existingResult.success && existingResult.data) {
        existingContacts = existingResult.data;
      }

      // Update or add contacts
      for (const contact of contacts) {
        const existingIndex = existingContacts.findIndex(
          (c) => c.id === contact.id,
        );
        if (existingIndex >= 0) {
          existingContacts[existingIndex] = contact;
        } else {
          existingContacts.push(contact);
        }
      }

      // Save to localStorage
      const dataToStore = JSON.stringify(existingContacts);

      try {
        localStorage.setItem(CONTACTS_STORAGE_KEY, dataToStore);
        return {
          success: true,
          data: contacts,
          source: "localStorage",
        };
      } catch (localStorageError) {
        // Fallback to sessionStorage
        try {
          sessionStorage.setItem(CONTACTS_STORAGE_KEY, dataToStore);
          return {
            success: true,
            data: contacts,
            source: "sessionStorage",
          };
        } catch (sessionStorageError) {
          return {
            success: false,
            error: "Failed to save to both localStorage and sessionStorage",
            source: "localStorage",
          };
        }
      }
    } catch (error) {
      return {
        success: false,
        error: `Failed to save contacts: ${error instanceof Error ? error.message : "Unknown error"}`,
        source: "localStorage",
      };
    }
  }

  private async replaceAllContactsInLocalStorage(
    contacts: StoredContact[],
  ): Promise<ContactOperationResult<StoredContact[]>> {
    try {
      const dataToStore = JSON.stringify(contacts);

      try {
        localStorage.setItem(CONTACTS_STORAGE_KEY, dataToStore);
        return {
          success: true,
          data: contacts,
          source: "localStorage",
        };
      } catch (localStorageError) {
        // Fallback to sessionStorage
        try {
          sessionStorage.setItem(CONTACTS_STORAGE_KEY, dataToStore);
          return {
            success: true,
            data: contacts,
            source: "sessionStorage",
          };
        } catch (sessionStorageError) {
          return {
            success: false,
            error: "Failed to save to both localStorage and sessionStorage",
            source: "localStorage",
          };
        }
      }
    } catch (error) {
      return {
        success: false,
        error: `Failed to replace contacts: ${error instanceof Error ? error.message : "Unknown error"}`,
        source: "localStorage",
      };
    }
  }

  private async loadFromLocalStorage(): Promise<
    ContactOperationResult<StoredContact[]>
  > {
    try {
      let data: string | null = null;
      let source: "localStorage" | "sessionStorage" = "localStorage";

      // Try localStorage first
      try {
        data = localStorage.getItem(CONTACTS_STORAGE_KEY);
      } catch (error) {
        console.warn("Failed to access localStorage:", error);
      }

      // Fallback to sessionStorage
      if (!data) {
        try {
          data = sessionStorage.getItem(CONTACTS_STORAGE_KEY);
          source = "sessionStorage";
        } catch (error) {
          console.warn("Failed to access sessionStorage:", error);
        }
      }

      if (!data) {
        return {
          success: true,
          data: [],
          source,
        };
      }

      const contacts: StoredContact[] = JSON.parse(data);

      // Parse dates
      const parsedContacts = contacts.map((contact) => ({
        ...contact,
        createdAt: new Date(contact.createdAt),
        updatedAt: new Date(contact.updatedAt),
        lastContact: new Date(contact.lastContact),
        lastSyncAt: contact.lastSyncAt
          ? new Date(contact.lastSyncAt)
          : undefined,
      }));

      return {
        success: true,
        data: parsedContacts,
        source,
      };
    } catch (error) {
      return {
        success: false,
        error: `Failed to load contacts: ${error instanceof Error ? error.message : "Unknown error"}`,
        source: "localStorage",
      };
    }
  }

  private async loadFromFirestore(
    options: ContactSearchOptions = {},
  ): Promise<StoredContact[]> {
    if (!this.currentUser || !db) {
      return [];
    }

    try {
      let q = query(
        collection(db, CONTACTS_COLLECTION),
        where("userId", "==", this.currentUser.uid),
      );

      // Apply filters
      if (options.levelIds && options.levelIds.length > 0) {
        q = query(q, where("levelId", "in", options.levelIds));
      }

      if (options.platforms && options.platforms.length > 0) {
        q = query(q, where("platform", "in", options.platforms));
      }

      // Apply sorting
      if (options.sortBy) {
        const direction = options.sortOrder === "desc" ? "desc" : "asc";
        q = query(q, orderBy(options.sortBy, direction));
      }

      // Apply limit
      if (options.limit) {
        q = query(q, limit(options.limit));
      }

      const querySnapshot = await getDocs(q);
      const contacts: StoredContact[] = [];

      querySnapshot.forEach((doc) => {
        const contact = this.parseFromFirestore(doc.data(), doc.id);
        contacts.push(contact);
      });

      return contacts;
    } catch (error) {
      console.error("Failed to load from Firestore:", error);
      return [];
    }
  }

  private filterContacts(
    contacts: StoredContact[],
    options: ContactSearchOptions,
  ): StoredContact[] {
    let filtered = [...contacts];

    // Text search
    if (options.query) {
      const query = options.query.toLowerCase();
      filtered = filtered.filter(
        (contact) =>
          contact.name.toLowerCase().includes(query) ||
          contact.email?.toLowerCase().includes(query) ||
          contact.phone?.includes(query) ||
          contact.notes?.toLowerCase().includes(query) ||
          contact.tags?.some((tag) => tag.toLowerCase().includes(query)),
      );
    }

    // Level filter
    if (options.levelIds && options.levelIds.length > 0) {
      filtered = filtered.filter((contact) =>
        options.levelIds!.includes(contact.levelId),
      );
    }

    // Platform filter
    if (options.platforms && options.platforms.length > 0) {
      filtered = filtered.filter((contact) =>
        options.platforms!.includes(contact.platform),
      );
    }

    // Tags filter
    if (options.tags && options.tags.length > 0) {
      filtered = filtered.filter((contact) =>
        contact.tags?.some((tag) => options.tags!.includes(tag)),
      );
    }

    // Strength range filter
    if (options.minStrength !== undefined) {
      filtered = filtered.filter(
        (contact) => contact.strength >= options.minStrength!,
      );
    }
    if (options.maxStrength !== undefined) {
      filtered = filtered.filter(
        (contact) => contact.strength <= options.maxStrength!,
      );
    }

    // Date range filters
    if (options.lastContactBefore) {
      filtered = filtered.filter(
        (contact) => contact.lastContact <= options.lastContactBefore!,
      );
    }
    if (options.lastContactAfter) {
      filtered = filtered.filter(
        (contact) => contact.lastContact >= options.lastContactAfter!,
      );
    }

    // Sorting
    if (options.sortBy) {
      filtered.sort((a, b) => {
        let aValue: any = a[options.sortBy as keyof StoredContact];
        let bValue: any = b[options.sortBy as keyof StoredContact];

        if (aValue instanceof Date) aValue = aValue.getTime();
        if (bValue instanceof Date) bValue = bValue.getTime();

        if (typeof aValue === "string") {
          aValue = aValue.toLowerCase();
          bValue = bValue.toLowerCase();
        }

        const comparison = aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
        return options.sortOrder === "desc" ? -comparison : comparison;
      });
    }

    // Pagination
    if (options.offset || options.limit) {
      const start = options.offset || 0;
      const end = options.limit ? start + options.limit : undefined;
      filtered = filtered.slice(start, end);
    }

    return filtered;
  }

  private async updateLocalContact(
    contactId: string,
    updates: Partial<StoredContact>,
  ): Promise<ContactOperationResult<StoredContact>> {
    try {
      const existingResult = await this.loadFromLocalStorage();
      if (!existingResult.success || !existingResult.data) {
        return {
          success: false,
          error: "Failed to load existing contacts",
          source: "localStorage",
        };
      }

      const contacts = existingResult.data;
      const contactIndex = contacts.findIndex((c) => c.id === contactId);

      if (contactIndex === -1) {
        return {
          success: false,
          error: `Contact with ID '${contactId}' not found`,
          source: "localStorage",
        };
      }

      const updatedContact = { ...contacts[contactIndex], ...updates };
      contacts[contactIndex] = updatedContact;

      const saveResult = await this.saveToLocalStorage(contacts);
      if (!saveResult.success) {
        return {
          success: false,
          error: saveResult.error,
          source: saveResult.source,
        };
      }

      return {
        success: true,
        data: updatedContact,
        source: saveResult.source,
      };
    } catch (error) {
      return {
        success: false,
        error: `Failed to update contact: ${error instanceof Error ? error.message : "Unknown error"}`,
        source: "localStorage",
      };
    }
  }

  private async deleteFromLocalStorage(
    contactId: string,
  ): Promise<ContactOperationResult<{ deleted: boolean }>> {
    try {
      const existingResult = await this.loadFromLocalStorage();
      if (!existingResult.success || !existingResult.data) {
        return {
          success: false,
          error: "Failed to load existing contacts",
          source: "localStorage",
        };
      }

      const contacts = existingResult.data;
      const contactIndex = contacts.findIndex((c) => c.id === contactId);

      if (contactIndex === -1) {
        return {
          success: false,
          error: `Contact with ID '${contactId}' not found`,
          source: "localStorage",
        };
      }

      contacts.splice(contactIndex, 1);
      const saveResult = await this.replaceAllContactsInLocalStorage(contacts);

      if (!saveResult.success) {
        return {
          success: false,
          error: saveResult.error,
          source: saveResult.source,
        };
      }

      return {
        success: true,
        data: { deleted: true },
        source: saveResult.source,
      };
    } catch (error) {
      return {
        success: false,
        error: `Failed to delete contact: ${error instanceof Error ? error.message : "Unknown error"}`,
        source: "localStorage",
      };
    }
  }

  public destroy(): void {
    if (this.authUnsubscribe) {
      this.authUnsubscribe();
    }
    if (this.contactsUnsubscribe) {
      this.contactsUnsubscribe();
    }
  }

  // CRUD Operations

  /**
   * Create a new contact
   */
  public async createContact(
    contactData: ContactForm,
  ): Promise<ContactOperationResult<StoredContact>> {
    try {
      // Validate input data
      const validation = validateContactData.form(contactData);
      if (!validation.success) {
        return {
          success: false,
          error: `Validation failed: ${validation.error.errors.map((e) => e.message).join(", ")}`,
          source: "localStorage",
        };
      }

      // Sanitize data
      const sanitizedData = {
        ...contactData,
        name: sanitizeContactData.name(contactData.name),
        email: contactData.email
          ? sanitizeContactData.email(contactData.email)
          : undefined,
        phone: contactData.phone
          ? sanitizeContactData.phone(contactData.phone)
          : undefined,
        notes: contactData.notes
          ? sanitizeContactData.notes(contactData.notes)
          : undefined,
        platform: sanitizeContactData.platform(contactData.platform),
        tags: contactData.tags
          ? sanitizeContactData.tags(contactData.tags)
          : undefined,
      };

      // Create contact object
      const contact: StoredContact = {
        id: `contact_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
        ...sanitizedData,
        createdAt: new Date(),
        updatedAt: new Date(),
        lastContact: new Date(),
        decayRate: 0.1, // Default decay rate
        syncStatus: this.currentUser && this.isOnline ? "pending" : undefined,
      };

      // Save to local storage first
      const localResult = await this.saveToLocalStorage([contact]);
      if (!localResult.success) {
        return {
          success: false,
          error: localResult.error,
          source: localResult.source,
        };
      }

      // Try to sync to Firestore if user is authenticated and online
      if (this.currentUser && this.isOnline && db) {
        try {
          const docRef = doc(collection(db, CONTACTS_COLLECTION));
          const firestoreData = this.prepareForFirestore(contact);
          await setDoc(docRef, firestoreData);

          contact.firestoreId = docRef.id;
          contact.syncStatus = "synced";
          contact.lastSyncAt = new Date();

          // Update local storage with sync info
          await this.updateLocalContact(contact.id, {
            firestoreId: contact.firestoreId,
            syncStatus: contact.syncStatus,
            lastSyncAt: contact.lastSyncAt,
          });
        } catch (firestoreError) {
          console.warn(
            "Failed to sync to Firestore, will retry later:",
            firestoreError,
          );
          this.addToSyncQueue(contact);
        }
      }

      return {
        success: true,
        data: contact,
        source:
          this.currentUser && contact.firestoreId
            ? "firestore"
            : "localStorage",
        offline: !this.isOnline,
      };
    } catch (error) {
      return {
        success: false,
        error: `Failed to create contact: ${error instanceof Error ? error.message : "Unknown error"}`,
        source: "localStorage",
      };
    }
  }

  /**
   * Read contacts with optional filtering and search
   */
  public async readContacts(
    options: ContactSearchOptions = {},
  ): Promise<ContactOperationResult<StoredContact[]>> {
    try {
      let contacts: StoredContact[] = [];
      let source: "firestore" | "localStorage" | "sessionStorage" =
        "localStorage";

      // Try to load from Firestore first if user is authenticated and online
      if (this.currentUser && this.isOnline && db) {
        try {
          const firestoreContacts = await this.loadFromFirestore(options);
          if (firestoreContacts.length > 0) {
            contacts = firestoreContacts;
            source = "firestore";

            // Update local storage with latest data
            await this.saveToLocalStorage(contacts);
          }
        } catch (firestoreError) {
          console.warn(
            "Failed to load from Firestore, using local storage:",
            firestoreError,
          );
        }
      }

      // Fallback to local storage if Firestore failed or user not authenticated
      if (contacts.length === 0) {
        const localResult = await this.loadFromLocalStorage();
        contacts = localResult.data || [];
        source = localResult.source;
      }

      // Apply client-side filtering and search
      const filteredContacts = this.filterContacts(contacts, options);

      return {
        success: true,
        data: filteredContacts,
        source,
        offline: !this.isOnline,
      };
    } catch (error) {
      return {
        success: false,
        error: `Failed to read contacts: ${error instanceof Error ? error.message : "Unknown error"}`,
        source: "localStorage",
      };
    }
  }

  /**
   * Read a single contact by ID
   */
  public async readContact(
    contactId: string,
  ): Promise<ContactOperationResult<StoredContact>> {
    try {
      // Try Firestore first if user is authenticated and online
      if (this.currentUser && this.isOnline && db) {
        try {
          // First try to find by document ID
          const docRef = doc(db, CONTACTS_COLLECTION, contactId);
          const docSnap = await getDoc(docRef);

          if (docSnap.exists()) {
            const contact = this.parseFromFirestore(docSnap.data(), docSnap.id);
            return {
              success: true,
              data: contact,
              source: "firestore",
            };
          }

          // If not found by document ID, search by contact ID field
          const q = query(
            collection(db, CONTACTS_COLLECTION),
            where("id", "==", contactId),
            limit(1),
          );
          const querySnapshot = await getDocs(q);

          if (!querySnapshot.empty) {
            const doc = querySnapshot.docs[0];
            const contact = this.parseFromFirestore(doc.data(), doc.id);
            return {
              success: true,
              data: contact,
              source: "firestore",
            };
          }
        } catch (firestoreError) {
          console.warn(
            "Failed to load from Firestore, trying local storage:",
            firestoreError,
          );
        }
      }

      // Fallback to local storage
      const localResult = await this.loadFromLocalStorage();
      const contacts = localResult.data || [];
      const contact = contacts.find(
        (c) => c.id === contactId || c.firestoreId === contactId,
      );

      if (contact) {
        return {
          success: true,
          data: contact,
          source: localResult.source,
          offline: !this.isOnline,
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
        error: `Failed to read contact: ${error instanceof Error ? error.message : "Unknown error"}`,
        source: "localStorage",
      };
    }
  }

  /**
   * Update an existing contact
   */
  public async updateContact(
    contactId: string,
    updates: ContactUpdate,
  ): Promise<ContactOperationResult<StoredContact>> {
    try {
      // Validate update data
      const validation = validateContactData.update({
        ...updates,
        id: contactId,
      });
      if (!validation.success) {
        return {
          success: false,
          error: `Validation failed: ${validation.error.errors.map((e) => e.message).join(", ")}`,
          source: "localStorage",
        };
      }

      // Get existing contact
      const existingResult = await this.readContact(contactId);
      if (!existingResult.success || !existingResult.data) {
        return {
          success: false,
          error: `Contact with ID '${contactId}' not found`,
          source: "localStorage",
        };
      }

      const existingContact = existingResult.data;

      // Sanitize update data
      const sanitizedUpdates: Partial<StoredContact> = {};
      if (updates.name !== undefined)
        sanitizedUpdates.name = sanitizeContactData.name(updates.name);
      if (updates.email !== undefined)
        sanitizedUpdates.email = updates.email
          ? sanitizeContactData.email(updates.email)
          : undefined;
      if (updates.phone !== undefined)
        sanitizedUpdates.phone = updates.phone
          ? sanitizeContactData.phone(updates.phone)
          : undefined;
      if (updates.notes !== undefined)
        sanitizedUpdates.notes = updates.notes
          ? sanitizeContactData.notes(updates.notes)
          : undefined;
      if (updates.platform !== undefined)
        sanitizedUpdates.platform = sanitizeContactData.platform(
          updates.platform,
        );
      if (updates.tags !== undefined)
        sanitizedUpdates.tags = updates.tags
          ? sanitizeContactData.tags(updates.tags)
          : undefined;
      if (updates.levelId !== undefined)
        sanitizedUpdates.levelId = updates.levelId;
      if (updates.contactFrequency !== undefined)
        sanitizedUpdates.contactFrequency = updates.contactFrequency;
      if (updates.strength !== undefined)
        sanitizedUpdates.strength = updates.strength;
      if (updates.lastContact !== undefined)
        sanitizedUpdates.lastContact = updates.lastContact;

      // Create updated contact
      const updatedContact: StoredContact = {
        ...existingContact,
        ...sanitizedUpdates,
        updatedAt: new Date(),
        syncStatus:
          this.currentUser && this.isOnline
            ? "pending"
            : existingContact.syncStatus,
      };

      // Update in local storage
      const localResult = await this.updateLocalContact(
        contactId,
        updatedContact,
      );
      if (!localResult.success) {
        return {
          success: false,
          error: localResult.error,
          source: localResult.source,
        };
      }

      // Try to sync to Firestore if user is authenticated and online
      if (
        this.currentUser &&
        this.isOnline &&
        db &&
        existingContact.firestoreId
      ) {
        try {
          const docRef = doc(
            db,
            CONTACTS_COLLECTION,
            existingContact.firestoreId,
          );
          const firestoreData = this.prepareForFirestore(updatedContact);
          await updateDoc(docRef, firestoreData);

          updatedContact.syncStatus = "synced";
          updatedContact.lastSyncAt = new Date();

          // Update local storage with sync info
          await this.updateLocalContact(contactId, {
            syncStatus: updatedContact.syncStatus,
            lastSyncAt: updatedContact.lastSyncAt,
          });
        } catch (firestoreError) {
          console.warn(
            "Failed to sync update to Firestore, will retry later:",
            firestoreError,
          );
          this.addToSyncQueue(updatedContact);
        }
      }

      return {
        success: true,
        data: updatedContact,
        source:
          this.currentUser && updatedContact.firestoreId
            ? "firestore"
            : "localStorage",
        offline: !this.isOnline,
      };
    } catch (error) {
      return {
        success: false,
        error: `Failed to update contact: ${error instanceof Error ? error.message : "Unknown error"}`,
        source: "localStorage",
      };
    }
  }

  /**
   * Delete a contact
   */
  public async deleteContact(
    contactId: string,
  ): Promise<ContactOperationResult<{ deleted: boolean }>> {
    try {
      // Get existing contact to check if it exists in Firestore
      const existingResult = await this.readContact(contactId);
      if (!existingResult.success || !existingResult.data) {
        return {
          success: false,
          error: `Contact with ID '${contactId}' not found`,
          source: "localStorage",
        };
      }

      const existingContact = existingResult.data;

      // Delete from Firestore if it exists there
      if (
        this.currentUser &&
        this.isOnline &&
        db &&
        existingContact.firestoreId
      ) {
        try {
          const docRef = doc(
            db,
            CONTACTS_COLLECTION,
            existingContact.firestoreId,
          );
          await deleteDoc(docRef);
        } catch (firestoreError) {
          console.warn("Failed to delete from Firestore:", firestoreError);
          // Continue with local deletion even if Firestore fails
        }
      }

      // Delete from local storage
      const localResult = await this.deleteFromLocalStorage(contactId);
      if (!localResult.success) {
        return {
          success: false,
          error: localResult.error,
          source: localResult.source,
        };
      }

      return {
        success: true,
        data: { deleted: true },
        source:
          this.currentUser && existingContact.firestoreId
            ? "firestore"
            : "localStorage",
        offline: !this.isOnline,
      };
    } catch (error) {
      return {
        success: false,
        error: `Failed to delete contact: ${error instanceof Error ? error.message : "Unknown error"}`,
        source: "localStorage",
      };
    }
  }

  // Batch Operations

  /**
   * Create multiple contacts in batch
   */
  public async createContacts(
    contactsData: ContactForm[],
  ): Promise<ContactOperationResult<StoredContact[]>> {
    try {
      const results: StoredContact[] = [];
      const errors: string[] = [];

      for (const contactData of contactsData) {
        const result = await this.createContact(contactData);
        if (result.success && result.data) {
          results.push(result.data);
        } else {
          errors.push(`Failed to create ${contactData.name}: ${result.error}`);
        }
      }

      if (errors.length > 0 && results.length === 0) {
        return {
          success: false,
          error: `All contacts failed to create: ${errors.join(", ")}`,
          source: "localStorage",
        };
      }

      return {
        success: true,
        data: results,
        error:
          errors.length > 0
            ? `Some contacts failed: ${errors.join(", ")}`
            : undefined,
        source: "localStorage",
      };
    } catch (error) {
      return {
        success: false,
        error: `Batch create failed: ${error instanceof Error ? error.message : "Unknown error"}`,
        source: "localStorage",
      };
    }
  }

  /**
   * Update multiple contacts in batch
   */
  public async updateContacts(
    updates: Array<{ id: string; data: ContactUpdate }>,
  ): Promise<ContactOperationResult<StoredContact[]>> {
    try {
      const results: StoredContact[] = [];
      const errors: string[] = [];

      for (const update of updates) {
        const result = await this.updateContact(update.id, update.data);
        if (result.success && result.data) {
          results.push(result.data);
        } else {
          errors.push(`Failed to update ${update.id}: ${result.error}`);
        }
      }

      if (errors.length > 0 && results.length === 0) {
        return {
          success: false,
          error: `All updates failed: ${errors.join(", ")}`,
          source: "localStorage",
        };
      }

      return {
        success: true,
        data: results,
        error:
          errors.length > 0
            ? `Some updates failed: ${errors.join(", ")}`
            : undefined,
        source: "localStorage",
      };
    } catch (error) {
      return {
        success: false,
        error: `Batch update failed: ${error instanceof Error ? error.message : "Unknown error"}`,
        source: "localStorage",
      };
    }
  }

  /**
   * Delete multiple contacts in batch
   */
  public async deleteContacts(
    contactIds: string[],
  ): Promise<ContactOperationResult<{ deleted: number; failed: number }>> {
    try {
      let deleted = 0;
      let failed = 0;
      const errors: string[] = [];

      for (const contactId of contactIds) {
        const result = await this.deleteContact(contactId);
        if (result.success) {
          deleted++;
        } else {
          failed++;
          errors.push(`Failed to delete ${contactId}: ${result.error}`);
        }
      }

      return {
        success: deleted > 0,
        data: { deleted, failed },
        error: errors.length > 0 ? errors.join(", ") : undefined,
        source: "localStorage",
      };
    } catch (error) {
      return {
        success: false,
        error: `Batch delete failed: ${error instanceof Error ? error.message : "Unknown error"}`,
        data: { deleted: 0, failed: contactIds.length },
        source: "localStorage",
      };
    }
  }

  // Data Migration Utilities

  /**
   * Migrate existing relationship data to contact format
   */
  public async migrateFromRelationshipData(
    relationships: Person[],
  ): Promise<ContactOperationResult<{ migrated: number; skipped: number }>> {
    try {
      let migrated = 0;
      let skipped = 0;
      const errors: string[] = [];

      for (const relationship of relationships) {
        try {
          // Check if contact already exists
          const existingResult = await this.readContacts({
            query: relationship.name,
            limit: 1,
          });

          if (
            existingResult.success &&
            existingResult.data &&
            existingResult.data.length > 0
          ) {
            const existing = existingResult.data[0];
            if (
              existing.name.toLowerCase() === relationship.name.toLowerCase() &&
              existing.platform === relationship.platform
            ) {
              skipped++;
              continue;
            }
          }

          // Convert Person to ContactForm
          const contactData: ContactForm = {
            name: relationship.name,
            levelId: relationship.levelId,
            platform: relationship.platform,
            contactFrequency: relationship.contactFrequency,
            strength: relationship.strength,
            // Set reasonable defaults for new fields
            email: undefined,
            phone: undefined,
            notes: `Migrated from relationship data on ${new Date().toLocaleDateString()}`,
            tags: ["migrated"],
          };

          const result = await this.createContact(contactData);
          if (result.success) {
            migrated++;
          } else {
            skipped++;
            errors.push(
              `Failed to migrate ${relationship.name}: ${result.error}`,
            );
          }
        } catch (error) {
          skipped++;
          errors.push(
            `Error migrating ${relationship.name}: ${error instanceof Error ? error.message : "Unknown error"}`,
          );
        }
      }

      return {
        success: migrated > 0,
        data: { migrated, skipped },
        error:
          errors.length > 0
            ? `Migration completed with errors: ${errors.slice(0, 5).join(", ")}${errors.length > 5 ? "..." : ""}`
            : undefined,
        source: "localStorage",
      };
    } catch (error) {
      return {
        success: false,
        error: `Migration failed: ${error instanceof Error ? error.message : "Unknown error"}`,
        data: { migrated: 0, skipped: relationships.length },
        source: "localStorage",
      };
    }
  }

  /**
   * Migrate from legacy contact storage formats
   */
  public async migrateFromLegacyStorage(): Promise<
    ContactOperationResult<{ migrated: number; errors: string[] }>
  > {
    try {
      const errors: string[] = [];
      let migrated = 0;

      // Try to load from various legacy storage keys
      const legacyKeys = [
        "yakw_imported_contacts",
        "yakw_relationships",
        "dunbar_contacts",
        "social_contacts",
      ];

      for (const key of legacyKeys) {
        try {
          const legacyData = localStorage.getItem(key);
          if (!legacyData) continue;

          const parsed = JSON.parse(legacyData);
          if (!Array.isArray(parsed)) continue;

          for (const item of parsed) {
            try {
              // Attempt to convert legacy format to current format
              const contactData: ContactForm = {
                name: item.name || "Unknown",
                levelId: item.levelId || item.level || "recognition-group",
                platform: item.platform || item.source || "legacy",
                contactFrequency: item.contactFrequency || 30,
                strength: item.strength || 0.5,
                email: item.email,
                phone: item.phone,
                notes: item.notes || `Migrated from legacy storage (${key})`,
                tags: item.tags || ["legacy"],
              };

              const result = await this.createContact(contactData);
              if (result.success) {
                migrated++;
              } else {
                errors.push(`Failed to migrate ${item.name}: ${result.error}`);
              }
            } catch (itemError) {
              errors.push(
                `Error processing legacy item: ${itemError instanceof Error ? itemError.message : "Unknown error"}`,
              );
            }
          }

          // Remove legacy data after successful migration
          if (migrated > 0) {
            localStorage.removeItem(key);
          }
        } catch (keyError) {
          errors.push(
            `Error processing legacy key ${key}: ${keyError instanceof Error ? keyError.message : "Unknown error"}`,
          );
        }
      }

      return {
        success: migrated > 0,
        data: { migrated, errors },
        source: "localStorage",
      };
    } catch (error) {
      return {
        success: false,
        error: `Legacy migration failed: ${error instanceof Error ? error.message : "Unknown error"}`,
        data: {
          migrated: 0,
          errors: [error instanceof Error ? error.message : "Unknown error"],
        },
        source: "localStorage",
      };
    }
  }

  // Advanced Search and Filtering

  /**
   * Search contacts with advanced text search capabilities
   */
  public async searchContacts(
    searchQuery: string,
    options: Omit<ContactSearchOptions, "query"> = {},
  ): Promise<ContactOperationResult<StoredContact[]>> {
    try {
      // Prepare search terms
      const terms = searchQuery
        .toLowerCase()
        .split(/\s+/)
        .filter((term) => term.length > 0);
      if (terms.length === 0) {
        return await this.readContacts(options);
      }

      // Load all contacts
      const allContactsResult = await this.readContacts();
      if (!allContactsResult.success || !allContactsResult.data) {
        return allContactsResult;
      }

      // Advanced text search with scoring
      const searchResults = allContactsResult.data
        .map((contact) => {
          let score = 0;
          const searchableText = [
            contact.name,
            contact.email || "",
            contact.phone || "",
            contact.notes || "",
            contact.platform,
            ...(contact.tags || []),
          ]
            .join(" ")
            .toLowerCase();

          // Calculate relevance score
          for (const term of terms) {
            if (contact.name.toLowerCase().includes(term)) {
              score += 10; // Name matches are most important
            }
            if (contact.email?.toLowerCase().includes(term)) {
              score += 5;
            }
            if (contact.platform.toLowerCase().includes(term)) {
              score += 3;
            }
            if (contact.tags?.some((tag) => tag.toLowerCase().includes(term))) {
              score += 4;
            }
            if (contact.notes?.toLowerCase().includes(term)) {
              score += 2;
            }
            if (searchableText.includes(term)) {
              score += 1;
            }
          }

          return { contact, score };
        })
        .filter((result) => result.score > 0);

      // Sort by relevance score
      searchResults.sort((a, b) => b.score - a.score);

      // Extract contacts and apply additional filters
      const contacts = searchResults.map((result) => result.contact);
      const filteredContacts = this.filterContacts(contacts, options);

      return {
        success: true,
        data: filteredContacts,
        source: allContactsResult.source,
        offline: allContactsResult.offline,
      };
    } catch (error) {
      return {
        success: false,
        error: `Search failed: ${error instanceof Error ? error.message : "Unknown error"}`,
        source: "localStorage",
      };
    }
  }

  /**
   * Get contacts that need attention (overdue for contact)
   */
  public async getContactsNeedingAttention(): Promise<
    ContactOperationResult<
      Array<StoredContact & { daysSinceContact: number; isOverdue: boolean }>
    >
  > {
    try {
      const allContactsResult = await this.readContacts();
      if (!allContactsResult.success || !allContactsResult.data) {
        return {
          success: false,
          error: allContactsResult.error,
          source: allContactsResult.source,
        };
      }

      const now = new Date();
      const contactsWithStatus = allContactsResult.data.map((contact) => {
        const daysSinceContact = Math.floor(
          (now.getTime() - contact.lastContact.getTime()) /
            (1000 * 60 * 60 * 24),
        );
        const isOverdue = daysSinceContact > contact.contactFrequency;

        return {
          ...contact,
          daysSinceContact,
          isOverdue,
        };
      });

      // Filter to only overdue contacts and sort by how overdue they are
      const overdueContacts = contactsWithStatus
        .filter((contact) => contact.isOverdue)
        .sort((a, b) => {
          const aOverdueDays = a.daysSinceContact - a.contactFrequency;
          const bOverdueDays = b.daysSinceContact - b.contactFrequency;
          return bOverdueDays - aOverdueDays; // Most overdue first
        });

      return {
        success: true,
        data: overdueContacts,
        source: allContactsResult.source,
        offline: allContactsResult.offline,
      };
    } catch (error) {
      return {
        success: false,
        error: `Failed to get contacts needing attention: ${error instanceof Error ? error.message : "Unknown error"}`,
        source: "localStorage",
      };
    }
  }

  /**
   * Get contact statistics and analytics
   */
  public async getContactStats(): Promise<
    ContactOperationResult<ContactStats>
  > {
    try {
      const allContactsResult = await this.readContacts();
      if (!allContactsResult.success || !allContactsResult.data) {
        return {
          success: false,
          error: allContactsResult.error,
          source: allContactsResult.source,
        };
      }

      const contacts = allContactsResult.data;
      const total = contacts.length;

      // Calculate statistics
      const byLevel: Record<string, number> = {};
      const byPlatform: Record<string, number> = {};
      const byTags: Record<string, number> = {};
      let totalStrength = 0;
      let lastUpdated = new Date(0);
      const syncStatus = { synced: 0, pending: 0, errors: 0 };

      for (const contact of contacts) {
        // Level distribution
        byLevel[contact.levelId] = (byLevel[contact.levelId] || 0) + 1;

        // Platform distribution
        byPlatform[contact.platform] = (byPlatform[contact.platform] || 0) + 1;

        // Tags distribution
        if (contact.tags) {
          for (const tag of contact.tags) {
            byTags[tag] = (byTags[tag] || 0) + 1;
          }
        }

        // Strength calculation
        totalStrength += contact.strength;

        // Last updated
        if (contact.updatedAt > lastUpdated) {
          lastUpdated = contact.updatedAt;
        }

        // Sync status
        if (contact.syncStatus === "synced") {
          syncStatus.synced++;
        } else if (contact.syncStatus === "pending") {
          syncStatus.pending++;
        } else if (contact.syncStatus === "error") {
          syncStatus.errors++;
        }
      }

      const averageStrength = total > 0 ? totalStrength / total : 0;

      const stats: ContactStats = {
        total,
        byLevel,
        byPlatform,
        byTags,
        averageStrength,
        lastUpdated,
        syncStatus,
      };

      return {
        success: true,
        data: stats,
        source: allContactsResult.source,
        offline: allContactsResult.offline,
      };
    } catch (error) {
      return {
        success: false,
        error: `Failed to get contact statistics: ${error instanceof Error ? error.message : "Unknown error"}`,
        source: "localStorage",
      };
    }
  }

  /**
   * Clear all contacts with confirmation
   */
  public async clearAllContacts(
    confirmationToken: string = "CLEAR_ALL_CONTACTS",
  ): Promise<ContactOperationResult<{ deleted: number }>> {
    if (confirmationToken !== "CLEAR_ALL_CONTACTS") {
      return {
        success: false,
        error:
          'Invalid confirmation token. Use "CLEAR_ALL_CONTACTS" to confirm.',
        source: "localStorage",
      };
    }

    try {
      // Get all contacts first to count them
      const allContactsResult = await this.readContacts();
      const contactCount = allContactsResult.data?.length || 0;

      // Clear from Firestore if user is authenticated
      if (this.currentUser && db) {
        try {
          const q = query(
            collection(db, CONTACTS_COLLECTION),
            where("userId", "==", this.currentUser.uid),
          );
          const querySnapshot = await getDocs(q);

          const batch = writeBatch(db);
          querySnapshot.forEach((doc) => {
            batch.delete(doc.ref);
          });

          await batch.commit();
        } catch (firestoreError) {
          console.warn("Failed to clear Firestore contacts:", firestoreError);
        }
      }

      // Clear from local storage
      try {
        localStorage.removeItem(CONTACTS_STORAGE_KEY);
      } catch (localError) {
        console.warn("Failed to clear localStorage:", localError);
      }

      // Clear from session storage
      try {
        sessionStorage.removeItem(CONTACTS_STORAGE_KEY);
      } catch (sessionError) {
        console.warn("Failed to clear sessionStorage:", sessionError);
      }

      // Clear sync queue
      this.syncQueue = [];

      return {
        success: true,
        data: { deleted: contactCount },
        source: "localStorage",
      };
    } catch (error) {
      return {
        success: false,
        error: `Failed to clear contacts: ${error instanceof Error ? error.message : "Unknown error"}`,
        source: "localStorage",
      };
    }
  }

  /**
   * Export contacts in various formats
   */
  public async exportContacts(
    format: "json" | "csv" = "json",
  ): Promise<ContactOperationResult<string>> {
    try {
      const allContactsResult = await this.readContacts();
      if (!allContactsResult.success || !allContactsResult.data) {
        return {
          success: false,
          error: allContactsResult.error,
          source: allContactsResult.source,
        };
      }

      const contacts = allContactsResult.data;

      if (format === "json") {
        const exportData = {
          exportDate: new Date().toISOString(),
          version: "1.0",
          totalContacts: contacts.length,
          contacts: contacts.map((contact) => ({
            ...contact,
            createdAt: contact.createdAt.toISOString(),
            updatedAt: contact.updatedAt.toISOString(),
            lastContact: contact.lastContact.toISOString(),
            lastSyncAt: contact.lastSyncAt?.toISOString(),
          })),
        };

        return {
          success: true,
          data: JSON.stringify(exportData, null, 2),
          source: allContactsResult.source,
        };
      } else if (format === "csv") {
        const headers = [
          "Name",
          "Email",
          "Phone",
          "Level",
          "Platform",
          "Strength",
          "Contact Frequency",
          "Last Contact",
          "Tags",
          "Notes",
          "Created At",
        ];

        const csvRows = [
          headers.join(","),
          ...contacts.map((contact) =>
            [
              `"${contact.name.replace(/"/g, '""')}"`,
              `"${contact.email || ""}"`,
              `"${contact.phone || ""}"`,
              `"${contact.levelId}"`,
              `"${contact.platform}"`,
              contact.strength.toString(),
              contact.contactFrequency.toString(),
              contact.lastContact.toISOString(),
              `"${(contact.tags || []).join("; ")}"`,
              `"${(contact.notes || "").replace(/"/g, '""')}"`,
              contact.createdAt.toISOString(),
            ].join(","),
          ),
        ];

        return {
          success: true,
          data: csvRows.join("\n"),
          source: allContactsResult.source,
        };
      }

      return {
        success: false,
        error: `Unsupported export format: ${format}`,
        source: "localStorage",
      };
    } catch (error) {
      return {
        success: false,
        error: `Export failed: ${error instanceof Error ? error.message : "Unknown error"}`,
        source: "localStorage",
      };
    }
  }

  /**
   * Import contacts from exported data
   */
  public async importContacts(
    data: string,
    format: "json" | "csv" = "json",
  ): Promise<
    ContactOperationResult<{
      imported: number;
      skipped: number;
      errors: string[];
    }>
  > {
    try {
      let contactsToImport: ContactForm[] = [];
      const errors: string[] = [];

      if (format === "json") {
        const parsed = JSON.parse(data);
        const contacts = parsed.contacts || parsed;

        if (!Array.isArray(contacts)) {
          return {
            success: false,
            error: "Invalid JSON format: expected array of contacts",
            source: "localStorage",
          };
        }

        contactsToImport = contacts.map((contact: any) => ({
          name: contact.name || "Unknown",
          email: contact.email,
          phone: contact.phone,
          levelId: contact.levelId || "recognition-group",
          platform: contact.platform || "imported",
          contactFrequency: contact.contactFrequency || 30,
          strength: contact.strength || 0.5,
          notes: contact.notes,
          tags: contact.tags || ["imported"],
        }));
      } else if (format === "csv") {
        const lines = data.split("\n").filter((line) => line.trim());
        if (lines.length < 2) {
          return {
            success: false,
            error: "Invalid CSV format: no data rows found",
            source: "localStorage",
          };
        }

        const headers = lines[0]
          .split(",")
          .map((h) => h.replace(/"/g, "").trim());
        const nameIndex = headers.findIndex((h) =>
          h.toLowerCase().includes("name"),
        );
        const emailIndex = headers.findIndex((h) =>
          h.toLowerCase().includes("email"),
        );
        const phoneIndex = headers.findIndex((h) =>
          h.toLowerCase().includes("phone"),
        );
        const levelIndex = headers.findIndex((h) =>
          h.toLowerCase().includes("level"),
        );
        const platformIndex = headers.findIndex((h) =>
          h.toLowerCase().includes("platform"),
        );

        if (nameIndex === -1) {
          return {
            success: false,
            error: "Invalid CSV format: no name column found",
            source: "localStorage",
          };
        }

        for (let i = 1; i < lines.length; i++) {
          try {
            const values = lines[i]
              .split(",")
              .map((v) => v.replace(/"/g, "").trim());

            contactsToImport.push({
              name: values[nameIndex] || "Unknown",
              email: emailIndex >= 0 ? values[emailIndex] : undefined,
              phone: phoneIndex >= 0 ? values[phoneIndex] : undefined,
              levelId:
                levelIndex >= 0 ? values[levelIndex] : "recognition-group",
              platform: platformIndex >= 0 ? values[platformIndex] : "imported",
              contactFrequency: 30,
              strength: 0.5,
              tags: ["imported"],
            });
          } catch (rowError) {
            errors.push(
              `Error parsing row ${i + 1}: ${rowError instanceof Error ? rowError.message : "Unknown error"}`,
            );
          }
        }
      }

      // Import contacts
      let imported = 0;
      let skipped = 0;

      for (const contactData of contactsToImport) {
        try {
          // Check for duplicates
          const existingResult = await this.readContacts({
            query: contactData.name,
            limit: 1,
          });

          if (
            existingResult.success &&
            existingResult.data &&
            existingResult.data.length > 0
          ) {
            const existing = existingResult.data[0];
            if (
              existing.name.toLowerCase() === contactData.name.toLowerCase()
            ) {
              skipped++;
              continue;
            }
          }

          const result = await this.createContact(contactData);
          if (result.success) {
            imported++;
          } else {
            skipped++;
            errors.push(
              `Failed to import ${contactData.name}: ${result.error}`,
            );
          }
        } catch (contactError) {
          skipped++;
          errors.push(
            `Error importing ${contactData.name}: ${contactError instanceof Error ? contactError.message : "Unknown error"}`,
          );
        }
      }

      return {
        success: imported > 0,
        data: { imported, skipped, errors },
        source: "localStorage",
      };
    } catch (error) {
      return {
        success: false,
        error: `Import failed: ${error instanceof Error ? error.message : "Unknown error"}`,
        data: {
          imported: 0,
          skipped: 0,
          errors: [error instanceof Error ? error.message : "Unknown error"],
        },
        source: "localStorage",
      };
    }
  }

  /**
   * Get sync status and queue information
   */
  public getSyncStatus(): {
    isOnline: boolean;
    isAuthenticated: boolean;
    queueLength: number;
    lastSyncAttempt?: Date;
  } {
    return {
      isOnline: this.isOnline,
      isAuthenticated: !!this.currentUser,
      queueLength: this.syncQueue.length,
      lastSyncAttempt: this.syncQueue.length > 0 ? new Date() : undefined,
    };
  }

  /**
   * Force sync of pending contacts
   */
  public async forcSync(): Promise<
    ContactOperationResult<{ synced: number; failed: number }>
  > {
    if (!this.currentUser || !this.isOnline) {
      return {
        success: false,
        error: "Cannot sync: user not authenticated or offline",
        source: "localStorage",
      };
    }

    try {
      const initialQueueLength = this.syncQueue.length;
      await this.processSyncQueue();
      const remainingQueueLength = this.syncQueue.length;
      const synced = initialQueueLength - remainingQueueLength;

      return {
        success: true,
        data: {
          synced,
          failed: remainingQueueLength,
        },
        source: "firestore",
      };
    } catch (error) {
      return {
        success: false,
        error: `Failed to sync: ${error instanceof Error ? error.message : "Unknown error"}`,
        source: "localStorage",
      };
    }
  }

  /**
   * Sync all contacts to Firestore
   */
  public async syncContacts(
    contacts: StoredContact[],
  ): Promise<ContactOperationResult<{ synced: number; failed: number }>> {
    if (!this.currentUser || !this.isOnline) {
      return {
        success: false,
        error: "User not authenticated or offline",
        source: "localStorage",
        offline: true,
      };
    }

    if (!db) {
      return {
        success: false,
        error: "Firestore not initialized",
        source: "localStorage",
      };
    }

    try {
      const batch = writeBatch(db);
      let synced = 0;
      let failed = 0;

      // Process each contact
      for (const contact of contacts) {
        try {
          const contactData = this.prepareForFirestore(contact);

          if (contact.firestoreId) {
            // Update existing document
            const docRef = doc(db, CONTACTS_COLLECTION, contact.firestoreId);
            batch.update(docRef, contactData);
          } else {
            // Create new document
            const docRef = doc(collection(db, CONTACTS_COLLECTION));
            batch.set(docRef, contactData);
          }
          synced++;
        } catch (error) {
          console.error(`Failed to sync contact ${contact.id}:`, error);
          failed++;
        }
      }

      // Commit the batch
      await batch.commit();

      return {
        success: true,
        data: { synced, failed },
        source: "firestore",
        offline: false,
      };
    } catch (error) {
      console.error("Failed to sync contacts:", error);
      return {
        success: false,
        error: `Failed to sync contacts: ${error instanceof Error ? error.message : "Unknown error"}`,
        source: "firestore",
        offline: !this.isOnline,
      };
    }
  }
}

// Export singleton instance
export const contactStorage = ContactStorageService.getInstance();
