import { z } from "zod";
import type { Person, Level } from "../src/types/relationships";

// Core contact interfaces extending the existing Person type
export interface Contact extends Person {
  email?: string;
  phone?: string;
  notes?: string;
  tags?: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ContactForm {
  name: string;
  email?: string;
  phone?: string;
  notes?: string;
  levelId: string;
  platform: string;
  tags?: string[];
  contactFrequency: number;
  strength: number;
}

export interface ContactUpdate {
  id: string;
  name?: string;
  email?: string;
  phone?: string;
  notes?: string;
  levelId?: string;
  platform?: string;
  tags?: string[];
  contactFrequency?: number;
  strength?: number;
  lastContact?: Date;
}

// Zod validation schemas
export const contactFormSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(100, "Name must be less than 100 characters")
    .trim(),

  email: z.string().email("Invalid email format").optional().or(z.literal("")),

  phone: z
    .string()
    .regex(/^[\+]?[1-9][\d]{0,15}$/, "Invalid phone number format")
    .optional()
    .or(z.literal("")),

  notes: z
    .string()
    .max(500, "Notes must be less than 500 characters")
    .optional()
    .or(z.literal("")),

  levelId: z.string().min(1, "Circle assignment is required"),

  platform: z
    .string()
    .min(1, "Platform/source is required")
    .max(50, "Platform name must be less than 50 characters"),

  tags: z
    .array(z.string().max(30, "Tag must be less than 30 characters"))
    .max(10, "Maximum 10 tags allowed")
    .optional(),

  contactFrequency: z
    .number()
    .min(1, "Contact frequency must be at least 1 day")
    .max(365, "Contact frequency cannot exceed 365 days"),

  strength: z
    .number()
    .min(0, "Relationship strength must be between 0 and 1")
    .max(1, "Relationship strength must be between 0 and 1"),
});

export const contactUpdateSchema = z.object({
  id: z.string().min(1, "Contact ID is required"),
  name: z
    .string()
    .min(1, "Name is required")
    .max(100, "Name must be less than 100 characters")
    .trim()
    .optional(),

  email: z.string().email("Invalid email format").optional().or(z.literal("")),

  phone: z
    .string()
    .regex(/^[\+]?[1-9][\d]{0,15}$/, "Invalid phone number format")
    .optional()
    .or(z.literal("")),

  notes: z
    .string()
    .max(500, "Notes must be less than 500 characters")
    .optional()
    .or(z.literal("")),

  levelId: z.string().optional(),

  platform: z
    .string()
    .max(50, "Platform name must be less than 50 characters")
    .optional(),

  tags: z
    .array(z.string().max(30, "Tag must be less than 30 characters"))
    .max(10, "Maximum 10 tags allowed")
    .optional(),

  contactFrequency: z
    .number()
    .min(1, "Contact frequency must be at least 1 day")
    .max(365, "Contact frequency cannot exceed 365 days")
    .optional(),

  strength: z
    .number()
    .min(0, "Relationship strength must be between 0 and 1")
    .max(1, "Relationship strength must be between 0 and 1")
    .optional(),

  lastContact: z.date().optional(),
});

// Type inference from schemas
export type ContactFormData = z.infer<typeof contactFormSchema>;
export type ContactUpdateData = z.infer<typeof contactUpdateSchema>;

