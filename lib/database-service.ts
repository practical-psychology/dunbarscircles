// Enhanced database service with user authorization and error handling
import {
  collection,
  doc,
  getDocs,
  getDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  writeBatch,
  Timestamp,
} from "firebase/firestore";
import { auth, db } from "../firebase-config";
import type { StoredContact } from "./contact-storage";

// Error types for proper error handling
export class DatabaseError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 500,
  ) {
    super(message);
    this.name = "DatabaseError";
  }
}

export class AuthorizationError extends DatabaseError {
  constructor(message: string = "Unauthorized access") {
    super(message, "UNAUTHORIZED", 401);
  }
}

export class NotFoundError extends DatabaseError {
  constructor(resource: string, id: string) {
    super(`${resource} with ID '${id}' not found`, "NOT_FOUND", 404);
  }
}

export class ValidationError extends DatabaseError {
  constructor(message: string) {
    super(message, "VALIDATION_ERROR", 400);
  }
}

// Response types for consistent API responses
export interface DatabaseResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    statusCode: number;
  };
  metadata?: {
    timestamp: string;
    userId?: string;
    operation: string;
  };
}

// User-scoped database operations
export class DatabaseService {
  private static getCurrentUserId(): string {
    const user = auth?.currentUser;
    if (!user) {
      throw new AuthorizationError("User must be authenticated");
    }
    return user.uid;
  }

  private static validateFirebaseConnection(): void {
    if (!db) {
      throw new DatabaseError(
        "Firebase database is not available",
        "DB_UNAVAILABLE",
        503,
      );
    }
  }

  private static createResponse<T>(
    data: T,
    operation: string,
    userId?: string,
  ): DatabaseResponse<T> {
    return {
      success: true,
      data,
      metadata: {
        timestamp: new Date().toISOString(),
        userId,
        operation,
      },
    };
  }

  private static createErrorResponse(
    error: DatabaseError,
    operation: string,
  ): DatabaseResponse<never> {
    return {
      success: false,
      error: {
        code: error.code,
        message: error.message,
        statusCode: error.statusCode,
      },
      metadata: {
        timestamp: new Date().toISOString(),
        operation,
      },
    };
  }

  // Validate contact data
  // For create/save operations, full objects will include all required fields.
  // For partial updates, only validate fields that are actually provided.
  private static validateContact(contact: Partial<StoredContact>): void {
    if ("name" in contact) {
      const name = contact.name as string | undefined;
      if (!name || name.trim().length === 0) {
        throw new ValidationError("Contact name is required");
      }
    }
    if ("levelId" in contact) {
      if (!contact.levelId) {
        throw new ValidationError("Contact level is required");
      }
    }
    if ("platform" in contact) {
      if (!contact.platform) {
        throw new ValidationError("Contact platform is required");
      }
    }
    if (
      contact.strength !== undefined &&
      (contact.strength < 0 || contact.strength > 1)
    ) {
      throw new ValidationError("Contact strength must be between 0 and 1");
    }
  }

  // Get user's contacts with proper error handling
  static async getUserContacts(
    userId?: string,
  ): Promise<DatabaseResponse<StoredContact[]>> {
    try {
      this.validateFirebaseConnection();
      const targetUserId = userId || this.getCurrentUserId();

      const contactsRef = collection(db!, "contacts");
      const q = query(
        contactsRef,
        where("userId", "==", targetUserId),
        orderBy("importDate", "desc"),
      );

      const querySnapshot = await getDocs(q);
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

      return this.createResponse(contacts, "getUserContacts", targetUserId);
    } catch (error) {
      if (error instanceof DatabaseError) {
        return this.createErrorResponse(error, "getUserContacts");
      }
      return this.createErrorResponse(
        new DatabaseError(
          `Failed to retrieve contacts: ${error instanceof Error ? error.message : "Unknown error"}`,
          "FETCH_ERROR",
        ),
        "getUserContacts",
      );
    }
  }

  // Get specific contact by ID with authorization check
  static async getContactById(
    contactId: string,
    userId?: string,
  ): Promise<DatabaseResponse<StoredContact>> {
    try {
      this.validateFirebaseConnection();
      const targetUserId = userId || this.getCurrentUserId();

      const contactRef = doc(db!, "contacts", contactId);
      const contactDoc = await getDoc(contactRef);

      if (!contactDoc.exists()) {
        throw new NotFoundError("Contact", contactId);
      }

      const data = contactDoc.data();

      // Authorization check - ensure user can only access their own data
      if (data.userId !== targetUserId) {
        throw new AuthorizationError(
          "You are not authorized to access this contact",
        );
      }

      const contact: StoredContact = {
        ...data,
        firestoreId: contactDoc.id,
        lastContact: data.lastContact?.toDate
          ? data.lastContact.toDate()
          : new Date(data.lastContact),
        importDate: data.importDate?.toDate
          ? data.importDate.toDate()
          : new Date(data.importDate),
      } as StoredContact;

      return this.createResponse(contact, "getContactById", targetUserId);
    } catch (error) {
      if (error instanceof DatabaseError) {
        return this.createErrorResponse(error, "getContactById");
      }
      return this.createErrorResponse(
        new DatabaseError(
          `Failed to retrieve contact: ${error instanceof Error ? error.message : "Unknown error"}`,
          "FETCH_ERROR",
        ),
        "getContactById",
      );
    }
  }

