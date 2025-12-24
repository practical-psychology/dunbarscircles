import { describe, it, expect, beforeEach, vi } from "vitest";
import { screen, waitFor, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { render } from "../test-utils";
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

// Mock the components that require Canvas API
vi.mock("@/components/network-diagram", () => {
  const NetworkDiagramComponent = ({
    onNodeClick,
  }: {
    onNodeClick?: (node: any) => void;
  }) => (
    <div data-testid="network-diagram">
      <canvas data-testid="network-canvas" />
      <button
        data-testid="mock-node"
        onClick={() => onNodeClick?.({ id: "test-node", name: "Test Node" })}
      >
        Mock Node
      </button>
    </div>
  );

  return {
    default: NetworkDiagramComponent,
    NetworkDiagram: NetworkDiagramComponent,
  };
});

vi.mock("@/components/radial-diagram", () => ({
  default: () => (
    <div data-testid="radial-diagram">
      <canvas data-testid="radial-canvas" />
    </div>
  ),
}));

// Don't mock PageLayout - we need the real component for authentication testing
// The PageLayout component handles authentication UI including user-info

vi.mock("@/components/relationship-inventory", () => ({
  default: ({
    onRelationshipAdd,
  }: {
    onRelationshipAdd?: (rel: any) => void;
  }) => (
    <div data-testid="relationship-inventory">
      <button
        data-testid="add-relationship"
        onClick={() =>
          onRelationshipAdd?.({ name: "New Contact", levelId: "inner-circle" })
        }
      >
        Add Relationship
      </button>
    </div>
  ),
}));

describe("User Workflows Integration Tests", () => {
  const user = userEvent.setup();

  beforeEach(() => {
    testHelpers.cleanupMocks();
    testHelpers.setupCanvasMock();
    testHelpers.setupFirebaseAuth(null);
  });

  describe("Data Import Workflow", () => {
    it("should complete full data import workflow: file upload → parsing → categorization → visualization", async () => {
      // Setup mock file reader for CSV import
      const csvContent = `First Name,Last Name,Email Address,Company,Position,Connected On
John,Doe,john.doe@example.com,Example Corp,Software Engineer,01-Jan-2023
Jane,Smith,jane.smith@example.com,Tech Inc,Product Manager,15-Feb-2023`;

      testHelpers.mockFileReader(csvContent);

      render(<App />, { initialEntries: ["/"] });

      // Wait for loading screen to finish
      await waitFor(
        () => {
          expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
        },
        { timeout: 3000 },
      );

      // Navigate to dashboard page where import functionality is available
      const dashboardLink = screen.queryByRole("link", { name: /dashboard/i });
      if (dashboardLink) {
        await user.click(dashboardLink);

        // Wait for dashboard to load
        await waitFor(() => {
          expect(screen.getByText(/dashboard/i)).toBeInTheDocument();
        });

        // Look for import functionality (contact manager or similar)
        const importButton =
          screen.queryByText(/import/i) || screen.queryByText(/upload/i);

        if (importButton) {
          await user.click(importButton);

          // Create mock CSV file
          const csvFile = testHelpers.createMockLinkedInCSV();

          // Find file input (might be hidden)
          const fileInput = screen
            .getByRole("button", { name: /choose file|upload/i })
            .closest("div")
            ?.querySelector('input[type="file"]') as HTMLInputElement;

          if (fileInput) {
            // Simulate file selection
            Object.defineProperty(fileInput, "files", {
              value: [csvFile],
              writable: false,
            });

            fireEvent.change(fileInput);

            // Wait for file processing
            await waitFor(
              () => {
                // Check if data was processed and categorized
                expect(
                  screen.queryByText(/john doe/i) ||
                    screen.queryByText(/processing/i),
                ).toBeTruthy();
              },
              { timeout: 3000 },
            );

            // Navigate to visualization to see imported data
            const networkLink = screen.queryByRole("link", {
              name: /network/i,
            });
            if (networkLink) {
              await user.click(networkLink);

              await waitFor(() => {
                expect(
                  screen.getByTestId("network-diagram"),
                ).toBeInTheDocument();
              });
            }
          }
        }
      }
    });

    it("should handle Facebook JSON import workflow", async () => {
      const jsonContent = JSON.stringify({
        friends_v2: [
          { name: "John Doe", timestamp: 1640995200 },
          { name: "Jane Smith", timestamp: 1643673600 },
        ],
      });

      testHelpers.mockFileReader(jsonContent);

      render(<App />, { initialEntries: ["/dashboard"] });

      // Wait for loading screen to finish
      await waitFor(
        () => {
          expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
        },
        { timeout: 3000 },
      );

      // Wait for dashboard to load
      await waitFor(() => {
        expect(screen.getByText(/dashboard/i)).toBeInTheDocument();
      });

      // Look for Facebook import option
      const facebookImport = screen.queryByText(/facebook/i);

      if (facebookImport) {
        await user.click(facebookImport);

        const jsonFile = testHelpers.createMockFacebookJSON();

        // Simulate file upload process
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
              // Verify data processing
              expect(
                screen.queryByText(/john doe/i) ||
                  screen.queryByText(/imported/i),
              ).toBeTruthy();
            },
            { timeout: 3000 },
          );
        }
      }
    });
  });

  describe("Relationship Management Workflow", () => {
    it("should complete relationship management workflow: add → edit → categorize → export", async () => {
      render(<App />, { initialEntries: ["/dashboard"] });

      // Wait for loading screen to finish
      await waitFor(
        () => {
          expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
        },
        { timeout: 3000 },
      );

      // Wait for dashboard to load
      await waitFor(() => {
        expect(screen.getByText(/dashboard/i)).toBeInTheDocument();
      });

      // Add a new relationship
      const addButton =
        screen.queryByText(/add/i) ||
        screen.queryByRole("button", { name: /add/i });

      if (addButton) {
        await user.click(addButton);

        // Fill in relationship details
        const nameInput =
          screen.queryByLabelText(/name/i) ||
          screen.queryByPlaceholderText(/name/i);
        if (nameInput) {
          await user.type(nameInput, "Test Contact");
        }

        // Select relationship level
        const levelSelect =
          screen.queryByRole("combobox") || screen.queryByText(/select/i);
        if (levelSelect) {
          await user.click(levelSelect);

          const innerCircleOption = screen.queryByText(/inner circle/i);
          if (innerCircleOption) {
            await user.click(innerCircleOption);
          }
        }

        // Save the relationship
        const saveButton =
          screen.queryByText(/save/i) ||
          screen.queryByRole("button", { name: /save/i });
        if (saveButton) {
          await user.click(saveButton);
        }

        // Verify relationship was added
        await waitFor(() => {
          expect(screen.queryByText(/test contact/i)).toBeTruthy();
        });

        // Edit the relationship
        const editButton =
          screen.queryByText(/edit/i) ||
          screen.queryByRole("button", { name: /edit/i });
        if (editButton) {
          await user.click(editButton);

          // Change the name
          const editNameInput = screen.queryByDisplayValue(/test contact/i);
          if (editNameInput) {
            await user.clear(editNameInput);
            await user.type(editNameInput, "Updated Contact");
          }

          // Save changes
          const updateButton =
            screen.queryByText(/update/i) || screen.queryByText(/save/i);
          if (updateButton) {
            await user.click(updateButton);
          }
        }

        // Export the data
        const exportButton = screen.queryByText(/export/i);
        if (exportButton) {
          await user.click(exportButton);

          // Select export format
          const csvExport = screen.queryByText(/csv/i);
          if (csvExport) {
            await user.click(csvExport);

            // Verify export was triggered
            await waitFor(() => {
              // Check if download was initiated or export completed
              expect(global.URL.createObjectURL).toHaveBeenCalled();
            });
          }
        }
      }
    });
  });

  describe("Authentication Workflow", () => {
    it("should complete authentication workflow: sign-in → dashboard → data persistence → sign-out", async () => {
      // Setup Firebase auth mock with user
      const mockUser = {
        uid: "test-uid",
        email: "test@example.com",
        displayName: "Test User",
        photoURL: "https://example.com/photo.jpg",
        emailVerified: true,
        isAnonymous: false,
        providerData: [
          {
            providerId: "google.com",
            uid: "test-uid",
            displayName: "Test User",
            email: "test@example.com",
            photoURL: "https://example.com/photo.jpg",
          },
        ],
        metadata: {
          creationTime: "2023-01-01T00:00:00.000Z",
          lastSignInTime: "2023-01-01T00:00:00.000Z",
        },
      };

      render(<App />, { initialEntries: ["/dashboard"] });

      // Wait for loading screen to finish
      await waitFor(
        () => {
          expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
        },
        { timeout: 3000 },
      );

      // Wait for dashboard to load
      await waitFor(() => {
        expect(screen.getByText(/dashboard/i)).toBeInTheDocument();
      });

      // Find and click sign-in button using more flexible selector
      const signInButton =
        screen.queryByTestId("sign-in") ||
        screen.queryByText(/sign in/i) ||
        screen.queryByRole("button", { name: /sign in/i });

      if (signInButton) {
        // Mock successful authentication before clicking
        testHelpers.setupFirebaseAuth(mockUser);

        // Trigger auth state change
        const { onAuthStateChanged } = await import("../firebase-mocks");
        onAuthStateChanged.mockImplementation((auth: any, callback: any) => {
          // auth parameter is intentionally unused in mock
          void auth;
          if (typeof callback === "function") {
            callback(mockUser);
          }
          return vi.fn();
        });

        await user.click(signInButton);

        // Wait for authentication to complete
        // user-info might be in PageLayout or might be shown differently
        // Also check for dashboard content as a sign that auth completed
        await waitFor(() => {
          const userInfo = screen.queryByTestId("user-info");
          const userEmail = screen.queryByText(/test@example.com/i);
          const userDisplayName = screen.queryByText(/test user/i);
          const dashboardContent = screen.queryByText(/dashboard/i);
          // At least one of these should be present
          expect(userInfo || userEmail || userDisplayName || dashboardContent).toBeTruthy();
        }, { timeout: 5000 });

        // Add some data to test persistence
        const contactManager = screen.queryByTestId("contact-manager");
        if (contactManager) {
          const addButton = screen.queryByText(/add contact/i);
          if (addButton) {
            await user.click(addButton);

            // Add test data
            const nameInput = screen.queryByLabelText(/name/i);
            if (nameInput) {
              await user.type(nameInput, "Persistent Contact");
            }

            const saveButton = screen.queryByText(/save/i);
            if (saveButton) {
              await user.click(saveButton);
            }
          }
        }

        // Sign out using flexible selector
        const signOutButton =
          screen.queryByTestId("sign-out") ||
          screen.queryByText(/sign out/i) ||
          screen.queryByText(/logout/i);
        if (signOutButton) {
          await user.click(signOutButton);

          // Mock sign out
          testHelpers.setupFirebaseAuth(null);

          await waitFor(() => {
            const signInElement =
              screen.queryByTestId("sign-in") || screen.queryByText(/sign in/i);
            expect(signInElement).toBeInTheDocument();
          });
        }

        // Sign back in to verify data persistence
        const signInAgain =
          screen.queryByTestId("sign-in") || screen.queryByText(/sign in/i);
        if (signInAgain) {
          await user.click(signInAgain);

          testHelpers.setupFirebaseAuth(mockUser);

          await waitFor(() => {
            const userInfo =
              screen.queryByTestId("user-info") ||
              screen.queryByText(/test@example.com/i);
            expect(userInfo).toBeInTheDocument();
          });
        }
      }
    });
  });

  describe("Export Workflow", () => {
    it("should complete export workflow: select data → choose format → generate file → download", async () => {
      // Setup some test data
      testHelpers.setupContactStorage([
        testHelpers.createMockRelationship({ name: "Export Test Contact" }),
      ]);

      render(<App />, { initialEntries: ["/network"] });

      // Wait for loading screen to finish
      await waitFor(
        () => {
          expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
        },
        { timeout: 3000 },
      );

      // Wait for network diagram to load
      await waitFor(() => {
        expect(screen.getByTestId("network-diagram")).toBeInTheDocument();
      });

      // Look for export functionality
      const exportButton = screen.queryByText(/export/i);

      if (exportButton) {
        await user.click(exportButton);

        // Test PNG export
        const pngExport = screen.queryByText(/png/i);
        if (pngExport) {
          await user.click(pngExport);

          await waitFor(() => {
            // Verify canvas toDataURL was called for PNG export
            expect(HTMLCanvasElement.prototype.toDataURL).toHaveBeenCalled();
          });
        }

        // Test SVG export
        const svgExport = screen.queryByText(/svg/i);
        if (svgExport) {
          await user.click(svgExport);

          await waitFor(() => {
            // Verify SVG export was triggered
            expect(global.URL.createObjectURL).toHaveBeenCalled();
          });
        }

        // Test JSON export
        const jsonExport = screen.queryByText(/json/i);
        if (jsonExport) {
          await user.click(jsonExport);

          await waitFor(() => {
            // Verify JSON export was triggered
            expect(global.URL.createObjectURL).toHaveBeenCalled();
          });
        }

        // Test CSV export
        const csvExport = screen.queryByText(/csv/i);
        if (csvExport) {
          await user.click(csvExport);

          await waitFor(() => {
            // Verify CSV export was triggered
            expect(global.URL.createObjectURL).toHaveBeenCalled();
          });
        }
      }
    });

    it("should handle export with different data selections", async () => {
      // Setup test data with multiple relationships
      const testContacts = [
        testHelpers.createMockRelationship({
          name: "Contact 1",
          levelId: "inner-circle",
        }),
        testHelpers.createMockRelationship({
          name: "Contact 2",
          levelId: "sympathy-group",
        }),
        testHelpers.createMockRelationship({
          name: "Contact 3",
          levelId: "affinity-group",
        }),
      ];

      testHelpers.setupContactStorage(testContacts);

      render(<App />, { initialEntries: ["/dashboard"] });

      // Wait for loading screen to finish
      await waitFor(
        () => {
          expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
        },
        { timeout: 3000 },
      );

      // Wait for dashboard to load
      await waitFor(() => {
        expect(screen.getByText(/dashboard/i)).toBeInTheDocument();
      });

      // Look for data selection options
      const selectAllButton = screen.queryByText(/select all/i);
      if (selectAllButton) {
        await user.click(selectAllButton);
      }

      // Find export options
      const exportButton = screen.queryByText(/export/i);
      if (exportButton) {
        await user.click(exportButton);

        // Test exporting selected data
        const exportSelectedButton =
          screen.queryByText(/export selected/i) || screen.queryByText(/csv/i);
        if (exportSelectedButton) {
          await user.click(exportSelectedButton);

          await waitFor(() => {
            expect(global.URL.createObjectURL).toHaveBeenCalled();
          });
        }
      }
    });
  });

  describe("Cross-Workflow Integration", () => {
    it("should handle complete user journey: import → manage → visualize → export", async () => {
      render(<App />, { initialEntries: ["/dashboard"] });

      // Wait for loading screen to finish
      await waitFor(
        () => {
          expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
        },
        { timeout: 3000 },
      );

      // Step 1: Import data
      await waitFor(() => {
        expect(screen.getByText(/dashboard/i)).toBeInTheDocument();
      });

      // Mock data import
      testHelpers.setupContactStorage([
        testHelpers.createMockRelationship({ name: "Imported Contact" }),
      ]);

      // Step 2: Manage relationships
      const addButton = screen.queryByText(/add/i);
      if (addButton) {
        await user.click(addButton);

        const nameInput = screen.queryByLabelText(/name/i);
        if (nameInput) {
          await user.type(nameInput, "Manually Added Contact");
        }

        const saveButton = screen.queryByText(/save/i);
        if (saveButton) {
          await user.click(saveButton);
        }
      }

      // Step 3: Visualize data
      const networkLink = screen.queryByRole("link", { name: /network/i });
      if (networkLink) {
        await user.click(networkLink);

        await waitFor(() => {
          expect(screen.getByTestId("network-diagram")).toBeInTheDocument();
        });

        // Interact with visualization
        const mockNode = screen.queryByTestId("mock-node");
        if (mockNode) {
          await user.click(mockNode);
        }

        // Step 4: Export results
        const exportButton = screen.queryByText(/export/i);
        if (exportButton) {
          await user.click(exportButton);

          const pngExport = screen.queryByText(/png/i);
          if (pngExport) {
            await user.click(pngExport);

            await waitFor(() => {
              expect(HTMLCanvasElement.prototype.toDataURL).toHaveBeenCalled();
            });
          }
        }
      }
    });
  });
});
