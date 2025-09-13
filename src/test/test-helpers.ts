import { vi } from "vitest";
import { firebaseMocks } from "./firebase-mocks";
import {
  localStorageMock,
  sessionStorageMock,
  mockStorageWithData,
} from "./storage-mocks";
import { createCanvasContextMock } from "./canvas-mocks";
import type { TestHelpers } from "./test-helpers.types";

// Helper to setup Firebase mocks with specific user state
export const setupFirebaseAuth = async (user: any = null) => {
  if (user) {
    firebaseMocks.setAuthUser(user);
  } else {
    firebaseMocks.clearAuthUser();
  }

  // Also mock the auth-utils functions
  try {
    const authUtils = await vi.importMock("../lib/auth-utils");
    if (authUtils) {
      const mockAuthUtils = authUtils as {
        signInWithGoogle: {
          mockResolvedValue: (value: any) => void;
          mockRejectedValue: (error: Error) => void;
        };
        signOut: {
          mockResolvedValue: (value: void) => void;
        };
      };

      if (user) {
        mockAuthUtils.signInWithGoogle?.mockResolvedValue({ user });
        mockAuthUtils.signOut?.mockResolvedValue(undefined);
      } else {
        mockAuthUtils.signInWithGoogle?.mockRejectedValue(
          new Error("Not authenticated"),
        );
        mockAuthUtils.signOut?.mockResolvedValue(undefined);
      }
    }
  } catch (error) {
    // Ignore if auth-utils is not mocked
  }
};

// Helper to setup localStorage with theme data
export const setupThemeStorage = (
  theme: "light" | "dark" | "system" = "light",
) => {
  mockStorageWithData(localStorageMock, {
    "vite-ui-theme": theme,
  });
};

// Helper to setup localStorage with contact data
export const setupContactStorage = (contacts: any[] = []) => {
  mockStorageWithData(localStorageMock, {
    "yakw-contacts": JSON.stringify(contacts),
  });
};

// Helper to simulate localStorage errors
export const simulateStorageError = (
  errorMessage: string = "Storage error",
) => {
  localStorageMock._simulateError(errorMessage);
};

// Helper to clear localStorage error simulation
export const clearStorageError = () => {
  localStorageMock._clearError();
};

// Helper to simulate localStorage being completely unavailable
export const simulateStorageUnavailable = () => {
  Object.defineProperty(window, "localStorage", {
    value: undefined,
    writable: true,
  });
};

// Helper to restore localStorage mock
export const restoreStorageMock = () => {
  Object.defineProperty(window, "localStorage", {
    value: localStorageMock,
    writable: true,
  });
};

// Helper to mock window.matchMedia with specific queries
export const mockMatchMedia = (
  matches: boolean = false,
  customQueries?: Record<string, boolean>,
) => {
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    configurable: true,
    value: vi.fn().mockImplementation((query: string) => {
      // Handle custom query mappings if provided
      let queryMatches = matches;
      if (customQueries && query in customQueries) {
        queryMatches = customQueries[query];
      }

      return {
        matches: queryMatches,
        media: query || "",
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      };
    }),
  });
};

// Helper to simulate window.matchMedia being unavailable
export const mockMatchMediaUnavailable = () => {
  delete (window as any).matchMedia;
};

// Helper to simulate window.matchMedia throwing errors
export const mockMatchMediaError = (
  errorMessage: string = "matchMedia not supported",
) => {
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    configurable: true,
    value: vi.fn().mockImplementation(() => {
      throw new Error(errorMessage);
    }),
  });
};

// Helper to restore window.matchMedia to default mock
export const restoreMatchMedia = () => {
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    configurable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query || "",
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
};

