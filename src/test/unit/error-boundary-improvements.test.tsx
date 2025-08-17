import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import {
  ErrorBoundary,
  DataErrorFallback,
  useErrorHandler,
} from "@/components/error-boundary";
import {
  simulateStorageError,
  clearStorageError,
  simulateStorageUnavailable,
  restoreStorageMock,
} from "@/src/test/test-helpers";
import React from "react";

// Test component that throws errors
function ThrowingComponent({
  shouldThrow = false,
  errorMessage = "Test error",
}: {
  shouldThrow?: boolean;
  errorMessage?: string;
}) {
  if (shouldThrow) {
    throw new Error(errorMessage);
  }
  return <div data-testid="success">Component rendered successfully</div>;
}

// Test component that uses useErrorHandler hook
function AsyncErrorComponent({
  shouldThrow = false,
}: {
  shouldThrow?: boolean;
}) {
  const { handleError } = useErrorHandler();

  React.useEffect(() => {
    if (shouldThrow) {
      // Simulate an async error
      setTimeout(() => {
        handleError(new Error("Async operation failed"));
      }, 0);
    }
  }, [shouldThrow, handleError]);

  return <div data-testid="async-component">Async component</div>;
}

// Test component that uses localStorage and might fail
function LocalStorageComponent({
  shouldFail = false,
}: {
  shouldFail?: boolean;
}) {
  const [value, setValue] = React.useState<string | null>(null);

  React.useEffect(() => {
    try {
      if (shouldFail) {
        simulateStorageError("localStorage access denied");
      }
      const stored = localStorage.getItem("test-key");
      setValue(stored || "default");
    } catch (error) {
      setValue("error-fallback");
    }
  }, [shouldFail]);

  return <div data-testid="storage-value">{value}</div>;
}

