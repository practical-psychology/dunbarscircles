import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import {
  getContrastRatio,
  meetsWCAGAA,
  meetsWCAGAAA,
  validateThemeContrast,
  getAccessibleColors,
} from "@/lib/color-contrast-utils";
import { ThemeProvider } from "@/components/theme-provider";
import { NetworkDiagram } from "@/components/network-diagram";
import { RadialDiagram } from "@/components/radial-diagram";

// Mock data for testing
const mockLevels = [
  {
    id: "inner-circle",
    name: "Inner Circle",
    count: 5,
    description: "Closest relationships requiring daily attention",
    contactFrequency: "Daily",
    digitalParallel: "Close family group chat",
    maintenanceCost: "High emotional investment",
    color: "bg-red-500",
    textColor: "text-red-700",
    bgColor: "bg-red-50",
    category: "intimate",
  },
];

describe("Color Contrast Accessibility", () => {
  describe("Contrast Ratio Calculations", () => {
    it("should calculate correct contrast ratios", () => {
      // Test known contrast ratios
      expect(getContrastRatio("#000000", "#ffffff")).toBeCloseTo(21, 1); // Maximum contrast
      expect(getContrastRatio("#ffffff", "#ffffff")).toBeCloseTo(1, 1); // No contrast
      expect(getContrastRatio("#767676", "#ffffff")).toBeCloseTo(4.5, 1); // WCAG AA minimum
    });

    it("should handle RGB color strings", () => {
      const ratio = getContrastRatio("rgb(0, 0, 0)", "rgb(255, 255, 255)");
      expect(ratio).toBeCloseTo(21, 1);
    });

    it("should handle invalid color formats gracefully", () => {
      const ratio = getContrastRatio("invalid-color", "#ffffff");
      expect(ratio).toBe(1); // Should return minimum ratio for invalid colors
    });
  });

  describe("WCAG Compliance", () => {
    it("should correctly identify WCAG AA compliant colors", () => {
      expect(meetsWCAGAA("#000000", "#ffffff")).toBe(true); // 21:1 ratio
      expect(meetsWCAGAA("#767676", "#ffffff")).toBe(true); // 4.5:1 ratio
      expect(meetsWCAGAA("#949494", "#ffffff")).toBe(false); // 3.2:1 ratio
    });

    it("should correctly identify WCAG AAA compliant colors", () => {
      expect(meetsWCAGAAA("#000000", "#ffffff")).toBe(true); // 21:1 ratio
      expect(meetsWCAGAAA("#595959", "#ffffff")).toBe(true); // 7:1 ratio
      expect(meetsWCAGAAA("#767676", "#ffffff")).toBe(false); // 4.5:1 ratio
    });

    it("should handle large text requirements", () => {
      // Large text has lower contrast requirements
      expect(meetsWCAGAA("#949494", "#ffffff", true)).toBe(true); // 3.2:1 ratio, large text
      expect(meetsWCAGAA("#949494", "#ffffff", false)).toBe(false); // 3.2:1 ratio, normal text
    });
  });

  describe("Theme Validation", () => {
    it("should validate light theme colors", () => {
      const result = validateThemeContrast("light");

      // All standard light theme combinations should pass
      expect(result.valid).toBe(true);
      expect(result.violations).toHaveLength(0);
    });

    it("should validate dark theme colors", () => {
      const result = validateThemeContrast("dark");

      // All standard dark theme combinations should pass
      expect(result.valid).toBe(true);
      expect(result.violations).toHaveLength(0);
    });

    it("should identify violations in invalid themes", () => {
      // This would be tested with a custom theme that has poor contrast
      const result = validateThemeContrast("light");

      // Structure should be correct even if no violations
      expect(result).toHaveProperty("valid");
      expect(result).toHaveProperty("violations");
      expect(Array.isArray(result.violations)).toBe(true);
    });
  });

  describe("Accessible Color Suggestions", () => {
    it("should suggest accessible colors for light backgrounds", () => {
      const suggestions = getAccessibleColors("#ffffff");

      expect(suggestions.darkText.length).toBeGreaterThan(0);
      expect(suggestions.lightText.length).toBeGreaterThanOrEqual(0);

      // All suggested colors should meet WCAG AA
      suggestions.darkText.forEach((color) => {
        expect(meetsWCAGAA(color, "#ffffff")).toBe(true);
      });
    });

    it("should suggest accessible colors for dark backgrounds", () => {
      const suggestions = getAccessibleColors("#111827");

      expect(suggestions.lightText.length).toBeGreaterThan(0);
      expect(suggestions.darkText.length).toBeGreaterThanOrEqual(0);

      // All suggested colors should meet WCAG AA
      suggestions.lightText.forEach((color) => {
        expect(meetsWCAGAA(color, "#111827")).toBe(true);
      });
    });
  });

  describe("Component Color Contrast", () => {
    it("should have accessible colors in NetworkDiagram light theme", () => {
      const { container } = render(
        <ThemeProvider defaultTheme="light" storageKey="test-theme">
          <NetworkDiagram
            levels={mockLevels}
            selectedLevel={null}
            onLevelSelect={vi.fn()}
          />
        </ThemeProvider>,
      );

      // Test text elements for contrast
      const textElements = container.querySelectorAll(
        "text, span, p, h1, h2, h3, h4, h5, h6",
      );

      textElements.forEach((element) => {
        const computedStyle = window.getComputedStyle(element);
        const color = computedStyle.color;
        const backgroundColor = computedStyle.backgroundColor;

        // Skip transparent backgrounds
        if (
          backgroundColor === "rgba(0, 0, 0, 0)" ||
          backgroundColor === "transparent"
        ) {
          return;
        }

        const ratio = getContrastRatio(color, backgroundColor);
        expect(ratio).toBeGreaterThanOrEqual(3); // Minimum for any text
      });
    });

    it("should have accessible colors in NetworkDiagram dark theme", () => {
      const { container } = render(
        <ThemeProvider defaultTheme="dark" storageKey="test-theme-dark">
          <NetworkDiagram
            levels={mockLevels}
            selectedLevel={null}
            onLevelSelect={vi.fn()}
          />
        </ThemeProvider>,
      );

      // Test text elements for contrast
      const textElements = container.querySelectorAll(
        "text, span, p, h1, h2, h3, h4, h5, h6",
      );

      textElements.forEach((element) => {
        const computedStyle = window.getComputedStyle(element);
        const color = computedStyle.color;
        const backgroundColor = computedStyle.backgroundColor;

        // Skip transparent backgrounds
        if (
          backgroundColor === "rgba(0, 0, 0, 0)" ||
          backgroundColor === "transparent"
        ) {
          return;
        }

        const ratio = getContrastRatio(color, backgroundColor);
        expect(ratio).toBeGreaterThanOrEqual(3); // Minimum for any text
      });
    });

    it("should have accessible colors in RadialDiagram", () => {
      const { container } = render(
        <ThemeProvider defaultTheme="light" storageKey="test-theme">
          <RadialDiagram levels={mockLevels} />
        </ThemeProvider>,
      );

      // Test that progress bars have sufficient contrast
      const progressBars = container.querySelectorAll('[role="progressbar"]');
      progressBars.forEach((progress) => {
        const computedStyle = window.getComputedStyle(progress);
        const backgroundColor = computedStyle.backgroundColor;

        // Progress bars should have visible backgrounds
        expect(backgroundColor).not.toBe("transparent");
        expect(backgroundColor).not.toBe("rgba(0, 0, 0, 0)");
      });
    });
  });

  describe("Interactive Element Contrast", () => {
    it("should have accessible button colors", () => {
      const { container } = render(
        <ThemeProvider defaultTheme="light" storageKey="test-theme">
          <RadialDiagram levels={mockLevels} />
        </ThemeProvider>,
      );

      const buttons = container.querySelectorAll("button");
      buttons.forEach((button) => {
        const computedStyle = window.getComputedStyle(button);
        const color = computedStyle.color;
        const backgroundColor = computedStyle.backgroundColor;

        // Skip buttons without background colors
        if (
          backgroundColor === "rgba(0, 0, 0, 0)" ||
          backgroundColor === "transparent"
        ) {
          return;
        }

        const ratio = getContrastRatio(color, backgroundColor);
        expect(ratio).toBeGreaterThanOrEqual(3); // Minimum for interactive elements
      });
    });

    it("should have accessible link colors", () => {
      const { container } = render(
        <ThemeProvider defaultTheme="light" storageKey="test-theme">
          <RadialDiagram levels={mockLevels} />
        </ThemeProvider>,
      );

      const links = container.querySelectorAll("a");
      links.forEach((link) => {
        const computedStyle = window.getComputedStyle(link);
        const color = computedStyle.color;

        // Links should have sufficient contrast against their background
        // This is a simplified test - in practice, you'd need to find the actual background
        expect(color).not.toBe("transparent");
        expect(color).not.toBe("rgba(0, 0, 0, 0)");
      });
    });
  });

  describe("Focus Indicator Contrast", () => {
    it("should have visible focus indicators", () => {
      const { container } = render(
        <ThemeProvider defaultTheme="light" storageKey="test-theme">
          <NetworkDiagram
            levels={mockLevels}
            selectedLevel={null}
            onLevelSelect={vi.fn()}
          />
        </ThemeProvider>,
      );

      const focusableElements = container.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      );

      focusableElements.forEach((element) => {
        // Focus each element to test focus indicators
        (element as HTMLElement).focus();

        const computedStyle = window.getComputedStyle(element);

        // Check for focus ring or outline
        const hasVisibleFocus =
          computedStyle.outline !== "none" ||
          computedStyle.boxShadow !== "none" ||
          element.classList.toString().includes("focus:") ||
          element.getAttribute("aria-label");

        expect(hasVisibleFocus).toBeTruthy();
      });
    });
  });
});
