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
  contactFrequency: number; // days between contacts
  strength: number; // 0-1
  decayRate: number; // how fast relationship decays
  platform: string; // where you know them from
  x?: number;
  y?: number;
  vx?: number;
  vy?: number;
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
