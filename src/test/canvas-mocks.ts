import { vi } from "vitest";

// Comprehensive Canvas 2D context mock with proper type compatibility
export const createCanvasContextMock = (): Partial<CanvasRenderingContext2D> & {
  _getDrawCalls: () => any;
  _reset: () => void;
} => {
  const mock = {
    // Drawing rectangles
    fillRect: vi.fn(),
    strokeRect: vi.fn(),
    clearRect: vi.fn(),

    // Drawing text
    fillText: vi.fn(),
    strokeText: vi.fn(),
    measureText: vi.fn(() => ({
      width: 100,
      actualBoundingBoxLeft: 0,
      actualBoundingBoxRight: 100,
      actualBoundingBoxAscent: 10,
      actualBoundingBoxDescent: 2,
      fontBoundingBoxAscent: 10,
      fontBoundingBoxDescent: 2,
      alphabeticBaseline: 0,
      hangingBaseline: 8,
      ideographicBaseline: -2,
      emHeightAscent: 10,
      emHeightDescent: 2,
    } as TextMetrics)),

    // Line styles
    lineWidth: 1,
    lineCap: "butt" as CanvasLineCap,
    lineJoin: "miter" as CanvasLineJoin,
    miterLimit: 10,
    setLineDash: vi.fn(),
    getLineDash: vi.fn(() => []),
    lineDashOffset: 0,

    // Fill and stroke styles
    fillStyle: "#000000",
    strokeStyle: "#000000",
    globalAlpha: 1,
    globalCompositeOperation: "source-over" as GlobalCompositeOperation,

    // Gradients and patterns
    createLinearGradient: vi.fn(() => ({
      addColorStop: vi.fn(),
    } as CanvasGradient)),
    createRadialGradient: vi.fn(() => ({
      addColorStop: vi.fn(),
    } as CanvasGradient)),
    createConicGradient: vi.fn(() => ({
      addColorStop: vi.fn(),
    } as CanvasGradient)),
    createPattern: vi.fn(() => null),

    // Shadows
    shadowBlur: 0,
    shadowColor: "rgba(0, 0, 0, 0)",
    shadowOffsetX: 0,
    shadowOffsetY: 0,

    // Paths
    beginPath: vi.fn(),
    closePath: vi.fn(),
    moveTo: vi.fn(),
    lineTo: vi.fn(),
    quadraticCurveTo: vi.fn(),
    bezierCurveTo: vi.fn(),
    arc: vi.fn(),
    arcTo: vi.fn(),
    ellipse: vi.fn(),
    rect: vi.fn(),
    roundRect: vi.fn(),

    // Drawing paths
    fill: vi.fn(),
    stroke: vi.fn(),
    clip: vi.fn(),
    isPointInPath: vi.fn(() => false),
    isPointInStroke: vi.fn(() => false),

    // Transformations
    rotate: vi.fn(),
    scale: vi.fn(),
    translate: vi.fn(),
    transform: vi.fn(),
    setTransform: vi.fn(),
    resetTransform: vi.fn(),
    getTransform: vi.fn(() => ({
      a: 1, b: 0, c: 0, d: 1, e: 0, f: 0,
      is2D: true,
      isIdentity: true,
    } as DOMMatrix)),

    // State
    save: vi.fn(),
    restore: vi.fn(),

    // Image data
    createImageData: vi.fn((width: number, height: number) => ({
      data: new Uint8ClampedArray(width * height * 4),
      width,
      height,
      colorSpace: "srgb" as PredefinedColorSpace,
    } as ImageData)),
    getImageData: vi.fn((x: number, y: number, width: number, height: number) => ({
      data: new Uint8ClampedArray(width * height * 4),
      width,
      height,
      colorSpace: "srgb" as PredefinedColorSpace,
    } as ImageData)),
    putImageData: vi.fn(),

    // Drawing images
    drawImage: vi.fn(),

    // Text properties
    font: "10px sans-serif",
    textAlign: "start" as CanvasTextAlign,
    textBaseline: "alphabetic" as CanvasTextBaseline,
    direction: "inherit" as CanvasDirection,
    fontKerning: "auto" as CanvasFontKerning,
    fontStretch: "normal" as CanvasFontStretch,
    fontVariantCaps: "normal" as CanvasFontVariantCaps,
    textRendering: "auto" as CanvasTextRendering,
    wordSpacing: "0px",
    letterSpacing: "0px",

    // Canvas reference with proper typing
    canvas: {
      width: 300,
      height: 150,
      toDataURL: vi.fn(() => "data:image/png;base64,mock"),
      toBlob: vi.fn((callback?: BlobCallback | null, type?: string, quality?: any) => {
        const blob = new Blob(["mock"], { type: type || "image/png" });
        if (callback) {
          setTimeout(() => callback(blob), 0);
        }
      }),
      getContext: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    } as unknown as HTMLCanvasElement,

    // Additional Canvas API methods
    getContextAttributes: vi.fn(() => ({
      alpha: true,
      colorSpace: "srgb",
      desynchronized: false,
      willReadFrequently: false,
    })),

    // Helper methods for testing
    _getDrawCalls: () => {
      return {
        fillRect: mock.fillRect.mock.calls,
        strokeRect: mock.strokeRect.mock.calls,
        fillText: mock.fillText.mock.calls,
        drawImage: mock.drawImage.mock.calls,
        arc: mock.arc.mock.calls,
        moveTo: mock.moveTo.mock.calls,
        lineTo: mock.lineTo.mock.calls,
        beginPath: mock.beginPath.mock.calls,
        closePath: mock.closePath.mock.calls,
        stroke: mock.stroke.mock.calls,
        fill: mock.fill.mock.calls,
      };
    },
    _reset: () => {
      Object.values(mock).forEach((value) => {
        if (typeof value === "function" && "mockClear" in value) {
          value.mockClear();
        }
      });
    },
  };

  return mock;
};

