import { vi } from "vitest";
import { createCanvasContextMock } from "./canvas-mocks";

// Canvas test utilities for export functionality testing
export class CanvasTestHelper {
  private originalMethods: {
    toDataURL: typeof HTMLCanvasElement.prototype.toDataURL;
    toBlob: typeof HTMLCanvasElement.prototype.toBlob;
    getContext: typeof HTMLCanvasElement.prototype.getContext;
  };

  constructor() {
    this.originalMethods = {
      toDataURL: HTMLCanvasElement.prototype.toDataURL,
      toBlob: HTMLCanvasElement.prototype.toBlob,
      getContext: HTMLCanvasElement.prototype.getContext,
    };
  }

  // Mock Canvas with successful export
  mockSuccessfulExport() {
    HTMLCanvasElement.prototype.toDataURL = vi.fn((type?: string) => {
      const mimeType = type || "image/png";
      return `data:${mimeType};base64,mock-success`;
    });

    HTMLCanvasElement.prototype.toBlob = vi.fn(
      (callback?: BlobCallback | null, type?: string) => {
        const mimeType = type || "image/png";
        const blob = new Blob(["mock-success"], { type: mimeType });
        if (callback) {
          setTimeout(() => callback(blob), 0);
        }
      },
    );

    HTMLCanvasElement.prototype.getContext = vi.fn((contextType: string) => {
      if (contextType === "2d") {
        return createCanvasContextMock() as unknown as CanvasRenderingContext2D;
      }
      return null;
    }) as any;
  }

  // Mock Canvas with export failure
  mockFailedExport(errorMessage = "Canvas export failed") {
    HTMLCanvasElement.prototype.toDataURL = vi.fn(() => {
      throw new Error(errorMessage);
    });

    HTMLCanvasElement.prototype.toBlob = vi.fn(
      (callback?: BlobCallback | null) => {
        if (callback) {
          // Call callback with null to simulate failure, but also throw error
          setTimeout(() => {
            try {
              callback(null);
            } catch (error) {
              // Error is expected when blob is null
            }
          }, 0);
        }
      },
    );

    HTMLCanvasElement.prototype.getContext = vi.fn((contextType: string) => {
      if (contextType === "2d") {
        return createCanvasContextMock() as unknown as CanvasRenderingContext2D;
      }
      return null;
    }) as any;
  }

  // Mock Canvas with no context available
  mockNoContext() {
    HTMLCanvasElement.prototype.getContext = vi.fn(() => null);

    HTMLCanvasElement.prototype.toDataURL = vi.fn(() => {
      throw new Error("Canvas 2D context not available");
    });

    HTMLCanvasElement.prototype.toBlob = vi.fn(
      (callback?: BlobCallback | null) => {
        if (callback) {
          setTimeout(() => callback(null), 0);
        }
      },
    );
  }

  // Restore original Canvas methods
  restore() {
    HTMLCanvasElement.prototype.toDataURL = this.originalMethods.toDataURL;
    HTMLCanvasElement.prototype.toBlob = this.originalMethods.toBlob;
    HTMLCanvasElement.prototype.getContext = this.originalMethods.getContext;
  }

  // Test Canvas export with error handling
  async testExport(
    exportFunction: () => void | Promise<void>,
    _expectError = false,
  ): Promise<{
    success: boolean;
    errorCaught: boolean;
    error?: Error;
  }> {
    let errorCaught = false;
    let caughtError: Error | undefined;

    try {
      await exportFunction();
    } catch (error) {
      errorCaught = true;
      caughtError = error as Error;
    }

    return {
      success: !errorCaught,
      errorCaught,
      error: caughtError,
    };
  }

  // Create a mock canvas element for testing
  createMockCanvas(width = 300, height = 150): HTMLCanvasElement {
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;

    // Override with current mocks
    canvas.getContext = HTMLCanvasElement.prototype.getContext;
    canvas.toDataURL = HTMLCanvasElement.prototype.toDataURL;
    canvas.toBlob = HTMLCanvasElement.prototype.toBlob;

    return canvas;
  }

