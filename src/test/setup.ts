import "@testing-library/jest-dom";
import { vi, beforeAll, afterEach, afterAll, beforeEach } from "vitest";
import { firebaseMocks } from "./firebase-mocks";
import React from "react";

interface LocalStorageMock extends Storage {
  _clearError?: () => void;
}

// Mock react-router-dom to prevent router nesting issues
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
  };
});

// Mock window.matchMedia
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Storage mock implementation
const createStorageMock = (): LocalStorageMock => {
  const store: Record<string, string> = {};

  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = String(value);
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      Object.keys(store).forEach((key) => delete store[key]);
    }),
    key: vi.fn((index: number) => {
      const keys = Object.keys(store);
      return index >= keys.length ? null : keys[index];
    }),
    get length() {
      return Object.keys(store).length;
    },
    _clearError: vi.fn(),
    _getStore: () => ({ ...store }),
    _setStore: (newStore: Record<string, string>) => {
      Object.keys(store).forEach((key) => delete store[key]);
      Object.assign(store, newStore);
    },
  };
};

// Initialize storage mocks
const localStorageMock = createStorageMock();
const sessionStorageMock = createStorageMock();

Object.defineProperty(window, "localStorage", {
  value: localStorageMock,
  configurable: true,
});

Object.defineProperty(window, "sessionStorage", {
  value: sessionStorageMock,
  configurable: true,
});

// Suppress React 18 act() warnings globally
const originalError = console.error;
const originalWarn = console.warn;
const originalConsole = { ...console };

beforeAll(() => {
  // Mock console methods
  global.console = {
    ...originalConsole,
    error: (...args) => {
      // Skip specific error messages
      if (
        /Warning: An update to .* inside a test was not wrapped in act/.test(
          args[0],
        ) ||
        /React Router Future Flag Warning/.test(args[0]) ||
        /React does not recognize the `%s` prop on a DOM element/.test(args[0])
      ) {
        return;
      }
      originalError(...args);
    },
    warn: (...args) => {
      // Skip specific warning messages
      if (
        args[0] &&
        (/React Router Future Flag Warning/.test(args[0]) ||
          /componentWillMount has been renamed/.test(args[0]) ||
          /componentWillReceiveProps has been renamed/.test(args[0]))
      ) {
        return;
      }
      originalWarn(...args);
    },
  };

  // Set up any other global test configurations
  vi.mock("next/head", () => ({
    __esModule: true,
    default: ({ children }: { children: React.ReactNode }) => {
      return React.createElement(React.Fragment, null, children);
    },
  }));

  // Mock next/link
  vi.mock("next/link", () => {
    return ({
      children,
      href,
      ...props
    }: {
      children: React.ReactNode;
      href: string;
      [key: string]: any;
    }) => {
      return React.createElement("a", { href, ...props }, children);
    };
  });
});

afterEach(() => {
  // Clean up after each test
  vi.clearAllMocks();
  localStorage.clear();
});

afterAll(() => {
  // Restore original console methods
  console.error = originalError;
  console.warn = originalWarn;

  // Clean up any other resources
  vi.restoreAllMocks();
});

// Ensure NODE_ENV is set to 'test' for loading screen detection
process.env.NODE_ENV = "test";

// Note: axe-core configuration is handled in individual test files

// Mock window.matchMedia for responsive design testing
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock IntersectionObserver
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Import improved Canvas mocking
import { createCanvasContextMock } from "./canvas-mocks";

// Mock HTMLCanvasElement.getContext for Canvas API testing with proper type compatibility
const mockCanvasContext = createCanvasContextMock();

HTMLCanvasElement.prototype.getContext = vi.fn((contextType: string) => {
  if (contextType === "2d") {
    return mockCanvasContext as CanvasRenderingContext2D;
  }
  return null;
}) as any;

// Mock Canvas toDataURL method with proper type support and error handling
HTMLCanvasElement.prototype.toDataURL = vi.fn(
  (type?: string, _quality?: any) => {
    const mimeType = type || "image/png";
    return `data:${mimeType};base64,mock`;
  },
);

// Mock Canvas toBlob method with proper callback handling and error handling
HTMLCanvasElement.prototype.toBlob = vi.fn(
  (callback?: BlobCallback | null, type?: string, _quality?: any) => {
    const mimeType = type || "image/png";
    try {
      const blob = new Blob(["mock"], { type: mimeType });
      if (callback) {
        setTimeout(() => callback(blob), 0);
      }
    } catch (error) {
      if (callback) {
        setTimeout(() => callback(null), 0);
      }
    }
  },
);

// Mock Canvas getBoundingClientRect for positioning
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

// Clean up duplicate storage mock implementation

// Storage mocks are already defined above

