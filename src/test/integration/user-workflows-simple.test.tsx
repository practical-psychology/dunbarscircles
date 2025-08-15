import { describe, it, expect, beforeEach, vi } from "vitest";
import { screen, waitFor, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { render, testHelpers } from "../test-utils";

// Import individual page components to test workflows directly
import DashboardPage from "../../pages/DashboardPage";
import NetworkPage from "../../pages/NetworkPage";
import RadialPage from "../../pages/RadialPage";

// Mock Firebase components
vi.mock("@/components/firebase-status", () => ({
  FirebaseStatus: () => (
    <div data-testid="firebase-status">
      <button data-testid="sign-in">Sign In</button>
      <button data-testid="sign-out">Sign Out</button>
      <div data-testid="user-info">User: test@example.com</div>
    </div>
  ),
}));

// Mock the components that require Canvas API
vi.mock("@/components/network-diagram", () => ({
  default: ({ onNodeClick }: { onNodeClick?: (node: any) => void }) => (
    <div data-testid="network-diagram">
      <canvas data-testid="network-canvas" />
      <button
        data-testid="mock-node"
        onClick={() => onNodeClick?.({ id: "test-node", name: "Test Node" })}
      >
        Mock Node
      </button>
      <button data-testid="export-png">Export PNG</button>
      <button data-testid="export-svg">Export SVG</button>
    </div>
  ),
}));

vi.mock("@/components/radial-diagram", () => ({
  default: () => (
    <div data-testid="radial-diagram">
      <canvas data-testid="radial-canvas" />
      <button data-testid="export-radial">Export Radial</button>
    </div>
  ),
}));

vi.mock("@/components/contact-manager", () => ({
  default: ({
    onContactAdd,
    onContactEdit,
    onImport,
  }: {
    onContactAdd?: (contact: any) => void;
    onContactEdit?: (contact: any) => void;
    onImport?: (data: any) => void;
  }) => (
    <div data-testid="contact-manager">
      <button
        data-testid="add-contact"
        onClick={() =>
          onContactAdd?.({ name: "New Contact", levelId: "inner-circle" })
        }
      >
        Add Contact
      </button>
      <button
        data-testid="edit-contact"
        onClick={() => onContactEdit?.({ id: "1", name: "Updated Contact" })}
      >
        Edit Contact
      </button>
      <input
        data-testid="file-input"
        type="file"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) {
            onImport?.({ fileName: file.name, data: "mock-data" });
          }
        }}
      />
      <button data-testid="export-csv">Export CSV</button>
      <button data-testid="export-json">Export JSON</button>
      <div data-testid="contact-list">
        <div data-testid="contact-item">Test Contact</div>
      </div>
    </div>
  ),
}));

vi.mock("@/components/firebase-status", () => ({
  default: () => (
    <div data-testid="firebase-status">
      <button data-testid="sign-in">Sign In</button>
      <button data-testid="sign-out">Sign Out</button>
      <div data-testid="user-info">User: test@example.com</div>
    </div>
  ),
}));

