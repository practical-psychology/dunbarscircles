import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import React from "react";
import { canvasTestHelper, testCanvasExportError } from "./canvas-test-helpers";

// Mock export manager component that uses Canvas
const MockExportManager = () => {
  const [status, setStatus] = React.useState<string>("");
  const canvasRef = React.useRef<HTMLCanvasElement>(null);

  const handleCanvasExport = async () => {
    try {
      const canvas = canvasRef.current;
      if (!canvas) {
        setStatus("Canvas not found");
        return;
      }

      // Simulate drawing on canvas
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.fillStyle = "blue";
        ctx.fillRect(10, 10, 100, 100);
      }

      // Attempt to export
      const dataURL = canvas.toDataURL("image/png");

      // Simulate creating download link
      const link = document.createElement("a");
      link.download = "test-export.png";
      link.href = dataURL;
      link.click();

      setStatus("Export successful");
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      setStatus(`Export failed: ${errorMessage}`);
      console.error("Canvas export failed:", error);
    }
  };

  const handleBlobExport = async () => {
    try {
      const canvas = canvasRef.current;
      if (!canvas) {
        setStatus("Canvas not found");
        return;
      }

      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          const link = document.createElement("a");
          link.download = "test-blob-export.png";
          link.href = url;
          link.click();
          URL.revokeObjectURL(url);
          setStatus("Blob export successful");
        } else {
          setStatus("Blob export failed: No blob created");
        }
      }, "image/png");
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      setStatus(`Blob export failed: ${errorMessage}`);
      console.error("Canvas blob export failed:", error);
    }
  };

  return (
    <div>
      <canvas
        ref={canvasRef}
        width={200}
        height={200}
        data-testid="export-canvas"
      />
      <button onClick={handleCanvasExport} data-testid="canvas-export">
        Export Canvas
      </button>
      <button onClick={handleBlobExport} data-testid="blob-export">
        Export Blob
      </button>
      <div data-testid="export-status">{status}</div>
    </div>
  );
};

