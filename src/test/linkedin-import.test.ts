import { describe, it, expect } from "vitest";

describe("LinkedIn Import Format Support", () => {
  // Mock the LinkedIn import logic for testing
  const parseLinkedInData = (csvText: string) => {
    const trimmed = csvText.trim();
    if (!trimmed) {
      throw new Error("Invalid CSV format. Expected at least a header row.");
    }

    const lines = trimmed.split("\n");
    if (lines.length < 1) {
      throw new Error("Invalid CSV format. Expected at least a header row.");
    }

    // Handle header-only CSV
    if (lines.length === 1) {
      return [];
    }

    // Simple CSV parser that handles quoted fields
    const parseCSVLine = (line: string): string[] => {
      const result: string[] = [];
      let current = "";
      let inQuotes = false;

      for (let i = 0; i < line.length; i++) {
        const char = line[i];

        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === "," && !inQuotes) {
          result.push(current.trim());
          current = "";
        } else {
          current += char;
        }
      }

      result.push(current.trim());
      return result;
    };

    const headers = parseCSVLine(lines[0]);
    const data = lines.slice(1);

    // Map common LinkedIn CSV column variations
    const columnMappings = {
      firstName: ["First Name", "FirstName", "first_name"],
      lastName: ["Last Name", "LastName", "last_name"],
      email: ["Email Address", "Email", "email_address", "email"],
      company: ["Company", "Organization", "company"],
      position: ["Position", "Title", "Job Title", "position", "title"],
      connectedOn: ["Connected On", "Connection Date", "connected_on", "date"],
    };

    // Find column indices
    const getColumnIndex = (fieldMappings: string[]) => {
      for (const mapping of fieldMappings) {
        const index = headers.findIndex(
          (h) =>
            h.toLowerCase() === mapping.toLowerCase() ||
            h.toLowerCase().includes(mapping.toLowerCase()),
        );
        if (index !== -1) return index;
      }
      return -1;
    };

    const firstNameIndex = getColumnIndex(columnMappings.firstName);
    const lastNameIndex = getColumnIndex(columnMappings.lastName);
    const emailIndex = getColumnIndex(columnMappings.email);
    const companyIndex = getColumnIndex(columnMappings.company);
    const positionIndex = getColumnIndex(columnMappings.position);
    const connectedOnIndex = getColumnIndex(columnMappings.connectedOn);

    if (firstNameIndex === -1 && lastNameIndex === -1) {
      throw new Error(
        "CSV must contain at least First Name or Last Name column",
      );
    }

    return data.map((line, index) => {
      const columns = parseCSVLine(line);

      const firstName =
        firstNameIndex !== -1 ? columns[firstNameIndex] || "" : "";
      const lastName = lastNameIndex !== -1 ? columns[lastNameIndex] || "" : "";
      const fullName = `${firstName} ${lastName}`.trim();

      if (!fullName) {
        throw new Error(`Row ${index + 2}: Missing name information`);
      }

      const email = emailIndex !== -1 ? columns[emailIndex] || "" : "";
      const company = companyIndex !== -1 ? columns[companyIndex] || "" : "";
      const position = positionIndex !== -1 ? columns[positionIndex] || "" : "";
      const connectedOn =
        connectedOnIndex !== -1 ? columns[connectedOnIndex] || "" : "";

      // Parse connection date to timestamp
      let timestamp = Date.now() / 1000; // Default to now
      if (connectedOn) {
        const parsedDate = new Date(connectedOn);
        if (!isNaN(parsedDate.getTime())) {
          timestamp = parsedDate.getTime() / 1000;
        }
      }

      return {
        id: `li_${Date.now()}_${index}`,
        name: fullName,
        email,
        company,
        position,
        connectedOn,
        timestamp,
        platform: "linkedin",
        hasExtendedInfo: !!(email || company || position),
      };
    });
  };

  it("should parse standard LinkedIn CSV format", () => {
    const csvData = `First Name,Last Name,Email Address,Company,Position,Connected On
John,Doe,john.doe@example.com,Example Corp,Software Engineer,01-Jan-2023
Jane,Smith,jane.smith@example.com,Tech Inc,Product Manager,15-Feb-2023`;

    const result = parseLinkedInData(csvData);

    expect(result).toHaveLength(2);
    expect(result[0].name).toBe("John Doe");
    expect(result[0].email).toBe("john.doe@example.com");
    expect(result[0].company).toBe("Example Corp");
    expect(result[0].position).toBe("Software Engineer");
    expect(result[0].platform).toBe("linkedin");
    expect(result[0].hasExtendedInfo).toBe(true);

    expect(result[1].name).toBe("Jane Smith");
    expect(result[1].email).toBe("jane.smith@example.com");
    expect(result[1].company).toBe("Tech Inc");
    expect(result[1].position).toBe("Product Manager");
  });

  it("should parse alternative LinkedIn CSV column names", () => {
    const csvData = `FirstName,LastName,Email,Organization,Title,Connection Date
Alice,Johnson,alice@company.com,Big Corp,Manager,2023-01-15
Bob,Wilson,bob@startup.com,StartupXYZ,Developer,2023-02-20`;

    const result = parseLinkedInData(csvData);

    expect(result).toHaveLength(2);
    expect(result[0].name).toBe("Alice Johnson");
    expect(result[0].email).toBe("alice@company.com");
    expect(result[0].company).toBe("Big Corp");
    expect(result[0].position).toBe("Manager");

    expect(result[1].name).toBe("Bob Wilson");
    expect(result[1].company).toBe("StartupXYZ");
    expect(result[1].position).toBe("Developer");
  });

  it("should handle CSV with minimal columns (name only)", () => {
    const csvData = `First Name,Last Name
Charlie,Brown
Diana,Prince`;

    const result = parseLinkedInData(csvData);

    expect(result).toHaveLength(2);
    expect(result[0].name).toBe("Charlie Brown");
    expect(result[0].email).toBe("");
    expect(result[0].company).toBe("");
    expect(result[0].hasExtendedInfo).toBe(false);

    expect(result[1].name).toBe("Diana Prince");
    expect(result[1].hasExtendedInfo).toBe(false);
  });

  it("should handle CSV with quoted fields containing commas", () => {
    const csvData = `First Name,Last Name,Email Address,Company,Position,Connected On
"John, Jr.",Doe,"john.doe@example.com","Example Corp, LLC","Senior Software Engineer, Team Lead","01-Jan-2023"
Jane,Smith,jane.smith@example.com,"Tech Inc","Product Manager","15-Feb-2023"`;

    const result = parseLinkedInData(csvData);

    expect(result).toHaveLength(2);
    expect(result[0].name).toBe("John, Jr. Doe");
    expect(result[0].company).toBe("Example Corp, LLC");
    expect(result[0].position).toBe("Senior Software Engineer, Team Lead");
  });

  it("should parse connection dates correctly", () => {
    const csvData = `First Name,Last Name,Connected On
John,Doe,2023-01-15
Jane,Smith,15-Feb-2023
Bob,Wilson,Feb 20 2023`;

    const result = parseLinkedInData(csvData);

    expect(result).toHaveLength(3);

    // Check that timestamps are reasonable (not NaN and within expected range)
    result.forEach((contact) => {
      expect(contact.timestamp).toBeGreaterThan(1640995200); // After 2022
      expect(contact.timestamp).toBeLessThan(Date.now() / 1000 + 86400); // Not in future
    });
  });

  it("should handle missing optional fields gracefully", () => {
    const csvData = `First Name,Last Name,Email Address,Company,Position,Connected On
John,Doe,,,Software Engineer,
Jane,Smith,jane@example.com,Tech Inc,,15-Feb-2023
Bob,Wilson,,,,"20-Mar-2023"`;

    const result = parseLinkedInData(csvData);

    expect(result).toHaveLength(3);
    expect(result[0].name).toBe("John Doe");
    expect(result[0].email).toBe("");
    expect(result[0].company).toBe("");
    expect(result[0].position).toBe("Software Engineer");
    expect(result[0].hasExtendedInfo).toBe(true); // Has position

    expect(result[1].name).toBe("Jane Smith");
    expect(result[1].email).toBe("jane@example.com");
    expect(result[1].position).toBe("");
    expect(result[1].hasExtendedInfo).toBe(true); // Has email and company

    expect(result[2].name).toBe("Bob Wilson");
    expect(result[2].hasExtendedInfo).toBe(false); // No extended info
  });

  it("should throw error for invalid CSV format", () => {
    const invalidCsv = "";

    expect(() => parseLinkedInData(invalidCsv)).toThrow(
      "Invalid CSV format. Expected at least a header row.",
    );
  });

  it("should throw error when no name columns are present", () => {
    const csvData = `Email,Company,Position
john@example.com,Example Corp,Engineer`;

    expect(() => parseLinkedInData(csvData)).toThrow(
      "CSV must contain at least First Name or Last Name column",
    );
  });

  it("should throw error for rows with missing name data", () => {
    const csvData = `First Name,Last Name,Email
John,Doe,john@example.com
,,jane@example.com`;

    expect(() => parseLinkedInData(csvData)).toThrow(
      "Row 3: Missing name information",
    );
  });

  it("should handle case-insensitive column matching", () => {
    const csvData = `first name,LAST NAME,email address,COMPANY,position,connected on
John,Doe,john@example.com,Example Corp,Engineer,2023-01-01`;

    const result = parseLinkedInData(csvData);

    expect(result).toHaveLength(1);
    expect(result[0].name).toBe("John Doe");
    expect(result[0].email).toBe("john@example.com");
    expect(result[0].company).toBe("Example Corp");
  });

  it("should handle empty CSV (header only)", () => {
    const csvData = `First Name,Last Name,Email Address,Company,Position,Connected On`;

    const result = parseLinkedInData(csvData);

    expect(result).toHaveLength(0);
  });

  it("should assign unique IDs to each contact", () => {
    const csvData = `First Name,Last Name
John,Doe
Jane,Smith
John,Doe`;

    const result = parseLinkedInData(csvData);

    expect(result).toHaveLength(3);

    const ids = result.map((contact) => contact.id);
    const uniqueIds = new Set(ids);

    expect(uniqueIds.size).toBe(3); // All IDs should be unique
    ids.forEach((id) => {
      expect(id).toMatch(/^li_\d+_\d+$/); // Should match LinkedIn ID pattern
    });
  });
});