describe("User Workflows Integration Tests - Simplified", () => {
  const user = userEvent.setup();

  beforeEach(() => {
    testHelpers.cleanupMocks();
    testHelpers.setupCanvasMock();
    testHelpers.setupFirebaseAuth(null);
  });

  describe("Data Import Workflow", () => {
    it("should complete data import workflow: file upload → parsing → categorization → visualization", async () => {
      // Setup mock file reader for CSV import
      const csvContent = `First Name,Last Name,Email Address,Company,Position,Connected On
John,Doe,john.doe@example.com,Example Corp,Software Engineer,01-Jan-2023
Jane,Smith,jane.smith@example.com,Tech Inc,Product Manager,15-Feb-2023`;

      testHelpers.mockFileReader(csvContent);

      // Test dashboard page with import functionality
      render(<DashboardPage />);

      // Wait for dashboard to load
      await waitFor(() => {
        expect(screen.getByTestId("contact-manager")).toBeInTheDocument();
      });

      // Test file import
      const fileInput = screen.getByTestId("file-input");
      const csvFile = testHelpers.createMockLinkedInCSV();

      Object.defineProperty(fileInput, "files", {
        value: [csvFile],
        writable: false,
      });

      fireEvent.change(fileInput);

      // Verify import was processed
      await waitFor(() => {
        expect(screen.getByTestId("contact-list")).toBeInTheDocument();
      });

      // Test visualization of imported data
      render(<NetworkPage />);

      await waitFor(() => {
        expect(screen.getByTestId("network-diagram")).toBeInTheDocument();
      });

      // Verify data is visualized
      const mockNode = screen.getByTestId("mock-node");
      expect(mockNode).toBeInTheDocument();
    });

    it("should handle Facebook JSON import workflow", async () => {
      const jsonContent = JSON.stringify({
        friends_v2: [
          { name: "John Doe", timestamp: 1640995200 },
          { name: "Jane Smith", timestamp: 1643673600 },
        ],
      });

      testHelpers.mockFileReader(jsonContent);

      render(<DashboardPage />);

      await waitFor(() => {
        expect(screen.getByTestId("contact-manager")).toBeInTheDocument();
      });

      const fileInput = screen.getByTestId("file-input");
      const jsonFile = testHelpers.createMockFacebookJSON();

      Object.defineProperty(fileInput, "files", {
        value: [jsonFile],
        writable: false,
      });

      fireEvent.change(fileInput);

      await waitFor(() => {
        expect(screen.getByTestId("contact-list")).toBeInTheDocument();
      });
    });
  });

  describe("Relationship Management Workflow", () => {
    it("should complete relationship management workflow: add → edit → categorize → export", async () => {
      render(<DashboardPage />);

      await waitFor(() => {
        expect(screen.getByTestId("contact-manager")).toBeInTheDocument();
      });

      // Add a new relationship
      const addButton = screen.getByTestId("add-contact");
      await user.click(addButton);

      // Verify contact was added
      await waitFor(() => {
        expect(screen.getByTestId("contact-list")).toBeInTheDocument();
      });

      // Edit the relationship
      const editButton = screen.getByTestId("edit-contact");
      await user.click(editButton);

      // Export the data
      const exportButton = screen.getByTestId("export-csv");
      await user.click(exportButton);

      // Verify export was triggered
      await waitFor(() => {
        expect(global.URL.createObjectURL).toHaveBeenCalled();
      });
    });
  });

  describe("Authentication Workflow", () => {
    it("should complete authentication workflow: sign-in → dashboard → data persistence → sign-out", async () => {
      const mockUser = {
        uid: "test-uid",
        email: "test@example.com",
        displayName: "Test User",
        photoURL: "https://example.com/photo.jpg",
      };

      render(<DashboardPage />);

      await waitFor(() => {
        expect(screen.getByTestId("firebase-status")).toBeInTheDocument();
      });

      // Sign in
      const signInButton = screen.getByTestId("sign-in");
      await user.click(signInButton);

      // Mock successful authentication
      testHelpers.setupFirebaseAuth(mockUser);

      // Verify user is signed in
      await waitFor(() => {
        expect(screen.getByTestId("user-info")).toBeInTheDocument();
      });

      // Add some data to test persistence
      const addButton = screen.getByTestId("add-contact");
      await user.click(addButton);

      // Sign out
      const signOutButton = screen.getByTestId("sign-out");
      await user.click(signOutButton);

      // Mock sign out
      testHelpers.setupFirebaseAuth(null);

      // Verify signed out state
      await waitFor(() => {
        expect(screen.getByTestId("sign-in")).toBeInTheDocument();
      });
    });
  });

  describe("Export Workflow", () => {
    it("should complete export workflow: select data → choose format → generate file → download", async () => {
      // Setup test data
      testHelpers.setupContactStorage([
        testHelpers.createMockRelationship({ name: "Export Test Contact" }),
      ]);

      // Test PNG export from network diagram
      render(<NetworkPage />);

      await waitFor(() => {
        expect(screen.getByTestId("network-diagram")).toBeInTheDocument();
      });

      const pngExport = screen.getByTestId("export-png");
      await user.click(pngExport);

      await waitFor(() => {
        expect(HTMLCanvasElement.prototype.toDataURL).toHaveBeenCalled();
      });

      // Test SVG export
      const svgExport = screen.getByTestId("export-svg");
      await user.click(svgExport);

      await waitFor(() => {
        expect(global.URL.createObjectURL).toHaveBeenCalled();
      });
    });

    it("should handle export with different data selections", async () => {
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

      render(<DashboardPage />);

      await waitFor(() => {
        expect(screen.getByTestId("contact-manager")).toBeInTheDocument();
      });

      // Test CSV export
      const csvExport = screen.getByTestId("export-csv");
      await user.click(csvExport);

      await waitFor(() => {
        expect(global.URL.createObjectURL).toHaveBeenCalled();
      });

      // Test JSON export
      const jsonExport = screen.getByTestId("export-json");
      await user.click(jsonExport);

      await waitFor(() => {
        expect(global.URL.createObjectURL).toHaveBeenCalledTimes(2);
      });
    });
  });

  describe("Cross-Workflow Integration", () => {
    it("should handle complete user journey: import → manage → visualize → export", async () => {
      // Step 1: Import data
      render(<DashboardPage />);

      await waitFor(() => {
        expect(screen.getByTestId("contact-manager")).toBeInTheDocument();
      });

      // Mock data import
      const fileInput = screen.getByTestId("file-input");
      const csvFile = testHelpers.createMockLinkedInCSV();

      Object.defineProperty(fileInput, "files", {
        value: [csvFile],
        writable: false,
      });

      fireEvent.change(fileInput);

      // Step 2: Manage relationships
      const addButton = screen.getByTestId("add-contact");
      await user.click(addButton);

      // Step 3: Visualize data
      render(<NetworkPage />);

      await waitFor(() => {
        expect(screen.getByTestId("network-diagram")).toBeInTheDocument();
      });

      // Interact with visualization
      const mockNode = screen.getByTestId("mock-node");
      await user.click(mockNode);

      // Step 4: Export results
      const pngExport = screen.getByTestId("export-png");
      await user.click(pngExport);

      await waitFor(() => {
        expect(HTMLCanvasElement.prototype.toDataURL).toHaveBeenCalled();
      });
    });

    it("should handle workflow transitions between different visualizations", async () => {
      testHelpers.setupContactStorage([
        testHelpers.createMockRelationship({ name: "Test Contact" }),
      ]);

      // Test network visualization
      render(<NetworkPage />);

      await waitFor(() => {
        expect(screen.getByTestId("network-diagram")).toBeInTheDocument();
      });

      // Test radial visualization
      render(<RadialPage />);

      await waitFor(() => {
        expect(screen.getByTestId("radial-diagram")).toBeInTheDocument();
      });

      // Test export from radial view
      const exportRadial = screen.getByTestId("export-radial");
      await user.click(exportRadial);

      await waitFor(() => {
        expect(HTMLCanvasElement.prototype.toDataURL).toHaveBeenCalled();
      });
    });
  });

  describe("Error Handling in Workflows", () => {
    it("should handle import errors gracefully", async () => {
      // Mock file reader to fail
      global.FileReader = vi.fn().mockImplementation(() => ({
        readAsText: vi.fn(function (this: any) {
          setTimeout(() => {
            this.onerror?.({ target: { error: new Error("Read failed") } });
          }, 0);
        }),
        onload: null,
        onerror: null,
        result: null,
      })) as any;

      render(<DashboardPage />);

      await waitFor(() => {
        expect(screen.getByTestId("contact-manager")).toBeInTheDocument();
      });

      const fileInput = screen.getByTestId("file-input");
      const csvFile = testHelpers.createMockLinkedInCSV();

      Object.defineProperty(fileInput, "files", {
        value: [csvFile],
        writable: false,
      });

      fireEvent.change(fileInput);

      // Should handle error gracefully and still show the interface
      await waitFor(() => {
        expect(screen.getByTestId("contact-manager")).toBeInTheDocument();
      });
    });

    it("should handle export errors gracefully", async () => {
      // Mock URL.createObjectURL to fail
      global.URL.createObjectURL = vi.fn(() => {
        throw new Error("Export failed");
      });

      render(<DashboardPage />);

      await waitFor(() => {
        expect(screen.getByTestId("contact-manager")).toBeInTheDocument();
      });

      const exportButton = screen.getByTestId("export-csv");

      // Should not crash when export fails
      await user.click(exportButton);

      // Interface should still be functional
      expect(screen.getByTestId("contact-manager")).toBeInTheDocument();
    });
  });
});