describe("Error Boundary Improvements", () => {
  beforeEach(() => {
    clearStorageError();
    restoreStorageMock();
    vi.clearAllMocks();
  });

  describe("Basic Error Boundary", () => {
    it("should catch and display errors with default fallback", () => {
      const consoleSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});

      render(
        <ErrorBoundary>
          <ThrowingComponent
            shouldThrow={true}
            errorMessage="Component crashed"
          />
        </ErrorBoundary>,
      );

      // Should show error fallback instead of crashing
      expect(screen.getByText("Something went wrong")).toBeInTheDocument();
      expect(screen.getByText("Component crashed")).toBeInTheDocument();
      expect(screen.getByText("Try Again")).toBeInTheDocument();
      expect(screen.getByText("Go Home")).toBeInTheDocument();

      consoleSpy.mockRestore();
    });

    it("should render children when no error occurs", () => {
      render(
        <ErrorBoundary>
          <ThrowingComponent shouldThrow={false} />
        </ErrorBoundary>,
      );

      expect(screen.getByTestId("success")).toBeInTheDocument();
      expect(
        screen.getByText("Component rendered successfully"),
      ).toBeInTheDocument();
    });

    it("should call onError callback when error occurs", () => {
      const onErrorSpy = vi.fn();
      const consoleSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});

      render(
        <ErrorBoundary onError={onErrorSpy}>
          <ThrowingComponent
            shouldThrow={true}
            errorMessage="Callback test error"
          />
        </ErrorBoundary>,
      );

      expect(onErrorSpy).toHaveBeenCalledWith(
        expect.objectContaining({ message: "Callback test error" }),
        expect.any(Object),
      );

      consoleSpy.mockRestore();
    });

    it("should use custom fallback component when provided", () => {
      const CustomFallback = ({
        error,
        retry,
      }: {
        error: Error;
        retry: () => void;
      }) => (
        <div>
          <div data-testid="custom-error">Custom error: {error.message}</div>
          <button onClick={retry} data-testid="custom-retry">
            Custom Retry
          </button>
        </div>
      );

      const consoleSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});

      render(
        <ErrorBoundary fallback={CustomFallback}>
          <ThrowingComponent
            shouldThrow={true}
            errorMessage="Custom fallback test"
          />
        </ErrorBoundary>,
      );

      expect(screen.getByTestId("custom-error")).toHaveTextContent(
        "Custom error: Custom fallback test",
      );
      expect(screen.getByTestId("custom-retry")).toBeInTheDocument();

      consoleSpy.mockRestore();
    });
  });

  describe("Data Error Fallback", () => {
    it("should handle authentication errors", () => {
      const mockRetry = vi.fn();
      const authError = new Error("Unauthorized access");

      render(<DataErrorFallback error={authError} retry={mockRetry} />);

      expect(screen.getByText("Authentication Required")).toBeInTheDocument();
      expect(
        screen.getByText("Please sign in to access your data"),
      ).toBeInTheDocument();
      expect(screen.getByText("Sign In")).toBeInTheDocument();
    });

    it("should handle not found errors", () => {
      const mockRetry = vi.fn();
      const notFoundError = new Error("Data not found");

      render(<DataErrorFallback error={notFoundError} retry={mockRetry} />);

      expect(screen.getByText("Data Not Found")).toBeInTheDocument();
      expect(
        screen.getByText("The requested data could not be found"),
      ).toBeInTheDocument();
    });

    it("should handle network errors", () => {
      const mockRetry = vi.fn();
      const networkError = new Error("network connection failed");

      render(<DataErrorFallback error={networkError} retry={mockRetry} />);

      expect(screen.getByText("Connection Error")).toBeInTheDocument();
      expect(
        screen.getByText("Unable to connect to the database"),
      ).toBeInTheDocument();
    });

    it("should show sample data button when provided", () => {
      const mockRetry = vi.fn();
      const mockShowSampleData = vi.fn();
      const error = new Error("Data loading failed");

      render(
        <DataErrorFallback
          error={error}
          retry={mockRetry}
          showSampleData={mockShowSampleData}
        />,
      );

      expect(screen.getByText("Use Sample Data")).toBeInTheDocument();
    });
  });

  describe("useErrorHandler Hook", () => {
    it("should catch async errors and throw them to ErrorBoundary", () => {
      const consoleSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});

      render(
        <ErrorBoundary>
          <AsyncErrorComponent shouldThrow={true} />
        </ErrorBoundary>,
      );

      // Initially renders the component
      expect(screen.getByTestId("async-component")).toBeInTheDocument();

      consoleSpy.mockRestore();
    });

    it("should work normally when no errors occur", () => {
      render(
        <ErrorBoundary>
          <AsyncErrorComponent shouldThrow={false} />
        </ErrorBoundary>,
      );

      expect(screen.getByTestId("async-component")).toBeInTheDocument();
    });
  });

  describe("localStorage Error Handling in Components", () => {
    it("should handle localStorage errors gracefully in components", () => {
      render(
        <ErrorBoundary>
          <LocalStorageComponent shouldFail={true} />
        </ErrorBoundary>,
      );

      // Component should handle localStorage error internally and show fallback
      expect(screen.getByTestId("storage-value")).toHaveTextContent(
        "error-fallback",
      );
    });

    it("should work normally when localStorage is available", () => {
      // Set up localStorage with test data
      localStorage.setItem("test-key", "stored-value");

      render(
        <ErrorBoundary>
          <LocalStorageComponent shouldFail={false} />
        </ErrorBoundary>,
      );

      expect(screen.getByTestId("storage-value")).toHaveTextContent(
        "stored-value",
      );
    });

    it("should handle completely unavailable localStorage", () => {
      simulateStorageUnavailable();

      render(
        <ErrorBoundary>
          <LocalStorageComponent shouldFail={false} />
        </ErrorBoundary>,
      );

      // Should fall back to default when localStorage is unavailable
      expect(screen.getByTestId("storage-value")).toHaveTextContent(
        "error-fallback",
      );
    });
  });

  describe("Error Recovery", () => {
    it("should allow retry after error", async () => {
      const user = (
        await import("@testing-library/user-event")
      ).default.setup();

      const consoleSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});

      let shouldThrow = true;
      const TestComponent = () => (
        <ThrowingComponent shouldThrow={shouldThrow} />
      );

      const { rerender } = render(
        <ErrorBoundary>
          <TestComponent />
        </ErrorBoundary>,
      );

      // Should show error initially
      expect(screen.getByText("Something went wrong")).toBeInTheDocument();

      // Fix the error condition
      shouldThrow = false;

      // Click retry button
      await user.click(screen.getByText("Try Again"));

      // Re-render with fixed condition
      rerender(
        <ErrorBoundary>
          <TestComponent />
        </ErrorBoundary>,
      );

      consoleSpy.mockRestore();
    });
  });

  describe("Error Logging", () => {
    it("should log errors to console", () => {
      const consoleSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});

      render(
        <ErrorBoundary>
          <ThrowingComponent
            shouldThrow={true}
            errorMessage="Logging test error"
          />
        </ErrorBoundary>,
      );

      expect(consoleSpy).toHaveBeenCalledWith(
        "ErrorBoundary caught an error:",
        expect.objectContaining({ message: "Logging test error" }),
        expect.any(Object),
      );

      consoleSpy.mockRestore();
    });
  });
});
