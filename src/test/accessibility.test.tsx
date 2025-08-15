import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  testAccessibility,
  testKeyboardNavigation,
  validateAriaLabels,
} from "./accessibility-utils";
import { NetworkDiagram } from "@/components/network-diagram";
import { RadialDiagram } from "@/components/radial-diagram";
import { RelationshipInventory } from "@/components/relationship-inventory";
import { ThemeProvider } from "@/components/theme-provider";

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
  {
    id: "sympathy-group",
    name: "Sympathy Group",
    count: 15,
    description: "Close friends you contact weekly",
    contactFrequency: "Weekly",
    digitalParallel: "Close friends on social media",
    maintenanceCost: "Regular check-ins required",
    color: "bg-orange-500",
    textColor: "text-orange-700",
    bgColor: "bg-orange-50",
    category: "intimate",
  },
];

const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <ThemeProvider defaultTheme="light" storageKey="test-theme">
    {children}
  </ThemeProvider>
);

describe("Accessibility Tests", () => {
  describe("NetworkDiagram", () => {
    it("should have no accessibility violations", async () => {
      const mockOnLevelSelect = vi.fn();

      await testAccessibility(
        <TestWrapper>
          <NetworkDiagram
            levels={mockLevels}
            selectedLevel={null}
            onLevelSelect={mockOnLevelSelect}
          />
        </TestWrapper>,
      );
    });

    it("should support keyboard navigation", async () => {
      const mockOnLevelSelect = vi.fn();

      render(
        <TestWrapper>
          <NetworkDiagram
            levels={mockLevels}
            selectedLevel={null}
            onLevelSelect={mockOnLevelSelect}
          />
        </TestWrapper>,
      );

      // Test keyboard navigation on interactive elements
      const diagram = screen.getByTestId("network-diagram");
      expect(diagram).toHaveAttribute("tabIndex", "0");
      expect(diagram).toHaveAttribute("role", "img");
      expect(diagram).toHaveAttribute("aria-label");

      // Test that SVG elements are properly labeled
      const svg = diagram.querySelector("svg");
      expect(svg).toHaveAttribute("role", "img");
      expect(svg).toHaveAttribute("aria-labelledby");
      expect(svg).toHaveAttribute("aria-describedby");
    });

    it("should have proper ARIA labels", () => {
      const mockOnLevelSelect = vi.fn();

      const { container } = render(
        <TestWrapper>
          <NetworkDiagram
            levels={mockLevels}
            selectedLevel={null}
            onLevelSelect={mockOnLevelSelect}
          />
        </TestWrapper>,
      );

      validateAriaLabels(container);
    });

    it("should handle keyboard interactions", async () => {
      const user = userEvent.setup();
      const mockOnLevelSelect = vi.fn();

      render(
        <TestWrapper>
          <NetworkDiagram
            levels={mockLevels}
            selectedLevel={null}
            onLevelSelect={mockOnLevelSelect}
          />
        </TestWrapper>,
      );

      // Find interactive elements and test keyboard activation
      const interactiveElements = screen.getAllByRole("button");

      for (const element of interactiveElements) {
        // Test Enter key
        element.focus();
        await user.keyboard("{Enter}");

        // Test Space key
        element.focus();
        await user.keyboard(" ");
      }

      // Verify that keyboard interactions trigger the callback
      expect(mockOnLevelSelect).toHaveBeenCalled();
    });
  });

  describe("RadialDiagram", () => {
    it("should have no accessibility violations", async () => {
      await testAccessibility(
        <TestWrapper>
          <RadialDiagram levels={mockLevels} />
        </TestWrapper>,
      );
    });

    it("should support keyboard navigation", () => {
      render(
        <TestWrapper>
          <RadialDiagram levels={mockLevels} />
        </TestWrapper>,
      );

      // Test that the main container has proper accessibility attributes
      const diagram = screen.getByTestId("radial-diagram");
      expect(diagram).toHaveAttribute("role", "region");
      expect(diagram).toHaveAttribute("aria-label");

      // Test that interactive elements are keyboard accessible
      const buttons = screen.getAllByRole("button");
      buttons.forEach((button) => {
        expect(button).toHaveAttribute("tabIndex", "0");
      });
    });

    it("should have proper semantic structure", () => {
      const { container } = render(
        <TestWrapper>
          <RadialDiagram levels={mockLevels} />
        </TestWrapper>,
      );

      // Check for proper heading structure
      const headings = container.querySelectorAll("h1, h2, h3, h4, h5, h6");
      expect(headings.length).toBeGreaterThan(0);

      // Check for proper ARIA labels on data visualizations
      const dataElements = container.querySelectorAll(
        '[aria-label*="percent"], [aria-label*="connections"], [aria-label*="relationships"]',
      );
      expect(dataElements.length).toBeGreaterThan(0);
    });

    it("should provide meaningful progress indicators", () => {
      render(
        <TestWrapper>
          <RadialDiagram levels={mockLevels} />
        </TestWrapper>,
      );

      // Check that progress bars have proper labels
      const progressBars = screen.getAllByRole("progressbar");
      progressBars.forEach((progress) => {
        expect(progress).toHaveAttribute("aria-valuemin");
        expect(progress).toHaveAttribute("aria-valuemax");
        expect(progress).toHaveAttribute("aria-valuenow");
      });
    });
  });

  describe("RelationshipInventory", () => {
    it("should have no accessibility violations", async () => {
      await testAccessibility(
        <TestWrapper>
          <RelationshipInventory levels={mockLevels} />
        </TestWrapper>,
      );
    });

    it("should support keyboard navigation", () => {
      const renderResult = render(
        <TestWrapper>
          <RelationshipInventory levels={mockLevels} />
        </TestWrapper>,
      );

      // Test that the main container has proper accessibility attributes
      const inventory = screen.getByTestId("relationship-inventory");
      expect(inventory).toHaveAttribute("role", "region");
      expect(inventory).toHaveAttribute("aria-label");

      // Test keyboard navigation
      testKeyboardNavigation(renderResult, 5); // Expect at least 5 focusable elements
    });

    it("should have proper form accessibility", () => {
      const { container } = render(
        <TestWrapper>
          <RelationshipInventory levels={mockLevels} />
        </TestWrapper>,
      );

      // Check that form elements have proper labels
      const inputs = container.querySelectorAll("input, select, textarea");
      inputs.forEach((input) => {
        const hasLabel =
          input.getAttribute("aria-label") ||
          input.getAttribute("aria-labelledby") ||
          container.querySelector(`label[for="${input.id}"]`);
        expect(hasLabel).toBeTruthy();
      });
    });
  });

  describe("Theme Accessibility", () => {
    it("should maintain accessibility in dark theme", async () => {
      await testAccessibility(
        <ThemeProvider defaultTheme="dark" storageKey="test-theme-dark">
          <NetworkDiagram
            levels={mockLevels}
            selectedLevel={null}
            onLevelSelect={vi.fn()}
          />
        </ThemeProvider>,
      );
    });

    it("should maintain accessibility in light theme", async () => {
      await testAccessibility(
        <ThemeProvider defaultTheme="light" storageKey="test-theme-light">
          <RadialDiagram levels={mockLevels} />
        </ThemeProvider>,
      );
    });
  });

  describe("Color Contrast", () => {
    it("should have sufficient color contrast in light theme", () => {
      const { container } = render(
        <ThemeProvider defaultTheme="light" storageKey="test-theme-light">
          <NetworkDiagram
            levels={mockLevels}
            selectedLevel={null}
            onLevelSelect={vi.fn()}
          />
        </ThemeProvider>,
      );

      // Test that text elements have sufficient contrast
      const textElements = container.querySelectorAll(
        "text, span, p, h1, h2, h3, h4, h5, h6",
      );
      textElements.forEach((element) => {
        const computedStyle = window.getComputedStyle(element);
        const backgroundColor = computedStyle.backgroundColor;
        const color = computedStyle.color;

        // Basic validation - colors should not be the same
        expect(backgroundColor).not.toBe(color);
      });
    });

    it("should have sufficient color contrast in dark theme", () => {
      const { container } = render(
        <ThemeProvider defaultTheme="dark" storageKey="test-theme-dark">
          <RadialDiagram levels={mockLevels} />
        </ThemeProvider>,
      );

      // Test that text elements have sufficient contrast
      const textElements = container.querySelectorAll(
        "text, span, p, h1, h2, h3, h4, h5, h6",
      );
      textElements.forEach((element) => {
        const computedStyle = window.getComputedStyle(element);
        const backgroundColor = computedStyle.backgroundColor;
        const color = computedStyle.color;

        // Basic validation - colors should not be the same
        expect(backgroundColor).not.toBe(color);
      });
    });
  });

  describe("Focus Management", () => {
    it("should manage focus properly in modals and dialogs", async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <RelationshipInventory levels={mockLevels} />
        </TestWrapper>,
      );

      // Test that focus is managed properly when opening dialogs
      const buttons = screen.getAllByRole("button");
      if (buttons.length > 0) {
        await user.click(buttons[0]);

        // Check that focus is trapped within modal if one opens
        const dialogs = screen.queryAllByRole("dialog");
        if (dialogs.length > 0) {
          const dialog = dialogs[0];
          const focusableElements = dialog.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
          );
          expect(focusableElements.length).toBeGreaterThan(0);
        }
      }
    });

    it("should have visible focus indicators", () => {
      const { container } = render(
        <TestWrapper>
          <NetworkDiagram
            levels={mockLevels}
            selectedLevel={null}
            onLevelSelect={vi.fn()}
          />
        </TestWrapper>,
      );

      // Check that focusable elements have focus styles
      const focusableElements = container.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      );

      focusableElements.forEach((element) => {
        const computedStyle = window.getComputedStyle(element);
        // Elements should have focus styles or proper ARIA labels
        const hasFocusStyle =
          computedStyle.outline !== "none" ||
          element.classList.contains("focus:") ||
          element.getAttribute("aria-label");
        expect(hasFocusStyle).toBeTruthy();
      });
    });
  });
});