// Mock HTMLCanvasElement with proper type compatibility
export const mockCanvas = {
  getContext: vi.fn((contextType: string, contextAttributes?: any) => {
    if (contextType === "2d") {
      return createCanvasContextMock() as CanvasRenderingContext2D;
    }
    if (contextType === "webgl" || contextType === "webgl2") {
      return null; // WebGL not supported in tests
    }
    return null;
  }),
  toDataURL: vi.fn((type?: string, quality?: any) => {
    const mimeType = type || "image/png";
    return `data:${mimeType};base64,mock`;
  }),
  toBlob: vi.fn((callback?: BlobCallback | null, type?: string, quality?: any) => {
    const mimeType = type || "image/png";
    const blob = new Blob(["mock"], { type: mimeType });
    if (callback) {
      setTimeout(() => callback(blob), 0);
    }
  }),
  width: 300,
  height: 150,
  clientWidth: 300,
  clientHeight: 150,
  offsetWidth: 300,
  offsetHeight: 150,
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  dispatchEvent: vi.fn(),
  getBoundingClientRect: vi.fn(() => ({
    x: 0,
    y: 0,
    width: 300,
    height: 150,
    top: 0,
    left: 0,
    bottom: 150,
    right: 300,
    toJSON: () => ({}),
  } as DOMRect)),
};

// Helper function to mock canvas creation
export const mockCreateCanvas = (width = 300, height = 150) => {
  const canvas = {
    ...mockCanvas,
    width,
    height,
    getContext: vi.fn(() => createCanvasContextMock()),
  };
  return canvas;
};

// Mock for testing canvas animations with proper cleanup
export const mockAnimationFrame = {
  request: vi.fn((callback: FrameRequestCallback) => {
    const id = Math.floor(Math.random() * 1000) + 1;
    setTimeout(() => {
      try {
        callback(performance.now());
      } catch (error) {
        // Silently handle animation frame errors during cleanup
        console.warn("Animation frame callback error:", error);
      }
    }, 16); // ~60fps
    return id;
  }),
  cancel: vi.fn((id: number) => {
    // Mock cancellation - in real implementation would clear the timeout
    return;
  }),
};

// Enhanced animation frame setup for tests
export const setupAnimationFrameMocks = () => {
  global.requestAnimationFrame = mockAnimationFrame.request as any;
  global.cancelAnimationFrame = mockAnimationFrame.cancel as any;
  
  // Also mock performance.now for consistent timing
  global.performance = global.performance || {};
  global.performance.now = vi.fn(() => Date.now());
  
  return {
    cleanup: () => {
      vi.clearAllMocks();
    },
    triggerFrame: (timestamp?: number) => {
      const callbacks = mockAnimationFrame.request.mock.calls.map(call => call[0]);
      callbacks.forEach(callback => {
        try {
          callback(timestamp || performance.now());
        } catch (error) {
          console.warn("Animation frame trigger error:", error);
        }
      });
    }
  };
};

// Mock for testing canvas events
export const mockCanvasEvent = (type: string, x: number, y: number) => {
  return new MouseEvent(type, {
    clientX: x,
    clientY: y,
    bubbles: true,
    cancelable: true,
  });
};

// Helper to simulate canvas drawing operations
export const simulateCanvasDrawing = (context: any) => {
  context.beginPath();
  context.arc(50, 50, 20, 0, Math.PI * 2);
  context.fill();
  return context._getDrawCalls();
};
