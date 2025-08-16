# Database Integration & Authorization

This document describes the enhanced database integration with proper user authorization, error handling, and fallback mechanisms implemented for the Dunbar Circles (Dunbar's Number Visualization) application.

## Overview

The application now features a comprehensive database service layer that provides:

- **User-scoped data access** - Users can only access their own data
- **Proper error handling** - Typed errors with appropriate HTTP status codes
- **Fallback mechanisms** - Graceful degradation when data is incomplete
- **Data validation** - Input sanitization and validation
- **Authorization checks** - Middleware-style authentication verification

## Architecture

### Core Components

1. **DatabaseService** (`lib/database-service.ts`) - Core database operations with authorization
2. **EnhancedContactStorage** (`lib/contact-storage-enhanced.ts`) - High-level storage API with fallbacks
3. **ErrorBoundary** (`components/error-boundary.tsx`) - UI error handling components
4. **DataStatus** (`components/data-status.tsx`) - Data completeness and source indicators
5. **useAuth** (`hooks/use-auth.tsx`) - Authentication state management

### Data Flow

```
User Request → Authentication Check → Database Service → Firestore/LocalStorage → Fallback to Sample Data
```

## Features

### 1. User Authorization

All database operations are scoped to the authenticated user:

```typescript
// Automatic user scoping
const contacts = await DatabaseService.getUserContacts();

// Manual user ID specification (for admin operations)
const contacts = await DatabaseService.getUserContacts(specificUserId);
```

**Authorization Features:**

- Automatic user ID extraction from Firebase Auth
- User-scoped queries prevent data leakage
- Authorization errors with proper 401 responses
- Confirmation tokens for destructive operations

### 2. Error Handling

Comprehensive error handling with typed responses:

```typescript
export class DatabaseError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 500,
  ) {
    super(message);
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
```

**Error Types:**

- `AuthorizationError` (401) - Authentication required or access denied
- `NotFoundError` (404) - Resource not found
- `ValidationError` (400) - Invalid input data
- `DatabaseError` (500) - General database errors

### 3. Fallback Mechanisms

Multi-tier fallback system ensures the app always works:

```typescript
// 1. Try Firebase/Firestore first
const dbResult = await DatabaseService.getUserContacts();

// 2. Fall back to localStorage
if (!dbResult.success) {
  const localContacts = loadFromLocalStorage();
}

// 3. Use sample data if needed
if (contacts.length < MIN_CONTACTS_FOR_MEANINGFUL_DATA) {
  const supplementedContacts = [...contacts, ...SAMPLE_CONTACTS];
}
```

**Fallback Hierarchy:**

1. **Firebase/Firestore** - Primary cloud storage
2. **localStorage** - Local browser storage backup
3. **Sample Data** - Demonstration data for new users

### 4. Data Validation

Input validation and sanitization:

```typescript
private static validateContact(contact: Partial<StoredContact>): void {
  if (!contact.name || contact.name.trim().length === 0) {
    throw new ValidationError("Contact name is required");
  }
  if (contact.strength !== undefined && (contact.strength < 0 || contact.strength > 1)) {
    throw new ValidationError("Contact strength must be between 0 and 1");
  }
}
```

**Validation Features:**

- Required field validation
- Data type checking
- Range validation for numeric fields
- Sanitization of user inputs

## API Reference

### DatabaseService

Core database operations with user authorization:

```typescript
// Get user's contacts
static async getUserContacts(userId?: string): Promise<DatabaseResponse<StoredContact[]>>

// Get specific contact by ID
static async getContactById(contactId: string, userId?: string): Promise<DatabaseResponse<StoredContact>>

// Save contacts with user scoping
static async saveUserContacts(contacts: StoredContact[], userId?: string): Promise<DatabaseResponse<{saved: number, skipped: number}>>

// Update specific contact
static async updateContact(contactId: string, updates: Partial<StoredContact>, userId?: string): Promise<DatabaseResponse<StoredContact>>

// Delete contact
static async deleteContact(contactId: string, userId?: string): Promise<DatabaseResponse<{deleted: boolean}>>

// Get contacts by source
static async getContactsBySource(source: "facebook" | "linkedin" | "manual", userId?: string): Promise<DatabaseResponse<StoredContact[]>>

// Clear all user contacts (requires confirmation)
static async clearUserContacts(userId?: string, confirmationToken?: string): Promise<DatabaseResponse<{deleted: number}>>

// Get user statistics
static async getUserStats(userId?: string): Promise<DatabaseResponse<UserStats>>
```

### EnhancedContactStorage

High-level storage API with fallback mechanisms:

```typescript
// Load contacts with fallback
static async loadContacts(): Promise<ContactOperationResult<StoredContact[]>>

// Get specific contact by ID
static async getContactById(contactId: string): Promise<ContactOperationResult<StoredContact>>

// Add new contacts with deduplication
static async addContacts(newContacts: Person[], source: "facebook" | "linkedin" | "manual"): Promise<ContactOperationResult<{added: number, skipped: number}>>

// Update contact
static async updateContact(contactId: string, updates: Partial<StoredContact>): Promise<ContactOperationResult<StoredContact>>

// Delete contact
static async deleteContact(contactId: string): Promise<ContactOperationResult<{deleted: boolean}>>

// Get user statistics
static async getStats(): Promise<ContactOperationResult<UserStats>>

// Check data completeness
static async checkDataCompleteness(): Promise<DataCompletenessReport>
```

### Response Types

All operations return structured responses:

```typescript
interface DatabaseResponse<T> {
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

interface ContactOperationResult<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  fallbackUsed?: boolean;
  source: "database" | "localStorage" | "sample";
}
```

## Usage Examples

### Basic Contact Loading

```typescript
import { EnhancedContactStorage } from "@/lib/contact-storage-enhanced";

const loadUserContacts = async () => {
  const result = await EnhancedContactStorage.loadContacts();

  if (result.success && result.data) {
    setContacts(result.data);

    if (result.fallbackUsed) {
      showMessage(`Loaded from ${result.source} with sample data included`);
    }
  } else {
    showError(result.error || "Failed to load contacts");
  }
};
```

### Error Handling with UI Components

```typescript
import { ErrorBoundary, DataErrorFallback } from "@/components/error-boundary";

<ErrorBoundary
  fallback={({ error, retry }) => (
    <DataErrorFallback
      error={error}
      retry={retry}
      showSampleData={() => loadSampleData()}
    />
  )}
>
  <ContactsList />
</ErrorBoundary>
```

### Data Status Monitoring

```typescript
import { DataStatus } from "@/components/data-status";

<DataStatus
  onImportClick={() => setShowImportDialog(true)}
  onRefresh={() => refreshData()}
/>
```

### Authentication-Required Operations

```typescript
import { useAuth } from "@/hooks/use-auth";

const ContactManager = () => {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) return <LoadingSpinner />;
  if (!isAuthenticated) return <SignInPrompt />;

  // User is authenticated, proceed with operations
  return <ContactsList />;
};
```

## Security Considerations

### Data Isolation

- All database queries include user ID filters
- Cross-user data access is prevented at the database level
- Authorization checks occur before any data operations

### Input Validation

- All user inputs are validated and sanitized
- Type checking prevents injection attacks
- Range validation prevents invalid data states

### Error Information

- Error messages don't leak sensitive information
- Stack traces are logged server-side only
- User-friendly error messages for UI display

## Performance Optimizations

### Caching Strategy

- localStorage serves as a local cache
- Firestore queries are optimized with proper indexing
- Batch operations reduce database round trips

### Lazy Loading

- Data is loaded on-demand
- Large datasets are paginated
- Background sync for better UX

### Fallback Performance

- Sample data loads instantly
- localStorage access is synchronous
- Progressive enhancement approach

## Testing

### Unit Tests

```typescript
describe("DatabaseService", () => {
  it("should require authentication for user operations", async () => {
    // Mock unauthenticated state
    jest.spyOn(auth, "currentUser", "get").mockReturnValue(null);

    await expect(DatabaseService.getUserContacts()).rejects.toThrow(
      AuthorizationError,
    );
  });

  it("should return 404 for non-existent contacts", async () => {
    const result = await DatabaseService.getContactById("non-existent-id");
    expect(result.success).toBe(false);
    expect(result.error?.statusCode).toBe(404);
  });
});
```

### Integration Tests

```typescript
describe("EnhancedContactStorage", () => {
  it("should fall back to localStorage when Firebase fails", async () => {
    // Mock Firebase failure
    jest
      .spyOn(DatabaseService, "getUserContacts")
      .mockRejectedValue(new Error("Firebase error"));

    const result = await EnhancedContactStorage.loadContacts();
    expect(result.source).toBe("localStorage");
  });
});
```

## Migration Guide

### From Legacy ContactStorage

1. Replace `ContactStorage` imports with `EnhancedContactStorage`
2. Update method calls to use async/await pattern
3. Handle `ContactOperationResult` response types
4. Add error boundaries to UI components

### Example Migration

**Before:**

```typescript
const contacts = ContactStorage.loadContacts();
ContactStorage.addContacts(newContacts, "facebook");
```

**After:**

```typescript
const result = await EnhancedContactStorage.loadContacts();
if (result.success) {
  const contacts = result.data;
}

const addResult = await EnhancedContactStorage.addContacts(
  newContacts,
  "facebook",
);
if (addResult.success) {
  console.log(`Added ${addResult.data.added} contacts`);
}
```

## Troubleshooting

### Common Issues

1. **Authentication Errors**

   - Ensure user is signed in before database operations
   - Check Firebase Auth configuration
   - Verify user permissions

2. **Data Not Loading**

   - Check network connectivity
   - Verify Firestore rules
   - Check browser console for errors

3. **Fallback Not Working**
   - Ensure localStorage is enabled
   - Check sample data configuration
   - Verify error handling logic

### Debug Mode

Enable debug logging:

```typescript
// Set in environment or localStorage
localStorage.setItem("Dunbar Circles_DEBUG", "true");
```

This will provide detailed logging of:

- Database operations
- Fallback mechanisms
- Error details
- Performance metrics

## Future Enhancements

### Planned Features

1. **Offline Support** - Service worker for offline functionality
2. **Real-time Sync** - Live updates across devices
3. **Data Export** - Enhanced export with user authorization
4. **Audit Logging** - Track all data access and modifications
5. **Advanced Caching** - Intelligent cache invalidation
6. **Bulk Operations** - Efficient batch processing

### Performance Improvements

1. **Query Optimization** - Advanced Firestore query patterns
2. **Pagination** - Handle large datasets efficiently
3. **Background Sync** - Non-blocking data synchronization
4. **Compression** - Reduce data transfer sizes

This enhanced database integration provides a robust, secure, and user-friendly foundation for the Dunbar Circles application's data management needs.
