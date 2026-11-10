import type { ContactForm } from "./contact-models";

/** Fictional people, one or more per layer, for "Start with sample data". */
export const SAMPLE_CONTACTS: ContactForm[] = [
  ["Alex Rivera", "inner-circle", 1, 0.95, "partner"],
  ["Sam Okafor", "inner-circle", 3, 0.9, "best friend"],
  ["Jo Lindqvist", "inner-circle", 7, 0.85, "sibling"],
  ["Priya Nair", "sympathy-group", 14, 0.7, "close friend"],
  ["Marcus Chen", "sympathy-group", 14, 0.65, "close friend"],
  ["Elena Rossi", "affinity-group", 30, 0.5, "book club"],
  ["Tom Becker", "affinity-group", 30, 0.45, "climbing partner"],
  ["Dana Whitfield", "active-network", 90, 0.3, "old colleague"],
  ["Yuki Tanaka", "active-network", 90, 0.3, "neighbour"],
  ["Chris Adeyemi", "recognition-group", 365, 0.15, "met at a conference"],
].map(([name, levelId, contactFrequency, strength, role]) => ({
  name: name as string,
  levelId: levelId as string,
  platform: "sample",
  tags: ["sample"],
  notes: `Sample contact (${role}). Delete it any time.`,
  contactFrequency: contactFrequency as number,
  strength: strength as number,
}));
