import { vi } from 'vitest'

// Comprehensive Canvas 2D context mock
export const createCanvasContextMock = () => {
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
    })),

    // Line styles
    lineWidth: 1,
    lineCap: 'butt' as CanvasLineCap,
    lineJoin: 'miter' as CanvasLineJoin,
    miterLimit: 10,
    setLineDash: vi.fn(),
    getLineDash: vi.fn(() => []),
    lineDashOffset: 0,

    // Fill and stroke styles
    fillStyle: '#000000',
    strokeStyle: '#000000',
    globalAlpha: 1,
    globalCompositeOperation: 'source-over' as GlobalCompositeOperation,

    // Gradients and patterns
    createLinearGradient: vi.fn(() => ({
      addColorStop: vi.fn(),
    })),
    createRadialGradient: vi.fn(() => ({
      addColorStop: vi.fn(),
    })),
    createPattern: vi.fn(() => null),

    // Shadows
    shadowBlur: 0,
    shadowColor: 'rgba(0, 0, 0, 0)',
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

    // State
    save: vi.fn(),
    restore: vi.fn(),

    // Image data
    createImageData: vi.fn(() => ({ 
      data: new Uint8ClampedArray(4),
      width: 1,
      height: 1,
    })),
    getImageData: vi.fn(() => ({ 
      data: new Uint8ClampedArray(4),
      width: 1,
      height: 1,
    })),
    putImageData: vi.fn(),

    // Drawing images
    drawImage: vi.fn(),

    // Text properties
    font: '10px sans-serif',
    textAlign: 'start' as CanvasTextAlign,
    textBaseline: 'alphabetic' as CanvasTextBaseline,
    direction: 'inherit' as CanvasDirection,

    // Canvas properties
    canvas: {
      width: 300,
      height: 150,
      toDataURL: vi.fn(() => 'data:image/png;base64,mock'),
      toBlob: vi.fn((callback) => {
        const blob = new Blob(['mock'], { type: 'image/png' })
        callback?.(blob)
      }),
    },

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
      }
    },
    _reset: () => {
      Object.values(mock).forEach(value => {
        if (typeof value === 'function' && 'mockClear' in value) {
          value.mockClear()
        }
      })
    },
  }

  return mock
}

// Mock HTMLCanvasElement
export const mockCanvas = {
  getContext: vi.fn((contextType: string) => {
    if (contextType === '2d') {
      return createCanvasContextMock()
    }
    return null
  }),
  toDataURL: vi.fn(() => 'data:image/png;base64,mock'),
  toBlob: vi.fn((callback) => {
    const blob = new Blob(['mock'], { type: 'image/png' })
    callback?.(blob)
  }),
  width: 300,
  height: 150,
}

// Helper function to mock canvas creation
export const mockCreateCanvas = (width = 300, height = 150) => {
  const canvas = {
    ...mockCanvas,
    width,
    height,
    getContext: vi.fn(() => createCanvasContextMock()),
  }
  return canvas
}

// Mock for testing canvas animations
export const mockAnimationFrame = {
  request: vi.fn((callback) => {
    setTimeout(callback, 16) // ~60fps
    return 1
  }),
  cancel: vi.fn(),
}

// Mock for testing canvas events
export const mockCanvasEvent = (type: string, x: number, y: number) => {
  return new MouseEvent(type, {
    clientX: x,
    clientY: y,
    bubbles: true,
    cancelable: true,
  })
}

// Helper to simulate canvas drawing operations
export const simulateCanvasDrawing = (context: any) => {
  context.beginPath()
  context.arc(50, 50, 20, 0, Math.PI * 2)
  context.fill()
  return context._getDrawCalls()
}