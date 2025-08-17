import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { ThemeProvider, useTheme } from "@/components/theme-provider";
import {
  simulateStorageError,
  clearStorageError,
  simulateStorageUnavailable,
  restoreStorageMock,
} from "@/src/test/test-helpers";

// Test component that uses the theme
function TestComponent() {
  const { theme, setTheme } = useTheme();

  return (
    <div>
      <div data-testid="current-theme">{theme}</div>
      <button data-testid="set-dark" onClick={() => setTheme("dark")}>
        Set Dark
      </button>
      <button data-testid="set-light" onClick={() => setTheme("light")}>
        Set Light
      </button>
    </div>
  );
}

describe("ThemeProvider Error Handling", () => {
  beforeEach(() => {
    clearStorageError();
    restoreStorageMock();
    vi.clearAllMocks();
  });

  it("should handle localStorage.getItem errors gracefully", () => {
    // Simulate localStorage.getItem throwing an error
    simulateStorageError("localStorage access denied");

    // Should not crash and should use default theme
    expect(() => {
      render(
        <ThemeProvider defaultTheme="light">
          <TestComponent />
        </ThemeProvider>,
      );
    }).not.toThrow();

    // Should use the default theme when localStorage fails
    expect(screen.getByTestId("current-theme")).toHaveTextContent("light");
  });

  it("should handle localStorage.setItem errors gracefully", async () => {
    const user = (await import("@testing-library/user-event")).default.setup();

    render(
      <ThemeProvider defaultTheme="light">
        <TestComponent />
      </ThemeProvider>,
    );

    // Simulate localStorage.setItem throwing an error after component is rendered
    simulateStorageError("localStorage quota exceeded");

    // Should not crash when trying to set theme
    await user.click(screen.getByTestId("set-dark"));

    // Theme should still update in memory even if localStorage fails
    expect(screen.getByTestId("current-theme")).toHaveTextContent("dark");
  });

  it("should handle completely unavailable localStorage", () => {
    // Simulate localStorage being completely unavailable
    simulateStorageUnavailable();

    // Should not crash and should use default theme
    expect(() => {
      render(
        <ThemeProvider defaultTheme="system">
          <TestComponent />
        </ThemeProvider>,
      );
    }).not.toThrow();

    // Should use the default theme when localStorage is unavailable
    expect(screen.getByTestId("current-theme")).toHaveTextContent("system");
  });

  it("should handle localStorage returning null gracefully", () => {
    // This is the normal case when no theme is stored
    render(
      <ThemeProvider defaultTheme="dark">
        <TestComponent />
      </ThemeProvider>,
    );

    // Should use the default theme when no stored theme exists
    expect(screen.getByTestId("current-theme")).toHaveTextContent("dark");
  });

  it("should log warnings when localStorage operations fail", () => {
    const consoleSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

    // Simulate localStorage.getItem throwing an error
    simulateStorageError("localStorage access denied");

    render(
      <ThemeProvider defaultTheme="light">
        <TestComponent />
      </ThemeProvider>,
    );

    // Should log a warning about localStorage not being available
    expect(consoleSpy).toHaveBeenCalledWith(
      "localStorage is not available, using default theme:",
      expect.any(Error),
    );

    consoleSpy.mockRestore();
  });

  it("should log warnings when setTheme fails", async () => {
    const user = (await import("@testing-library/user-event")).default.setup();
    const consoleSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

    render(
      <ThemeProvider defaultTheme="light">
        <TestComponent />
      </ThemeProvider>,
    );

    // Simulate localStorage.setItem throwing an error after component is rendered
    simulateStorageError("localStorage quota exceeded");

    await user.click(screen.getByTestId("set-dark"));

    // Should log a warning about failing to save theme
    expect(consoleSpy).toHaveBeenCalledWith(
      "Failed to save theme to localStorage:",
      expect.any(Error),
    );

    consoleSpy.mockRestore();
  });

  it("should work normally when localStorage is available", async () => {
    const user = (await import("@testing-library/user-event")).default.setup();

    render(
      <ThemeProvider defaultTheme="light">
        <TestComponent />
      </ThemeProvider>,
    );

    // Should start with default theme
    expect(screen.getByTestId("current-theme")).toHaveTextContent("light");

    // Should be able to change theme
    await user.click(screen.getByTestId("set-dark"));
    expect(screen.getByTestId("current-theme")).toHaveTextContent("dark");

    await user.click(screen.getByTestId("set-light"));
    expect(screen.getByTestId("current-theme")).toHaveTextContent("light");
  });
});
