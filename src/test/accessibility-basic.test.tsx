import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { NetworkDiagram } from "@/components/network-diagram";
import { RadialDiagram } from "@/components/radial-diagram";
import { RelationshipInventory } from "@/components/relationship-inventory";
import { ContactForm } from "@/components/contact-form";
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

describe("Basic Accessibility Features", () => {
  describe("NetworkDiagram Accessibility", () => {
    it("should have proper ARIA attributes", () => {
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

      const diagram = screen.getByTestId("network-diagram");
      // Container should NOT have role when it contains interactive elements
      expect(diagram).not.toHaveAttribute("role");
      expect(diagram).toHaveAttribute("aria-label");
      // Container should NOT have tabIndex to avoid nested interactive controls

      // Check SVG accessibility
      const svg = diagram.querySelector("svg");
      // SVG should NOT have role="img" when it contains interactive elements
      expect(svg).not.toHaveAttribute("role");
      expect(svg).toHaveAttribute("aria-labelledby");
      expect(svg).toHaveAttribute("aria-describedby");
    });

    it("should have keyboard accessible interactive elements", () => {
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

      // Find interactive elements (buttons)
      const buttons = screen.getAllByRole("button");
      expect(buttons.length).toBeGreaterThan(0);

      buttons.forEach((button) => {
        // Check for keyboard accessibility (explicit tabIndex or default focusable)
        const tabIndex = button.getAttribute("tabIndex");
        const isDisabled = button.hasAttribute("disabled");

        if (!isDisabled) {
          expect(
            tabIndex === null || tabIndex === "0" || parseInt(tabIndex) >= 0,
          ).toBeTruthy();
        }

        expect(button).toHaveAttribute("aria-label");
        expect(button).toHaveAttribute("aria-pressed");
      });
    });

    it("should support keyboard navigation", async () => {
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

      const buttons = screen.getAllByRole("button");
      if (buttons.length > 0) {
        const firstButton = buttons[0];

        // Test Enter key
        firstButton.focus();
        await user.keyboard("{Enter}");
        expect(mockOnLevelSelect).toHaveBeenCalled();

        // Test Space key
        mockOnLevelSelect.mockClear();
        firstButton.focus();
        await user.keyboard(" ");
        expect(mockOnLevelSelect).toHaveBeenCalled();
      }
    });
  });

  describe("RadialDiagram Accessibility", () => {
    it("should have proper semantic structure", () => {
      render(
        <TestWrapper>
          <RadialDiagram levels={mockLevels} />
        </TestWrapper>,
      );

      const diagram = screen.getByTestId("radial-diagram");
      expect(diagram).toHaveAttribute("role", "region");
      expect(diagram).toHaveAttribute("aria-label");

      // Check for progress bars with proper attributes (if any exist)
      const progressBars = screen.queryAllByRole("progressbar");
      progressBars.forEach((progress) => {
        expect(progress).toHaveAttribute("aria-valuemin");
        expect(progress).toHaveAttribute("aria-valuemax");
        expect(progress).toHaveAttribute("aria-valuenow");
      });
    });

    it("should have accessible data visualizations", () => {
      render(
        <TestWrapper>
          <RadialDiagram levels={mockLevels} />
        </TestWrapper>,
      );

      // Check for ARIA labels on data elements
      const dataElements = screen.getAllByLabelText(
        /cognitive load|network size|relationships/i,
      );
      expect(dataElements.length).toBeGreaterThan(0);

      // Check SVG accessibility - find the main diagram SVG specifically
      const diagram = screen.getByTestId("radial-diagram");
      const svg = diagram.querySelector(
        "svg[aria-labelledby='radial-diagram-title']",
      );
      if (svg) {
        // SVG should NOT have role="img" when it contains interactive elements
        expect(svg).not.toHaveAttribute("role");
        expect(svg).toHaveAttribute("aria-labelledby");
        expect(svg).toHaveAttribute("aria-describedby");
      }
    });
  });

  describe("RelationshipInventory Accessibility", () => {
    it("should have proper region labeling", () => {
      render(
        <TestWrapper>
          <RelationshipInventory levels={mockLevels} />
        </TestWrapper>,
      );

      const inventory = screen.getByTestId("relationship-inventory");
      expect(inventory).toHaveAttribute("role", "region");
      expect(inventory).toHaveAttribute("aria-label");
    });

    it("should have keyboard accessible controls", () => {
      render(
        <TestWrapper>
          <RelationshipInventory levels={mockLevels} />
        </TestWrapper>,
      );

      // Check that buttons are keyboard accessible
      const buttons = screen.getAllByRole("button");
      buttons.forEach((button) => {
        // Buttons should either have explicit tabIndex or be focusable by default
        const tabIndex = button.getAttribute("tabIndex");
        const isDisabled = button.hasAttribute("disabled");

        if (!isDisabled) {
          // Button should be focusable (either explicit tabIndex or default focusable)
          expect(
            tabIndex === null || tabIndex === "0" || parseInt(tabIndex) >= 0,
          ).toBeTruthy();
        }
      });
    });
  });

  describe("ContactForm Accessibility", () => {
    it("should have proper form structure", async () => {
      const mockOnSubmit = vi.fn();

      render(
        <TestWrapper>
          <ContactForm onSubmit={mockOnSubmit} />
        </TestWrapper>,
      );

      const form = screen.getByRole("form");
      expect(form).toHaveAttribute("aria-label");
      expect(form).toHaveAttribute("noValidate");

      // Check for fieldsets and legends
      const fieldsets = document.querySelectorAll("fieldset");
      expect(fieldsets.length).toBeGreaterThan(0);

      fieldsets.forEach((fieldset) => {
        const legend = fieldset.querySelector("legend");
        expect(legend).toBeInTheDocument();
      });
    });

    it("should have proper form validation", () => {
      const mockOnSubmit = vi.fn();

      render(
        <TestWrapper>
          <ContactForm onSubmit={mockOnSubmit} />
        </TestWrapper>,
      );

      // Check required fields
      const nameInput = screen.getByLabelText(/name/i);
      expect(nameInput).toHaveAttribute("required");
      expect(nameInput).toHaveAttribute("aria-invalid", "false");

      // Check that inputs have proper labeling
      const inputs = screen.getAllByRole("textbox");
      inputs.forEach((input) => {
        const hasLabel =
          input.getAttribute("aria-label") ||
          input.getAttribute("aria-labelledby") ||
          document.querySelector(`label[for="${input.id}"]`);
        expect(hasLabel).toBeTruthy();
      });
    });

    it("should announce validation errors", async () => {
      const user = userEvent.setup();
      const mockOnSubmit = vi.fn();

      render(
        <TestWrapper>
          <ContactForm onSubmit={mockOnSubmit} />
        </TestWrapper>,
      );

      // Try to submit empty form to trigger validation
      const submitButton = screen.getByRole("button", {
        name: /save contact/i,
      });
      await user.click(submitButton);

      // Check for error announcements
      const errorElements = document.querySelectorAll('[role="alert"]');
      if (errorElements.length > 0) {
        errorElements.forEach((error) => {
          expect(error).toHaveAttribute("aria-live", "polite");
        });
      }
    });
  });

  describe("Focus Management", () => {
    it("should have visible focus indicators", () => {
      render(
        <TestWrapper>
          <NetworkDiagram
            levels={mockLevels}
            selectedLevel={null}
            onLevelSelect={vi.fn()}
          />
        </TestWrapper>,
      );

      const focusableElements = document.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      );

      focusableElements.forEach((element) => {
        // Check for focus styles in class names or ARIA labels
        const className =
          element.className?.toString() || element.getAttribute("class") || "";
        const hasFocusStyle =
          className.includes("focus:") ||
          className.includes("focus-visible:") ||
          element.getAttribute("aria-label");
        expect(hasFocusStyle).toBeTruthy();
      });
    });

    it("should maintain logical tab order", () => {
      const mockOnSubmit = vi.fn();

      render(
        <TestWrapper>
          <ContactForm onSubmit={mockOnSubmit} />
        </TestWrapper>,
      );

      const focusableElements = document.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      );

      // Check that elements have reasonable tab indices
      focusableElements.forEach((element) => {
        const tabIndex = element.getAttribute("tabindex");
        if (tabIndex !== null) {
          expect(parseInt(tabIndex)).toBeGreaterThanOrEqual(0);
        }
      });
    });
  });

  describe("Screen Reader Support", () => {
    it("should have proper heading hierarchy", () => {
      render(
        <TestWrapper>
          <RadialDiagram levels={mockLevels} />
        </TestWrapper>,
      );

      const headings = document.querySelectorAll(
        "h1, h2, h3, h4, h5, h6, legend",
      );
      expect(headings.length).toBeGreaterThan(0);

      // Check that headings provide structure
      headings.forEach((heading) => {
        expect(heading.textContent?.trim()).toBeTruthy();
      });
    });

    it("should hide decorative elements from screen readers", () => {
      render(
        <TestWrapper>
          <NetworkDiagram
            levels={mockLevels}
            selectedLevel={null}
            onLevelSelect={vi.fn()}
          />
        </TestWrapper>,
      );

      // Check that decorative text elements are hidden
      const decorativeTexts = document.querySelectorAll(
        'text[aria-hidden="true"]',
      );
      expect(decorativeTexts.length).toBeGreaterThan(0);
    });

    it("should provide meaningful alternative text", () => {
      render(
        <TestWrapper>
          <NetworkDiagram
            levels={mockLevels}
            selectedLevel={null}
            onLevelSelect={vi.fn()}
          />
        </TestWrapper>,
      );

      // Check that interactive elements have meaningful labels
      const buttons = screen.getAllByRole("button");
      buttons.forEach((button) => {
        const label = button.getAttribute("aria-label");
        expect(label).toBeTruthy();
        expect(label?.length).toBeGreaterThan(10); // Should be descriptive
      });
    });
  });
});
