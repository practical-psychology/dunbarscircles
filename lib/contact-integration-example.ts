/**
 * Example of how to integrate the new contact models with existing Dunbar Circles components
 * This shows how to use the contact validation and utilities with the existing Person type
 */

import type { Person, Level } from "@/types/relationships";
import {
  contactUtils,
  type ContactFormData,
  type Contact,
} from "./contact-models";

// Example: Convert existing Person to new Contact format
export function personToContact(person: Person): Contact {
  return {
    ...person,
    email: undefined,
    phone: undefined,
    notes: undefined,
    tags: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

// Example: Convert ContactFormData to Person for existing components
export function contactFormToPerson(formData: ContactFormData): Person {
  return {
    id: crypto.randomUUID(),
    name: contactUtils.sanitize.name(formData.name),
    levelId: formData.levelId,
    lastContact: new Date(),
    contactFrequency: formData.contactFrequency,
    strength: formData.strength,
    decayRate: 0.1, // Default decay rate
    platform: contactUtils.sanitize.platform(formData.platform),
  };
}

// Example: Validate and enhance imported social media data
export function validateImportedContact(
  rawData: any,
  source: "facebook" | "linkedin" | "manual",
  levels: Level[],
): { isValid: boolean; contact?: Person; errors?: string[] } {
  const errors: string[] = [];

  // Basic validation
  if (!rawData.name || typeof rawData.name !== "string") {
    errors.push("Name is required");
  }

  if (rawData.name && rawData.name.length > 100) {
    errors.push("Name is too long");
  }

  if (errors.length > 0) {
    return { isValid: false, errors };
  }

  // Sanitize and create contact
  const sanitizedName = contactUtils.sanitize.name(rawData.name);

  // Calculate initial relationship strength based on platform and available data
  const strengthFactors = {
    contactFrequency: 30, // Default monthly contact
    lastContactDays: rawData.lastContact
      ? Math.floor(
          (Date.now() - new Date(rawData.lastContact).getTime()) /
            (1000 * 60 * 60 * 24),
        )
      : 90, // Default 3 months ago
    interactionQuality: 0.5, // Default medium quality
    relationshipAge: rawData.connectionDate
      ? Math.floor(
          (Date.now() - new Date(rawData.connectionDate).getTime()) /
            (1000 * 60 * 60 * 24),
        )
      : 365, // Default 1 year
    platform: source,
  };

  const calculatedStrength =
    contactUtils.strength.calculateStrength(strengthFactors);

  // Suggest appropriate Dunbar level based on strength
  const suggestedLevel = getSuggestedLevelForStrength(
    calculatedStrength,
    levels,
  );

  const contact: Person = {
    id: crypto.randomUUID(),
    name: sanitizedName,
    levelId: suggestedLevel.id,
    lastContact: rawData.lastContact
      ? new Date(rawData.lastContact)
      : new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
    contactFrequency: contactUtils.strength.suggestContactFrequency(
      calculatedStrength,
      suggestedLevel.id,
    ),
    strength: calculatedStrength,
    decayRate: 0.1,
    platform: source,
  };

  return { isValid: true, contact };
}

// Example: Batch validate and process contacts for import
export function processBatchImport(
  rawContacts: any[],
  source: "facebook" | "linkedin" | "manual",
  levels: Level[],
): {
  successful: Person[];
  failed: Array<{ data: any; errors: string[] }>;
  summary: {
    total: number;
    successful: number;
    failed: number;
    byLevel: Record<string, number>;
  };
} {
  const successful: Person[] = [];
  const failed: Array<{ data: any; errors: string[] }> = [];
  const byLevel: Record<string, number> = {};

  rawContacts.forEach((rawData) => {
    const result = validateImportedContact(rawData, source, levels);

    if (result.isValid && result.contact) {
      successful.push(result.contact);
      byLevel[result.contact.levelId] =
        (byLevel[result.contact.levelId] || 0) + 1;
    } else {
      failed.push({
        data: rawData,
        errors: result.errors || ["Unknown validation error"],
      });
    }
  });

  return {
    successful,
    failed,
    summary: {
      total: rawContacts.length,
      successful: successful.length,
      failed: failed.length,
      byLevel,
    },
  };
}

// Helper function to suggest Dunbar level based on relationship strength
function getSuggestedLevelForStrength(
  strength: number,
  levels: Level[],
): Level {
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

  // Fallback to recognition group or last level
  return (
    levels.find((l) => l.id === "recognition-group") ||
    levels[levels.length - 1]
  );
}

// Example usage in a React component:
/*
import { contactUtils, type ContactFormData } from '@/lib/contact-models';
import { processBatchImport } from '@/lib/contact-integration-example';

// In your component:
const handleFormSubmit = (formData: ContactFormData) => {
  const validation = contactUtils.validate.form(formData);
  
  if (!validation.success) {
    setErrors(validation.error.issues.map(i => i.message));
    return;
  }
  
  const person = contactFormToPerson(validation.data);
  // Save person using existing storage methods
};

const handleBatchImport = (rawContacts: any[], source: 'facebook' | 'linkedin') => {
  const result = processBatchImport(rawContacts, source, levels);
  
  console.log(`Imported ${result.summary.successful} contacts successfully`);
  console.log(`Failed to import ${result.summary.failed} contacts`);
  
  // Save successful contacts using existing storage
  // Show errors for failed contacts
};
*/
