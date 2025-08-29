// Type definitions for test helpers

// Interface for Contact type used in tests
export interface Contact {
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

// Interface for MockUser type used in tests
export interface MockUser {
  uid: string;
  email?: string;
  displayName?: string;
  // Add other user properties as needed
}

// Type for test helpers
export interface TestHelpers {
  // Mock setup and teardown
  cleanupMocks(): void;
  setupCanvasMock(): void;
  setupFirebaseAuth(user?: MockUser | null): void;
  setupContactStorage(contacts: Contact[]): void;

  // File handling
  mockFileReader(result: string | ArrayBuffer | null): void;
  createMockFile(content: string, fileName: string, type?: string): File;
  createMockLinkedInCSV(): File;
  createMockFacebookJSON(): File;
  createMockFacebookJSONV2(): File;

  // Test data generation
  createMockRelationship(overrides?: Partial<Contact>): Contact;
  createMockLevel(overrides?: any): any;

  // DOM and browser mocks
  mockMatchMedia(matches?: boolean): void;
  triggerResize(width: number, height: number): void;
  waitFor(ms?: number): Promise<void>;

  // Error simulation
  simulateStorageError(errorMessage?: string): void;
  clearStorageError(): void;
  simulateStorageUnavailable(): void;
  restoreStorageMock(): void;

  // Other test helpers
  setupThemeStorage(theme: "light" | "dark" | "system"): void;
  mockResponsiveBreakpoint(breakpoint: "mobile" | "tablet" | "desktop"): void;
  simulateCanvasError(
    errorType: "toDataURL" | "toBlob" | "getContext",
    errorMessage?: string,
  ): void;
  restoreCanvasMocks(): void;
  setupURLMocks(): void;
  simulateURLError(errorMessage?: string): void;
  setupRouterMocks(): void;
  mockFetch(response: any, status?: number): void;

  // Firebase auth error helpers
  mockAuthError(errorMessage?: string): void;
  mockSignOutError(errorMessage?: string): void;
  mockAuthStateError(errorMessage?: string): void;
}
