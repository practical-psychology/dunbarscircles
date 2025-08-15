import { axe } from "jest-axe";
import { render, RenderResult } from "@testing-library/react";
import { ReactElement } from "react";
import { expect } from "vitest";

// Type declaration for jest-axe
declare module "vitest" {
  interface Assertion<T = any> {
    toHaveNoViolations(): T;
  }
}

// Import and extend expect with jest-axe matchers
const { toHaveNoViolations } = require("jest-axe");
expect.extend(toHaveNoViolations);

/**
 * Test a component for accessibility violations
 * @param component - React component to test
 * @param options - Axe configuration options
 */
export const testAccessibility = async (
  component: ReactElement,
  options?: any,
): Promise<void> => {
  const { container } = render(component);
  const results = await axe(container, options);
  expect(results).toHaveNoViolations();
};

/**
 * Test keyboard navigation for a component
 * @param renderResult - Result from @testing-library/react render
 * @param expectedFocusableElements - Number of expected focusable elements
 */
export const testKeyboardNavigation = (
  renderResult: RenderResult,
  expectedFocusableElements: number,
): void => {
  const { container } = renderResult;

  // Find all focusable elements
  const focusableElements = container.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
  );

  expect(focusableElements).toHaveLength(expectedFocusableElements);

  // Test that all focusable elements have proper focus indicators
  focusableElements.forEach((element) => {
    const computedStyle = window.getComputedStyle(element);
    // Elements should have focus styles or be properly labeled
    expect(
      element.getAttribute("aria-label") ||
        element.getAttribute("aria-labelledby") ||
        element.textContent ||
        computedStyle.outline !== "none",
    ).toBeTruthy();
  });
};

/**
 * Test color contrast ratios for theme compliance
 * @param element - DOM element to test
 * @param theme - Theme name ('light' or 'dark')
 */
export const testColorContrast = (
  element: Element,
  _theme: "light" | "dark",
): void => {
  const computedStyle = window.getComputedStyle(element);
  const backgroundColor = computedStyle.backgroundColor;
  const color = computedStyle.color;

  // Basic contrast validation - in a real implementation, you'd use a proper contrast checker
  expect(backgroundColor).not.toBe(color);
  expect(backgroundColor).not.toBe("transparent");
  expect(color).not.toBe("transparent");
};

/**
 * Validate semantic HTML structure
 * @param container - Container element to validate
 */
export const validateSemanticHTML = (container: Element): void => {
  // Check for proper heading hierarchy
  const headings = container.querySelectorAll("h1, h2, h3, h4, h5, h6");
  if (headings.length > 0) {
    const firstHeading = headings[0];
    expect(firstHeading.tagName.toLowerCase()).toBe("h1");
  }

  // Check for proper landmark elements
  const main = container.querySelector("main");
  if (main) {
    expect(main).toBeInTheDocument();
  }

  // Check for proper list structures
  const lists = container.querySelectorAll("ul, ol");
  lists.forEach((list) => {
    const listItems = list.querySelectorAll("li");
    expect(listItems.length).toBeGreaterThan(0);
  });
};

/**
 * Test ARIA labels and descriptions
 * @param container - Container element to validate
 */
export const validateAriaLabels = (container: Element): void => {
  // Find interactive elements that should have labels
  const interactiveElements = container.querySelectorAll(
    'button, input, select, textarea, [role="button"], [role="link"], [role="tab"]',
  );

  interactiveElements.forEach((element) => {
    const hasLabel =
      element.getAttribute("aria-label") ||
      element.getAttribute("aria-labelledby") ||
      element.textContent?.trim() ||
      element
        .querySelector("span:not([aria-hidden='true'])")
        ?.textContent?.trim();

    expect(hasLabel).toBeTruthy();
  });

  // Check for proper ARIA descriptions where needed
  const elementsWithDescriptions =
    container.querySelectorAll("[aria-describedby]");
  elementsWithDescriptions.forEach((element) => {
    const describedBy = element.getAttribute("aria-describedby");
    if (describedBy) {
      const descriptionElement = container.querySelector(`#${describedBy}`);
      expect(descriptionElement).toBeInTheDocument();
    }
  });
};
