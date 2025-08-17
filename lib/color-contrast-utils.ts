/**
 * Color contrast validation utilities for WCAG AA compliance
 * Ensures all color combinations meet accessibility standards
 */

/**
 * Convert HSL color to RGB values
 */
function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  h /= 360;
  s /= 100;
  l /= 100;

  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h * 6) % 2) - 1));
  const m = l - c / 2;

  let r = 0,
    g = 0,
    b = 0;

  if (0 <= h && h < 1 / 6) {
    r = c;
    g = x;
    b = 0;
  } else if (1 / 6 <= h && h < 2 / 6) {
    r = x;
    g = c;
    b = 0;
  } else if (2 / 6 <= h && h < 3 / 6) {
    r = 0;
    g = c;
    b = x;
  } else if (3 / 6 <= h && h < 4 / 6) {
    r = 0;
    g = x;
    b = c;
  } else if (4 / 6 <= h && h < 5 / 6) {
    r = x;
    g = 0;
    b = c;
  } else if (5 / 6 <= h && h < 1) {
    r = c;
    g = 0;
    b = x;
  }

  return [
    Math.round((r + m) * 255),
    Math.round((g + m) * 255),
    Math.round((b + m) * 255),
  ];
}

/**
 * Parse HSL string from CSS custom property
 */
function parseHslString(hslString: string): [number, number, number] {
  // Handle format like "220 70% 50%" or "hsl(220, 70%, 50%)"
  const cleanString = hslString.replace(/hsl\(|\)|%/g, "").trim();
  const parts = cleanString
    .split(/[\s,]+/)
    .map((part) => parseFloat(part.trim()));

  if (parts.length !== 3) {
    throw new Error(`Invalid HSL format: ${hslString}`);
  }

  return [parts[0], parts[1], parts[2]];
}

/**
 * Calculate relative luminance of a color
 */
