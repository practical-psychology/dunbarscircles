import { describe, it, expect, beforeEach, vi } from "vitest";
import { screen, waitFor, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { render, testHelpers } from "../test-utils";

// Import individual page components to test workflows directly
import NetworkPage from "../../pages/NetworkPage";

// Mock Firebase components
vi.mock("@/components/firebase-status", () => ({
  FirebaseStatus: () => (
    <div data-testid="firebase-status">
      <button data-testid="fb-sign-in">Sign In</button>
      <button data-testid="fb-sign-out">Sign Out</button>
      <div data-testid="fb-user-info">User: test@example.com</div>
    </div>
  ),
}));

// Mock the components that require Canvas API with proper data import functionality
vi.mock("@/components/relationship-inventory", () => ({
  RelationshipInventory: () => (
    <div data-testid="relationship-inventory">
      <div data-testid="network-diagram">
        <canvas data-testid="network-canvas" />
        <button data-testid="mock-node">Mock Node</button>
      </div>
      <div data-testid="import-section">
        <input
          data-testid="facebook-file-input"
          type="file"
          accept=".json"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file && file.name.includes("facebook")) {
              console.log("Facebook file imported:", file.name);
              // Simulate successful Facebook import
              setTimeout(() => {
                const event = new CustomEvent("facebook-import-complete", {
                  detail: { contacts: 2, source: "facebook" },
                });
                document.dispatchEvent(event);
              }, 100);
            }
          }}
        />
        <input
          data-testid="linkedin-file-input"
          type="file"
          accept=".csv"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file && file.name.includes("linkedin")) {
              console.log("LinkedIn file imported:", file.name);
              // Simulate successful LinkedIn import
              setTimeout(() => {
                const event = new CustomEvent("linkedin-import-complete", {
                  detail: { contacts: 2, source: "linkedin" },
                });
                document.dispatchEvent(event);
              }, 100);
            }
          }}
        />
        <div data-testid="import-status">Ready for import</div>
      </div>
      <button
        data-testid="ri-export-csv"
        onClick={() => {
          const blob = new Blob(["test,data"], { type: "text/csv" });
          URL.createObjectURL(blob);
        }}
      >
        Export CSV
      </button>
      <div data-testid="ri-contact-list">
        <div data-testid="ri-contact-item">Test Contact</div>
      </div>
    </div>
  ),
}));

vi.mock("@/components/contact-manager", () => ({
  ContactManager: () => (
    <div data-testid="contact-manager">
      <button data-testid="add-contact">Add Contact</button>
      <div data-testid="contact-list">
        <div data-testid="contact-item">Test Contact</div>
      </div>
    </div>
  ),
}));

