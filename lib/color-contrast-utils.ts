/**
 * Color contrast utilities for accessibility compliance
 * Implements WCAG 2.1 AA color contrast requirements
 */

/**
 * Convert hex color to RGB values
 */
function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}

/**
 * Convert RGB color string to RGB values
 */
function rgbStringToRgb(
  rgb: string,
): { r: number; g: number; b: number } | null {
  const match = rgb.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
  return match
    ? {
        r: parseInt(match[1], 10),
        g: parseInt(match[2], 10),
        b: parseInt(match[3], 10),
      }
    : null;
}

/**
 * Calculate relative luminance of a color
 * Based on WCAG 2.1 specification
 */
function getRelativeLuminance(r: number, g: number, b: number): number {
  const [rs, gs, bs] = [r, g, b].map((c) => {
    c = c / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });

  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

/**
 * Calculate contrast ratio between two colors
 * Returns a value between 1 and 21
 */
export function getContrastRatio(color1: string, color2: string): number {
  let rgb1, rgb2;

  // Handle hex colors
  if (color1.startsWith("#")) {
    rgb1 = hexToRgb(color1);
  } else if (color1.startsWith("rgb")) {
    rgb1 = rgbStringToRgb(color1);
  } else {
    // Handle named colors or other formats
    return 1; // Default to failing ratio
  }

  if (color2.startsWith("#")) {
    rgb2 = hexToRgb(color2);
  } else if (color2.startsWith("rgb")) {
    rgb2 = rgbStringToRgb(color2);
  } else {
    return 1; // Default to failing ratio
  }

  if (!rgb1 || !rgb2) return 1;

  const lum1 = getRelativeLuminance(rgb1.r, rgb1.g, rgb1.b);
  const lum2 = getRelativeLuminance(rgb2.r, rgb2.g, rgb2.b);

  const brightest = Math.max(lum1, lum2);
  const darkest = Math.min(lum1, lum2);

  return (brightest + 0.05) / (darkest + 0.05);
}

/**
 * Check if color combination meets WCAG AA standards
 * Normal text: 4.5:1, Large text: 3:1
 */
export function meetsWCAGAA(
  foreground: string,
  background: string,
  isLargeText: boolean = false,
): boolean {
  const ratio = getContrastRatio(foreground, background);
  return isLargeText ? ratio >= 3 : ratio >= 4.5;
}

/**
 * Check if color combination meets WCAG AAA standards
 * Normal text: 7:1, Large text: 4.5:1
 */
export function meetsWCAGAAA(
  foreground: string,
  background: string,
  isLargeText: boolean = false,
): boolean {
  const ratio = getContrastRatio(foreground, background);
  return isLargeText ? ratio >= 4.5 : ratio >= 7;
}

/**
 * Validate color contrast for theme compliance
 */
export function validateThemeContrast(theme: "light" | "dark"): {
  valid: boolean;
  violations: Array<{
    element: string;
    foreground: string;
    background: string;
    ratio: number;
    required: number;
  }>;
} {
  const violations: Array<{
    element: string;
    foreground: string;
    background: string;
    ratio: number;
    required: number;
  }> = [];

  // Define theme color combinations to test
  const colorCombinations =
    theme === "light"
      ? [
          {
            element: "body-text",
            foreground: "#1f2937",
            background: "#ffffff",
          },
          {
            element: "heading-text",
            foreground: "#111827",
            background: "#ffffff",
          },
          {
            element: "button-primary",
            foreground: "#ffffff",
            background: "#3b82f6",
          },
          {
            element: "button-secondary",
            foreground: "#374151",
            background: "#f9fafb",
          },
          {
            element: "link-text",
            foreground: "#2563eb",
            background: "#ffffff",
          },
          {
            element: "error-text",
            foreground: "#dc2626",
            background: "#ffffff",
          },
          {
            element: "success-text",
            foreground: "#059669",
            background: "#ffffff",
          },
        ]
      : [
          {
            element: "body-text",
            foreground: "#f9fafb",
            background: "#111827",
          },
          {
            element: "heading-text",
            foreground: "#ffffff",
            background: "#111827",
          },
          {
            element: "button-primary",
            foreground: "#ffffff",
            background: "#3b82f6",
          },
          {
            element: "button-secondary",
            foreground: "#d1d5db",
            background: "#374151",
          },
          {
            element: "link-text",
            foreground: "#60a5fa",
            background: "#111827",
          },
          {
            element: "error-text",
            foreground: "#f87171",
            background: "#111827",
          },
          {
            element: "success-text",
            foreground: "#34d399",
            background: "#111827",
          },
        ];

  colorCombinations.forEach(({ element, foreground, background }) => {
    const ratio = getContrastRatio(foreground, background);
    const required = element.includes("heading") ? 3 : 4.5; // Large text vs normal text

    // Allow a small tolerance for floating point precision
    if (ratio < required - 0.1) {
      violations.push({
        element,
        foreground,
        background,
        ratio,
        required,
      });
    }
  });

  return {
    valid: violations.length === 0,
    violations,
  };
}

/**
 * Get accessible color suggestions for a given background
 */
export function getAccessibleColors(backgroundColor: string): {
  lightText: string[];
  darkText: string[];
} {
  const lightColors = ["#ffffff", "#f9fafb", "#f3f4f6", "#e5e7eb"];
  const darkColors = ["#111827", "#1f2937", "#374151", "#4b5563"];

  const accessibleLight = lightColors.filter((color) =>
    meetsWCAGAA(color, backgroundColor),
  );

  const accessibleDark = darkColors.filter((color) =>
    meetsWCAGAA(color, backgroundColor),
  );

  return {
    lightText: accessibleLight,
    darkText: accessibleDark,
  };
}

/**
 * Generate a contrast report for the current page
 */
export function generateContrastReport(): {
  totalElements: number;
  passedElements: number;
  failedElements: number;
  violations: Array<{
    element: HTMLElement;
    foreground: string;
    background: string;
    ratio: number;
    selector: string;
  }>;
} {
  const violations: Array<{
    element: HTMLElement;
    foreground: string;
    background: string;
    ratio: number;
    selector: string;
  }> = [];

  // Get all text elements
  const textElements = document.querySelectorAll(
    "p, span, h1, h2, h3, h4, h5, h6, a, button, label, input, textarea",
  );

  textElements.forEach((element) => {
    const computedStyle = window.getComputedStyle(element);
    const foreground = computedStyle.color;
    const background = computedStyle.backgroundColor;

    // Skip transparent backgrounds
    if (background === "rgba(0, 0, 0, 0)" || background === "transparent") {
      return;
    }

    const ratio = getContrastRatio(foreground, background);
    const isLargeText =
      parseFloat(computedStyle.fontSize) >= 18 ||
      (parseFloat(computedStyle.fontSize) >= 14 &&
        computedStyle.fontWeight === "bold");

    if (!meetsWCAGAA(foreground, background, isLargeText)) {
      violations.push({
        element: element as HTMLElement,
        foreground,
        background,
        ratio,
        selector: getElementSelector(element as HTMLElement),
      });
    }
  });

  return {
    totalElements: textElements.length,
    passedElements: textElements.length - violations.length,
    failedElements: violations.length,
    violations,
  };
}

/**
 * Generate a CSS selector for an element
 */
function getElementSelector(element: HTMLElement): string {
  if (element.id) {
    return `#${element.id}`;
  }

  if (element.className) {
    const classes = element.className.split(" ").filter((c) => c.length > 0);
    if (classes.length > 0) {
      return `.${classes.join(".")}`;
    }
  }

  return element.tagName.toLowerCase();
}