  // Validate Canvas context availability
  validateContext(canvas: HTMLCanvasElement): {
    valid: boolean;
    context?: CanvasRenderingContext2D;
    error?: string;
  } {
    try {
      const context = canvas.getContext("2d");
      if (!context) {
        return { valid: false, error: "2D context not available" };
      }

      // Test basic context functionality
      if (typeof context.fillRect !== "function") {
        return { valid: false, error: "Context methods not available" };
      }

      return { valid: true, context };
    } catch (error) {
      return {
        valid: false,
        error: `Context validation failed: ${error instanceof Error ? error.message : String(error)}`,
      };
    }
  }

  // Test Canvas drawing operations
  testDrawing(canvas: HTMLCanvasElement): {
    success: boolean;
    operations: string[];
    error?: string;
  } {
    const operations: string[] = [];

    try {
      const context = canvas.getContext("2d");
      if (!context) {
        return { success: false, operations, error: "No 2D context available" };
      }

      // Test basic drawing operations
      context.beginPath();
      operations.push("beginPath");

      context.arc(50, 50, 20, 0, Math.PI * 2);
      operations.push("arc");

      context.fill();
      operations.push("fill");

      context.fillRect(0, 0, 100, 100);
      operations.push("fillRect");

      return { success: true, operations };
    } catch (error) {
      return {
        success: false,
        operations,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }
}

// Global helper instance
export const canvasTestHelper = new CanvasTestHelper();

// Convenience functions for common test scenarios
export const withSuccessfulCanvasExport = (
  testFn: () => void | Promise<void>,
) => {
  return async () => {
    canvasTestHelper.mockSuccessfulExport();
    try {
      await testFn();
    } finally {
      canvasTestHelper.restore();
    }
  };
};

export const withFailedCanvasExport = (
  testFn: () => void | Promise<void>,
  errorMessage?: string,
) => {
  return async () => {
    canvasTestHelper.mockFailedExport(errorMessage);
    try {
      await testFn();
    } finally {
      canvasTestHelper.restore();
    }
  };
};

export const withNoCanvasContext = (testFn: () => void | Promise<void>) => {
  return async () => {
    canvasTestHelper.mockNoContext();
    try {
      await testFn();
    } finally {
      canvasTestHelper.restore();
    }
  };
};

// Error boundary for Canvas operations in tests
export const safeCanvasOperation = async <T>(
  operation: () => T | Promise<T>,
  fallback?: T,
): Promise<{ result?: T; error?: Error; success: boolean }> => {
  try {
    const result = await operation();
    return { result, success: true };
  } catch (error) {
    return {
      error: error as Error,
      success: false,
      result: fallback,
    };
  }
};

// Global error handler for Canvas export tests
export const setupCanvasErrorHandling = () => {
  const originalConsoleError = console.error;
  const errors: Error[] = [];

  // Capture Canvas-related errors
  console.error = (...args) => {
    const message = args[0];
    if (
      typeof message === "string" &&
      (message.includes("Canvas") ||
        message.includes("export") ||
        message.includes("toDataURL"))
    ) {
      errors.push(new Error(message));
    }
    originalConsoleError(...args);
  };

  return {
    getErrors: () => [...errors],
    clearErrors: () => (errors.length = 0),
    hasErrors: () => errors.length > 0,
    restore: () => {
      console.error = originalConsoleError;
    },
  };
};

// Test wrapper for Canvas export error scenarios
export const testCanvasExportError = async (
  testFn: () => void | Promise<void>,
  expectedErrorMessage?: string,
): Promise<{
  errorCaught: boolean;
  errorMessage?: string;
  success: boolean;
}> => {
  const errorHandler = setupCanvasErrorHandling();
  let errorCaught = false;
  let errorMessage: string | undefined;

  try {
    await testFn();

    // Check if errors were logged
    const errors = errorHandler.getErrors();
    if (errors.length > 0) {
      errorCaught = true;
      errorMessage = errors[0].message;
    }
  } catch (error) {
    errorCaught = true;
    errorMessage = error instanceof Error ? error.message : String(error);
  } finally {
    errorHandler.restore();
  }

  const success = expectedErrorMessage
    ? errorCaught && (errorMessage?.includes(expectedErrorMessage) ?? false)
    : errorCaught;

  return {
    errorCaught,
    errorMessage,
    success,
  };
};
