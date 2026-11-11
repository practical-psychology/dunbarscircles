import { useEffect, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  INITIATORS,
  INTERACTION_TYPES,
  INTERACTION_TYPE_LABELS,
  contactRhythm,
  parseInitiator,
  parseInteractionType,
  type ChangeRecord,
  type Interaction,
  type InteractionType,
} from "@/lib/relationship-model";
import {
  addInteraction,
  deleteInteraction,
  historyFor,
  interactionsFor,
} from "@/lib/relationship-log";
import { CONTACTS_CHANGED_EVENT } from "@/lib/contact-events";

const FIELD_LABELS: Record<string, string> = {
  name: "Name",
  levelId: "Circle",
  stage: "Feelings",
  attachmentScore: "Importance",
  trust: "Trust",
  support: "Support",
  reciprocity: "Reciprocity",
  desiredContactPerMonth: "Desired contact / month",
  contactStatus: "Status",
  overlay: "Overlay",
  notes: "Notes",
  _created: "Added",
  _deleted: "Deleted",
};

const fmt = (v: unknown) =>
  v === null || v === undefined || v === "" ? "—" : String(v);

const inputClass =
  "h-11 w-full rounded-md border border-input bg-background px-3 text-sm";

const RHYTHM_TEXT = {
  unknown: "Set a desired contact rate and log interactions to compare.",
  "below-desired": "Voluntary contact is below what you said you want.",
  "on-track": "Voluntary contact is close to what you said you want.",
  "above-desired": "Voluntary contact is above what you said you want.",
} as const;

