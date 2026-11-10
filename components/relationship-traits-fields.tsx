import type { ChangeEvent } from "react";
import { Label } from "@/components/ui/label";
import {
  ATTACHMENTS,
  ATTACHMENT_LABELS,
  VALENCES,
  VALENCE_LABELS,
  parseAttachment,
  parseValence,
  type Attachment,
  type Valence,
} from "@/lib/relationship-traits";

interface Props {
  valence?: Valence;
  attachment?: Attachment;
  onValence: (v: Valence | undefined) => void;
  onAttachment: (v: Attachment | undefined) => void;
  disabled?: boolean;
}

const selectClass =
  "h-11 w-full rounded-md border border-input bg-background px-3 text-sm";

/** Optional self-reported relationship traits (Phase 12). */
export function TraitSelects({
  valence,
  attachment,
  onValence,
  onAttachment,
  disabled,
}: Props) {
  return (
    <>
      <div className="space-y-2">
        <Label htmlFor="valence">How does this relationship feel?</Label>
        <select
          id="valence"
          className={selectClass}
          value={valence ?? ""}
          disabled={disabled}
          onChange={(e: ChangeEvent<HTMLSelectElement>) => onValence(parseValence(e.target.value))}
        >
          <option value="">Not set</option>
          {VALENCES.map((v) => (
            <option key={v} value={v}>
              {VALENCE_LABELS[v]}
            </option>
          ))}
        </select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="attachment">Attachment</Label>
        <select
          id="attachment"
          className={selectClass}
          value={attachment ?? ""}
          disabled={disabled}
          onChange={(e: ChangeEvent<HTMLSelectElement>) => onAttachment(parseAttachment(e.target.value))}
        >
          <option value="">Not set</option>
          {ATTACHMENTS.map((a) => (
            <option key={a} value={a}>
              {ATTACHMENT_LABELS[a]}
            </option>
          ))}
        </select>
      </div>
    </>
  );
}