// Data sanitization utilities
export const sanitizeContactData = {
  /**
   * Sanitizes and normalizes contact name
   */
  name: (name: string): string => {
    return name
      .trim()
      .replace(/<[^>]*>/g, "") // Remove HTML tags
      .replace(/\s+/g, " ") // Replace multiple spaces with single space
      .replace(/[^\w\s\-'\.]/g, "") // Remove special characters except common name chars
      .substring(0, 100); // Truncate to max length
  },

  /**
   * Sanitizes and validates email format
   */
  email: (email: string): string => {
    return email.trim().toLowerCase().substring(0, 254); // RFC 5321 email length limit
  },

  /**
   * Sanitizes phone number by removing non-numeric characters except +
   */
  phone: (phone: string): string => {
    return phone
      .trim()
      .replace(/[^\d\+]/g, "") // Keep only digits and +
      .substring(0, 16); // International format max length
  },

  /**
   * Sanitizes notes by removing potentially harmful content
   */
  notes: (notes: string): string => {
    return notes
      .trim()
      .replace(/[<>]/g, "") // Remove potential HTML tags
      .substring(0, 500); // Truncate to max length
  },

  /**
   * Sanitizes platform/source name
   */
  platform: (platform: string): string => {
    return platform
      .trim()
      .toLowerCase()
      .replace(/[^\w\s\-]/g, "") // Remove special characters
      .substring(0, 50); // Truncate to max length
  },

  /**
   * Sanitizes tags array
   */
  tags: (tags: string[]): string[] => {
    return tags
      .map((tag) => tag.trim().toLowerCase().substring(0, 30))
      .filter((tag) => tag.length > 0)
      .filter((tag, index, arr) => arr.indexOf(tag) === index) // Remove duplicates
      .slice(0, 10); // Limit to 10 tags
  },
};

// Validation utilities
export const validateContactData = {
  /**
   * Validates contact form data using Zod schema
   */
  form: (data: unknown) => {
    return contactFormSchema.safeParse(data);
  },

  /**
   * Validates contact update data using Zod schema
   */
  update: (data: unknown) => {
    return contactUpdateSchema.safeParse(data);
  },

  /**
   * Validates if a contact belongs to the correct Dunbar circle based on strength
   */
  circleAssignment: (
    contact: ContactFormData,
    levels: Level[],
  ): {
    isValid: boolean;
    suggestedLevelId?: string;
    reason?: string;
  } => {
    const currentLevel = levels.find((level) => level.id === contact.levelId);
    if (!currentLevel) {
      return {
        isValid: false,
        reason: "Invalid circle assignment - circle not found",
      };
    }

    // Get suggested level based on relationship strength
    const suggestedLevel = getSuggestedLevel(contact.strength, levels);

    if (suggestedLevel.id !== contact.levelId) {
      return {
        isValid: false,
        suggestedLevelId: suggestedLevel.id,
        reason: `Based on relationship strength (${Math.round(contact.strength * 100)}%), this contact might fit better in ${suggestedLevel.name}`,
      };
    }

    return { isValid: true };
  },

  /**
   * Validates contact frequency against Dunbar circle expectations
   */
  contactFrequency: (
    contact: ContactFormData,
    levels: Level[],
  ): {
    isValid: boolean;
    suggestedFrequency?: number;
    reason?: string;
  } => {
    const level = levels.find((l) => l.id === contact.levelId);
    if (!level) {
      return { isValid: false, reason: "Invalid circle assignment" };
    }

    // Expected contact frequencies for each Dunbar level (in days)
    const expectedFrequencies: Record<string, { min: number; max: number }> = {
      "inner-circle": { min: 1, max: 7 }, // Daily to weekly
      "sympathy-group": { min: 3, max: 14 }, // Few times a week to bi-weekly
      "affinity-group": { min: 14, max: 45 }, // Bi-weekly to monthly
      "active-network": { min: 30, max: 120 }, // Monthly to quarterly
      "recognition-group": { min: 90, max: 365 }, // Quarterly to yearly
    };

    const expected = expectedFrequencies[level.id];
    if (!expected) {
      return { isValid: true }; // Unknown level, assume valid
    }

    if (
      contact.contactFrequency < expected.min ||
      contact.contactFrequency > expected.max
    ) {
      const suggestedFrequency = Math.round((expected.min + expected.max) / 2);
      return {
        isValid: false,
        suggestedFrequency,
        reason: `For ${level.name}, contact frequency should be between ${expected.min}-${expected.max} days. Suggested: ${suggestedFrequency} days`,
      };
    }

    return { isValid: true };
  },
};

// Relationship strength calculation algorithms
export const relationshipStrengthCalculator = {
  /**
   * Calculates relationship strength based on multiple factors
   */
  calculateStrength: (factors: {
    contactFrequency: number; // days between contacts
    lastContactDays: number; // days since last contact
    interactionQuality: number; // 0-1 scale (optional, defaults to 0.5)
    relationshipAge: number; // days since relationship started
    platform: string; // where you know them from
  }): number => {
    const {
      contactFrequency,
      lastContactDays,
      interactionQuality = 0.5,
      relationshipAge,
      platform,
    } = factors;

    // Base strength from contact frequency (more frequent = stronger)
    const frequencyScore = Math.max(0, 1 - contactFrequency / 365); // Normalize to 0-1

    // Recency factor (recent contact = stronger)
    const recencyScore = Math.max(
      0,
      1 - lastContactDays / (contactFrequency * 2),
    );

    // Relationship maturity (older relationships can be stronger)
    const maturityScore = Math.min(1, relationshipAge / (365 * 2)); // 2 years to full maturity

    // Platform factor (some platforms indicate stronger relationships)
    const platformMultiplier = getPlatformStrengthMultiplier(platform);

    // Weighted combination
    const baseStrength =
      (frequencyScore * 0.4 +
        recencyScore * 0.3 +
        interactionQuality * 0.2 +
        maturityScore * 0.1) *
      platformMultiplier;

    return Math.max(0, Math.min(1, baseStrength));
  },

  /**
   * Calculates relationship decay over time
   */
  calculateDecay: (
    initialStrength: number,
    daysSinceLastContact: number,
    expectedContactFrequency: number,
    decayRate: number = 0.1,
  ): number => {
    if (daysSinceLastContact <= expectedContactFrequency) {
      return initialStrength; // No decay if within expected frequency
    }

    const excessDays = daysSinceLastContact - expectedContactFrequency;
    const decayFactor = Math.exp(
      -decayRate * (excessDays / expectedContactFrequency),
    );

    return Math.max(0.1, initialStrength * decayFactor); // Minimum 10% strength
  },

  /**
   * Suggests optimal contact frequency based on relationship strength and level
   */
  suggestContactFrequency: (strength: number, levelId: string): number => {
    const baseFrequencies: Record<string, number> = {
      "inner-circle": 3, // Every 3 days
      "sympathy-group": 7, // Weekly
      "affinity-group": 21, // Every 3 weeks
      "active-network": 60, // Every 2 months
      "recognition-group": 180, // Every 6 months
    };

    const baseFreq = baseFrequencies[levelId] || 30;

    // Adjust based on strength (stronger relationships need more frequent contact)
    const strengthMultiplier = 2 - strength; // 1.0 to 2.0 range

    return Math.round(baseFreq * strengthMultiplier);
  },

  /**
   * Calculates relationship health score (0-100)
   */
  calculateHealthScore: (contact: {
    strength: number;
    lastContact: Date;
    contactFrequency: number;
    decayRate: number;
  }): {
    score: number;
    status: "excellent" | "good" | "fair" | "poor" | "critical";
    recommendations: string[];
  } => {
    const daysSinceContact =
      (Date.now() - (contact.lastContact ?? new Date()).getTime()) /
      (1000 * 60 * 60 * 24);
    const currentStrength = relationshipStrengthCalculator.calculateDecay(
      contact.strength,
      daysSinceContact,
      contact.contactFrequency,
      contact.decayRate,
    );

    const score = Math.round(currentStrength * 100);

    let status: "excellent" | "good" | "fair" | "poor" | "critical";
    const recommendations: string[] = [];

    if (score >= 80) {
      status = "excellent";
      recommendations.push("Relationship is strong and well-maintained");
    } else if (score >= 60) {
      status = "good";
      recommendations.push("Consider reaching out soon to maintain strength");
    } else if (score >= 40) {
      status = "fair";
      recommendations.push(
        "Relationship needs attention - schedule contact soon",
      );
      if (daysSinceContact > contact.contactFrequency * 1.5) {
        recommendations.push(
          "Overdue for contact based on your usual frequency",
        );
      }
    } else if (score >= 20) {
      status = "poor";
      recommendations.push(
        "Relationship is weakening - immediate contact recommended",
      );
      recommendations.push(
        "Consider adjusting contact frequency or relationship level",
      );
    } else {
      status = "critical";
      recommendations.push("Relationship at risk of being lost");
      recommendations.push(
        "Urgent contact needed or consider moving to outer circle",
      );
    }

    return { score, status, recommendations };
  },
};

// Helper functions
function getPlatformStrengthMultiplier(platform: string): number {
  const multipliers: Record<string, number> = {
    family: 1.2,
    work: 1.0,
    school: 1.1,
    facebook: 0.8,
    linkedin: 0.9,
    instagram: 0.7,
    twitter: 0.6,
    dating: 1.3,
    hobby: 1.1,
    neighbor: 1.0,
    manual: 1.0, // User-added contacts
  };

  return multipliers[platform.toLowerCase()] || 0.8;
}

function getSuggestedLevel(strength: number, levels: Level[]): Level {
  // Sort levels by typical strength thresholds
  const strengthThresholds = [
    { levelId: "inner-circle", minStrength: 0.8 },
    { levelId: "sympathy-group", minStrength: 0.6 },
    { levelId: "affinity-group", minStrength: 0.4 },
    { levelId: "active-network", minStrength: 0.2 },
    { levelId: "recognition-group", minStrength: 0.0 },
  ];

  for (const threshold of strengthThresholds) {
    if (strength >= threshold.minStrength) {
      const level = levels.find((l) => l.id === threshold.levelId);
      if (level) return level;
    }
  }

  // Fallback to recognition group
  return (
    levels.find((l) => l.id === "recognition-group") ||
    levels[levels.length - 1]
  );
}

// Export utility functions for easy access
export const contactUtils = {
  sanitize: sanitizeContactData,
  validate: validateContactData,
  strength: relationshipStrengthCalculator,
};
