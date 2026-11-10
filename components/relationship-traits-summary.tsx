import { VALENCES, ATTACHMENTS } from "@/lib/relationship-traits";
import type { Attachment, Valence } from "@/lib/relationship-traits";

interface Props {
  contacts: ReadonlyArray<{
    name: string;
    levelId: string;
    valence?: Valence;
    attachment?: Attachment;
  }>;
}

/** Counts by valence and attachment, plus a gentle flag for inner-circle drains. */
export function RelationshipTraitsSummary({ contacts }: Props) {
  const rated = contacts.filter((c) => c.valence || c.attachment);
  if (rated.length === 0) return null;
  const count = <T extends string>(key: "valence" | "attachment", v: T) =>
    contacts.filter((c) => c[key] === v).length;
  const innerDrains = contacts.filter(
    (c) =>
      c.valence === "negative" &&
      (c.levelId === "inner-circle" || c.levelId === "sympathy-group"),
  );
  return (
    <section aria-labelledby="traits-heading" className="space-y-3">
      <h2 id="traits-heading" className="text-lg font-semibold">
        How your relationships feel
      </h2>
      <dl className="grid grid-cols-2 gap-2 text-sm sm:grid-cols-4">
        {VALENCES.map((v) => (
          <div key={v} className="rounded-md border p-3">
            <dt className="capitalize">{v}</dt>
            <dd className="text-xl font-bold">{count("valence", v)}</dd>
          </div>
        ))}
        {ATTACHMENTS.map((a) => (
          <div key={a} className="rounded-md border p-3">
            <dt className="capitalize">{a} attachment</dt>
            <dd className="text-xl font-bold">{count("attachment", a)}</dd>
          </div>
        ))}
      </dl>
      {innerDrains.length > 0 && (
        <p role="note" className="text-sm text-amber-800 dark:text-amber-300">
          {innerDrains.map((c) => c.name).join(", ")}{" "}
          {innerDrains.length === 1 ? "is" : "are"} in your closest circles but
          feel{innerDrains.length === 1 ? "s" : ""} draining. Worth
          reconsidering where they sit.
        </p>
      )}
      <p className="text-xs text-gray-600 dark:text-gray-400">
        Self-reported and stored only in your browser. Not a clinical
        assessment.
      </p>
    </section>
  );
}
