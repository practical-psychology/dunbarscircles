import { z } from "zod";
import type { Person, Level } from "../src/types/relationships";
import { STAGES, CONTACT_STATUSES } from "./relationship-model";
import type { Stage, ContactStatus } from "./relationship-model";

// Core contact interfaces extending the existing Person type
export interface Contact extends Person {
  email?: string;
  phone?: string;
  notes?: string;
  tags?: string[];
  // Relationship model v2 (lib/relationship-model.ts). All optional.
  stage?: Stage;
  attachmentScore?: number;
  trust?: number;
  support?: number;
  reciprocity?: number;
  desiredContactPerMonth?: number;
  contactStatus?: ContactStatus;
  overlay?: boolean;
  schemaVersion?: number;
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
  // Relationship model v2 (lib/relationship-model.ts). All optional.
  stage?: Stage;
  attachmentScore?: number;
  trust?: number;
  support?: number;
  reciprocity?: number;
  desiredContactPerMonth?: number;
  contactStatus?: ContactStatus;
  overlay?: boolean;
  schemaVersion?: number;
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
  // Relationship model v2 (lib/relationship-model.ts). All optional.
  stage?: Stage;
  attachmentScore?: number;
  trust?: number;
  support?: number;
  reciprocity?: number;
  desiredContactPerMonth?: number;
  contactStatus?: ContactStatus;
  overlay?: boolean;
  schemaVersion?: number;
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

  stage: z.enum(STAGES).optional(),
  attachmentScore: z.number().int().min(0).max(100).optional(),
  trust: z.number().int().min(0).max(100).optional(),
  support: z.number().int().min(0).max(100).optional(),
  reciprocity: z.number().int().min(0).max(100).optional(),
  desiredContactPerMonth: z.number().min(0).max(1000).optional(),
  contactStatus: z.enum(CONTACT_STATUSES).optional(),
  overlay: z.boolean().optional(),
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

  stage: z.enum(STAGES).optional(),
  attachmentScore: z.number().int().min(0).max(100).optional(),
  trust: z.number().int().min(0).max(100).optional(),
  support: z.number().int().min(0).max(100).optional(),
  reciprocity: z.number().int().min(0).max(100).optional(),
  desiredContactPerMonth: z.number().min(0).max(1000).optional(),
  contactStatus: z.enum(CONTACT_STATUSES).optional(),
  overlay: z.boolean().optional(),

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

    // The circle is the user's own choice; it is only checked to exist.
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

// No strength, decay or "health" scores: under the relationship model
// (lib/relationship-model.ts) contact frequency never implies attachment,
// and no function suggests or assigns a circle.

// Export utility functions for easy access
export const contactUtils = {
  sanitize: sanitizeContactData,
  validate: validateContactData,
};
