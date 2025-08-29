import { vi } from "vitest";

// Enhanced storage mock that behaves like real localStorage/sessionStorage with error simulation
export const createStorageMock = () => {
  let store: Record<string, string> = {};
  let shouldThrow = false;
  let errorMessage = "Storage error";

  const mock = {
    getItem: vi.fn((key: string) => {
      if (shouldThrow) {
        throw new Error(errorMessage);
      }
      return store[key] || null;
    }),
    setItem: vi.fn((key: string, value: string) => {
      if (shouldThrow) {
        throw new Error(errorMessage);
      }
      store[key] = String(value);
    }),
    removeItem: vi.fn((key: string) => {
      if (shouldThrow) {
        throw new Error(errorMessage);
      }
      delete store[key];
    }),
    clear: vi.fn(() => {
      if (shouldThrow) {
        throw new Error(errorMessage);
      }
      store = {};
    }),
    get length() {
      if (shouldThrow) {
        throw new Error(errorMessage);
      }
      return Object.keys(store).length;
    },
    key: vi.fn((index: number) => {
      if (shouldThrow) {
        throw new Error(errorMessage);
      }
      const keys = Object.keys(store);
      return keys[index] || null;
    }),
    // Helper methods for testing
    _getStore: () => ({ ...store }),
    _setStore: (newStore: Record<string, string>) => {
      if (!shouldThrow) {
        store = { ...newStore };
      }
    },
    // Error simulation methods
    _simulateError: (message: string = "Storage error") => {
      shouldThrow = true;
      errorMessage = message;
    },
    _clearError: () => {
      shouldThrow = false;
      errorMessage = "Storage error";
    },
    // Safe cleanup method that doesn't throw
    _safeClear: () => {
      const wasThrowingBefore = shouldThrow;
      shouldThrow = false;
      try {
        store = {};
      } catch (error) {
        // Ignore any errors during cleanup
      }
      shouldThrow = wasThrowingBefore;
    },
  };

  return mock;
};

// Pre-configured storage mocks
export const localStorageMock = createStorageMock();
export const sessionStorageMock = createStorageMock();

// Helper functions for testing storage behavior
export const mockStorageWithData = (
  storage: ReturnType<typeof createStorageMock>,
  data: Record<string, string>,
) => {
  storage._setStore(data);
};

export const getStorageData = (
  storage: ReturnType<typeof createStorageMock>,
) => {
  return storage._getStore();
};

export const clearStorageData = (
  storage: ReturnType<typeof createStorageMock>,
) => {
  storage.clear();
};

// Mock storage quota API for testing storage limits
export const mockStorageQuota = {
  estimate: vi.fn(() =>
    Promise.resolve({
      quota: 1000000000, // 1GB
      usage: 50000000, // 50MB
      usageDetails: {
        indexedDB: 25000000,
        localStorage: 25000000,
      },
    }),
  ),
};

// Mock for testing storage events
export const mockStorageEvent = (
  key: string,
  oldValue: string | null,
  newValue: string | null,
) => {
  const event = new StorageEvent("storage", {
    key,
    oldValue,
    newValue,
    storageArea: window.localStorage,
    url: window.location.href,
  });
  return event;
};

// Helper to simulate localStorage being completely unavailable
export const simulateStorageUnavailable = () => {
  // Remove localStorage from window object
  Object.defineProperty(window, "localStorage", {
    value: undefined,
    writable: true,
  });
};

// Helper to restore localStorage mock
export const restoreStorageMock = (
  storageMock: ReturnType<typeof createStorageMock>,
) => {
  Object.defineProperty(window, "localStorage", {
    value: storageMock,
    writable: true,
    configurable: true,
  });
};

// Helper to safely clear storage without throwing errors
export const safeClearStorage = (
  storage: ReturnType<typeof createStorageMock>,
) => {
  try {
    if (storage && typeof storage._safeClear === "function") {
      storage._safeClear();
    } else if (storage && typeof storage.clear === "function") {
      storage.clear();
    }
  } catch (error) {
    // Ignore cleanup errors
  }
};
