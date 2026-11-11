import type { ChangeEvent } from "react";
import { Label } from "@/components/ui/label";
import {
  CONTACT_STATUSES,
  CONTACT_STATUS_LABELS,
  STAGES,
  STAGE_LABELS,
  parsePerMonth,
  parseScore,
  parseStage,
  parseStatus,
  type RelationshipProfile,
} from "@/lib/relationship-model";

interface Props {
  value: RelationshipProfile;
  /** Called with the changed keys only. `undefined` clears a rating. */
  onChange: (patch: Partial<RelationshipProfile>) => void;
  disabled?: boolean;
  /** Old 0-1 "relationship strength", offered (never applied) as importance. */
  legacyStrength?: number;
}

const selectClass =
  "h-11 w-full rounded-md border border-input bg-background px-3 text-sm";

function ScoreField({
  id,
  label,
  help,
  value,
  onChange,
  disabled,
}: {
  id: string;
  label: string;
  help: string;
  value: number | undefined;
  onChange: (v: number | undefined) => void;
  disabled?: boolean;
}) {
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between gap-2">
        <Label htmlFor={id}>{label}</Label>
        {value === undefined ? (
          <button
            type="button"
            className="min-h-[36px] text-sm text-blue-700 underline dark:text-blue-300"
            onClick={() => onChange(50)}
            disabled={disabled}
          >
            Rate
          </button>
        ) : (
          <span className="flex items-center gap-3 text-sm">
            <output htmlFor={id} className="font-medium tabular-nums">
              {value}/100
            </output>
            <button
              type="button"
              className="min-h-[36px] text-gray-600 underline dark:text-gray-300"
              onClick={() => onChange(undefined)}
              disabled={disabled}
              aria-label={`Clear ${label}`}
            >
              Clear
            </button>
          </span>
        )}
      </div>
      {value !== undefined && (
        <input
          id={id}
          type="range"
          min={0}
          max={100}
          step={5}
          value={value}
          disabled={disabled}
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            onChange(parseScore(e.target.value))
          }
          className="w-full"
          aria-describedby={`${id}-help`}
        />
      )}
      <p id={`${id}-help`} className="text-xs text-gray-600 dark:text-gray-400">
        {value === undefined ? "Not rated. " : ""}
        {help}
      </p>
    </div>
  );
}

/**
 * Relationship fields from the emotional-relationship model. Each one is a
 * separate, optional self-report; none is calculated from another.
 */
export function RelationshipFields({
  value,
  onChange,
  disabled,
  legacyStrength,
}: Props) {
  return (
    <fieldset className="space-y-4 rounded-lg border border-gray-200 p-4 dark:border-gray-700">
      <legend className="px-1 text-sm font-semibold">
        How this relationship is for you
      </legend>
      <p className="text-xs text-gray-600 dark:text-gray-400">
        These are separate on purpose. You can dislike someone who matters a lot
        to you, or rarely see someone you feel close to. Nothing here moves a
        person between circles.
      </p>

      <div className="space-y-2">
        <Label htmlFor="stage">Feelings towards them</Label>
        <select
          id="stage"
          className={selectClass}
          value={value.stage ?? ""}
          disabled={disabled}
          onChange={(e: ChangeEvent<HTMLSelectElement>) =>
            onChange({ stage: parseStage(e.target.value) })
          }
        >
          <option value="">Not set</option>
          {STAGES.map((s) => (
            <option key={s} value={s}>
              {STAGE_LABELS[s]}
            </option>
          ))}
        </select>
      </div>

      <ScoreField
        id="attachmentScore"
        label="How important they are to you"
        help="Psychological importance, positive or negative. 0 = not at all, 100 = central to your life."
        value={value.attachmentScore}
        onChange={(v) => onChange({ attachmentScore: v })}
        disabled={disabled}
      />
      {value.attachmentScore === undefined && legacyStrength !== undefined && (
        <p className="text-xs text-gray-600 dark:text-gray-400">
          You previously set "relationship strength" to{" "}
          {Math.round(legacyStrength * 100)}%.{" "}
          <button
            type="button"
            className="underline"
            onClick={() =>
              onChange({ attachmentScore: parseScore(legacyStrength * 100) })
            }
            disabled={disabled}
          >
            Use it as importance
          </button>
        </p>
      )}

      <div className="grid gap-4 sm:grid-cols-3">
        <ScoreField
          id="trust"
          label="Trust"
          help="How much you trust them."
          value={value.trust}
          onChange={(v) => onChange({ trust: v })}
          disabled={disabled}
        />
        <ScoreField
          id="support"
          label="Support"
          help="How much support you get from them."
          value={value.support}
          onChange={(v) => onChange({ support: v })}
          disabled={disabled}
        />
        <ScoreField
          id="reciprocity"
          label="Reciprocity"
          help="How balanced the give and take is."
          value={value.reciprocity}
          onChange={(v) => onChange({ reciprocity: v })}
          disabled={disabled}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="desiredContactPerMonth">
            How often you would like contact (per month)
          </Label>
          <input
            id="desiredContactPerMonth"
            type="number"
            inputMode="decimal"
            min={0}
            step={0.5}
            className={selectClass}
            placeholder="Optional"
            value={value.desiredContactPerMonth ?? ""}
            disabled={disabled}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              onChange({
                desiredContactPerMonth: parsePerMonth(e.target.value),
              })
            }
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="contactStatus">Status</Label>
          <select
            id="contactStatus"
            className={selectClass}
            value={value.contactStatus ?? "active"}
            disabled={disabled}
            onChange={(e: ChangeEvent<HTMLSelectElement>) => {
              const s = parseStatus(e.target.value);
              onChange({ contactStatus: s === "active" ? undefined : s });
            }}
          >
            {CONTACT_STATUSES.map((s) => (
              <option key={s} value={s}>
                {CONTACT_STATUS_LABELS[s]}
              </option>
            ))}
          </select>
        </div>
      </div>

      <label className="flex min-h-[44px] items-start gap-3 text-sm">
        <input
          type="checkbox"
          className="mt-1 h-4 w-4"
          checked={value.overlay === true}
          disabled={disabled}
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            onChange({ overlay: e.target.checked ? true : undefined })
          }
        />
        <span>
          Show on the "important but difficult" overlay instead of in a circle.
          <span className="block text-xs text-gray-600 dark:text-gray-400">
            Only you decide this; it is never set automatically.
          </span>
        </span>
      </label>
    </fieldset>
  );
}

/** Pick the relationship fields out of any contact-like object. */
export function profileOf(c: Record<string, unknown>): RelationshipProfile {
  return {
    stage: parseStage(c.stage),
    attachmentScore: parseScore(c.attachmentScore),
    trust: parseScore(c.trust),
    support: parseScore(c.support),
    reciprocity: parseScore(c.reciprocity),
    desiredContactPerMonth: parsePerMonth(c.desiredContactPerMonth),
    contactStatus: parseStatus(c.contactStatus),
    overlay: c.overlay === true ? true : undefined,
  };
}
