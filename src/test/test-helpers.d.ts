// Type definitions for test helpers

// Interface for Contact type used in tests
interface Contact {
  id: string;
  name: string;
  level: number;
  // Add other contact properties as needed
}

// Interface for MockUser type used in tests
interface MockUser {
  uid: string;
  email?: string;
  displayName?: string;
  // Add other user properties as needed
}

declare module "./test-helpers" {
  // Mock setup and teardown
  export function cleanupMocks(): void;
  export function setupCanvasMock(): void;
  export function setupFirebaseAuth(user?: MockUser): void;
  export function setupContactStorage(contacts: Contact[]): void;

  // File handling
  export function mockFileReader(result: string | ArrayBuffer | null): void;
  export function createMockFile(
    content: string,
    fileName: string,
    type?: string,
  ): File;
  export function createMockLinkedInCSV(): File;
  export function createMockFacebookJSON(): File;
  export function createMockFacebookJSONV2(): File;

  // Test data generation
  export function createMockRelationship(overrides?: Partial<Contact>): Contact;
  export function createMockLevel(overrides?: any): any;

  // DOM and browser mocks
  export function mockMatchMedia(matches?: boolean): void;
  export function triggerResize(width: number, height: number): void;
  export function waitFor(ms?: number): Promise<void>;

  // Error simulation
  export function simulateStorageError(errorMessage?: string): void;
  export function clearStorageError(): void;
  export function simulateStorageUnavailable(): void;
  export function restoreStorageMock(): void;

  // Other test helpers
  export function setupThemeStorage(theme: "light" | "dark" | "system"): void;
  export function mockResponsiveBreakpoint(
    breakpoint: "mobile" | "tablet" | "desktop",
  ): void;
  export function simulateCanvasError(
    errorType: "toDataURL" | "toBlob" | "getContext",
    errorMessage?: string,
  ): void;
  export function setupURLMocks(): void;
  export function simulateURLError(errorMessage?: string): void;
  export function mockFetch(response: any, status?: number): void;
}

// Augment the global scope for test helpers
declare global {
  // For browser environment
  interface Window {
    testHelpers: typeof import("./test-helpers");
  }

  // For Node.js environment
  namespace NodeJS {
    interface Global {
      testHelpers: typeof import("./test-helpers");
    }
  }
  export function createMockLevel(overrides?: any): any;

  export const testHelpers: {
    setupFirebaseAuth: typeof setupFirebaseAuth;
    setupThemeStorage: typeof setupThemeStorage;
    setupContactStorage: typeof setupContactStorage;
    simulateStorageError: typeof simulateStorageError;
    clearStorageError: typeof clearStorageError;
    simulateStorageUnavailable: typeof simulateStorageUnavailable;
    restoreStorageMock: typeof restoreStorageMock;
    mockMatchMedia: typeof mockMatchMedia;
    mockResponsiveBreakpoint: typeof mockResponsiveBreakpoint;
    createMockFile: typeof createMockFile;
    createMockLinkedInCSV: typeof createMockLinkedInCSV;
    createMockFacebookJSON: typeof createMockFacebookJSON;
    createMockFacebookJSONV2: typeof createMockFacebookJSONV2;
    mockFileReader: typeof mockFileReader;
    waitFor: typeof waitFor;
    triggerResize: typeof triggerResize;
    setupCanvasMock: typeof setupCanvasMock;
    simulateCanvasError: typeof simulateCanvasError;
    restoreCanvasMocks: typeof restoreCanvasMocks;
    setupURLMocks: typeof setupURLMocks;
    simulateURLError: typeof simulateURLError;
    cleanupMocks: typeof cleanupMocks;
    mockFetch: typeof mockFetch;
    createMockRelationship: typeof createMockRelationship;
    createMockLevel: typeof createMockLevel;
  };
}
