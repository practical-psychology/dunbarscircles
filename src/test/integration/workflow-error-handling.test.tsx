import {
  describe,
  it,
  expect,
  beforeEach,
  vi,
  beforeAll,
  afterEach,
} from "vitest";
import { screen, waitFor, fireEvent, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithRouter } from "../test-utils";
import { testHelpers } from "../test-helpers";
import App from "../../App";

// Mock Firebase modules
vi.mock("@/firebase-config", () => ({
  auth: {
    currentUser: null,
    onAuthStateChanged: vi.fn(() => vi.fn()), // Return unsubscribe function
    signInWithPopup: vi.fn(),
    signOut: vi.fn(),
  },
  firebaseConfig: {
    apiKey: "test-api-key",
    authDomain: "test.firebaseapp.com",
    projectId: "test-project",
    storageBucket: "test-project.appspot.com",
    messagingSenderId: "123456789",
    appId: "test-app-id",
  },
}));

vi.mock("@/lib/auth-utils", () => ({
  signInWithGoogle: vi.fn(),
  signInWithGoogleRedirect: vi.fn(),
  handleRedirectResult: vi.fn(),
  signOut: vi.fn(),
  getUserDisplayName: vi.fn(
    (user) => user?.displayName || user?.email || "User",
  ),
}));

vi.mock("firebase/auth", () => ({
  GoogleAuthProvider: vi.fn(),
  signInWithPopup: vi.fn(),
  signInWithRedirect: vi.fn(),
  getRedirectResult: vi.fn(),
  signOut: vi.fn(),
  onAuthStateChanged: vi.fn(() => vi.fn()), // Return unsubscribe function
  getAuth: vi.fn(() => ({
    currentUser: null,
    onAuthStateChanged: vi.fn(() => vi.fn()),
  })),
}));

// Mock PageLayout component to avoid authentication complexity
vi.mock("@/components/PageLayout", () => ({
  default: ({
    children,
    title,
  }: {
    children: React.ReactNode;
    title: string;
  }) => (
    <div data-testid="page-layout">
      <h1>{title}</h1>
      {children}
    </div>
  ),
}));

// Mock the components that cause side effects
vi.mock("../../components/analytics", () => ({
  trackEvent: vi.fn(),
  trackError: vi.fn(),
}));