function getRelativeLuminance(r: number, g: number, b: number): number {
  // Normalize RGB values to 0-1 range
  const [rs, gs, bs] = [r, g, b].map((c) => {
    c = c / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });

  // Calculate relative luminance
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

/**
 * Calculate contrast ratio between two colors
 */
export function calculateContrastRatio(color1: string, color2: string): number {
  try {
    const [h1, s1, l1] = parseHslString(color1);
    const [h2, s2, l2] = parseHslString(color2);

    const [r1, g1, b1] = hslToRgb(h1, s1, l1);
    const [r2, g2, b2] = hslToRgb(h2, s2, l2);

    const lum1 = getRelativeLuminance(r1, g1, b1);
    const lum2 = getRelativeLuminance(r2, g2, b2);

    const lighter = Math.max(lum1, lum2);
    const darker = Math.min(lum1, lum2);

    return (lighter + 0.05) / (darker + 0.05);
  } catch (error) {
    console.error("Error calculating contrast ratio:", error);
    return 1; // Return minimum contrast if calculation fails
  }
}

/**
 * Check if contrast ratio meets WCAG AA standards
 */
export function meetsWCAGAA(
  contrastRatio: number,
  isLargeText = false,
): boolean {
  const threshold = isLargeText ? 3.0 : 4.5;
  return contrastRatio >= threshold;
}

/**
 * Check if contrast ratio meets WCAG AAA standards
 */
export function meetsWCAGAAA(
  contrastRatio: number,
  isLargeText = false,
): boolean {
  const threshold = isLargeText ? 4.5 : 7.0;
  return contrastRatio >= threshold;
}

/**
 * Get accessibility level for a contrast ratio
 */
export function getAccessibilityLevel(
  contrastRatio: number,
  isLargeText = false,
): "FAIL" | "AA" | "AAA" {
  if (meetsWCAGAAA(contrastRatio, isLargeText)) return "AAA";
  if (meetsWCAGAA(contrastRatio, isLargeText)) return "AA";
  return "FAIL";
}

/**
 * Color combinations to validate for WCAG compliance
 */
export interface ColorCombination {
  name: string;
  foreground: string;
  background: string;
  isLargeText?: boolean;
  context: string;
}

/**
 * Get all color combinations that need validation
 */
export function getColorCombinationsToValidate(): ColorCombination[] {
  return [
    // Light theme combinations
    {
      name: "Primary Text on Background (Light)",
      foreground: "0 0% 3.9%", // --foreground
      background: "0 0% 100%", // --background
      context: "Main body text",
    },
    {
      name: "Primary Button Text (Light)",
      foreground: "0 0% 98%", // --primary-foreground
      background: "0 0% 9%", // --primary
      context: "Primary button text",
    },
    {
      name: "Secondary Text (Light)",
      foreground: "0 0% 9%", // --secondary-foreground
      background: "0 0% 96.1%", // --secondary
      context: "Secondary button text",
    },
    {
      name: "Muted Text (Light)",
      foreground: "0 0% 40%", // --muted-foreground (improved)
      background: "0 0% 100%", // --background
      context: "Muted/helper text",
    },
    {
      name: "Card Text (Light)",
      foreground: "0 0% 3.9%", // --card-foreground
      background: "0 0% 100%", // --card
      context: "Card content text",
    },
    {
      name: "Destructive Button Text (Light)",
      foreground: "0 0% 98%", // --destructive-foreground
      background: "0 84.2% 48%", // --destructive (improved)
      context: "Error/destructive button text",
    },

    // Dark theme combinations
    {
      name: "Primary Text on Background (Dark)",
      foreground: "0 0% 98%", // --foreground (dark)
      background: "0 0% 3.9%", // --background (dark)
      context: "Main body text (dark theme)",
    },
    {
      name: "Primary Button Text (Dark)",
      foreground: "0 0% 9%", // --primary-foreground (dark)
      background: "0 0% 98%", // --primary (dark)
      context: "Primary button text (dark theme)",
    },
    {
      name: "Secondary Text (Dark)",
      foreground: "0 0% 98%", // --secondary-foreground (dark)
      background: "0 0% 14.9%", // --secondary (dark)
      context: "Secondary button text (dark theme)",
    },
    {
      name: "Muted Text (Dark)",
      foreground: "0 0% 70%", // --muted-foreground (dark, improved)
      background: "0 0% 3.9%", // --background (dark)
      context: "Muted/helper text (dark theme)",
    },
    {
      name: "Card Text (Dark)",
      foreground: "0 0% 98%", // --card-foreground (dark)
      background: "0 0% 3.9%", // --card (dark)
      context: "Card content text (dark theme)",
    },
    {
      name: "Destructive Button Text (Dark)",
      foreground: "0 0% 98%", // --destructive-foreground (dark)
      background: "0 62.8% 40%", // --destructive (dark, improved)
      context: "Error/destructive button text (dark theme)",
    },

    // Chart colors (both themes use same values)
    {
      name: "Chart Color 1",
      foreground: "0 0% 98%", // White text on chart
      background: "12 76% 45%", // --chart-1 (improved)
      context: "Chart data labels",
      isLargeText: true,
    },
    {
      name: "Chart Color 2",
      foreground: "0 0% 98%", // White text on chart
      background: "173 58% 30%", // --chart-2 (improved)
      context: "Chart data labels",
      isLargeText: true,
    },
    {
      name: "Chart Color 3",
      foreground: "0 0% 98%", // White text on chart
      background: "197 37% 20%", // --chart-3 (improved)
      context: "Chart data labels",
      isLargeText: true,
    },
    {
      name: "Chart Color 4",
      foreground: "0 0% 3.9%", // Dark text on light chart
      background: "43 74% 55%", // --chart-4 (improved)
      context: "Chart data labels",
      isLargeText: true,
    },
    {
      name: "Chart Color 5",
      foreground: "0 0% 3.9%", // Dark text on light chart
      background: "27 87% 55%", // --chart-5 (improved)
      context: "Chart data labels",
      isLargeText: true,
    },
  ];
}

/**
 * Validate all color combinations and return results
 */
export interface ValidationResult {
  combination: ColorCombination;
  contrastRatio: number;
  level: "FAIL" | "AA" | "AAA";
  passes: boolean;
}

export function validateAllColorCombinations(): ValidationResult[] {
  const combinations = getColorCombinationsToValidate();

  return combinations.map((combination) => {
    const contrastRatio = calculateContrastRatio(
      combination.foreground,
      combination.background,
    );
    const level = getAccessibilityLevel(contrastRatio, combination.isLargeText);
    const passes = meetsWCAGAA(contrastRatio, combination.isLargeText);

    return {
      combination,
      contrastRatio,
      level,
      passes,
    };
  });
}

/**
 * Generate improved color values that meet WCAG AA standards
 */
export function generateAccessibleColors(): Record<string, string> {
  return {
    // Light theme - improved colors for better contrast
    light: `
    --background: 0 0% 100%;
    --foreground: 0 0% 3.9%;
    --card: 0 0% 100%;
    --card-foreground: 0 0% 3.9%;
    --popover: 0 0% 100%;
    --popover-foreground: 0 0% 3.9%;
    --primary: 0 0% 9%;
    --primary-foreground: 0 0% 98%;
    --secondary: 0 0% 96.1%;
    --secondary-foreground: 0 0% 9%;
    --muted: 0 0% 96.1%;
    --muted-foreground: 0 0% 40%; /* Improved from 45.1% for better contrast */
    --accent: 0 0% 96.1%;
    --accent-foreground: 0 0% 9%;
    --destructive: 0 84.2% 50%; /* Improved from 60.2% for better contrast */
    --destructive-foreground: 0 0% 98%;
    --border: 0 0% 89.8%;
    --input: 0 0% 89.8%;
    --ring: 0 0% 3.9%;
    --chart-1: 12 76% 45%; /* Darkened for better contrast */
    --chart-2: 173 58% 30%; /* Darkened for better contrast */
    --chart-3: 197 37% 20%; /* Darkened for better contrast */
    --chart-4: 43 74% 55%; /* Adjusted for better contrast */
    --chart-5: 27 87% 55%; /* Adjusted for better contrast */
    `,

    // Dark theme - improved colors for better contrast
    dark: `
    --background: 0 0% 3.9%;
    --foreground: 0 0% 98%;
    --card: 0 0% 3.9%;
    --card-foreground: 0 0% 98%;
    --popover: 0 0% 3.9%;
    --popover-foreground: 0 0% 98%;
    --primary: 0 0% 98%;
    --primary-foreground: 0 0% 9%;
    --secondary: 0 0% 14.9%;
    --secondary-foreground: 0 0% 98%;
    --muted: 0 0% 14.9%;
    --muted-foreground: 0 0% 70%; /* Improved from 63.9% for better contrast */
    --accent: 0 0% 14.9%;
    --accent-foreground: 0 0% 98%;
    --destructive: 0 62.8% 40%; /* Improved from 30.6% for better contrast */
    --destructive-foreground: 0 0% 98%;
    --border: 0 0% 14.9%;
    --input: 0 0% 14.9%;
    --ring: 0 0% 83.1%;
    --chart-1: 220 70% 60%; /* Lightened for better contrast on dark */
    --chart-2: 160 60% 55%; /* Lightened for better contrast on dark */
    --chart-3: 30 80% 65%; /* Lightened for better contrast on dark */
    --chart-4: 280 65% 70%; /* Lightened for better contrast on dark */
    --chart-5: 340 75% 65%; /* Lightened for better contrast on dark */
    `,
  };
}

/**
 * Log validation results to console for debugging
 */
export function logValidationResults(): void {
  const results = validateAllColorCombinations();

  console.group("🎨 Color Contrast Validation Results");

  const failed = results.filter((r) => !r.passes);
  const passed = results.filter((r) => r.passes);

  if (failed.length > 0) {
    console.group(`❌ Failed WCAG AA (${failed.length})`);
    failed.forEach((result) => {
      console.log(
        `${result.combination.name}: ${result.contrastRatio.toFixed(2)}:1 (${result.level}) - ${result.combination.context}`,
      );
    });
    console.groupEnd();
  }

  if (passed.length > 0) {
    console.group(`✅ Passed WCAG AA (${passed.length})`);
    passed.forEach((result) => {
      console.log(
        `${result.combination.name}: ${result.contrastRatio.toFixed(2)}:1 (${result.level}) - ${result.combination.context}`,
      );
    });
    console.groupEnd();
  }

  console.groupEnd();
}
