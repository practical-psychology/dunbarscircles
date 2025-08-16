# Testing Utilities

This directory contains comprehensive testing utilities and mocks for the Dunbar Circles application.

## Overview

The testing infrastructure provides:

- Custom render functions with providers (ThemeProvider, Router)
- Firebase authentication and Firestore mocks
- localStorage/sessionStorage mocks with realistic behavior
- Canvas API mocks for visualization testing
- window.matchMedia mocks for responsive design testing
- File handling mocks for import functionality
- Helper functions for common testing scenarios

## Quick Start

```typescript
import { render, screen, userEvent, testHelpers } from '@/src/test'

// Basic component testing
test('renders component', () => {
  render(<MyComponent />)
  expect(screen.getByText('Hello')).toBeInTheDocument()
})

// Testing with user interactions
test('handles click events', async () => {
  const user = userEvent.setup()
  render(<Button onClick={mockFn}>Click me</Button>)

  await user.click(screen.getByRole('button'))
  expect(mockFn).toHaveBeenCalled()
})
```

## Files

### Core Testing Utilities

- **`test-utils.tsx`** - Custom render functions with providers
- **`test-helpers.ts`** - Helper functions for common testing scenarios
- **`setup.ts`** - Global test setup and mocks
- **`index.ts`** - Main export file for easy imports

### Specialized Mocks

- **`firebase-mocks.ts`** - Firebase Auth and Firestore mocks
- **`storage-mocks.ts`** - localStorage/sessionStorage mocks
- **`canvas-mocks.ts`** - Canvas API mocks for visualizations

## Custom Render Functions

### Basic Render

```typescript
import { render } from '@/src/test'

// Renders with ThemeProvider and BrowserRouter
render(<Component />)
```

### Render with Options

```typescript
// Render with specific theme
render(<Component />, { theme: 'dark' })

// Render with specific route
renderWithRoute(<Component />, '/dashboard')

// Render with multiple routes
renderWithRoutes(<Component />, ['/home', '/dashboard'])

// Render without router
renderWithoutRouter(<Component />)
```

## Firebase Testing

```typescript
import { testHelpers, firebaseMocks } from "@/src/test";

// Setup authenticated user
testHelpers.setupFirebaseAuth({
  uid: "test-uid",
  email: "test@example.com",
  displayName: "Test User",
});

// Test Firebase operations
expect(firebaseMocks.signInWithPopup).toHaveBeenCalled();
```

## Storage Testing

```typescript
import { testHelpers } from "@/src/test";

// Setup localStorage with data
testHelpers.setupThemeStorage("dark");
testHelpers.setupContactStorage([{ id: "1", name: "John" }]);

// Test storage operations
localStorage.setItem("key", "value");
expect(localStorage.getItem("key")).toBe("value");
```

## Canvas Testing

```typescript
import { testHelpers } from "@/src/test";

// Setup canvas mock
const context = testHelpers.setupCanvasMock();

// Test canvas operations
context.fillRect(0, 0, 100, 100);
expect(context.fillRect).toHaveBeenCalledWith(0, 0, 100, 100);
```

## File Upload Testing

```typescript
import { testHelpers, simulateFileDrop } from "@/src/test";

// Create mock files
const csvFile = testHelpers.createMockLinkedInCSV();
const jsonFile = testHelpers.createMockFacebookJSON();

// Simulate file drop
const dropZone = screen.getByTestId("drop-zone");
simulateFileDrop(dropZone, [csvFile]);
```

## Responsive Design Testing

```typescript
import { testHelpers } from "@/src/test";

// Mock specific breakpoint
testHelpers.mockResponsiveBreakpoint("mobile");

// Trigger resize event
testHelpers.triggerResize(768, 1024);
```

## Common Patterns

### Testing Components with Providers

```typescript
test('component with theme', () => {
  render(<ThemeToggle />, { theme: 'dark' })
  expect(screen.getByRole('button')).toHaveClass('dark')
})
```

### Testing Navigation

```typescript
test('navigation works', async () => {
  const user = userEvent.setup()
  renderWithRoute(<App />, '/home')

  await user.click(screen.getByText('Dashboard'))
  expect(screen.getByText('Dashboard Page')).toBeInTheDocument()
})
```

### Testing File Operations

```typescript
test('file import', async () => {
  const user = userEvent.setup()
  const file = testHelpers.createMockLinkedInCSV()

  render(<FileUpload />)

  const input = screen.getByLabelText('Upload file')
  await user.upload(input, file)

  expect(screen.getByText('File uploaded')).toBeInTheDocument()
})
```

### Testing Canvas Visualizations

```typescript
test('network diagram renders', () => {
  const context = testHelpers.setupCanvasMock()
  render(<NetworkDiagram data={mockData} />)

  // Verify canvas operations
  expect(context.beginPath).toHaveBeenCalled()
  expect(context.arc).toHaveBeenCalled()
  expect(context.fill).toHaveBeenCalled()
})
```

## Cleanup

The testing infrastructure automatically cleans up mocks between tests. For manual cleanup:

```typescript
import { testHelpers } from "@/src/test";

afterEach(() => {
  testHelpers.cleanupMocks();
});
```

## Best Practices

1. **Use custom render functions** - Always use the provided render functions to ensure proper provider setup
2. **Mock external dependencies** - Use the provided mocks for Firebase, Canvas, etc.
3. **Test user interactions** - Use userEvent for realistic user interactions
4. **Clean up between tests** - Mocks are automatically cleaned up, but you can do it manually if needed
5. **Use realistic data** - Use the helper functions to create realistic mock data
6. **Test accessibility** - The render functions include accessibility testing support

## Environment Variables

The testing environment automatically sets up:

- `NODE_ENV=test`
- All Vite environment variables
- Mock implementations for browser APIs

## Coverage

Run tests with coverage:

```bash
npm run test:coverage
```

Coverage reports are generated in the `coverage/` directory.