// Mock Firebase configuration and diagnostics
vi.mock("@/firebase-config", () => ({
  firebaseConfig: {
    apiKey: "mock-api-key",
    authDomain: "mock-auth-domain",
    projectId: "mock-project-id",
    storageBucket: "mock-storage-bucket",
    messagingSenderId: "mock-sender-id",
    appId: "mock-app-id",
  },
  app: firebaseMocks.app,
  db: firebaseMocks.firestore,
  auth: firebaseMocks.auth,
  isInitialized: true,
  initializationError: null,
  getFirebaseStatus: vi.fn(() => ({
    isInitialized: true,
    hasApp: true,
    hasDb: true,
    hasAuth: true,
    hasAnalytics: false,
    error: null,
  })),
  reinitializeFirebase: vi.fn(),
}));

vi.mock("@/lib/firebase-diagnostics", () => ({
  runFirebaseDiagnostics: vi.fn(() =>
    Promise.resolve({
      configValid: true,
      connectionWorking: true,
      readPermission: true,
      writePermission: true,
      errors: [],
    }),
  ),
  logFirebaseDiagnostics: vi.fn(),
  testFirebaseConnection: vi.fn(() => Promise.resolve(true)),
}));

// Mock Firebase modules with proper authentication state management
vi.mock("firebase/app", () => ({
  initializeApp: firebaseMocks.initializeApp,
}));

vi.mock("firebase/auth", () => ({
  getAuth: firebaseMocks.getAuth,
  signInWithPopup: firebaseMocks.signInWithPopup,
  signOut: firebaseMocks.signOut,
  onAuthStateChanged: firebaseMocks.onAuthStateChanged,
  GoogleAuthProvider: vi
    .fn()
    .mockImplementation(() => firebaseMocks.googleAuthProvider),
}));

// Mock auth utilities to use the improved Firebase mocks
vi.mock("@/lib/auth-utils", () => ({
  signInWithGoogle: vi.fn(async () => {
    return await firebaseMocks.signInWithPopup(
      firebaseMocks.auth,
      firebaseMocks.googleAuthProvider,
    );
  }),
  signOut: vi.fn(async () => {
    return await firebaseMocks.signOut(firebaseMocks.auth);
  }),
  getUserDisplayName: vi.fn((user: any) => {
    if (!user) return "";
    return user.displayName || user.email?.split("@")[0] || "User";
  }),
}));

vi.mock("firebase/firestore", () => ({
  getFirestore: firebaseMocks.getFirestore,
  collection: firebaseMocks.collection,
  doc: firebaseMocks.doc,
  addDoc: vi.fn(() => Promise.resolve({ id: "mock-doc-id" })),
  setDoc: vi.fn(() => Promise.resolve()),
  updateDoc: vi.fn(() => Promise.resolve()),
  deleteDoc: vi.fn(() => Promise.resolve()),
  getDoc: vi.fn(() =>
    Promise.resolve({
      exists: () => true,
      data: () => ({ test: "data" }),
      id: "mock-doc-id",
    }),
  ),
  getDocs: vi.fn(() =>
    Promise.resolve({
      docs: [],
      forEach: vi.fn(),
      empty: true,
      size: 0,
    }),
  ),
  query: vi.fn(),
  where: vi.fn(),
  orderBy: vi.fn(),
  limit: vi.fn(),
}));

// Mock URL.createObjectURL for file handling
global.URL.createObjectURL = vi.fn(() => "mock-object-url");
global.URL.revokeObjectURL = vi.fn();

// Mock File and FileReader for file upload testing
global.File = vi.fn().mockImplementation((chunks, filename, options) => ({
  name: filename,
  size: chunks.reduce((acc: number, chunk: any) => acc + chunk.length, 0),
  type: options?.type || "",
  lastModified: Date.now(),
})) as any;

global.FileReader = vi.fn().mockImplementation(() => ({
  readAsText: vi.fn(function (this: any) {
    this.onload?.({ target: { result: "mock file content" } });
  }),
  readAsDataURL: vi.fn(function (this: any) {
    this.onload?.({
      target: { result: "data:text/plain;base64,bW9jayBmaWxlIGNvbnRlbnQ=" },
    });
  }),
  onload: null,
  onerror: null,
  result: null,
})) as any;

// Import improved animation frame mocking
import { setupAnimationFrameMocks } from "./canvas-mocks";

// Setup animation frame mocks globally if available
let cleanupAnimationMocks: (() => void) | undefined;
try {
  const animationMocks = setupAnimationFrameMocks();
  cleanupAnimationMocks = animationMocks.cleanup;
} catch (error) {
  console.warn("Could not set up animation frame mocks:", error);
}

// Safe call helper removed as it's not being used

// Reset all mocks before each test
beforeEach(() => {
  vi.clearAllMocks();

  // Reset localStorage and sessionStorage mocks
  if (localStorageMock) {
    localStorageMock.clear();
    localStorageMock._clearError?.();
  }

  if (sessionStorageMock) {
    sessionStorageMock.clear();
  }
  sessionStorageMock._clearError?.();
  // Clean up animation frames if cleanup function exists
  if (typeof cleanupAnimationMocks === "function") {
    cleanupAnimationMocks();
  }
  // Reset Firebase authentication state
  firebaseMocks.resetAuthState();
});