// Helper to mock responsive breakpoints
export const mockResponsiveBreakpoint = (
  breakpoint: "mobile" | "tablet" | "desktop",
) => {
  const breakpoints = {
    mobile: "(max-width: 768px)",
    tablet: "(min-width: 769px) and (max-width: 1024px)",
    desktop: "(min-width: 1025px)",
  };

  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: vi.fn().mockImplementation((query) => ({
      matches: query === breakpoints[breakpoint],
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
};

// Helper to create mock file for testing file uploads
export const createMockFile = (
  content: string,
  filename: string,
  type: string = "text/plain",
) => {
  const blob = new Blob([content], { type });
  const file = new File([blob], filename, { type });
  return file;
};

// Helper to create mock CSV file for LinkedIn import
export const createMockLinkedInCSV = () => {
  const csvContent = `First Name,Last Name,Email Address,Company,Position,Connected On
John,Doe,john.doe@example.com,Example Corp,Software Engineer,01-Jan-2023
Jane,Smith,jane.smith@example.com,Tech Inc,Product Manager,15-Feb-2023`;
  return createMockFile(csvContent, "connections.csv", "text/csv");
};

// Helper to create mock JSON file for Facebook import (old format)
export const createMockFacebookJSON = () => {
  const jsonContent = JSON.stringify({
    friends: {
      data: [
        {
          name: "John Doe",
          timestamp: 1640995200,
        },
        {
          name: "Jane Smith",
          timestamp: 1643673600,
        },
      ],
    },
  });
  return createMockFile(jsonContent, "friends.json", "application/json");
};

// Helper to create mock JSON file for Facebook import (new v2 format)
export const createMockFacebookJSONV2 = () => {
  const jsonContent = JSON.stringify({
    friends_v2: [
      {
        name: "Martin Keshkekidis",
        timestamp: 1694403736,
      },
      {
        name: "Yuri Kuznetsov",
        timestamp: 1672874610,
      },
      {
        name: "Leyla Shukurova",
        timestamp: 1661808787,
      },
    ],
  });
  return createMockFile(jsonContent, "friends_v2.json", "application/json");
};

// Helper to mock FileReader for file processing
export const mockFileReader = (result: string) => {
  const mockReader = {
    readAsText: vi.fn(function (this: any) {
      setTimeout(() => {
        this.onload?.({ target: { result } });
      }, 0);
    }),
    readAsDataURL: vi.fn(function (this: any) {
      setTimeout(() => {
        this.onload?.({
          target: { result: `data:text/plain;base64,${btoa(result)}` },
        });
      }, 0);
    }),
    onload: null,
    onerror: null,
    result: null,
  };

  global.FileReader = vi.fn().mockImplementation(() => mockReader) as any;
  return mockReader;
};

// Helper to wait for async operations in tests
export const waitFor = (ms: number = 0): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

// Helper to trigger resize events for responsive testing
export const triggerResize = (width: number, height: number) => {
  Object.defineProperty(window, "innerWidth", {
    writable: true,
    configurable: true,
    value: width,
  });
  Object.defineProperty(window, "innerHeight", {
    writable: true,
    configurable: true,
    value: height,
  });
  window.dispatchEvent(new Event("resize"));
};

// Helper to mock canvas for visualization testing with proper type compatibility and error handling
export const setupCanvasMock = () => {
  const context = createCanvasContextMock();

  // Mock HTMLCanvasElement.prototype methods with proper typing and error handling
  HTMLCanvasElement.prototype.getContext = vi.fn(
    (contextType: string, contextAttributes?: any) => {
      // contextAttributes parameter is intentionally unused in mock
      void contextAttributes;
      if (contextType === "2d") {
        return context as CanvasRenderingContext2D;
      }
      return null;
    },
  ) as any;

  // Enhanced toDataURL mock with error handling support
  HTMLCanvasElement.prototype.toDataURL = vi.fn(
    (type?: string, quality?: any) => {
      const mimeType = type || "image/png";
      // quality parameter is intentionally unused in mock
      void quality;
      return `data:${mimeType};base64,mock`;
    },
  );

  // Enhanced toBlob mock with error handling support
  HTMLCanvasElement.prototype.toBlob = vi.fn(
    (callback?: BlobCallback | null, type?: string, quality?: any) => {
      const mimeType = type || "image/png";
      // quality parameter is intentionally unused in mock
      void quality;

      try {
        const blob = new Blob(["mock"], { type: mimeType });
        if (callback) {
          setTimeout(() => callback(blob), 0);
        }
      } catch (error) {
        // Handle blob creation errors gracefully
        if (callback) {
          setTimeout(() => callback(null), 0);
        }
      }
    },
  );

  // Mock getBoundingClientRect for canvas positioning
  HTMLCanvasElement.prototype.getBoundingClientRect = vi.fn(
    () =>
      ({
        x: 0,
        y: 0,
        width: 300,
        height: 150,
        top: 0,
        left: 0,
        bottom: 150,
        right: 300,
        toJSON: () => ({}),
      }) as DOMRect,
  );

  return context;
};

// Helper to simulate Canvas errors for testing error handling
export const simulateCanvasError = (
  errorType: "toDataURL" | "toBlob" | "getContext",
  errorMessage: string = "Canvas operation failed",
) => {
  switch (errorType) {
    case "toDataURL":
      HTMLCanvasElement.prototype.toDataURL = vi.fn(() => {
        throw new Error(errorMessage);
      });
      break;
    case "toBlob":
      HTMLCanvasElement.prototype.toBlob = vi.fn(
        (callback?: BlobCallback | null) => {
          if (callback) {
            setTimeout(() => callback(null), 0);
          }
        },
      );
      break;
    case "getContext":
      HTMLCanvasElement.prototype.getContext = vi.fn(() => null);
      break;
  }
};

// Helper to restore Canvas mocks to working state
export const restoreCanvasMocks = () => {
  setupCanvasMock();
};

// Helper to mock URL.createObjectURL with error handling
export const setupURLMocks = () => {
  global.URL.createObjectURL = vi.fn((_blob: Blob) => {
    return `mock-blob-url-${Date.now()}`;
  });

  global.URL.revokeObjectURL = vi.fn();
};

// Helper to simulate URL creation errors
export const simulateURLError = (
  errorMessage: string = "URL creation failed",
) => {
  global.URL.createObjectURL = vi.fn(() => {
    throw new Error(errorMessage);
  });
};

// Note: setupAnimationFrameMocks is now exported from canvas-mocks.ts to avoid duplication

// Helper to setup Router context mocks
export const setupRouterMocks = () => {
  // Ensure Router context is properly mocked
  vi.mock("react-router-dom", async () => {
    const actual = await vi.importActual("react-router-dom");
    return {
      ...actual,
      useNavigate: () => vi.fn(),
      useLocation: () => ({
        pathname: "/",
        search: "",
        hash: "",
        state: null,
        key: "test",
      }),
      useRouterContext: () => ({
        basename: "",
        navigator: {
          push: vi.fn(),
          replace: vi.fn(),
          go: vi.fn(),
          back: vi.fn(),
          forward: vi.fn(),
          createHref: vi.fn(),
        },
        static: false,
      }),
    };
  });
};

// Helper to clean up all mocks
export const cleanupMocks = () => {
  vi.clearAllMocks();

  // Use safe cleanup methods that don't throw errors
  try {
    if (localStorageMock && typeof localStorageMock._safeClear === "function") {
      localStorageMock._safeClear();
    } else if (
      localStorageMock &&
      typeof localStorageMock.clear === "function"
    ) {
      localStorageMock.clear();
    }
  } catch (error) {
    // Ignore cleanup errors
  }

  try {
    if (
      sessionStorageMock &&
      typeof sessionStorageMock._safeClear === "function"
    ) {
      sessionStorageMock._safeClear();
    } else if (
      sessionStorageMock &&
      typeof sessionStorageMock.clear === "function"
    ) {
      sessionStorageMock.clear();
    }
  } catch (error) {
    // Ignore cleanup errors
  }

  // Clear error states
  try {
    localStorageMock._clearError();
    sessionStorageMock._clearError();
  } catch (error) {
    // Ignore if methods don't exist
  }

  restoreStorageMock();
  firebaseMocks.resetAuthState();
  setupRouterMocks(); // Ensure Router mocks are reset
};

// Helper to mock network requests (for future API integration)
export const mockFetch = (response: any, status: number = 200) => {
  global.fetch = vi.fn(() =>
    Promise.resolve({
      ok: status >= 200 && status < 300,
      status,
      json: () => Promise.resolve(response),
      text: () => Promise.resolve(JSON.stringify(response)),
    }),
  ) as any;
};

// Helper to create mock relationship data
export const createMockRelationship = (overrides: any = {}) => {
  return {
    id: "mock-id",
    name: "Test Person",
    levelId: "inner-circle",
    lastContact: new Date(),
    contactFrequency: 7,
    strength: 0.9,
    decayRate: 0.1,
    platform: "manual",
    ...overrides,
  };
};

// Helper to create mock level data
export const createMockLevel = (overrides: any = {}) => {
  return {
    id: "inner-circle",
    name: "Inner Circle",
    count: 5,
    description: "Daily contact, high emotional investment",
    contactFrequency: "Daily",
    color: "#ef4444",
    category: "intimate",
    ...overrides,
  };
};

// Export all helpers for easy importing
export const testHelpers: TestHelpers = {
  setupFirebaseAuth,
  setupThemeStorage,
  setupContactStorage,
  simulateStorageError,
  clearStorageError,
  simulateStorageUnavailable,
  restoreStorageMock,
  mockMatchMedia,
  mockResponsiveBreakpoint,
  createMockFile,
  createMockLinkedInCSV,
  createMockFacebookJSON,
  createMockFacebookJSONV2,
  mockFileReader,
  waitFor,
  triggerResize,
  setupCanvasMock,
  simulateCanvasError,
  restoreCanvasMocks,
  setupURLMocks,
  simulateURLError,
  setupRouterMocks,
  cleanupMocks,
  mockFetch,
  createMockRelationship,
  createMockLevel,
  // Firebase auth error helpers
  mockAuthError: firebaseMocks.mockAuthError,
  mockSignOutError: firebaseMocks.mockSignOutError,
  mockAuthStateError: firebaseMocks.mockAuthStateError,
};

// For Node.js environment
if (typeof global !== "undefined") {
  (global as any).testHelpers = testHelpers;
}

// For browser environment
if (typeof window !== "undefined") {
  (window as any).testHelpers = testHelpers;
}
