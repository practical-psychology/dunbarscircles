/**
 * Phase 12 relationship traits.
 * - valence: how the relationship feels overall.
 * - attachment: how secure the connection feels to you.
 * Both are optional, self-reported and stay in the browser like other contact data.
 */
export const VALENCES = ["positive", "neutral", "negative", "mixed"] as const;
export type Valence = (typeof VALENCES)[number];

export const ATTACHMENTS = ["secure", "anxious", "avoidant", "unsure"] as const;
export type Attachment = (typeof ATTACHMENTS)[number];

export const VALENCE_LABELS: Record<Valence, string> = {
  positive: "Positive: energising",
  neutral: "Neutral",
  negative: "Negative: draining",
  mixed: "Mixed: it depends",
};

export const ATTACHMENT_LABELS: Record<Attachment, string> = {
  secure: "Secure: comfortable and trusting",
  anxious: "Anxious: I worry about this bond",
  avoidant: "Avoidant: I keep distance",
  unsure: "Not sure",
};

export function parseValence(v: unknown): Valence | undefined {
  return typeof v === "string" && (VALENCES as readonly string[]).includes(v)
    ? (v as Valence)
    : undefined;
}

export function parseAttachment(v: unknown): Attachment | undefined {
  return typeof v === "string" && (ATTACHMENTS as readonly string[]).includes(v)
    ? (v as Attachment)
    : undefined;
}
