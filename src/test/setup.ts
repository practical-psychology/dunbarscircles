import "@testing-library/jest-dom";
import { vi } from "vitest";
import { firebaseMocks } from "./firebase-mocks";

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

// Mock Canvas toDataURL method with proper type support
HTMLCanvasElement.prototype.toDataURL = vi.fn((type?: string, _quality?: any) => {
  const mimeType = type || "image/png";
  return `data:${mimeType};base64,mock`;
});

// Mock Canvas toBlob method with proper callback handling
HTMLCanvasElement.prototype.toBlob = vi.fn((callback?: BlobCallback | null, type?: string, _quality?: any) => {
  const mimeType = type || "image/png";
  const blob = new Blob(["mock"], { type: mimeType });
  if (callback) {
    setTimeout(() => callback(blob), 0);
  }
});

// Mock Canvas getBoundingClientRect for positioning
HTMLCanvasElement.prototype.getBoundingClientRect = vi.fn(() => ({
  x: 0,
  y: 0,
  width: 300,
  height: 150,
  top: 0,
  left: 0,
  bottom: 150,
  right: 300,
  toJSON: () => ({}),
} as DOMRect));

// Enhanced localStorage and sessionStorage mocks with realistic behavior
const createStorageMock = () => {
  let store: Record<string, string> = {};

  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = String(value);
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
    get length() {
      return Object.keys(store).length;
    },
    key: vi.fn((index: number) => {
      const keys = Object.keys(store);
      return keys[index] || null;
    }),
  };
};

const localStorageMock = createStorageMock();
const sessionStorageMock = createStorageMock();

Object.defineProperty(window, "localStorage", {
  value: localStorageMock,
});

Object.defineProperty(window, "sessionStorage", {
  value: sessionStorageMock,
});

// Firebase components are mocked in individual test files as needed

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

// Mock Firebase modules
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

// Setup animation frame mocks globally
const animationMocks = setupAnimationFrameMocks();

// Store cleanup function for use in beforeEach
const cleanupAnimationMocks = animationMocks.cleanup;

// Reset all mocks before each test
beforeEach(() => {
  vi.clearAllMocks();
  localStorageMock.clear();
  sessionStorageMock.clear();
  // Clean up animation frames
  cleanupAnimationMocks();
});