  // Save contacts with user scoping and validation
  static async saveUserContacts(
    contacts: StoredContact[],
    userId?: string,
  ): Promise<DatabaseResponse<{ saved: number; skipped: number }>> {
    try {
      this.validateFirebaseConnection();
      const targetUserId = userId || this.getCurrentUserId();

      // Validate all contacts before saving
      contacts.forEach((contact, index) => {
        try {
          this.validateContact(contact);
        } catch (error) {
          throw new ValidationError(
            `Contact at index ${index}: ${error instanceof Error ? error.message : "Invalid data"}`,
          );
        }
      });

      const batch = writeBatch(db!);
      const contactsRef = collection(db!, "contacts");
      let saved = 0;
      let skipped = 0;

      for (const contact of contacts) {
        try {
          const docRef = doc(contactsRef);
          const contactData = {
            ...contact,
            userId: targetUserId, // Ensure user scoping
            lastContact:
              contact.lastContact instanceof Date
                ? Timestamp.fromDate(contact.lastContact)
                : Timestamp.fromDate(new Date(contact.lastContact)),
            importDate:
              contact.importDate instanceof Date
                ? Timestamp.fromDate(contact.importDate)
                : Timestamp.fromDate(new Date(contact.importDate)),
            updatedAt: Timestamp.now(),
            // Remove firestoreId from saved data
            firestoreId: undefined,
          };

          // Clean up undefined values
          Object.keys(contactData).forEach((key) => {
            if (contactData[key as keyof typeof contactData] === undefined) {
              delete contactData[key as keyof typeof contactData];
            }
          });

          batch.set(docRef, contactData);
          saved++;
        } catch (error) {
          console.warn(`Skipping invalid contact: ${contact.name}`, error);
          skipped++;
        }
      }

      await batch.commit();

      return this.createResponse(
        { saved, skipped },
        "saveUserContacts",
        targetUserId,
      );
    } catch (error) {
      if (error instanceof DatabaseError) {
        return this.createErrorResponse(error, "saveUserContacts");
      }
      return this.createErrorResponse(
        new DatabaseError(
          `Failed to save contacts: ${error instanceof Error ? error.message : "Unknown error"}`,
          "SAVE_ERROR",
        ),
        "saveUserContacts",
      );
    }
  }

  // Update specific contact with authorization
  static async updateContact(
    contactId: string,
    updates: Partial<StoredContact>,
    userId?: string,
  ): Promise<DatabaseResponse<StoredContact>> {
    try {
      this.validateFirebaseConnection();
      const targetUserId = userId || this.getCurrentUserId();

      // First verify the contact exists and user has access
      const existingResponse = await this.getContactById(
        contactId,
        targetUserId,
      );
      if (!existingResponse.success) {
        throw new DatabaseError(
          existingResponse.error!.message,
          existingResponse.error!.code,
          existingResponse.error!.statusCode,
        );
      }

      // Validate updates
      this.validateContact(updates);

      const contactRef = doc(db!, "contacts", contactId);
      const updateData = {
        ...updates,
        userId: targetUserId, // Ensure user scoping is maintained
        updatedAt: Timestamp.now(),
        lastContact: updates.lastContact
          ? updates.lastContact instanceof Date
            ? Timestamp.fromDate(updates.lastContact)
            : Timestamp.fromDate(new Date(updates.lastContact))
          : undefined,
        importDate: updates.importDate
          ? updates.importDate instanceof Date
            ? Timestamp.fromDate(updates.importDate)
            : Timestamp.fromDate(new Date(updates.importDate))
          : undefined,
        // Remove firestoreId from updates
        firestoreId: undefined,
      };

      // Clean up undefined values
      Object.keys(updateData).forEach((key) => {
        if (updateData[key as keyof typeof updateData] === undefined) {
          delete updateData[key as keyof typeof updateData];
        }
      });

      await updateDoc(contactRef, updateData);

      // Return updated contact
      const updatedResponse = await this.getContactById(
        contactId,
        targetUserId,
      );
      return updatedResponse;
    } catch (error) {
      if (error instanceof DatabaseError) {
        return this.createErrorResponse(error, "updateContact");
      }
      return this.createErrorResponse(
        new DatabaseError(
          `Failed to update contact: ${error instanceof Error ? error.message : "Unknown error"}`,
          "UPDATE_ERROR",
        ),
        "updateContact",
      );
    }
  }

