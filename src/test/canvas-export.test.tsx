import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import { canvasTestHelper, safeCanvasOperation } from "./canvas-test-helpers";
import { exportCanvasToPNG, convertSVGToPNG } from "../../lib/export-utils";

// Test component that uses Canvas export functionality
const TestCanvasExportComponent = () => {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const [exportStatus, setExportStatus] = React.useState<string>("");

  const handleExportPNG = async () => {
    try {
      const canvas = canvasRef.current;
      if (!canvas) {
        setExportStatus("Canvas not found");
        return;
      }

      // Draw something on the canvas first
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.fillStyle = "blue";
        ctx.fillRect(10, 10, 100, 100);
      }

      exportCanvasToPNG(canvas, "test-export.png");
      setExportStatus("Export successful");
    } catch (error) {
      setExportStatus(
        `Export failed: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  };

  const handleTestToDataURL = async () => {
    try {
      const canvas = canvasRef.current;
      if (!canvas) {
        setExportStatus("Canvas not found");
        return;
      }

      const dataURL = canvas.toDataURL("image/png");
      setExportStatus(`toDataURL successful: ${dataURL.substring(0, 50)}...`);
    } catch (error) {
      setExportStatus(
        `toDataURL failed: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  };

  return (
    <div>
      <canvas
        ref={canvasRef}
        width={200}
        height={200}
        data-testid="test-canvas"
      />
      <button onClick={handleExportPNG} data-testid="export-png">
        Export PNG
      </button>
      <button onClick={handleTestToDataURL} data-testid="test-todataurl">
        Test toDataURL
      </button>
      <div data-testid="export-status">{exportStatus}</div>
    </div>
  );
};

describe("Canvas Export Functionality", () => {
  beforeEach(() => {
    // Reset Canvas mocks before each test
    canvasTestHelper.restore();
    vi.clearAllMocks();
  });

  afterEach(() => {
    canvasTestHelper.restore();
  });

  describe("Canvas Context and Drawing", () => {
    it("should create canvas context successfully", () => {
      canvasTestHelper.mockSuccessfulExport();

      render(<TestCanvasExportComponent />);

      const canvas = screen.getByTestId("test-canvas") as HTMLCanvasElement;
      expect(canvas).toBeInTheDocument();

      const validation = canvasTestHelper.validateContext(canvas);
      expect(validation.valid).toBe(true);
      expect(validation.context).toBeDefined();
    });

    it("should handle missing canvas context gracefully", () => {
      canvasTestHelper.mockNoContext();

      render(<TestCanvasExportComponent />);

      const canvas = screen.getByTestId("test-canvas") as HTMLCanvasElement;
      const validation = canvasTestHelper.validateContext(canvas);

      expect(validation.valid).toBe(false);
      expect(validation.error).toContain("2D context not available");
    });

    it("should perform basic drawing operations", () => {
      canvasTestHelper.mockSuccessfulExport();

      render(<TestCanvasExportComponent />);

      const canvas = screen.getByTestId("test-canvas") as HTMLCanvasElement;
      const drawingTest = canvasTestHelper.testDrawing(canvas);

      expect(drawingTest.success).toBe(true);
      expect(drawingTest.operations).toContain("beginPath");
      expect(drawingTest.operations).toContain("arc");
      expect(drawingTest.operations).toContain("fill");
      expect(drawingTest.operations).toContain("fillRect");
    });
  });

  describe("Canvas toDataURL Method", () => {
    it("should export canvas to data URL successfully", async () => {
      canvasTestHelper.mockSuccessfulExport();

      render(<TestCanvasExportComponent />);

      const testButton = screen.getByTestId("test-todataurl");
      fireEvent.click(testButton);

      // Wait for async operation
      await new Promise((resolve) => setTimeout(resolve, 100));

      const status = screen.getByTestId("export-status");
      expect(status.textContent).toContain("toDataURL successful");
      expect(status.textContent).toContain(
        "data:image/png;base64,mock-success",
      );
    });

    it("should handle toDataURL failures gracefully", async () => {
      canvasTestHelper.mockFailedExport("Canvas toDataURL test error");

      render(<TestCanvasExportComponent />);

      const testButton = screen.getByTestId("test-todataurl");
      fireEvent.click(testButton);

      // Wait for async operation
      await new Promise((resolve) => setTimeout(resolve, 100));

      const status = screen.getByTestId("export-status");
      expect(status.textContent).toContain("toDataURL failed");
      expect(status.textContent).toContain("Canvas toDataURL test error");
    });
  });

  describe("Canvas Export Utilities", () => {
    it("should export PNG successfully with mock", async () => {
      canvasTestHelper.mockSuccessfulExport();

      render(<TestCanvasExportComponent />);

      const exportButton = screen.getByTestId("export-png");
      fireEvent.click(exportButton);

      // Wait for async operation
      await new Promise((resolve) => setTimeout(resolve, 100));

      const status = screen.getByTestId("export-status");
      expect(status.textContent).toBe("Export successful");
    });

    it("should handle export failures gracefully", async () => {
      canvasTestHelper.mockFailedExport("Export test error");

      render(<TestCanvasExportComponent />);

      const exportButton = screen.getByTestId("export-png");
      fireEvent.click(exportButton);

      // Wait for async operation
      await new Promise((resolve) => setTimeout(resolve, 100));

      const status = screen.getByTestId("export-status");
      expect(status.textContent).toContain("Export failed");
      // The export utility re-throws with a generic message
      expect(status.textContent).toContain(
        "Canvas export failed. Please try again.",
      );
    });
  });

  describe("Safe Canvas Operations", () => {
    it("should handle successful canvas operations", async () => {
      canvasTestHelper.mockSuccessfulExport();

      const result = await safeCanvasOperation(() => {
        const canvas = document.createElement("canvas");
        return canvas.toDataURL("image/png");
      });

      expect(result.success).toBe(true);
      expect(result.result).toContain("data:image/png;base64,mock-success");
      expect(result.error).toBeUndefined();
    });

    it("should handle failed canvas operations", async () => {
      canvasTestHelper.mockFailedExport("Safe operation test error");

      const result = await safeCanvasOperation(() => {
        const canvas = document.createElement("canvas");
        return canvas.toDataURL("image/png");
      }, "fallback-value");

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.error?.message).toContain("Safe operation test error");
      expect(result.result).toBe("fallback-value");
    });
  });

  describe("Canvas Mock Helper Functions", () => {
    it("should create mock canvas with correct dimensions", () => {
      canvasTestHelper.mockSuccessfulExport();

      const canvas = canvasTestHelper.createMockCanvas(400, 300);

      expect(canvas.width).toBe(400);
      expect(canvas.height).toBe(300);
      expect(canvas.tagName).toBe("CANVAS");
    });

    it("should test export function with helper", async () => {
      canvasTestHelper.mockSuccessfulExport();

      const exportTest = await canvasTestHelper.testExport(() => {
        const canvas = document.createElement("canvas");
        canvas.toDataURL("image/png");
      });

      expect(exportTest.success).toBe(true);
      expect(exportTest.errorCaught).toBe(false);
    });

    it("should test export function with expected error", async () => {
      canvasTestHelper.mockFailedExport("Expected test error");

      const exportTest = await canvasTestHelper.testExport(() => {
        const canvas = document.createElement("canvas");
        canvas.toDataURL("image/png");
      }, true);

      expect(exportTest.success).toBe(false);
      expect(exportTest.errorCaught).toBe(true);
      expect(exportTest.error?.message).toContain("Expected test error");
    });
  });

  describe("SVG to PNG Conversion", () => {
    it("should handle SVG to PNG conversion setup", async () => {
      canvasTestHelper.mockFailedExport("SVG conversion error");

      // Create a mock SVG element
      const svgElement = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "svg",
      );
      svgElement.setAttribute("width", "100");
      svgElement.setAttribute("height", "100");

      // The convertSVGToPNG function is asynchronous and uses Image loading
      // We can test that it doesn't throw immediately
      const result = await safeCanvasOperation(() => {
        convertSVGToPNG(svgElement, "test.png");
        return "conversion-started";
      });

      // The function should start successfully (errors happen in async callbacks)
      expect(result.success).toBe(true);
      expect(result.result).toBe("conversion-started");
    });
  });
});
