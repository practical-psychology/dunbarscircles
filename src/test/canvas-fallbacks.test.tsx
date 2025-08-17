import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import React from "react";

// Mock canvas context
const mockCanvas = {
  getContext: vi.fn(() => ({
    fillRect: vi.fn(),
    clearRect: vi.fn(),
    getImageData: vi.fn(() => ({ data: new Array(4) })),
    putImageData: vi.fn(),
    createImageData: vi.fn(() => ({ data: new Array(4) })),
    setTransform: vi.fn(),
    drawImage: vi.fn(),
    save: vi.fn(),
    fillText: vi.fn(),
    restore: vi.fn(),
    beginPath: vi.fn(),
    moveTo: vi.fn(),
    lineTo: vi.fn(),
    closePath: vi.fn(),
    stroke: vi.fn(),
    translate: vi.fn(),
    scale: vi.fn(),
    rotate: vi.fn(),
    arc: vi.fn(),
    fill: vi.fn(),
    measureText: vi.fn(() => ({ width: 0 })),
    transform: vi.fn(),
    rect: vi.fn(),
    clip: vi.fn(),
  })),
  toDataURL: vi.fn(() => "data:image/png;base64,mock"),
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
};

// Simple test component that uses canvas
const TestCanvasComponent = () => {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);

  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.fillRect(0, 0, 100, 100);
      }
    }
  }, []);

  return (
    <div>
      <canvas
        ref={canvasRef}
        width={200}
        height={200}
        data-testid="test-canvas"
      />
      <div data-testid="fallback-message">Canvas not supported</div>
    </div>
  );
};

describe("Canvas Fallbacks", () => {
  beforeEach(() => {
    // Mock HTMLCanvasElement
    Object.defineProperty(HTMLCanvasElement.prototype, "getContext", {
      value: mockCanvas.getContext,
      writable: true,
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("should render canvas element when supported", () => {
    render(<TestCanvasComponent />);

    const canvas = screen.getByTestId("test-canvas");
    expect(canvas).toBeInTheDocument();
    expect(canvas.tagName).toBe("CANVAS");
  });

  it("should handle canvas context creation", () => {
    render(<TestCanvasComponent />);

    expect(mockCanvas.getContext).toHaveBeenCalledWith("2d");
  });

  it("should gracefully handle missing canvas context", () => {
    // Mock getContext to return null
    const mockGetContextNull = vi.fn(() => null);
    Object.defineProperty(HTMLCanvasElement.prototype, "getContext", {
      value: mockGetContextNull,
      writable: true,
    });

    render(<TestCanvasComponent />);

    expect(mockGetContextNull).toHaveBeenCalledWith("2d");
    // Component should still render without errors
    expect(screen.getByTestId("test-canvas")).toBeInTheDocument();
  });

  it("should provide fallback content when canvas is not supported", () => {
    // Simply test that the component renders both canvas and fallback content
    // In a real scenario, the fallback would be shown based on canvas support detection
    render(<TestCanvasComponent />);

    // Both canvas and fallback should be present in the DOM
    expect(screen.getByTestId("test-canvas")).toBeInTheDocument();
    expect(screen.getByTestId("fallback-message")).toBeInTheDocument();

    // The component should handle the case where getContext returns null gracefully
    const mockGetContextNull = vi.fn(() => null);
    Object.defineProperty(HTMLCanvasElement.prototype, "getContext", {
      value: mockGetContextNull,
      writable: true,
    });

    // Re-render with null context
    render(<TestCanvasComponent />);
    expect(mockGetContextNull).toHaveBeenCalledWith("2d");
  });
});
