import { vi } from 'vitest'
import { firebaseMocks } from './firebase-mocks'
import { localStorageMock, sessionStorageMock, mockStorageWithData } from './storage-mocks'
import { createCanvasContextMock, mockCanvas } from './canvas-mocks'

// Helper to setup Firebase mocks with specific user state
export const setupFirebaseAuth = (user: any = null) => {
  firebaseMocks.auth.currentUser = user
  firebaseMocks.onAuthStateChanged.mockImplementation((callback) => {
    callback(user)
    return vi.fn() // unsubscribe function
  })
}

// Helper to setup localStorage with theme data
export const setupThemeStorage = (theme: 'light' | 'dark' | 'system' = 'light') => {
  mockStorageWithData(localStorageMock, {
    'yakw-theme': theme,
  })
}

// Helper to setup localStorage with contact data
export const setupContactStorage = (contacts: any[] = []) => {
  mockStorageWithData(localStorageMock, {
    'yakw-contacts': JSON.stringify(contacts),
  })
}

// Helper to mock window.matchMedia with specific queries
export const mockMatchMedia = (matches: boolean = false) => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation(query => ({
      matches,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  })
}

// Helper to mock responsive breakpoints
export const mockResponsiveBreakpoint = (breakpoint: 'mobile' | 'tablet' | 'desktop') => {
  const breakpoints = {
    mobile: '(max-width: 768px)',
    tablet: '(min-width: 769px) and (max-width: 1024px)',
    desktop: '(min-width: 1025px)',
  }

  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation(query => ({
      matches: query === breakpoints[breakpoint],
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  })
}

// Helper to create mock file for testing file uploads
export const createMockFile = (
  content: string,
  filename: string,
  type: string = 'text/plain'
) => {
  const blob = new Blob([content], { type })
  const file = new File([blob], filename, { type })
  return file
}

// Helper to create mock CSV file for LinkedIn import
export const createMockLinkedInCSV = () => {
  const csvContent = `First Name,Last Name,Email Address,Company,Position,Connected On
John,Doe,john.doe@example.com,Example Corp,Software Engineer,01-Jan-2023
Jane,Smith,jane.smith@example.com,Tech Inc,Product Manager,15-Feb-2023`
  return createMockFile(csvContent, 'connections.csv', 'text/csv')
}

// Helper to create mock JSON file for Facebook import
export const createMockFacebookJSON = () => {
  const jsonContent = JSON.stringify({
    friends_v2: [
      {
        name: 'John Doe',
        timestamp: 1640995200
      },
      {
        name: 'Jane Smith',
        timestamp: 1643673600
      }
    ]
  })
  return createMockFile(jsonContent, 'friends.json', 'application/json')
}

// Helper to mock FileReader for file processing
export const mockFileReader = (result: string) => {
  const mockReader = {
    readAsText: vi.fn(function(this: any) {
      setTimeout(() => {
        this.onload?.({ target: { result } })
      }, 0)
    }),
    readAsDataURL: vi.fn(function(this: any) {
      setTimeout(() => {
        this.onload?.({ target: { result: `data:text/plain;base64,${btoa(result)}` } })
      }, 0)
    }),
    onload: null,
    onerror: null,
    result: null,
  }

  global.FileReader = vi.fn().mockImplementation(() => mockReader) as any
  return mockReader
}

// Helper to wait for async operations in tests
export const waitFor = (ms: number = 0) => {
  return new Promise(resolve => setTimeout(resolve, ms))
}

// Helper to trigger resize events for responsive testing
export const triggerResize = (width: number, height: number) => {
  Object.defineProperty(window, 'innerWidth', {
    writable: true,
    configurable: true,
    value: width,
  })
  Object.defineProperty(window, 'innerHeight', {
    writable: true,
    configurable: true,
    value: height,
  })
  window.dispatchEvent(new Event('resize'))
}

// Helper to mock canvas for visualization testing
export const setupCanvasMock = () => {
  const context = createCanvasContextMock()
  HTMLCanvasElement.prototype.getContext = vi.fn(() => context)
  HTMLCanvasElement.prototype.toDataURL = vi.fn(() => 'data:image/png;base64,mock')
  return context
}

// Helper to clean up all mocks
export const cleanupMocks = () => {
  vi.clearAllMocks()
  localStorageMock.clear()
  sessionStorageMock.clear()
  setupFirebaseAuth(null)
}

// Helper to mock network requests (for future API integration)
export const mockFetch = (response: any, status: number = 200) => {
  global.fetch = vi.fn(() =>
    Promise.resolve({
      ok: status >= 200 && status < 300,
      status,
      json: () => Promise.resolve(response),
      text: () => Promise.resolve(JSON.stringify(response)),
    })
  ) as any
}

// Helper to create mock relationship data
export const createMockRelationship = (overrides: any = {}) => {
  return {
    id: 'mock-id',
    name: 'Test Person',
    levelId: 'inner-circle',
    lastContact: new Date(),
    contactFrequency: 7,
    strength: 0.9,
    decayRate: 0.1,
    platform: 'manual',
    ...overrides,
  }
}

// Helper to create mock level data
export const createMockLevel = (overrides: any = {}) => {
  return {
    id: 'inner-circle',
    name: 'Inner Circle',
    count: 5,
    description: 'Daily contact, high emotional investment',
    contactFrequency: 'Daily',
    color: '#ef4444',
    category: 'intimate',
    ...overrides,
  }
}

// Export all helpers for easy importing
export const testHelpers = {
  setupFirebaseAuth,
  setupThemeStorage,
  setupContactStorage,
  mockMatchMedia,
  mockResponsiveBreakpoint,
  createMockFile,
  createMockLinkedInCSV,
  createMockFacebookJSON,
  mockFileReader,
  waitFor,
  triggerResize,
  setupCanvasMock,
  cleanupMocks,
  mockFetch,
  createMockRelationship,
  createMockLevel,
}