/** Interactions log, contact rhythm and change history for one person. */
export function RelationshipActivity({
  personId,
  desiredPerMonth,
}: {
  personId: string;
  desiredPerMonth?: number;
}) {
  const [items, setItems] = useState<Interaction[]>([]);
  const [history, setHistory] = useState<ChangeRecord[]>([]);
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [type, setType] = useState<InteractionType>("voluntary");
  const [duration, setDuration] = useState("");
  const [initiator, setInitiator] = useState("");

  useEffect(() => {
    const load = () => {
      setItems(interactionsFor(personId));
      setHistory(historyFor(personId).reverse());
    };
    load();
    window.addEventListener(CONTACTS_CHANGED_EVENT, load);
    return () => window.removeEventListener(CONTACTS_CHANGED_EVENT, load);
  }, [personId]);

  const rhythm = contactRhythm(personId, items, desiredPerMonth);

  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    addInteraction({
      person_id: personId,
      date,
      type,
      duration_minutes: duration === "" ? undefined : Number(duration),
      initiated_by: parseInitiator(initiator),
    });
    setDuration("");
    toast.success("Interaction logged");
  };

  return (
    <section
      aria-labelledby="activity-heading"
      className="space-y-6 rounded-lg border border-gray-200 p-4 dark:border-gray-700"
    >
      <h3 id="activity-heading" className="text-lg font-semibold">
        Interactions and changes
      </h3>

      <div
        className="grid grid-cols-2 gap-2 text-sm sm:grid-cols-4"
        data-testid="contact-rhythm"
      >
        {(
          [
            ["Voluntary", rhythm.voluntaryPerMonth],
            ["Obligatory", rhythm.obligatoryPerMonth],
            ["Conflict", rhythm.conflictPerMonth],
            ["Unclassified", rhythm.unclassifiedPerMonth],
          ] as const
        ).map(([label, v]) => (
          <div key={label} className="rounded-md border p-2">
            <div className="text-xs text-gray-600 dark:text-gray-400">
              {label} / month
            </div>
            <div className="font-semibold tabular-nums">{v}</div>
          </div>
        ))}
      </div>
      <p className="text-sm text-gray-700 dark:text-gray-300">
        Last 90 days. {RHYTHM_TEXT[rhythm.status]} Low contact does not mean a
        weak bond, and obligatory or conflict contact is counted separately.
      </p>

      <form
        onSubmit={submit}
        className="grid gap-3 sm:grid-cols-5 sm:items-end"
      >
        <div className="space-y-1">
          <Label htmlFor="int-date">Date</Label>
          <input
            id="int-date"
            type="date"
            className={inputClass}
            value={date}
            max={new Date().toISOString().slice(0, 10)}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              setDate(e.target.value)
            }
            required
          />
        </div>
        <div className="space-y-1 sm:col-span-2">
          <Label htmlFor="int-type">Type</Label>
          <select
            id="int-type"
            className={inputClass}
            value={type}
            onChange={(e: ChangeEvent<HTMLSelectElement>) =>
              setType(parseInteractionType(e.target.value))
            }
          >
            {INTERACTION_TYPES.map((t) => (
              <option key={t} value={t}>
                {INTERACTION_TYPE_LABELS[t]}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-1">
          <Label htmlFor="int-duration">Minutes</Label>
          <input
            id="int-duration"
            type="number"
            min={0}
            inputMode="numeric"
            className={inputClass}
            placeholder="Optional"
            value={duration}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              setDuration(e.target.value)
            }
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="int-by">Started by</Label>
          <select
            id="int-by"
            className={inputClass}
            value={initiator}
            onChange={(e: ChangeEvent<HTMLSelectElement>) =>
              setInitiator(e.target.value)
            }
          >
            <option value="">Optional</option>
            {INITIATORS.map((i) => (
              <option key={i} value={i}>
                {i === "me"
                  ? "Me"
                  : i === "them"
                    ? "Them"
                    : i === "both"
                      ? "Both"
                      : "Not sure"}
              </option>
            ))}
          </select>
        </div>
        <Button
          type="submit"
          className="min-h-[44px] sm:col-span-5 sm:justify-self-start"
        >
          Log interaction
        </Button>
      </form>

      {items.length > 0 && (
        <ul
          className="divide-y rounded-md border text-sm"
          aria-label="Logged interactions"
        >
          {items.slice(0, 20).map((i) => (
            <li
              key={i.interaction_id}
              className="flex items-center justify-between gap-2 p-2"
            >
              <span>
                {i.date} · {INTERACTION_TYPE_LABELS[i.type].split(" (")[0]}
                {i.duration_minutes !== undefined
                  ? ` · ${i.duration_minutes} min`
                  : ""}
                {i.initiated_by ? ` · started by ${i.initiated_by}` : ""}
              </span>
              <button
                type="button"
                className="min-h-[36px] text-red-700 underline dark:text-red-300"
                onClick={() => deleteInteraction(i.interaction_id)}
                aria-label={`Delete interaction on ${i.date}`}
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      )}

      <details>
        <summary className="min-h-[44px] cursor-pointer py-3 font-medium">
          Change history ({history.length})
        </summary>
        {history.length === 0 ? (
          <p className="text-sm text-gray-600 dark:text-gray-400">
            No recorded changes yet.
          </p>
        ) : (
          <ol className="space-y-2 text-sm" aria-label="Change history">
            {history.slice(0, 50).map((h) => (
              <li key={h.change_id} className="rounded-md border p-2">
                <div className="text-xs text-gray-600 dark:text-gray-400">
                  {new Date(h.timestamp).toLocaleString()} ·{" "}
                  {h.source === "import" ? "import" : "your edit"}
                </div>
                <ul>
                  {Object.entries(h.changed_fields).map(([f, c]) => (
                    <li key={f}>
                      {FIELD_LABELS[f] ?? f}
                      {f.startsWith("_")
                        ? ""
                        : `: ${fmt(c.from)} → ${fmt(c.to)}`}
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ol>
        )}
        <p className="mt-2 text-xs text-gray-600 dark:text-gray-400">
          History only grows; it is kept in this browser and included in your
          JSON export.
        </p>
      </details>
    </section>
  );
}
