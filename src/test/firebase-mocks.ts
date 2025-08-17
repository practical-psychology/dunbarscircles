import { vi } from "vitest";

// Mock Firebase User
export const mockUser = {
  uid: "test-uid",
  email: "test@example.com",
  displayName: "Test User",
  photoURL: "https://example.com/photo.jpg",
  providerData: [
    {
      providerId: "google.com",
      uid: "test-uid",
      displayName: "Test User",
      email: "test@example.com",
      photoURL: "https://example.com/photo.jpg",
    },
  ],
  metadata: {
    creationTime: "2023-01-01T00:00:00.000Z",
    lastSignInTime: "2023-01-01T00:00:00.000Z",
  },
  emailVerified: true,
  isAnonymous: false,
  tenantId: null,
  refreshToken: "mock-refresh-token",
  accessToken: "mock-access-token",
};

// Mock Google Auth Provider
export const mockGoogleAuthProvider = {
  providerId: "google.com",
};

// Authentication state management
let currentAuthUser: any = null;
let authStateCallbacks: Array<(user: any) => void> = [];

// Firebase Auth mocks with proper state management
export const mockSignInWithPopup = vi.fn(async (auth: any, provider: any) => {
  // auth and provider parameters are intentionally unused in mock
  void auth;
  void provider;

  try {
    // Simulate successful sign-in
    currentAuthUser = mockUser;
    mockAuth.currentUser = mockUser;

    // Notify all auth state listeners
    authStateCallbacks.forEach((callback) => {
      try {
        callback(mockUser);
      } catch (error) {
        console.warn("Auth state callback error:", error);
      }
    });

    return {
      user: mockUser,
      credential: null,
    };
  } catch (error) {
    // Reset auth state on error
    currentAuthUser = null;
    mockAuth.currentUser = null;
    throw error;
  }
});

export const mockSignOut = vi.fn(async (auth: any) => {
  // auth parameter is intentionally unused in mock
  void auth;

  try {
    // Clear authentication state
    currentAuthUser = null;
    mockAuth.currentUser = null;

    // Notify all auth state listeners
    authStateCallbacks.forEach((callback) => {
      try {
        callback(null);
      } catch (error) {
        console.warn("Auth state callback error:", error);
      }
    });

    return Promise.resolve();
  } catch (error) {
    throw error;
  }
});

export const mockOnAuthStateChanged = vi.fn(
  (
    auth: any,
    callback: (user: any) => void,
    errorCallback?: (error: any) => void,
  ) => {
    // auth parameter is intentionally unused in mock
    void auth;

    if (typeof callback === "function") {
      // Add callback to listeners
      authStateCallbacks.push(callback);

      // Immediately call with current auth state
      try {
        callback(currentAuthUser);
      } catch (error) {
        if (errorCallback && typeof errorCallback === "function") {
          errorCallback(error);
        }
      }
    }

    // Return unsubscribe function
    return vi.fn(() => {
      const index = authStateCallbacks.indexOf(callback);
      if (index > -1) {
        authStateCallbacks.splice(index, 1);
      }
    });
  },
);

// Mock Firebase Auth with proper state management
export const mockAuth = {
  get currentUser() {
    return currentAuthUser;
  },
  set currentUser(user: any) {
    currentAuthUser = user;
  },
  signInWithPopup: mockSignInWithPopup,
  signOut: mockSignOut,
  onAuthStateChanged: mockOnAuthStateChanged,
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

// Helper functions for test setup
export const setAuthUser = (user: any) => {
  currentAuthUser = user;
  mockAuth.currentUser = user;

  // Notify all listeners of the state change
  authStateCallbacks.forEach((callback) => {
    try {
      callback(user);
    } catch (error) {
      console.warn("Auth state callback error:", error);
    }
  });
};

export const clearAuthUser = () => {
  setAuthUser(null);
};

export const resetAuthState = () => {
  currentAuthUser = null;
  mockAuth.currentUser = null;
  authStateCallbacks = [];

  // Reset all mock implementations to defaults
  mockSignInWithPopup.mockImplementation(async (auth: any, provider: any) => {
    void auth;
    void provider;

    currentAuthUser = mockUser;
    mockAuth.currentUser = mockUser;

    authStateCallbacks.forEach((callback) => {
      try {
        callback(mockUser);
      } catch (error) {
        console.warn("Auth state callback error:", error);
      }
    });

    return {
      user: mockUser,
      credential: null,
    };
  });

  mockSignOut.mockImplementation(async (auth: any) => {
    void auth;

    currentAuthUser = null;
    mockAuth.currentUser = null;

    authStateCallbacks.forEach((callback) => {
      try {
        callback(null);
      } catch (error) {
        console.warn("Auth state callback error:", error);
      }
    });

    return Promise.resolve();
  });

  mockOnAuthStateChanged.mockImplementation(
    (
      auth: any,
      callback: (user: any) => void,
      errorCallback?: (error: any) => void,
    ) => {
      void auth;

      if (typeof callback === "function") {
        authStateCallbacks.push(callback);

        try {
          callback(currentAuthUser);
        } catch (error) {
          if (errorCallback && typeof errorCallback === "function") {
            errorCallback(error);
          }
        }
      }

      return vi.fn(() => {
        const index = authStateCallbacks.indexOf(callback);
        if (index > -1) {
          authStateCallbacks.splice(index, 1);
        }
      });
    },
  );
};

// Mock authentication errors for testing
export const mockAuthError = (
  errorMessage: string = "Authentication failed",
) => {
  mockSignInWithPopup.mockRejectedValue(new Error(errorMessage));
};

export const mockSignOutError = (errorMessage: string = "Sign out failed") => {
  mockSignOut.mockRejectedValue(new Error(errorMessage));
};

export const mockAuthStateError = (
  errorMessage: string = "Auth state error",
) => {
  mockOnAuthStateChanged.mockImplementation(
    (
      auth: any,
      callback: (user: any) => void,
      errorCallback?: (error: any) => void,
    ) => {
      void auth;

      if (typeof callback === "function") {
        authStateCallbacks.push(callback);

        const error = new Error(errorMessage);
        if (errorCallback && typeof errorCallback === "function") {
          errorCallback(error);
        }
      }

      return vi.fn(() => {
        const index = authStateCallbacks.indexOf(callback);
        if (index > -1) {
          authStateCallbacks.splice(index, 1);
        }
      });
    },
  );
};

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
  // Helper functions
  setAuthUser,
  clearAuthUser,
  resetAuthState,
  mockAuthError,
  mockSignOutError,
  mockAuthStateError,
};

// Export default for component mocking
export default firebaseMocks;