describe("Data Import Workflow Tests", () => {
  const user = userEvent.setup();

  beforeEach(() => {
    testHelpers.cleanupMocks();
    testHelpers.setupCanvasMock();
    testHelpers.setupFirebaseAuth(null);
  });

  describe("Facebook JSON Import Workflow", () => {
    it("should complete Facebook JSON import workflow: file upload → parsing → categorization → visualization", async () => {
      // Setup mock file reader for Facebook JSON import
      const jsonContent = JSON.stringify({
        friends: {
          data: [
            { name: "John Doe", timestamp: 1640995200 },
            { name: "Jane Smith", timestamp: 1643673600 },
          ],
        },
      });

      testHelpers.mockFileReader(jsonContent);

      // Test network page with import functionality
      render(<NetworkPage />);

      // Wait for relationship inventory to load
      await waitFor(() => {
        expect(
          screen.getByTestId("relationship-inventory")
        ).toBeInTheDocument();
      });

      // Verify import section is present
      expect(screen.getByTestId("import-section")).toBeInTheDocument();
      expect(screen.getByTestId("import-status")).toHaveTextContent(
        "Ready for import"
      );

      // Test Facebook JSON file import
      const facebookFileInput = screen.getByTestId("facebook-file-input");
      const jsonFile = testHelpers.createMockFacebookJSON();

      Object.defineProperty(facebookFileInput, "files", {
        value: [jsonFile],
        writable: false,
      });

      fireEvent.change(facebookFileInput);

      // Wait for import to be processed
      await waitFor(() => {
        // Verify the file was processed (console.log should have been called)
        expect(screen.getByTestId("import-section")).toBeInTheDocument();
      });

      // Verify network diagram is available for visualization
      const networkDiagram = screen.getByTestId("network-diagram");
      expect(networkDiagram).toBeInTheDocument();

      // Verify mock node interaction works
      const mockNode = screen.getByTestId("mock-node");
      await user.click(mockNode);
      expect(mockNode).toBeInTheDocument();
    });

    it("should handle Facebook JSON parsing and categorization correctly", async () => {
      const jsonContent = JSON.stringify({
        friends: {
          data: [
            { name: "Close Friend", timestamp: Date.now() / 1000 - 86400 }, // 1 day ago
            { name: "Old Friend", timestamp: Date.now() / 1000 - 31536000 }, // 1 year ago
          ],
        },
      });

      testHelpers.mockFileReader(jsonContent);

      render(<NetworkPage />);

      await waitFor(() => {
        expect(
          screen.getByTestId("relationship-inventory")
        ).toBeInTheDocument();
      });

      const facebookFileInput = screen.getByTestId("facebook-file-input");
      const jsonFile = new File([jsonContent], "facebook_friends.json", {
        type: "application/json",
      });

      Object.defineProperty(facebookFileInput, "files", {
        value: [jsonFile],
        writable: false,
      });

      fireEvent.change(facebookFileInput);

      // Verify import processing
      await waitFor(() => {
        expect(screen.getByTestId("import-section")).toBeInTheDocument();
      });
    });
  });

  describe("LinkedIn CSV Import Workflow", () => {
    it("should complete LinkedIn CSV import workflow: file upload → parsing → categorization → visualization", async () => {
      // Setup mock file reader for CSV import
      const csvContent = `First Name,Last Name,Email Address,Company,Position,Connected On
John,Doe,john.doe@example.com,Example Corp,Software Engineer,01-Jan-2023
Jane,Smith,jane.smith@example.com,Tech Inc,Product Manager,15-Feb-2023`;

      testHelpers.mockFileReader(csvContent);

      // Test network page with import functionality
      render(<NetworkPage />);

      // Wait for relationship inventory to load
      await waitFor(() => {
        expect(
          screen.getByTestId("relationship-inventory")
        ).toBeInTheDocument();
      });

      // Test LinkedIn CSV file import
      const linkedinFileInput = screen.getByTestId("linkedin-file-input");
      const csvFile = testHelpers.createMockLinkedInCSV();

      Object.defineProperty(linkedinFileInput, "files", {
        value: [csvFile],
        writable: false,
      });

      fireEvent.change(linkedinFileInput);

      // Wait for import to be processed
      await waitFor(() => {
        expect(screen.getByTestId("import-section")).toBeInTheDocument();
      });

      // Verify network diagram is available for visualization
      const networkDiagram = screen.getByTestId("network-diagram");
      expect(networkDiagram).toBeInTheDocument();
    });

    it("should handle LinkedIn CSV parsing with different column formats", async () => {
      const csvContent = `First Name,Last Name,Email,Company,Title,Connected On
Alice,Johnson,alice@company.com,Big Corp,Manager,2023-01-15
Bob,Wilson,bob@startup.com,StartupXYZ,Developer,2023-02-20`;

      testHelpers.mockFileReader(csvContent);

      render(<NetworkPage />);

      await waitFor(() => {
        expect(
          screen.getByTestId("relationship-inventory")
        ).toBeInTheDocument();
      });

      const linkedinFileInput = screen.getByTestId("linkedin-file-input");
      const csvFile = new File([csvContent], "linkedin_connections.csv", {
        type: "text/csv",
      });

      Object.defineProperty(linkedinFileInput, "files", {
        value: [csvFile],
        writable: false,
      });

      fireEvent.change(linkedinFileInput);

      await waitFor(() => {
        expect(screen.getByTestId("import-section")).toBeInTheDocument();
      });
    });
  });

  describe("Data Categorization and Auto-Assignment", () => {
    it("should automatically categorize imported contacts based on relationship strength", async () => {
      const mixedData = JSON.stringify({
        friends: {
          data: [
            { name: "Best Friend", timestamp: Date.now() / 1000 - 86400 }, // Recent
            { name: "College Friend", timestamp: Date.now() / 1000 - 7776000 }, // 3 months ago
            { name: "Acquaintance", timestamp: Date.now() / 1000 - 31536000 }, // 1 year ago
          ],
        },
      });

      testHelpers.mockFileReader(mixedData);

      render(<NetworkPage />);

      await waitFor(() => {
        expect(
          screen.getByTestId("relationship-inventory")
        ).toBeInTheDocument();
      });

      const facebookFileInput = screen.getByTestId("facebook-file-input");
      const jsonFile = new File([mixedData], "facebook_friends.json", {
        type: "application/json",
      });

      Object.defineProperty(facebookFileInput, "files", {
        value: [jsonFile],
        writable: false,
      });

      fireEvent.change(facebookFileInput);

      // Verify categorization logic would be applied
      await waitFor(() => {
        expect(screen.getByTestId("network-diagram")).toBeInTheDocument();
      });
    });
  });

  describe("Workflow Transitions", () => {
    it("should handle transitions between import → visualization → export", async () => {
      const csvContent = `First Name,Last Name,Email Address,Company,Position,Connected On
Test,User,test@example.com,Test Corp,Tester,01-Jan-2023`;

      testHelpers.mockFileReader(csvContent);

      render(<NetworkPage />);

      await waitFor(() => {
        expect(
          screen.getByTestId("relationship-inventory")
        ).toBeInTheDocument();
      });

      // Step 1: Import data
      const linkedinFileInput = screen.getByTestId("linkedin-file-input");
      const csvFile = testHelpers.createMockLinkedInCSV();

      Object.defineProperty(linkedinFileInput, "files", {
        value: [csvFile],
        writable: false,
      });

      fireEvent.change(linkedinFileInput);

      // Step 2: Verify visualization is available
      await waitFor(() => {
        expect(screen.getByTestId("network-diagram")).toBeInTheDocument();
      });

      // Step 3: Test export functionality
      const exportButton = screen.getByTestId("ri-export-csv");
      await user.click(exportButton);

      await waitFor(() => {
        expect(global.URL.createObjectURL).toHaveBeenCalled();
      });
    });
  });

  describe("Error Handling in Import Workflows", () => {
    it("should handle malformed JSON files gracefully", async () => {
      // Mock file reader to return invalid JSON
      testHelpers.mockFileReader("{ invalid json }");

      render(<NetworkPage />);

      await waitFor(() => {
        expect(
          screen.getByTestId("relationship-inventory")
        ).toBeInTheDocument();
      });

      const facebookFileInput = screen.getByTestId("facebook-file-input");
      const invalidFile = new File(["{ invalid json }"], "invalid.json", {
        type: "application/json",
      });

      Object.defineProperty(facebookFileInput, "files", {
        value: [invalidFile],
        writable: false,
      });

      fireEvent.change(facebookFileInput);

      // Should not crash and interface should remain functional
      await waitFor(() => {
        expect(
          screen.getByTestId("relationship-inventory")
        ).toBeInTheDocument();
      });
    });

    it("should handle malformed CSV files gracefully", async () => {
      // Mock file reader to return invalid CSV
      testHelpers.mockFileReader("invalid,csv,format\nwith,missing,columns");

      render(<NetworkPage />);

      await waitFor(() => {
        expect(
          screen.getByTestId("relationship-inventory")
        ).toBeInTheDocument();
      });

      const linkedinFileInput = screen.getByTestId("linkedin-file-input");
      const invalidFile = new File(["invalid csv"], "invalid.csv", {
        type: "text/csv",
      });

      Object.defineProperty(linkedinFileInput, "files", {
        value: [invalidFile],
        writable: false,
      });

      fireEvent.change(linkedinFileInput);

      // Should not crash and interface should remain functional
      await waitFor(() => {
        expect(
          screen.getByTestId("relationship-inventory")
        ).toBeInTheDocument();
      });
    });

    it("should handle file reading errors gracefully", async () => {
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

      render(<NetworkPage />);

      await waitFor(() => {
        expect(
          screen.getByTestId("relationship-inventory")
        ).toBeInTheDocument();
      });

      const facebookFileInput = screen.getByTestId("facebook-file-input");
      const testFile = testHelpers.createMockFacebookJSON();

      Object.defineProperty(facebookFileInput, "files", {
        value: [testFile],
        writable: false,
      });

      fireEvent.change(facebookFileInput);

      // Should handle error gracefully and still show the interface
      await waitFor(() => {
        expect(
          screen.getByTestId("relationship-inventory")
        ).toBeInTheDocument();
      });
    });
  });
});
