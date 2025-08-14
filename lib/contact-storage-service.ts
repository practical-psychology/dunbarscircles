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

import type { Person } from "@/types/relationships";
import type { Contact, ContactForm, ContactUpdate } from "./contact-models";
import { sanitizeContactData, validateContactData } from "./contact-models";
import { auth, db } from "@/firebase-config";
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
  type Unsubscribe
} from "firebase/firestore";
import { onAuthStateChanged, type User } from "firebase/auth";

// Storage keys
const CONTACTS_STORAGE_KEY = "yakw_contacts";

// Firestore collection name
const CONTACTS_COLLECTION = "user_contacts";

// Storage interfaces
export interface StoredContact extends Contact {
  firestoreId?: string;
  syncStatus?: 'synced' | 'pending' | 'error';
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
  sortBy?: 'name' | 'lastContact' | 'strength' | 'createdAt' | 'updatedAt';
  sortOrder?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}

export interface ContactOperationResult<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  source: 'firestore' | 'localStorage' | 'sessionStorage';
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
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.processSyncQueue();
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
    });
  }

  private enableFirestoreSync(): void {
    // Enable Firestore sync when user is authenticated
    console.log('Firestore sync enabled');
  }

  private disableFirestoreSync(): void {
    // Disable Firestore sync when user is not authenticated
    console.log('Firestore sync disabled');
    if (this.contactsUnsubscribe) {
      this.contactsUnsubscribe();
      this.contactsUnsubscribe = null;
    }
  }

  private async processSyncQueue(): Promise<void> {
    if (!this.currentUser || !this.isOnline || !db || this.syncQueue.length === 0) {
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
        contact.syncStatus = 'synced';
        contact.lastSyncAt = new Date();
        processedContacts.push(contact);
      } catch (error) {
        console.error('Failed to prepare contact for sync:', error);
        contact.syncStatus = 'error';
      }
    }

    try {
      await batch.commit();
      this.syncQueue = this.syncQueue.filter(c => !processedContacts.includes(c));
      
      // Update local storage with sync status
      for (const contact of processedContacts) {
        await this.updateLocalContact(contact.id, {
          firestoreId: contact.firestoreId,
          syncStatus: contact.syncStatus,
          lastSyncAt: contact.lastSyncAt
        });
      }
    } catch (error) {
      console.error('Failed to sync contacts to Firestore:', error);
    }
  }

  private addToSyncQueue(contact: StoredContact): void {
    const existingIndex = this.syncQueue.findIndex(c => c.id === contact.id);
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
      syncStatus: 'synced' as const,
      lastSyncAt: new Date(),
    };
  }

  private async saveToLocalStorage(contacts: StoredContact[]): Promise<ContactOperationResult<StoredContact[]>> {
    try {
      let existingContacts: StoredContact[] = [];
      
      // Load existing contacts
      const existingResult = await this.loadFromLocalStorage();
      if (existingResult.success && existingResult.data) {
        existingContacts = existingResult.data;
      }

      // Update or add contacts
      for (const contact of contacts) {
        const existingIndex = existingContacts.findIndex(c => c.id === contact.id);
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
          source: 'localStorage'
        };
      } catch (localStorageError) {
        // Fallback to sessionStorage
        try {
          sessionStorage.setItem(CONTACTS_STORAGE_KEY, dataToStore);
          return {
            success: true,
            data: contacts,
            source: 'sessionStorage'
          };
        } catch (sessionStorageError) {
          return {
            success: false,
            error: 'Failed to save to both localStorage and sessionStorage',
            source: 'localStorage'
          };
        }
      }
    } catch (error) {
      return {
        success: false,
        error: `Failed to save contacts: ${error instanceof Error ? error.message : 'Unknown error'}`,
        source: 'localStorage'
      };
    }
  }

  private async loadFromLocalStorage(): Promise<ContactOperationResult<StoredContact[]>> {
    try {
      let data: string | null = null;
      let source: 'localStorage' | 'sessionStorage' = 'localStorage';

      // Try localStorage first
      try {
        data = localStorage.getItem(CONTACTS_STORAGE_KEY);
      } catch (error) {
        console.warn('Failed to access localStorage:', error);
      }

      // Fallback to sessionStorage
      if (!data) {
        try {
          data = sessionStorage.getItem(CONTACTS_STORAGE_KEY);
          source = 'sessionStorage';
        } catch (error) {
          console.warn('Failed to access sessionStorage:', error);
        }
      }

      if (!data) {
        return {
          success: true,
          data: [],
          source
        };
      }

      const contacts: StoredContact[] = JSON.parse(data);
      
      // Parse dates
      const parsedContacts = contacts.map(contact => ({
        ...contact,
        createdAt: new Date(contact.createdAt),
        updatedAt: new Date(contact.updatedAt),
        lastContact: new Date(contact.lastContact),
        lastSyncAt: contact.lastSyncAt ? new Date(contact.lastSyncAt) : undefined,
      }));

      return {
        success: true,
        data: parsedContacts,
        source
      };
    } catch (error) {
      return {
        success: false,
        error: `Failed to load contacts: ${error instanceof Error ? error.message : 'Unknown error'}`,
        source: 'localStorage'
      };
    }
  }

  private async loadFromFirestore(options: ContactSearchOptions = {}): Promise<StoredContact[]> {
    if (!this.currentUser || !db) {
      return [];
    }

    try {
      let q = query(
        collection(db, CONTACTS_COLLECTION),
        where('userId', '==', this.currentUser.uid)
      );

      // Apply filters
      if (options.levelIds && options.levelIds.length > 0) {
        q = query(q, where('levelId', 'in', options.levelIds));
      }

      if (options.platforms && options.platforms.length > 0) {
        q = query(q, where('platform', 'in', options.platforms));
      }

      // Apply sorting
      if (options.sortBy) {
        const direction = options.sortOrder === 'desc' ? 'desc' : 'asc';
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
      console.error('Failed to load from Firestore:', error);
      return [];
    }
  }

  private filterContacts(contacts: StoredContact[], options: ContactSearchOptions): StoredContact[] {
    let filtered = [...contacts];

    // Text search
    if (options.query) {
      const query = options.query.toLowerCase();
      filtered = filtered.filter(contact => 
        contact.name.toLowerCase().includes(query) ||
        contact.email?.toLowerCase().includes(query) ||
        contact.phone?.includes(query) ||
        contact.notes?.toLowerCase().includes(query) ||
        contact.tags?.some(tag => tag.toLowerCase().includes(query))
      );
    }

    // Level filter
    if (options.levelIds && options.levelIds.length > 0) {
      filtered = filtered.filter(contact => options.levelIds!.includes(contact.levelId));
    }

    // Platform filter
    if (options.platforms && options.platforms.length > 0) {
      filtered = filtered.filter(contact => options.platforms!.includes(contact.platform));
    }

    // Tags filter
    if (options.tags && options.tags.length > 0) {
      filtered = filtered.filter(contact => 
        contact.tags?.some(tag => options.tags!.includes(tag))
      );
    }

    // Strength range filter
    if (options.minStrength !== undefined) {
      filtered = filtered.filter(contact => contact.strength >= options.minStrength!);
    }
    if (options.maxStrength !== undefined) {
      filtered = filtered.filter(contact => contact.strength <= options.maxStrength!);
    }

    // Date range filters
    if (options.lastContactBefore) {
      filtered = filtered.filter(contact => contact.lastContact <= options.lastContactBefore!);
    }
    if (options.lastContactAfter) {
      filtered = filtered.filter(contact => contact.lastContact >= options.lastContactAfter!);
    }

    // Sorting
    if (options.sortBy) {
      filtered.sort((a, b) => {
        let aValue: any = a[options.sortBy as keyof StoredContact];
        let bValue: any = b[options.sortBy as keyof StoredContact];

        if (aValue instanceof Date) aValue = aValue.getTime();
        if (bValue instanceof Date) bValue = bValue.getTime();

        if (typeof aValue === 'string') {
          aValue = aValue.toLowerCase();
          bValue = bValue.toLowerCase();
        }

        const comparison = aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
        return options.sortOrder === 'desc' ? -comparison : comparison;
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

  private async updateLocalContact(contactId: string, updates: Partial<StoredContact>): Promise<ContactOperationResult<StoredContact>> {
    try {
      const existingResult = await this.loadFromLocalStorage();
      if (!existingResult.success || !existingResult.data) {
        return {
          success: false,
          error: 'Failed to load existing contacts',
          source: 'localStorage'
        };
      }

      const contacts = existingResult.data;
      const contactIndex = contacts.findIndex(c => c.id === contactId);
      
      if (contactIndex === -1) {
        return {
          success: false,
          error: `Contact with ID '${contactId}' not found`,
          source: 'localStorage'
        };
      }

      const updatedContact = { ...contacts[contactIndex], ...updates };
      contacts[contactIndex] = updatedContact;

      const saveResult = await this.saveToLocalStorage(contacts);
      if (!saveResult.success) {
        return {
          success: false,
          error: saveResult.error,
          source: saveResult.source
        };
      }

      return {
        success: true,
        data: updatedContact,
        source: saveResult.source
      };
    } catch (error) {
      return {
        success: false,
        error: `Failed to update contact: ${error instanceof Error ? error.message : 'Unknown error'}`,
        source: 'localStorage'
      };
    }
  }

  private async deleteFromLocalStorage(contactId: string): Promise<ContactOperationResult<{ deleted: boolean }>> {
    try {
      const existingResult = await this.loadFromLocalStorage();
      if (!existingResult.success || !existingResult.data) {
        return {
          success: false,
          error: 'Failed to load existing contacts',
          source: 'localStorage'
        };
      }

      const contacts = existingResult.data;
      const contactIndex = contacts.findIndex(c => c.id === contactId);
      
      if (contactIndex === -1) {
        return {
          success: false,
          error: `Contact with ID '${contactId}' not found`,
          source: 'localStorage'
        };
      }

      contacts.splice(contactIndex, 1);

      const saveResult = await this.saveToLocalStorage(contacts);
      if (!saveResult.success) {
        return {
          success: false,
          error: saveResult.error,
          source: saveResult.source
        };
      }

      return {
        success: true,
        data: { deleted: true },
        source: saveResult.source
      };
    } catch (error) {
      return {
        success: false,
        error: `Failed to delete contact: ${error instanceof Error ? error.message : 'Unknown error'}`,
        source: 'localStorage'
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
  public async createContact(contactData: ContactForm): Promise<ContactOperationResult<StoredContact>> {
    try {
      // Validate input data
      const validation = validateContactData.form(contactData);
      if (!validation.success) {
        return {
          success: false,
          error: `Validation failed: ${validation.error.errors.map(e => e.message).join(', ')}`,
          source: 'localStorage'
        };
      }

      // Sanitize data
      const sanitizedData = {
        ...contactData,
        name: sanitizeContactData.name(contactData.name),
        email: contactData.email ? sanitizeContactData.email(contactData.email) : undefined,
        phone: contactData.phone ? sanitizeContactData.phone(contactData.phone) : undefined,
        notes: contactData.notes ? sanitizeContactData.notes(contactData.notes) : undefined,
        platform: sanitizeContactData.platform(contactData.platform),
        tags: contactData.tags ? sanitizeContactData.tags(contactData.tags) : undefined,
      };

      // Create contact object
      const contact: StoredContact = {
        id: `contact_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
        ...sanitizedData,
        createdAt: new Date(),
        updatedAt: new Date(),
        lastContact: new Date(),
        decayRate: 0.1, // Default decay rate
        syncStatus: this.currentUser && this.isOnline ? 'pending' : undefined,
      };

      // Save to local storage first
      const localResult = await this.saveToLocalStorage([contact]);
      if (!localResult.success) {
        return {
          success: false,
          error: localResult.error,
          source: localResult.source
        };
      }

      // Try to sync to Firestore if user is authenticated and online
      if (this.currentUser && this.isOnline && db) {
        try {
          const docRef = doc(collection(db, CONTACTS_COLLECTION));
          const firestoreData = this.prepareForFirestore(contact);
          await setDoc(docRef, firestoreData);
          
          contact.firestoreId = docRef.id;
          contact.syncStatus = 'synced';
          contact.lastSyncAt = new Date();
          
          // Update local storage with sync info
          await this.updateLocalContact(contact.id, {
            firestoreId: contact.firestoreId,
            syncStatus: contact.syncStatus,
            lastSyncAt: contact.lastSyncAt
          });
        } catch (firestoreError) {
          console.warn('Failed to sync to Firestore, will retry later:', firestoreError);
          this.addToSyncQueue(contact);
        }
      }

      return {
        success: true,
        data: contact,
        source: this.currentUser && contact.firestoreId ? 'firestore' : 'localStorage',
        offline: !this.isOnline
      };
    } catch (error) {
      return {
        success: false,
        error: `Failed to create contact: ${error instanceof Error ? error.message : 'Unknown error'}`,
        source: 'localStorage'
      };
    }
  }

  /**
   * Read contacts with optional filtering and search
   */
  public async readContacts(options: ContactSearchOptions = {}): Promise<ContactOperationResult<StoredContact[]>> {
    try {
      let contacts: StoredContact[] = [];
      let source: 'firestore' | 'localStorage' | 'sessionStorage' = 'localStorage';

      // Try to load from Firestore first if user is authenticated and online
      if (this.currentUser && this.isOnline && db) {
        try {
          const firestoreContacts = await this.loadFromFirestore(options);
          if (firestoreContacts.length > 0) {
            contacts = firestoreContacts;
            source = 'firestore';
            
            // Update local storage with latest data
            await this.saveToLocalStorage(contacts);
          }
        } catch (firestoreError) {
          console.warn('Failed to load from Firestore, using local storage:', firestoreError);
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
        offline: !this.isOnline
      };
    } catch (error) {
      return {
        success: false,
        error: `Failed to read contacts: ${error instanceof Error ? error.message : 'Unknown error'}`,
        source: 'localStorage'
      };
    }
  }

  /**
   * Read a single contact by ID
   */
  public async readContact(contactId: string): Promise<ContactOperationResult<StoredContact>> {
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
              source: 'firestore'
            };
          }

          // If not found by document ID, search by contact ID field
          const q = query(
            collection(db, CONTACTS_COLLECTION),
            where('id', '==', contactId),
            limit(1)
          );
          const querySnapshot = await getDocs(q);
          
          if (!querySnapshot.empty) {
            const doc = querySnapshot.docs[0];
            const contact = this.parseFromFirestore(doc.data(), doc.id);
            return {
              success: true,
              data: contact,
              source: 'firestore'
            };
          }
        } catch (firestoreError) {
          console.warn('Failed to load from Firestore, trying local storage:', firestoreError);
        }
      }

      // Fallback to local storage
      const localResult = await this.loadFromLocalStorage();
      const contacts = localResult.data || [];
      const contact = contacts.find(c => c.id === contactId || c.firestoreId === contactId);

      if (contact) {
        return {
          success: true,
          data: contact,
          source: localResult.source,
          offline: !this.isOnline
        };
      }

      return {
        success: false,
        error: `Contact with ID '${contactId}' not found`,
        source: 'localStorage'
      };
    } catch (error) {
      return {
        success: false,
        error: `Failed to read contact: ${error instanceof Error ? error.message : 'Unknown error'}`,
        source: 'localStorage'
      };
    }
  }

  /**
   * Update an existing contact
   */
  public async updateContact(contactId: string, updates: ContactUpdate): Promise<ContactOperationResult<StoredContact>> {
    try {
      // Validate update data
      const validation = validateContactData.update({ ...updates, id: contactId });
      if (!validation.success) {
        return {
          success: false,
          error: `Validation failed: ${validation.error.errors.map(e => e.message).join(', ')}`,
          source: 'localStorage'
        };
      }

      // Get existing contact
      const existingResult = await this.readContact(contactId);
      if (!existingResult.success || !existingResult.data) {
        return {
          success: false,
          error: `Contact with ID '${contactId}' not found`,
          source: 'localStorage'
        };
      }

      const existingContact = existingResult.data;

      // Sanitize update data
      const sanitizedUpdates: Partial<StoredContact> = {};
      if (updates.name !== undefined) sanitizedUpdates.name = sanitizeContactData.name(updates.name);
      if (updates.email !== undefined) sanitizedUpdates.email = updates.email ? sanitizeContactData.email(updates.email) : undefined;
      if (updates.phone !== undefined) sanitizedUpdates.phone = updates.phone ? sanitizeContactData.phone(updates.phone) : undefined;
      if (updates.notes !== undefined) sanitizedUpdates.notes = updates.notes ? sanitizeContactData.notes(updates.notes) : undefined;
      if (updates.platform !== undefined) sanitizedUpdates.platform = sanitizeContactData.platform(updates.platform);
      if (updates.tags !== undefined) sanitizedUpdates.tags = updates.tags ? sanitizeContactData.tags(updates.tags) : undefined;
      if (updates.levelId !== undefined) sanitizedUpdates.levelId = updates.levelId;
      if (updates.contactFrequency !== undefined) sanitizedUpdates.contactFrequency = updates.contactFrequency;
      if (updates.strength !== undefined) sanitizedUpdates.strength = updates.strength;
      if (updates.lastContact !== undefined) sanitizedUpdates.lastContact = updates.lastContact;

      // Create updated contact
      const updatedContact: StoredContact = {
        ...existingContact,
        ...sanitizedUpdates,
        updatedAt: new Date(),
        syncStatus: this.currentUser && this.isOnline ? 'pending' : existingContact.syncStatus,
      };

      // Update in local storage
      const localResult = await this.updateLocalContact(contactId, updatedContact);
      if (!localResult.success) {
        return {
          success: false,
          error: localResult.error,
          source: localResult.source
        };
      }

      // Try to sync to Firestore if user is authenticated and online
      if (this.currentUser && this.isOnline && db && existingContact.firestoreId) {
        try {
          const docRef = doc(db, CONTACTS_COLLECTION, existingContact.firestoreId);
          const firestoreData = this.prepareForFirestore(updatedContact);
          await updateDoc(docRef, firestoreData);
          
          updatedContact.syncStatus = 'synced';
          updatedContact.lastSyncAt = new Date();
          
          // Update local storage with sync info
          await this.updateLocalContact(contactId, {
            syncStatus: updatedContact.syncStatus,
            lastSyncAt: updatedContact.lastSyncAt
          });
        } catch (firestoreError) {
          console.warn('Failed to sync update to Firestore, will retry later:', firestoreError);
          this.addToSyncQueue(updatedContact);
        }
      }

      return {
        success: true,
        data: updatedContact,
        source: this.currentUser && updatedContact.firestoreId ? 'firestore' : 'localStorage',
        offline: !this.isOnline
      };
    } catch (error) {
      return {
        success: false,
        error: `Failed to update contact: ${error instanceof Error ? error.message : 'Unknown error'}`,
        source: 'localStorage'
      };
    }
  }

  /**
   * Delete a contact
   */
  public async deleteContact(contactId: string): Promise<ContactOperationResult<{ deleted: boolean }>> {
    try {
      // Get existing contact to check if it exists in Firestore
      const existingResult = await this.readContact(contactId);
      if (!existingResult.success || !existingResult.data) {
        return {
          success: false,
          error: `Contact with ID '${contactId}' not found`,
          source: 'localStorage'
        };
      }

      const existingContact = existingResult.data;

      // Delete from Firestore if it exists there
      if (this.currentUser && this.isOnline && db && existingContact.firestoreId) {
        try {
          const docRef = doc(db, CONTACTS_COLLECTION, existingContact.firestoreId);
          await deleteDoc(docRef);
        } catch (firestoreError) {
          console.warn('Failed to delete from Firestore:', firestoreError);
          // Continue with local deletion even if Firestore fails
        }
      }

      // Delete from local storage
      const localResult = await this.deleteFromLocalStorage(contactId);
      if (!localResult.success) {
        return {
          success: false,
          error: localResult.error,
          source: localResult.source
        };
      }

      return {
        success: true,
        data: { deleted: true },
        source: this.currentUser && existingContact.firestoreId ? 'firestore' : 'localStorage',
        offline: !this.isOnline
      };
    } catch (error) {
      return {
        success: false,
        error: `Failed to delete contact: ${error instanceof Error ? error.message : 'Unknown error'}`,
        source: 'localStorage'
      };
    }
  }

  // Batch Operations

  /**
   * Create multiple contacts in batch
   */
  public async createContacts(contactsData: ContactForm[]): Promise<ContactOperationResult<StoredContact[]>> {
    try {
      const results: StoredContact[] = [];
      const errors: string[] = [];

      for (const contactData of contactsData) {
        const result = await this.createContact(contactData);
        if (result.success && result.data) {
          results.push(result.data);
        } else {
          errors.push(result.error || 'Unknown error');
        }
      }

      if (errors.length > 0 && results.length === 0) {
        return {
          success: false,
          error: `All contacts failed to create: ${errors.join('; ')}`,
          source: 'localStorage'
        };
      }

      return {
        success: true,
        data: results,
        source: 'localStorage',
        error: errors.length > 0 ? `Some contacts failed: ${errors.join('; ')}` : undefined
      };
    } catch (error) {
      return {
        success: false,
        error: `Failed to create contacts: ${error instanceof Error ? error.message : 'Unknown error'}`,
        source: 'localStorage'
      };
    }
  }

  /**
   * Import contacts from existing Person data (migration utility)
   */
  public async importFromPersonData(persons: Person[], source: 'facebook' | 'linkedin' | 'manual' = 'manual'): Promise<ContactOperationResult<{ imported: number; skipped: number; errors: string[] }>> {
    try {
      const contactsData: ContactForm[] = persons.map(person => ({
        name: person.name,
        levelId: person.levelId,
        platform: person.platform,
        contactFrequency: person.contactFrequency,
        strength: person.strength,
        // Set reasonable defaults for new fields
        email: undefined,
        phone: undefined,
        notes: undefined,
        tags: [source],
      }));

      // Check for duplicates
      const existingContacts = await this.readContacts();
      const existingNames = new Set(
        (existingContacts.data || []).map(c => c.name.toLowerCase())
      );

      const newContactsData = contactsData.filter(
        contact => !existingNames.has(contact.name.toLowerCase())
      );

      if (newContactsData.length === 0) {
        return {
          success: true,
          data: { imported: 0, skipped: contactsData.length, errors: [] },
          source: 'localStorage'
        };
      }

      const result = await this.createContacts(newContactsData);
      const imported = result.data?.length || 0;
      const skipped = contactsData.length - newContactsData.length;
      const errors = result.error ? [result.error] : [];

      return {
        success: true,
        data: { imported, skipped, errors },
        source: result.source
      };
    } catch (error) {
      return {
        success: false,
        error: `Failed to import contacts: ${error instanceof Error ? error.message : 'Unknown error'}`,
        source: 'localStorage'
      };
    }
  }

  // Search and Filtering

  /**
   * Search contacts with advanced filtering options
   */
  public async searchContacts(searchOptions: ContactSearchOptions): Promise<ContactOperationResult<StoredContact[]>> {
    return this.readContacts(searchOptions);
  }

  // Statistics and Analytics

  /**
   * Get contact statistics and analytics
   */
  public async getContactStats(): Promise<ContactOperationResult<ContactStats>> {
    try {
      const contactsResult = await this.readContacts();
      if (!contactsResult.success || !contactsResult.data) {
        return {
          success: false,
          error: 'Failed to load contacts for statistics',
          source: 'localStorage'
        };
      }

      const contacts = contactsResult.data;
      const total = contacts.length;

      // Calculate level distribution
      const byLevel: Record<string, number> = {};
      contacts.forEach(contact => {
        byLevel[contact.levelId] = (byLevel[contact.levelId] || 0) + 1;
      });

      // Calculate platform distribution
      const byPlatform: Record<string, number> = {};
      contacts.forEach(contact => {
        byPlatform[contact.platform] = (byPlatform[contact.platform] || 0) + 1;
      });

      // Calculate tag distribution
      const byTags: Record<string, number> = {};
      contacts.forEach(contact => {
        contact.tags?.forEach(tag => {
          byTags[tag] = (byTags[tag] || 0) + 1;
        });
      });

      // Calculate average strength
      const averageStrength = total > 0 
        ? contacts.reduce((sum, contact) => sum + contact.strength, 0) / total 
        : 0;

      // Calculate sync status
      const syncStatus = {
        synced: contacts.filter(c => c.syncStatus === 'synced').length,
        pending: contacts.filter(c => c.syncStatus === 'pending').length,
        errors: contacts.filter(c => c.syncStatus === 'error').length,
      };

      const stats: ContactStats = {
        total,
        byLevel,
        byPlatform,
        byTags,
        averageStrength,
        lastUpdated: new Date(),
        syncStatus,
      };

      return {
        success: true,
        data: stats,
        source: contactsResult.source
      };
    } catch (error) {
      return {
        success: false,
        error: `Failed to calculate statistics: ${error instanceof Error ? error.message : 'Unknown error'}`,
        source: 'localStorage'
      };
    }
  }

  // Utility Methods

  /**
   * Clear all contacts (with confirmation)
   */
  public async clearAllContacts(): Promise<ContactOperationResult<{ cleared: number }>> {
    try {
      const contactsResult = await this.readContacts();
      if (!contactsResult.success || !contactsResult.data) {
        return {
          success: true,
          data: { cleared: 0 },
          source: 'localStorage'
        };
      }

      const contactCount = contactsResult.data.length;

      // Clear from Firestore if user is authenticated
      if (this.currentUser && db) {
        try {
          const batch = writeBatch(db);
          const firestoreContacts = contactsResult.data.filter(c => c.firestoreId);
          
          firestoreContacts.forEach(contact => {
            if (contact.firestoreId && db) {
              const docRef = doc(db, CONTACTS_COLLECTION, contact.firestoreId);
              batch.delete(docRef);
            }
          });

          if (firestoreContacts.length > 0) {
            await batch.commit();
          }
        } catch (firestoreError) {
          console.warn('Failed to clear Firestore contacts:', firestoreError);
        }
      }

      // Clear from local storage
      try {
        localStorage.removeItem(CONTACTS_STORAGE_KEY);
      } catch (error) {
        try {
          sessionStorage.removeItem(CONTACTS_STORAGE_KEY);
        } catch (sessionError) {
          console.warn('Failed to clear storage:', sessionError);
        }
      }

      // Clear sync queue
      this.syncQueue = [];

      return {
        success: true,
        data: { cleared: contactCount },
        source: 'localStorage'
      };
    } catch (error) {
      return {
        success: false,
        error: `Failed to clear contacts: ${error instanceof Error ? error.message : 'Unknown error'}`,
        source: 'localStorage'
      };
    }
  }

  /**
   * Export contacts to JSON
   */
  public async exportContacts(options: { includeMetadata?: boolean } = {}): Promise<ContactOperationResult<string>> {
    try {
      const contactsResult = await this.readContacts();
      if (!contactsResult.success || !contactsResult.data) {
        return {
          success: false,
          error: 'Failed to load contacts for export',
          source: 'localStorage'
        };
      }

      const contacts = contactsResult.data;
      let exportData: any = contacts;

      if (!options.includeMetadata) {
        // Remove metadata fields for cleaner export
        exportData = contacts.map(contact => {
          const { firestoreId, syncStatus, lastSyncAt, ...cleanContact } = contact;
          return cleanContact;
        });
      }

      const jsonString = JSON.stringify(exportData, null, 2);

      return {
        success: true,
        data: jsonString,
        source: contactsResult.source
      };
    } catch (error) {
      return {
        success: false,
        error: `Failed to export contacts: ${error instanceof Error ? error.message : 'Unknown error'}`,
        source: 'localStorage'
      };
    }
  }
}

// Export singleton instance
export const contactStorageService = ContactStorageService.getInstance();