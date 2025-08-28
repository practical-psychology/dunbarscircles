// Global type declarations for test environment
declare namespace NodeJS {
  interface Global {
    testHelpers: typeof import("./test-helpers");
  }
}

// Extend the global window object for browser tests
interface Window {
  testHelpers: typeof import("./test-helpers");
}

// Declare the test helpers module
declare module "./test-helpers" {
  export function setupFirebaseAuth(user: any): void;
  export function setupThemeStorage(theme: "light" | "dark" | "system"): void;
  export function setupContactStorage(contacts: any[]): void;
  export function simulateStorageError(errorMessage?: string): void;
  export function clearStorageError(): void;
  export function simulateStorageUnavailable(): void;
  export function restoreStorageMock(): void;
  export function mockMatchMedia(matches?: boolean): void;
  export function mockResponsiveBreakpoint(
    breakpoint: "mobile" | "tablet" | "desktop",
  ): void;
  export function createMockFile(
    content: string,
    filename: string,
    type?: string,
  ): File;
  export function createMockLinkedInCSV(): File;
  export function createMockFacebookJSON(): File;
  export function createMockFacebookJSONV2(): File;
  export function mockFileReader(result: string): void;
  export function waitFor(ms?: number): Promise<void>;
  export function triggerResize(width: number, height: number): void;
  export function setupCanvasMock(): void;
  export function simulateCanvasError(
    errorType: "toDataURL" | "toBlob" | "getContext",
    errorMessage?: string,
  ): void;
  export function restoreCanvasMocks(): void;
  export function setupURLMocks(): void;
  export function simulateURLError(errorMessage?: string): void;
  export function cleanupMocks(): void;
  export function mockFetch(response: any, status?: number): void;
  export function createMockRelationship(overrides?: any): any;
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
