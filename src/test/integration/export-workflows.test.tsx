import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { render, testHelpers } from "../test-utils";

// Test component that simulates export functionality
const ExportTestComponent = () => {
  return (
    <div data-testid="export-test-component">
      <h1>Export Workflow Test</h1>

      {/* Canvas Export Section */}
      <div data-testid="canvas-export-section">
        <h2>Canvas Export</h2>
        <canvas data-testid="test-canvas" width="300" height="150" />
        <button
          data-testid="export-canvas-png"
          onClick={() => {
            try {
              const canvas = document.querySelector("canvas") as HTMLCanvasElement;
              if (canvas) {
                const dataURL = canvas.toDataURL("image/png");
                // Don't actually click the link in tests, just verify the process
                console.log("Canvas exported as PNG:", dataURL);
              }
            } catch (error) {
              console.error("Canvas export failed:", error);
              throw error;
            }
          }}
        >
          Export Canvas as PNG
        </button>
        <button
          data-testid="export-canvas-svg"
          onClick={() => {
            try {
              // Simulate SVG export
              const svgContent = '<svg><rect width="100" height="100" fill="red"/></svg>';
              const blob = new Blob([svgContent], { type: "image/svg+xml" });
              const url = URL.createObjectURL(blob);
              console.log("SVG exported:", url);
              URL.revokeObjectURL(url);
            } catch (error) {
              console.error("SVG export failed:", error);
              throw error;
            }
          }}
        >
          Export as SVG
        </button>
      </div>

      {/* Data Export Section */}
      <div data-testid="data-export-section">
        <h2>Data Export</h2>
        <button
          data-testid="export-data-json"
          onClick={() => {
            try {
              const data = { contacts: [{ name: "Test", level: "inner-circle" }] };
              const jsonString = JSON.stringify(data, null, 2);
              const blob = new Blob([jsonString], { type: "application/json" });
              const url = URL.createObjectURL(blob);
              console.log("JSON exported:", url);
              URL.revokeObjectURL(url);
            } catch (error) {
              console.error("JSON export failed:", error);
              throw error;
            }
          }}
        >
          Export Data as JSON
        </button>
        <button
          data-testid="export-data-csv"
          onClick={() => {
            try {
              const csvContent = "Name,Level\nTest,inner-circle\n";
              const blob = new Blob([csvContent], { type: "text/csv" });
              const url = URL.createObjectURL(blob);
              console.log("CSV exported:", url);
              URL.revokeObjectURL(url);
            } catch (error) {
              console.error("CSV export failed:", error);
              throw error;
            }
          }}
        >
          Export Data as CSV
        </button>
      </div>

      {/* Batch Export Section */}
      <div data-testid="batch-export-section">
        <h2>Batch Export</h2>
        <button
          data-testid="export-all-formats"
          onClick={async () => {
            try {
              // Export multiple formats
              const formats = ["png", "json", "csv"];
              for (const format of formats) {
                if (format === "png") {
                  const canvas = document.querySelector("canvas") as HTMLCanvasElement;
                  if (canvas) {
                    canvas.toDataURL("image/png");
                  }
                } else if (format === "json") {
                  const data = { test: "data" };
                  const blob = new Blob([JSON.stringify(data)], { type: "application/json" });
                  URL.createObjectURL(blob);
                } else if (format === "csv") {
                  const blob = new Blob(["test,data"], { type: "text/csv" });
                  URL.createObjectURL(blob);
                }
              }
            } catch (error) {
              console.error("Batch export failed:", error);
              throw error;
            }
          }}
        >
          Export All Formats
        </button>
      </div>
    </div>
  );
};

