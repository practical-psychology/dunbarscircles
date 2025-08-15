import React, { ReactElement } from "react";
import { render, RenderOptions } from "@testing-library/react";
import { BrowserRouter, MemoryRouter } from "react-router-dom";
import { ThemeProvider } from "@/components/theme-provider";
import { testHelpers } from "./test-helpers";

// Interface for custom render options
interface CustomRenderOptions extends Omit<RenderOptions, "wrapper"> {
  initialEntries?: string[];
  theme?: "light" | "dark" | "system";
  withRouter?: boolean;
}

// Custom render function that includes all necessary providers
const AllTheProviders = ({
  children,
  theme = "light",
  initialEntries = ["/"],
  withRouter = true,
}: {
  children: React.ReactNode;
  theme?: "light" | "dark" | "system";
  initialEntries?: string[];
  withRouter?: boolean;
}) => {
  const RouterComponent = withRouter
    ? initialEntries.length > 1
      ? MemoryRouter
      : BrowserRouter
    : React.Fragment;

  const routerProps =
    withRouter && initialEntries.length > 1 ? { initialEntries } : {};

  return (
    <RouterComponent {...routerProps}>
      <ThemeProvider defaultTheme={theme} storageKey="test-theme">
        {children}
      </ThemeProvider>
    </RouterComponent>
  );
};

// Main custom render function
const customRender = (ui: ReactElement, options: CustomRenderOptions = {}) => {
  const {
    initialEntries = ["/"],
    theme = "light",
    withRouter = true,
    ...renderOptions
  } = options;

  // Setup theme storage if needed
  if (theme !== "light") {
    testHelpers.setupThemeStorage(theme);
  }

  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <AllTheProviders
      theme={theme}
      initialEntries={initialEntries}
      withRouter={withRouter}
    >
      {children}
    </AllTheProviders>
  );

  return render(ui, { wrapper: Wrapper, ...renderOptions });
};

// Re-export everything from testing library
export * from "@testing-library/react";

// Override render method
export { customRender as render };

// Specialized render functions for different scenarios
export const renderWithRouter = (
  ui: ReactElement,
  options: {
    initialEntries?: string[];
    theme?: "light" | "dark" | "system";
  } = {},
) => {
  return customRender(ui, { ...options, withRouter: true });
};

export const renderWithoutRouter = (
  ui: ReactElement,
  options: { theme?: "light" | "dark" | "system" } = {},
) => {
  return customRender(ui, { ...options, withRouter: false });
};

export const renderWithTheme = (
  ui: ReactElement,
  theme: "light" | "dark" | "system",
  options: CustomRenderOptions = {},
) => {
  return customRender(ui, { ...options, theme });
};

// Render with specific route for testing navigation
export const renderWithRoute = (
  ui: ReactElement,
  route: string,
  options: CustomRenderOptions = {},
) => {
  return customRender(ui, { ...options, initialEntries: [route] });
};

// Render with multiple routes for testing navigation between pages
export const renderWithRoutes = (
  ui: ReactElement,
  routes: string[],
  options: CustomRenderOptions = {},
) => {
  return customRender(ui, { ...options, initialEntries: routes });
};

// Export test helpers for convenience
export { testHelpers } from "./test-helpers";
export { firebaseMocks } from "./firebase-mocks";
export { localStorageMock, sessionStorageMock } from "./storage-mocks";
export { createCanvasContextMock } from "./canvas-mocks";

// Common test utilities
import userEvent from "@testing-library/user-event";
export { default as userEvent } from "@testing-library/user-event";
export const createUser = () => userEvent.setup();

// Helper to wait for elements with better error messages
export const waitForElement = async (callback: () => any, timeout = 1000) => {
  const start = Date.now();
  while (Date.now() - start < timeout) {
    try {
      const result = callback();
      if (result) return result;
    } catch (error) {
      // Continue waiting
    }
    await new Promise((resolve) => setTimeout(resolve, 50));
  }
  throw new Error(`Element not found within ${timeout}ms`);
};

// Helper to simulate file drop events
export const simulateFileDrop = (element: Element, files: File[]) => {
  const dataTransfer = {
    files,
    items: files.map((file) => ({
      kind: "file",
      type: file.type,
      getAsFile: () => file,
    })),
    types: ["Files"],
  };

  const dropEvent = new DragEvent("drop", {
    bubbles: true,
    cancelable: true,
    dataTransfer: dataTransfer as any,
  });

  element.dispatchEvent(dropEvent);
};
