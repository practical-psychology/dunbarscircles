export interface Level {
  id: string;
  name: string;
  count: number;
  description: string;
  contactFrequency: string;
  digitalParallel: string;
  maintenanceCost: string;
  color: string;
  textColor: string;
  bgColor: string;
  category: string;
}

export interface Person {
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
  x?: number;
  y?: number;
  vx?: number;
  vy?: number;
}

export interface StoredContact extends Person {
  importDate: Date;
  source: "facebook" | "linkedin" | "manual";
  firestoreId?: string;
  syncStatus?: "synced" | "pending" | "error";
  lastSyncAt?: Date;
  tags?: string[];
}

export interface ExportOptions {
  includeMetadata: boolean;
  includeDecayingOnly: boolean;
  selectedLevels: string[];
  format: "json" | "csv" | "png" | "svg";
}

export interface NetworkStats {
  totalContacts: number;
  networkHealth: number;
  decayingCount: number;
  averageStrength: number;
  levelDistribution: { [levelId: string]: number };
}
