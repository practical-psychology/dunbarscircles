import { vi } from "vitest";

// Mock Firebase Auth
export const mockAuth = {
  currentUser: null,
  signInWithPopup: vi.fn(),
  signOut: vi.fn(),
  onAuthStateChanged: vi.fn(),
};

// Mock Firebase User
export const mockUser = {
  uid: "test-uid",
  email: "test@example.com",
  displayName: "Test User",
  photoURL: "https://example.com/photo.jpg",
};

// Mock Google Auth Provider
export const mockGoogleAuthProvider = {
  providerId: "google.com",
};

// Mock Firestore
export const mockFirestore = {
  collection: vi.fn(() => ({
    doc: vi.fn(() => ({
      get: vi.fn(() =>
        Promise.resolve({
          exists: true,
          data: () => ({}),
        }),
      ),
      set: vi.fn(() => Promise.resolve()),
      update: vi.fn(() => Promise.resolve()),
      delete: vi.fn(() => Promise.resolve()),
    })),
    add: vi.fn(() => Promise.resolve({ id: "mock-doc-id" })),
    where: vi.fn(() => ({
      get: vi.fn(() =>
        Promise.resolve({
          docs: [],
          forEach: vi.fn(),
        }),
      ),
    })),
  })),
};

// Mock Firebase App
export const mockFirebaseApp = {
  name: "test-app",
  options: {},
};

// Firebase Auth mocks
export const mockSignInWithPopup = vi.fn(() =>
  Promise.resolve({
    user: mockUser,
    credential: null,
  }),
);

export const mockSignOut = vi.fn(() => Promise.resolve());

export const mockOnAuthStateChanged = vi.fn((callback) => {
  // Simulate no user initially
  callback(null);
  // Return unsubscribe function
  return vi.fn();
});

// Firestore operation mocks
export const mockDoc = vi.fn(() => ({
  get: vi.fn(() =>
    Promise.resolve({
      exists: true,
      data: () => ({ test: "data" }),
      id: "mock-doc-id",
    }),
  ),
  set: vi.fn(() => Promise.resolve()),
  update: vi.fn(() => Promise.resolve()),
  delete: vi.fn(() => Promise.resolve()),
}));

export const mockCollection = vi.fn(() => ({
  doc: mockDoc,
  add: vi.fn(() => Promise.resolve({ id: "mock-doc-id" })),
  where: vi.fn(() => ({
    get: vi.fn(() =>
      Promise.resolve({
        docs: [],
        forEach: vi.fn(),
        empty: true,
        size: 0,
      }),
    ),
  })),
  get: vi.fn(() =>
    Promise.resolve({
      docs: [],
      forEach: vi.fn(),
      empty: true,
      size: 0,
    }),
  ),
}));

// Mock Firebase initialization
export const mockInitializeApp = vi.fn(() => mockFirebaseApp);

export const mockGetAuth = vi.fn(() => mockAuth);

export const mockGetFirestore = vi.fn(() => mockFirestore);

// Export individual functions for direct import
export const signInWithPopup = mockSignInWithPopup;
export const onAuthStateChanged = mockOnAuthStateChanged;
export const signOut = mockSignOut;

// Export all mocks for easy importing
export const firebaseMocks = {
  auth: mockAuth,
  user: mockUser,
  googleAuthProvider: mockGoogleAuthProvider,
  firestore: mockFirestore,
  app: mockFirebaseApp,
  signInWithPopup: mockSignInWithPopup,
  signOut: mockSignOut,
  onAuthStateChanged: mockOnAuthStateChanged,
  doc: mockDoc,
  collection: mockCollection,
  initializeApp: mockInitializeApp,
  getAuth: mockGetAuth,
  getFirestore: mockGetFirestore,
};

// Export default for component mocking
export default firebaseMocks;