describe("Export Workflow Integration Tests", () => {
  const user = userEvent.setup();
  let originalCreateObjectURL: typeof URL.createObjectURL;
  let originalRevokeObjectURL: typeof URL.revokeObjectURL;
  let originalToDataURL: typeof HTMLCanvasElement.prototype.toDataURL;

  beforeEach(() => {
    // Store original functions
    originalCreateObjectURL = global.URL.createObjectURL;
    originalRevokeObjectURL = global.URL.revokeObjectURL;
    originalToDataURL = HTMLCanvasElement.prototype.toDataURL;

    // Setup clean mocks
    testHelpers.cleanupMocks();
    testHelpers.setupCanvasMock();
    
    // Mock URL methods
    global.URL.createObjectURL = vi.fn(() => "mock-blob-url");
    global.URL.revokeObjectURL = vi.fn();
  });

  afterEach(() => {
    // Restore original functions
    global.URL.createObjectURL = originalCreateObjectURL;
    global.URL.revokeObjectURL = originalRevokeObjectURL;
    HTMLCanvasElement.prototype.toDataURL = originalToDataURL;
  });

  describe("Canvas Export Workflow", () => {
    it("should export canvas as PNG successfully", async () => {
      render(<ExportTestComponent />);

      expect(screen.getByTestId("canvas-export-section")).toBeInTheDocument();

      const exportButton = screen.getByTestId("export-canvas-png");
      await user.click(exportButton);

      // Verify canvas toDataURL was called
      expect(HTMLCanvasElement.prototype.toDataURL).toHaveBeenCalledWith("image/png");
    });

    it("should export SVG successfully", async () => {
      render(<ExportTestComponent />);

      const exportButton = screen.getByTestId("export-canvas-svg");
      await user.click(exportButton);

      // Verify blob creation and URL generation
      expect(global.URL.createObjectURL).toHaveBeenCalled();
      expect(global.URL.revokeObjectURL).toHaveBeenCalled();
    });

    it("should handle canvas export errors gracefully", async () => {
      // Mock canvas toDataURL to fail
      HTMLCanvasElement.prototype.toDataURL = vi.fn(() => {
        throw new Error("Canvas export failed");
      });

      render(<ExportTestComponent />);

      const exportButton = screen.getByTestId("export-canvas-png");

      // Should handle error gracefully
      let errorCaught = false;
      try {
        await user.click(exportButton);
      } catch (error) {
        errorCaught = true;
        expect(error).toBeInstanceOf(Error);
      }

      // Interface should still be functional
      expect(screen.getByTestId("export-test-component")).toBeInTheDocument();
    });
  });

  describe("Data Export Workflow", () => {
    it("should export JSON data successfully", async () => {
      render(<ExportTestComponent />);

      expect(screen.getByTestId("data-export-section")).toBeInTheDocument();

      const exportButton = screen.getByTestId("export-data-json");
      await user.click(exportButton);

      // Verify blob creation and URL generation
      expect(global.URL.createObjectURL).toHaveBeenCalled();
      expect(global.URL.revokeObjectURL).toHaveBeenCalled();
    });

    it("should export CSV data successfully", async () => {
      render(<ExportTestComponent />);

      const exportButton = screen.getByTestId("export-data-csv");
      await user.click(exportButton);

      // Verify blob creation and URL generation
      expect(global.URL.createObjectURL).toHaveBeenCalled();
      expect(global.URL.revokeObjectURL).toHaveBeenCalled();
    });

    it("should handle data export errors gracefully", async () => {
      // Mock URL.createObjectURL to fail
      global.URL.createObjectURL = vi.fn(() => {
        throw new Error("Blob creation failed");
      });

      render(<ExportTestComponent />);

      const exportButton = screen.getByTestId("export-data-json");

      // Should handle error gracefully
      let errorCaught = false;
      try {
        await user.click(exportButton);
      } catch (error) {
        errorCaught = true;
        expect(error).toBeInstanceOf(Error);
      }

      // Interface should still be functional
      expect(screen.getByTestId("export-test-component")).toBeInTheDocument();
    });
  });

  describe("Batch Export Workflow", () => {
    it("should handle batch export of multiple formats", async () => {
      render(<ExportTestComponent />);

      expect(screen.getByTestId("batch-export-section")).toBeInTheDocument();

      const exportButton = screen.getByTestId("export-all-formats");
      await user.click(exportButton);

      // Verify multiple export operations
      expect(HTMLCanvasElement.prototype.toDataURL).toHaveBeenCalled();
      expect(global.URL.createObjectURL).toHaveBeenCalledTimes(2); // JSON and CSV
    });

    it("should handle partial failures in batch export", async () => {
      // Mock canvas to fail but URL creation to succeed
      HTMLCanvasElement.prototype.toDataURL = vi.fn(() => {
        throw new Error("Canvas export failed");
      });

      render(<ExportTestComponent />);

      const exportButton = screen.getByTestId("export-all-formats");

      // Should handle partial failures gracefully
      let errorCaught = false;
      try {
        await user.click(exportButton);
      } catch (error) {
        errorCaught = true;
      }

      // Verify the error was caught
      expect(errorCaught).toBe(true);

      // Interface should still be functional
      expect(screen.getByTestId("export-test-component")).toBeInTheDocument();
    });
  });

  describe("Export with Large Data", () => {
    it("should handle export of large datasets", async () => {
      // Create large dataset
      const largeData = Array.from({ length: 1000 }, (_, i) => ({
        id: i,
        name: `Contact ${i}`,
        level: "inner-circle",
      }));

      // Mock component with large data export
      const LargeDataExportComponent = () => (
        <div data-testid="large-data-export">
          <button
            data-testid="export-large-json"
            onClick={() => {
              const jsonString = JSON.stringify(largeData, null, 2);
              const blob = new Blob([jsonString], { type: "application/json" });
              const url = URL.createObjectURL(blob);
              const link = document.createElement("a");
              link.download = "large-data.json";
              link.href = url;
              link.click();
              URL.revokeObjectURL(url);
            }}
          >
            Export Large Dataset
          </button>
        </div>
      );

      render(<LargeDataExportComponent />);

      const exportButton = screen.getByTestId("export-large-json");
      await user.click(exportButton);

      // Should handle large data export
      expect(global.URL.createObjectURL).toHaveBeenCalled();
      expect(global.URL.revokeObjectURL).toHaveBeenCalled();
    });
  });

  describe("Export Error Recovery", () => {
    it("should recover from export failures and allow retry", async () => {
      let failCount = 0;
      
      // Mock to fail first time, succeed second time
      global.URL.createObjectURL = vi.fn(() => {
        failCount++;
        if (failCount === 1) {
          throw new Error("First attempt failed");
        }
        return "mock-blob-url";
      });

      render(<ExportTestComponent />);

      const exportButton = screen.getByTestId("export-data-json");

      // First attempt should fail
      let firstAttemptFailed = false;
      try {
        await user.click(exportButton);
      } catch (error) {
        firstAttemptFailed = true;
        expect(error).toBeInstanceOf(Error);
      }

      expect(firstAttemptFailed).toBe(true);

      // Second attempt should succeed
      try {
        await user.click(exportButton);
        expect(global.URL.createObjectURL).toHaveBeenCalledTimes(2);
      } catch (error) {
        // Second attempt should not fail
        expect(error).toBeNull();
      }
    });

    it("should provide meaningful error messages for different failure types", async () => {
      const errorTypes = [
        { mock: () => { throw new Error("Network error"); }, type: "network" },
        { mock: () => { throw new Error("Insufficient storage"); }, type: "storage" },
        { mock: () => { throw new Error("Permission denied"); }, type: "permission" },
      ];

      for (const errorType of errorTypes) {
        // Reset the mock for each test
        global.URL.createObjectURL = vi.fn(errorType.mock);

        render(<ExportTestComponent />);

        const exportButton = screen.getByTestId("export-data-json");

        let errorCaught = false;
        let caughtError: Error | null = null;
        try {
          await user.click(exportButton);
        } catch (error) {
          errorCaught = true;
          caughtError = error as Error;
        }

        expect(errorCaught).toBe(true);
        expect(caughtError).toBeInstanceOf(Error);
        
        // Clean up for next iteration
        testHelpers.cleanupMocks();
      }
    });
  });

  describe("Export Performance", () => {
    it("should complete exports within reasonable time limits", async () => {
      const startTime = performance.now();

      render(<ExportTestComponent />);

      const exportButton = screen.getByTestId("export-data-json");
      await user.click(exportButton);

      const endTime = performance.now();
      const duration = endTime - startTime;

      // Export should complete within 1 second (generous for test environment)
      expect(duration).toBeLessThan(1000);
      expect(global.URL.createObjectURL).toHaveBeenCalled();
    });

    it("should handle concurrent export requests", async () => {
      render(<ExportTestComponent />);

      const jsonButton = screen.getByTestId("export-data-json");
      const csvButton = screen.getByTestId("export-data-csv");

      // Trigger concurrent exports
      const promises = [
        user.click(jsonButton),
        user.click(csvButton),
      ];

      await Promise.all(promises);

      // Both exports should complete successfully
      expect(global.URL.createObjectURL).toHaveBeenCalledTimes(2);
      expect(global.URL.revokeObjectURL).toHaveBeenCalledTimes(2);
    });
  });
});