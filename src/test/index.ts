// Main testing utilities
export * from './test-utils'
export * from './test-helpers'

// Specific mock utilities
export * from './firebase-mocks'
export * from './storage-mocks'
export * from './canvas-mocks'

// Re-export commonly used testing library functions
export {
  screen,
  waitFor,
  act,
  fireEvent,
  cleanup,
  within,
  getByRole,
  getByText,
  getByTestId,
  queryByRole,
  queryByText,
  queryByTestId,
  findByRole,
  findByText,
  findByTestId,
} from '@testing-library/react'

export { default as userEvent } from '@testing-library/user-event'

// Vitest utilities
export { vi, expect, describe, it, test, beforeEach, afterEach, beforeAll, afterAll } from 'vitest'