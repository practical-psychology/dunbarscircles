import type { Person } from "../src/types/relationships";

/**
 * Contact shape used by the dashboard and edit page. Stored in the browser
 * (`yakw_contacts`); cloud backup is handled by lib/cloud-sync.ts.
 * The old Firestore class that wrote to the retired `contacts` collection
 * was removed on 2026-11-10.
 */
export interface StoredContact extends Person {
  id: string;
  name: string;
  levelId: string;
  lastContact: Date;
  contactFrequency: number;
  strength: number;
  decayRate: number;
  platform: string;
  email?: string;
  phone?: string;
  notes?: string;
  importDate: Date;
  source: "facebook" | "linkedin" | "manual";
  firestoreId?: string;
  syncStatus?: "synced" | "pending" | "error";
  lastSyncAt?: Date;
  tags?: string[];
  // Relationship model v2 (lib/relationship-model.ts)
  stage?: import("./relationship-model").Stage;
  attachmentScore?: number;
  trust?: number;
  support?: number;
  reciprocity?: number;
  desiredContactPerMonth?: number;
  contactStatus?: import("./relationship-model").ContactStatus;
  overlay?: boolean;
  schemaVersion?: number;
  x?: number;
  y?: number;
  vx?: number;
  vy?: number;
}
