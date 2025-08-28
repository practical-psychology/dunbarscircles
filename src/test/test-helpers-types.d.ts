// Type definitions for test helpers
declare namespace TestHelpers {
  export function cleanupMocks(): void;
  export function setupCanvasMock(): void;
  export function setupFirebaseAuth(user?: any): void;
  export function mockFileReader(result: string): void;
  export function createMockFile(
    content: string,
    filename: string,
    type?: string,
  ): File;
  export function createMockFacebookJSON(): File;
  export function createMockLinkedInCSV(): File;
  export function setupContactStorage(contacts?: any[]): void;
  export function createMockRelationship(overrides?: any): any;

  // Add other test helper methods as needed
}
