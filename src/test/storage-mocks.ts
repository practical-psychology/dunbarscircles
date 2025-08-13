import { vi } from 'vitest'

// Enhanced storage mock that behaves like real localStorage/sessionStorage
export const createStorageMock = () => {
  let store: Record<string, string> = {}
  
  const mock = {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = String(value)
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key]
    }),
    clear: vi.fn(() => {
      store = {}
    }),
    get length() {
      return Object.keys(store).length
    },
    key: vi.fn((index: number) => {
      const keys = Object.keys(store)
      return keys[index] || null
    }),
    // Helper methods for testing
    _getStore: () => ({ ...store }),
    _setStore: (newStore: Record<string, string>) => {
      store = { ...newStore }
    },
  }

  return mock
}

// Pre-configured storage mocks
export const localStorageMock = createStorageMock()
export const sessionStorageMock = createStorageMock()

// Helper functions for testing storage behavior
export const mockStorageWithData = (storage: ReturnType<typeof createStorageMock>, data: Record<string, string>) => {
  storage._setStore(data)
}

export const getStorageData = (storage: ReturnType<typeof createStorageMock>) => {
  return storage._getStore()
}

export const clearStorageData = (storage: ReturnType<typeof createStorageMock>) => {
  storage.clear()
}

// Mock storage quota API for testing storage limits
export const mockStorageQuota = {
  estimate: vi.fn(() => Promise.resolve({
    quota: 1000000000, // 1GB
    usage: 50000000,   // 50MB
    usageDetails: {
      indexedDB: 25000000,
      localStorage: 25000000,
    }
  }))
}

// Mock for testing storage events
export const mockStorageEvent = (key: string, oldValue: string | null, newValue: string | null) => {
  const event = new StorageEvent('storage', {
    key,
    oldValue,
    newValue,
    storageArea: window.localStorage,
    url: window.location.href,
  })
  return event
}