  // Delete contact with authorization
  static async deleteContact(
    contactId: string,
    userId?: string,
  ): Promise<DatabaseResponse<{ deleted: boolean }>> {
    try {
      this.validateFirebaseConnection();
      const targetUserId = userId || this.getCurrentUserId();

      // First verify the contact exists and user has access
      const existingResponse = await this.getContactById(
        contactId,
        targetUserId,
      );
      if (!existingResponse.success) {
        throw new DatabaseError(
          existingResponse.error!.message,
          existingResponse.error!.code,
          existingResponse.error!.statusCode,
        );
      }

      const contactRef = doc(db!, "contacts", contactId);
      await deleteDoc(contactRef);

      return this.createResponse(
        { deleted: true },
        "deleteContact",
        targetUserId,
      );
    } catch (error) {
      if (error instanceof DatabaseError) {
        return this.createErrorResponse(error, "deleteContact");
      }
      return this.createErrorResponse(
        new DatabaseError(
          `Failed to delete contact: ${error instanceof Error ? error.message : "Unknown error"}`,
          "DELETE_ERROR",
        ),
        "deleteContact",
      );
    }
  }

  // Get contacts by source with user scoping
  static async getContactsBySource(
    source: "facebook" | "linkedin" | "manual",
    userId?: string,
  ): Promise<DatabaseResponse<StoredContact[]>> {
    try {
      this.validateFirebaseConnection();
      const targetUserId = userId || this.getCurrentUserId();

      const contactsRef = collection(db!, "contacts");
      const q = query(
        contactsRef,
        where("userId", "==", targetUserId),
        where("source", "==", source),
        orderBy("importDate", "desc"),
      );

      const querySnapshot = await getDocs(q);
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

      return this.createResponse(contacts, "getContactsBySource", targetUserId);
    } catch (error) {
      if (error instanceof DatabaseError) {
        return this.createErrorResponse(error, "getContactsBySource");
      }
      return this.createErrorResponse(
        new DatabaseError(
          `Failed to retrieve contacts by source: ${error instanceof Error ? error.message : "Unknown error"}`,
          "FETCH_ERROR",
        ),
        "getContactsBySource",
      );
    }
  }

  // Clear all user contacts with confirmation
  static async clearUserContacts(
    userId?: string,
    confirmationToken?: string,
  ): Promise<DatabaseResponse<{ deleted: number }>> {
    try {
      this.validateFirebaseConnection();
      const targetUserId = userId || this.getCurrentUserId();

      // Simple confirmation mechanism
      if (confirmationToken !== `CONFIRM_DELETE_${targetUserId}`) {
        throw new ValidationError(
          "Invalid confirmation token for bulk delete operation",
        );
      }

      const contactsRef = collection(db!, "contacts");
      const q = query(contactsRef, where("userId", "==", targetUserId));
      const querySnapshot = await getDocs(q);

      const batch = writeBatch(db!);
      let deleted = 0;

      querySnapshot.forEach((doc) => {
        batch.delete(doc.ref);
        deleted++;
      });

      await batch.commit();

      return this.createResponse(
        { deleted },
        "clearUserContacts",
        targetUserId,
      );
    } catch (error) {
      if (error instanceof DatabaseError) {
        return this.createErrorResponse(error, "clearUserContacts");
      }
      return this.createErrorResponse(
        new DatabaseError(
          `Failed to clear contacts: ${error instanceof Error ? error.message : "Unknown error"}`,
          "DELETE_ERROR",
        ),
        "clearUserContacts",
      );
    }
  }

  // Get user statistics
  static async getUserStats(userId?: string): Promise<
    DatabaseResponse<{
      total: number;
      bySource: Record<string, number>;
      byLevel: Record<string, number>;
      lastUpdated: Date;
    }>
  > {
    try {
      const contactsResponse = await this.getUserContacts(userId);
      if (!contactsResponse.success) {
        throw new DatabaseError(
          contactsResponse.error!.message,
          contactsResponse.error!.code,
          contactsResponse.error!.statusCode,
        );
      }

      const contacts = contactsResponse.data!;
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

      return this.createResponse(
        { total, bySource, byLevel, lastUpdated },
        "getUserStats",
        userId,
      );
    } catch (error) {
      if (error instanceof DatabaseError) {
        return this.createErrorResponse(error, "getUserStats");
      }
      return this.createErrorResponse(
        new DatabaseError(
          `Failed to get user stats: ${error instanceof Error ? error.message : "Unknown error"}`,
          "STATS_ERROR",
        ),
        "getUserStats",
      );
    }
  }
}