describe("Canvas Integration Tests", () => {
  beforeEach(() => {
    canvasTestHelper.restore();
    vi.clearAllMocks();
  });

  afterEach(() => {
    canvasTestHelper.restore();
  });

  describe("Successful Canvas Export", () => {
    it("should handle successful canvas export", async () => {
      canvasTestHelper.mockSuccessfulExport();

      render(<MockExportManager />);

      const exportButton = screen.getByTestId("canvas-export");
      fireEvent.click(exportButton);

      await waitFor(() => {
        const status = screen.getByTestId("export-status");
        expect(status.textContent).toBe("Export successful");
      });
    });

    it("should handle successful blob export", async () => {
      canvasTestHelper.mockSuccessfulExport();

      render(<MockExportManager />);

      const blobButton = screen.getByTestId("blob-export");
      fireEvent.click(blobButton);

      await waitFor(() => {
        const status = screen.getByTestId("export-status");
        expect(status.textContent).toBe("Blob export successful");
      });
    });
  });

  describe("Canvas Export Error Handling", () => {
    it("should handle canvas toDataURL failures gracefully", async () => {
      canvasTestHelper.mockFailedExport("Canvas toDataURL test error");

      render(<MockExportManager />);

      const exportButton = screen.getByTestId("canvas-export");

      const errorTest = await testCanvasExportError(async () => {
        fireEvent.click(exportButton);

        await waitFor(() => {
          const status = screen.getByTestId("export-status");
          expect(status.textContent).toContain("Export failed");
        });
      }, "Canvas toDataURL test error");

      expect(errorTest.errorCaught).toBe(true);
    });

    it("should handle canvas toBlob failures gracefully", async () => {
      canvasTestHelper.mockFailedExport("Canvas toBlob test error");

      render(<MockExportManager />);

      const blobButton = screen.getByTestId("blob-export");

      // Click the button and wait for the error status
      fireEvent.click(blobButton);

      await waitFor(() => {
        const status = screen.getByTestId("export-status");
        expect(status.textContent).toContain("Blob export failed");
      });

      // Verify the error was handled gracefully - interface should still work
      expect(screen.getByTestId("export-canvas")).toBeInTheDocument();
    });

    it("should handle missing canvas context", async () => {
      canvasTestHelper.mockNoContext();

      render(<MockExportManager />);

      const canvas = screen.getByTestId("export-canvas") as HTMLCanvasElement;
      const validation = canvasTestHelper.validateContext(canvas);

      expect(validation.valid).toBe(false);
      expect(validation.error).toContain("2D context not available");
    });
  });

  describe("Canvas Mock Functionality", () => {
    it("should provide working canvas context mock", () => {
      canvasTestHelper.mockSuccessfulExport();

      const canvas = canvasTestHelper.createMockCanvas(400, 300);
      const validation = canvasTestHelper.validateContext(canvas);

      expect(validation.valid).toBe(true);
      expect(validation.context).toBeDefined();
      expect(canvas.width).toBe(400);
      expect(canvas.height).toBe(300);
    });

    it("should support canvas drawing operations", () => {
      canvasTestHelper.mockSuccessfulExport();

      const canvas = canvasTestHelper.createMockCanvas();
      const drawingTest = canvasTestHelper.testDrawing(canvas);

      expect(drawingTest.success).toBe(true);
      expect(drawingTest.operations).toContain("beginPath");
      expect(drawingTest.operations).toContain("arc");
      expect(drawingTest.operations).toContain("fill");
      expect(drawingTest.operations).toContain("fillRect");
    });

    it("should handle canvas export testing utilities", async () => {
      canvasTestHelper.mockSuccessfulExport();

      const exportTest = await canvasTestHelper.testExport(() => {
        const canvas = document.createElement("canvas");
        const dataURL = canvas.toDataURL("image/png");
        expect(dataURL).toContain("data:image/png;base64,mock-success");
      });

      expect(exportTest.success).toBe(true);
      expect(exportTest.errorCaught).toBe(false);
    });

    it("should handle canvas export error testing", async () => {
      canvasTestHelper.mockFailedExport("Test export error");

      const exportTest = await canvasTestHelper.testExport(() => {
        const canvas = document.createElement("canvas");
        canvas.toDataURL("image/png");
      }, true);

      expect(exportTest.success).toBe(false);
      expect(exportTest.errorCaught).toBe(true);
      expect(exportTest.error?.message).toContain("Test export error");
    });
  });

  describe("Canvas Type Compatibility", () => {
    it("should provide proper Canvas API types", () => {
      canvasTestHelper.mockSuccessfulExport();

      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d");

      expect(context).toBeDefined();
      expect(typeof context?.fillRect).toBe("function");
      expect(typeof context?.strokeRect).toBe("function");
      expect(typeof context?.clearRect).toBe("function");
      expect(typeof context?.beginPath).toBe("function");
      expect(typeof context?.closePath).toBe("function");
      expect(typeof context?.moveTo).toBe("function");
      expect(typeof context?.lineTo).toBe("function");
      expect(typeof context?.arc).toBe("function");
      expect(typeof context?.fill).toBe("function");
      expect(typeof context?.stroke).toBe("function");
    });

    it("should provide proper Canvas element methods", () => {
      canvasTestHelper.mockSuccessfulExport();

      const canvas = document.createElement("canvas");

      expect(typeof canvas.toDataURL).toBe("function");
      expect(typeof canvas.toBlob).toBe("function");
      expect(typeof canvas.getContext).toBe("function");
      expect(typeof canvas.getBoundingClientRect).toBe("function");
    });

    it("should handle different image formats", () => {
      canvasTestHelper.mockSuccessfulExport();

      const canvas = document.createElement("canvas");

      const pngDataURL = canvas.toDataURL("image/png");
      const jpegDataURL = canvas.toDataURL("image/jpeg");
      const webpDataURL = canvas.toDataURL("image/webp");

      expect(pngDataURL).toContain("data:image/png;base64,mock-success");
      expect(jpegDataURL).toContain("data:image/jpeg;base64,mock-success");
      expect(webpDataURL).toContain("data:image/webp;base64,mock-success");
    });
  });

  describe("Error Recovery", () => {
    it("should allow switching between success and error modes", async () => {
      // Start with successful export
      canvasTestHelper.mockSuccessfulExport();

      render(<MockExportManager />);

      const exportButton = screen.getByTestId("canvas-export");
      fireEvent.click(exportButton);

      await waitFor(() => {
        const status = screen.getByTestId("export-status");
        expect(status.textContent).toBe("Export successful");
      });

      // Switch to error mode
      canvasTestHelper.mockFailedExport("Switched to error mode");

      fireEvent.click(exportButton);

      await waitFor(() => {
        const status = screen.getByTestId("export-status");
        expect(status.textContent).toContain("Export failed");
      });

      // Switch back to success mode
      canvasTestHelper.mockSuccessfulExport();

      fireEvent.click(exportButton);

      await waitFor(() => {
        const status = screen.getByTestId("export-status");
        expect(status.textContent).toBe("Export successful");
      });
    });
  });
});