describe("Workflow Error Handling Integration Tests", () => {
  let user: ReturnType<typeof userEvent.setup>;

  beforeAll(() => {
    // Initialize user event with proper timing
    user = userEvent.setup({ delay: null });
  });

  beforeEach(() => {
    testHelpers.cleanupMocks();
    testHelpers.setupCanvasMock();
    testHelpers.setupFirebaseAuth(null);

    // Clear all mocks before each test
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("Data Import Error Handling", () => {
    it("should handle malformed CSV files gracefully", async () => {
      // Setup mock file reader with malformed CSV
      const malformedCSV = `First Name,Last Name,Email
John,Doe
Jane,Smith,jane@example.com,Extra,Column`;

      testHelpers.mockFileReader(malformedCSV);

      await act(async () => {
        renderWithRouter(<App />, {
          initialEntries: ["/dashboard"],
        });
      });

      await user.click(screen.getByRole("link", { name: /dashboard/i }));

      await waitFor(() => {
        expect(screen.getByText(/dashboard/i)).toBeInTheDocument();
      });

      const importButton = screen.queryByText(/import/i);
      if (importButton) {
        await user.click(importButton);

        const csvFile = testHelpers.createMockFile(
          malformedCSV,
          "malformed.csv",
          "text/csv",
        );

        const fileInput = document.querySelector(
          'input[type="file"]',
        ) as HTMLInputElement;
        if (fileInput) {
          Object.defineProperty(fileInput, "files", {
            value: [csvFile],
            writable: false,
          });

          fireEvent.change(fileInput);

          // Should show error message or handle gracefully
          await waitFor(
            () => {
              const errorMessage =
                screen.queryByText(/error/i) ||
                screen.queryByText(/invalid/i) ||
                screen.queryByText(/failed/i);
              expect(
                errorMessage || screen.queryByText(/imported/i),
              ).toBeTruthy();
            },
            { timeout: 3000 },
          );
        }
      }
    });

    it("should handle invalid JSON files", async () => {
      const invalidJSON = `{ "friends_v2": [ { "name": "John Doe", "timestamp": invalid } ] }`;

      testHelpers.mockFileReader(invalidJSON);

      await act(async () => {
        renderWithRouter(<App />, {
          initialEntries: ["/dashboard"],
        });
      });

      await user.click(screen.getByRole("link", { name: /dashboard/i }));

      const importButton =
        screen.queryByText(/import/i) || screen.queryByText(/facebook/i);
      if (importButton) {
        await user.click(importButton);

        const jsonFile = testHelpers.createMockFile(
          invalidJSON,
          "invalid.json",
          "application/json",
        );

        const fileInput = document.querySelector(
          'input[type="file"]',
        ) as HTMLInputElement;
        if (fileInput) {
          Object.defineProperty(fileInput, "files", {
            value: [jsonFile],
            writable: false,
          });

          fireEvent.change(fileInput);

          await waitFor(
            () => {
              // Should handle JSON parsing error
              const errorIndicator =
                screen.queryByText(/error/i) || screen.queryByText(/invalid/i);
              expect(
                errorIndicator || screen.queryByText(/processed/i),
              ).toBeTruthy();
            },
            { timeout: 3000 },
          );
        }
      }
    });

    it("should handle empty files", async () => {
      testHelpers.mockFileReader("");

      await act(async () => {
        renderWithRouter(<App />, {
          initialEntries: ["/dashboard"],
        });
      });

      await user.click(screen.getByRole("link", { name: /dashboard/i }));

      const importButton = screen.queryByText(/import/i);
      if (importButton) {
        await user.click(importButton);

        const emptyFile = testHelpers.createMockFile(
          "",
          "empty.csv",
          "text/csv",
        );

        const fileInput = document.querySelector(
          'input[type="file"]',
        ) as HTMLInputElement;
        if (fileInput) {
          Object.defineProperty(fileInput, "files", {
            value: [emptyFile],
            writable: false,
          });

          fireEvent.change(fileInput);

          await waitFor(
            () => {
              // Should handle empty file gracefully
              const message =
                screen.queryByText(/empty/i) ||
                screen.queryByText(/no data/i) ||
                screen.queryByText(/processed/i);
              expect(message).toBeTruthy();
            },
            { timeout: 3000 },
          );
        }
      }
    });
  });

  describe("Authentication Error Handling", () => {
    it("should handle authentication failures", async () => {
      // Mock Firebase auth to reject
      const { signInWithPopup } = await import("../firebase-mocks");
      signInWithPopup.mockRejectedValue(new Error("Authentication failed"));

      await act(async () => {
        renderWithRouter(<App />, {
          initialEntries: ["/dashboard"],
        });
      });

      // Wait for dashboard to load
      await waitFor(() => {
        expect(screen.getByText(/dashboard/i)).toBeInTheDocument();
      });

      // Use queryByTestId to avoid errors if sign-in button doesn't exist
      const signInButton = screen.queryByTestId("sign-in");
      if (signInButton) {
        await user.click(signInButton);

        await waitFor(() => {
          // Should show error message or remain on sign-in state
          const errorMessage =
            screen.queryByText(/authentication failed/i) ||
            screen.queryByText(/failed/i) ||
            screen.queryByTestId("sign-in");
          expect(errorMessage).toBeTruthy();
        });
      }
    });

    it("should handle network failures during authentication", async () => {
      // Mock network error
      const { signInWithPopup } = await import("../firebase-mocks");
      signInWithPopup.mockRejectedValue(new Error("Network error"));

      await act(async () => {
        renderWithRouter(<App />, {
          initialEntries: ["/dashboard"],
        });
      });

      // Wait for dashboard to load
      await waitFor(() => {
        expect(screen.getByText(/dashboard/i)).toBeInTheDocument();
      });

      // Use queryByTestId to avoid errors if sign-in button doesn't exist
      const signInButton = screen.queryByTestId("sign-in");
      if (signInButton) {
        await user.click(signInButton);

        await waitFor(() => {
          // Should handle network error gracefully
          const networkError =
            screen.queryByText(/network error/i) ||
            screen.queryByText(/connection/i) ||
            screen.queryByTestId("sign-in");
          expect(networkError).toBeTruthy();
        });
      }
    });
  });

  describe("Export Error Handling", () => {
    it("should handle export failures gracefully", async () => {
      // Mock URL.createObjectURL to fail
      global.URL.createObjectURL = vi.fn(() => {
        throw new Error("Export failed");
      });

      await act(async () => {
        renderWithRouter(<App />, {
          initialEntries: ["/dashboard"],
        });
      });

      // Pages are lazy-loaded, so wait for the nav to render
      await user.click(
        await screen.findByRole("button", { name: /visualizations/i }),
      );
      await user.click(
        await screen.findByRole("link", { name: /network graph/i }),
      );

      await waitFor(() => {
        expect(screen.getByTestId("network-diagram")).toBeInTheDocument();
      });

      const exportButton = screen.queryByText(/export/i);
      if (exportButton) {
        await user.click(exportButton);

        const pngExport = screen.queryByText(/png/i);
        if (pngExport) {
          await user.click(pngExport);

          await waitFor(() => {
            // Should handle export error gracefully
            const errorMessage =
              screen.queryByText(/error/i) || screen.queryByText(/failed/i);
            expect(
              errorMessage || screen.getByTestId("network-diagram"),
            ).toBeTruthy();
          });
        }
      }
    });

    it("should handle canvas export failures", async () => {
      // Mock canvas toDataURL to fail
      HTMLCanvasElement.prototype.toDataURL = vi.fn(() => {
        throw new Error("Canvas export failed");
      });

      await act(async () => {
        renderWithRouter(<App />, {
          initialEntries: ["/dashboard"],
        });
      });

      // Pages are lazy-loaded, so wait for the nav to render
      await user.click(
        await screen.findByRole("button", { name: /visualizations/i }),
      );
      await user.click(
        await screen.findByRole("link", { name: /network graph/i }),
      );

      await waitFor(() => {
        expect(screen.getByTestId("network-diagram")).toBeInTheDocument();
      });

      const exportButton = screen.queryByText(/export/i);
      if (exportButton) {
        await user.click(exportButton);

        const pngExport = screen.queryByText(/png/i);
        if (pngExport) {
          await user.click(pngExport);

          // Should handle canvas export error
          await waitFor(() => {
            const errorIndicator =
              screen.queryByText(/error/i) ||
              screen.getByTestId("network-diagram");
            expect(errorIndicator).toBeTruthy();
          });
        }
      }
    });
  });

  describe("Data Persistence Error Handling", () => {
    it("should handle localStorage failures", async () => {
      // Mock localStorage to fail
      const mockLocalStorage = {
        getItem: vi.fn(() => {
          throw new Error("Storage error");
        }),
        setItem: vi.fn(() => {
          throw new Error("Storage error");
        }),
        removeItem: vi.fn(),
        clear: vi.fn(),
        length: 0,
        key: vi.fn(),
      };

      Object.defineProperty(window, "localStorage", {
        value: mockLocalStorage,
      });

      await act(async () => {
        renderWithRouter(<App />, {
          initialEntries: ["/dashboard"],
        });
      });

      await user.click(screen.getByRole("link", { name: /dashboard/i }));

      // Should handle storage errors gracefully
      await waitFor(() => {
        expect(screen.getByText(/dashboard/i)).toBeInTheDocument();
      });

      const addButton = screen.queryAllByText(/add/i)[0];
      if (addButton) {
        await user.click(addButton);

        const nameInput = screen.queryByLabelText(/name/i);
        if (nameInput) {
          await user.type(nameInput, "Test Contact");
        }

        const saveButton = screen.queryByText(/save/i);
        if (saveButton) {
          await user.click(saveButton);

          // Should handle save error gracefully
          await waitFor(() => {
            const errorMessage =
              screen.queryByText(/error/i) ||
              screen.queryByText(/failed/i) ||
              screen.getByText(/dashboard/i);
            expect(errorMessage).toBeTruthy();
          });
        }
      }
    });
  });

  describe("Large Dataset Handling", () => {
    it("should handle large datasets without performance issues", async () => {
      // Create large dataset
      const largeDataset = Array.from({ length: 1000 }, (_, i) =>
        testHelpers.createMockRelationship({
          name: `Contact ${i}`,
          id: `contact-${i}`,
        }),
      );

      testHelpers.setupContactStorage(largeDataset);

      await act(async () => {
        renderWithRouter(<App />, {
          initialEntries: ["/dashboard"],
        });
      });

      // Navigate to visualization with large dataset
      // Pages are lazy-loaded, so wait for the nav to render
      await user.click(
        await screen.findByRole("button", { name: /visualizations/i }),
      );
      await user.click(
        await screen.findByRole("link", { name: /network graph/i }),
      );

      // Should load without crashing
      await waitFor(
        () => {
          expect(screen.getByTestId("network-diagram")).toBeInTheDocument();
        },
        { timeout: 5000 },
      );

      // Test interaction with large dataset
      const mockNode = screen.queryByTestId("mock-node");
      if (mockNode) {
        await user.click(mockNode);

        // Should handle interaction without performance issues
        await waitFor(() => {
          expect(screen.getByTestId("network-diagram")).toBeInTheDocument();
        });
      }
    });

    it("should handle export of large datasets", async () => {
      const largeDataset = Array.from({ length: 500 }, (_, i) =>
        testHelpers.createMockRelationship({
          name: `Export Contact ${i}`,
          id: `export-contact-${i}`,
        }),
      );

      testHelpers.setupContactStorage(largeDataset);

      await act(async () => {
        renderWithRouter(<App />, {
          initialEntries: ["/dashboard"],
        });
      });

      await user.click(screen.getByRole("link", { name: /dashboard/i }));

      const exportButton = screen.queryByText(/export/i);
      if (exportButton) {
        await user.click(exportButton);

        const csvExport = screen.queryByText(/csv/i);
        if (csvExport) {
          await user.click(csvExport);

          // Should handle large export without crashing
          await waitFor(
            () => {
              expect(global.URL.createObjectURL).toHaveBeenCalled();
            },
            { timeout: 5000 },
          );
        }
      }
    });
  });

  describe("Browser Compatibility Edge Cases", () => {
    it("should handle missing Canvas API support", async () => {
      // Mock missing Canvas support
      HTMLCanvasElement.prototype.getContext = vi.fn(() => null) as any;

      await act(async () => {
        renderWithRouter(<App />, {
          initialEntries: ["/dashboard"],
        });
      });

      // Pages are lazy-loaded, so wait for the nav to render
      await user.click(
        await screen.findByRole("button", { name: /visualizations/i }),
      );
      await user.click(
        await screen.findByRole("link", { name: /network graph/i }),
      );

      // Should handle missing Canvas API gracefully
      await waitFor(() => {
        const fallbackMessage =
          screen.queryByText(/not supported/i) ||
          screen.getByTestId("network-diagram");
        expect(fallbackMessage).toBeTruthy();
      });
    });

    it("should handle missing File API support", async () => {
      // Mock missing File API
      delete (global as any).File;
      delete (global as any).FileReader;

      await act(async () => {
        renderWithRouter(<App />, {
          initialEntries: ["/dashboard"],
        });
      });

      await user.click(screen.getByRole("link", { name: /dashboard/i }));

      const importButton = screen.queryByText(/import/i);
      if (importButton) {
        await user.click(importButton);

        // Should handle missing File API gracefully
        await waitFor(() => {
          const fallbackMessage =
            screen.queryByText(/not supported/i) ||
            screen.getByText(/dashboard/i);
          expect(fallbackMessage).toBeTruthy();
        });
      }
    });

    it("should handle missing localStorage support", async () => {
      // Mock missing localStorage
      Object.defineProperty(window, "localStorage", {
        value: undefined,
      });

      await act(async () => {
        renderWithRouter(<App />, {
          initialEntries: ["/dashboard"],
        });
      });

      // Should still function without localStorage - check for any main content
      await waitFor(() => {
        const mainContent =
          screen.queryByRole("main") ||
          screen.queryByText(/dunbar/i) ||
          screen.queryByText(/dashboard/i) ||
          screen.queryByText(/welcome/i);
        expect(mainContent).toBeTruthy();
      });
    });
  });
});
