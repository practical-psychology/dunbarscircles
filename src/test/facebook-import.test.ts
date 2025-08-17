import { describe, it, expect } from "vitest";

describe("Facebook Import Format Support", () => {
  // Mock the Facebook import logic for testing
  const parseFacebookData = (data: any) => {
    let friendsArray: any[] = [];

    // Check for new Facebook API v2 format first
    if (data.friends_v2) {
      friendsArray = data.friends_v2;
    } else if (data.friends?.data) {
      // Fall back to old format
      friendsArray = data.friends.data;
    } else {
      throw new Error(
        "Invalid Facebook data format. Expected 'friends_v2' or 'friends.data' structure.",
      );
    }

    return friendsArray.map((friend, index) => ({
      id: `fb_${Date.now()}_${index}`,
      name: friend.name,
      timestamp: friend.timestamp,
      hasExtendedInfo:
        "contact_info" in friend || "about" in friend || "hometown" in friend,
    }));
  };

  it("should parse old Facebook format (friends.data)", () => {
    const oldFormat = {
      friends: {
        data: [
          {
            name: "John Doe",
            timestamp: 1640995200,
            contact_info: { email: "john@example.com" },
            about: "Software engineer",
          },
          {
            name: "Jane Smith",
            timestamp: 1643673600,
          },
        ],
      },
    };

    const result = parseFacebookData(oldFormat);

    expect(result).toHaveLength(2);
    expect(result[0].name).toBe("John Doe");
    expect(result[0].timestamp).toBe(1640995200);
    expect(result[0].hasExtendedInfo).toBe(true);
    expect(result[1].name).toBe("Jane Smith");
    expect(result[1].hasExtendedInfo).toBe(false);
  });

  it("should parse new Facebook format (friends_v2)", () => {
    const newFormat = {
      friends_v2: [
        {
          name: "Martin Keshkekidis",
          timestamp: 1694403736,
        },
        {
          name: "Yuri Kuznetsov",
          timestamp: 1672874610,
        },
        {
          name: "Leyla Shukurova",
          timestamp: 1661808787,
        },
      ],
    };

    const result = parseFacebookData(newFormat);

    expect(result).toHaveLength(3);
    expect(result[0].name).toBe("Martin Keshkekidis");
    expect(result[0].timestamp).toBe(1694403736);
    expect(result[0].hasExtendedInfo).toBe(false); // New format doesn't have extended info
    expect(result[1].name).toBe("Yuri Kuznetsov");
    expect(result[2].name).toBe("Leyla Shukurova");
  });

  it("should throw error for invalid format", () => {
    const invalidFormat = {
      contacts: [{ name: "Invalid Format" }],
    };

    expect(() => parseFacebookData(invalidFormat)).toThrow(
      "Invalid Facebook data format. Expected 'friends_v2' or 'friends.data' structure.",
    );
  });

  it("should prioritize friends_v2 format when both are present", () => {
    const mixedFormat = {
      friends: {
        data: [{ name: "Old Format Friend", timestamp: 1640995200 }],
      },
      friends_v2: [{ name: "New Format Friend", timestamp: 1694403736 }],
    };

    const result = parseFacebookData(mixedFormat);

    expect(result).toHaveLength(1);
    expect(result[0].name).toBe("New Format Friend");
    expect(result[0].timestamp).toBe(1694403736);
  });
});
