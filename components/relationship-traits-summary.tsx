import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  attachmentContactMismatch,
  dataCompleteness,
  overlayMembers,
  overlaySuggestions,
  scatterPoints,
  trendPrompts,
  type ChangeRecord,
  type Interaction,
  type RelationshipProfile,
} from "@/lib/relationship-model";
import {
  dismissPrompt,
  readDismissedPrompts,
  readHistory,
  readInteractions,
} from "@/lib/relationship-log";
import { CONTACTS_CHANGED_EVENT } from "@/lib/contact-events";
import { ImportanceContactScatter } from "./relationship-visuals";

type Person = {
  id: string;
  name: string;
  levelId: string;
} & RelationshipProfile;

interface Props {
  contacts: ReadonlyArray<Person>;
}

const pct = (x: number) => `${Math.round(x * 100)}%`;

/**
 * Relationship insights. Data completeness is shown first; trend prompts
 * are dismissible; the standardized comparison and the scatterplot appear
 * only with enough varied data. Nothing here moves anyone between circles.
 */
export function RelationshipTraitsSummary({ contacts }: Props) {
  const [interactions, setInteractions] = useState<Interaction[]>([]);
  const [history, setHistory] = useState<ChangeRecord[]>([]);
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());
  useEffect(() => {
    const load = () => {
      setInteractions(readInteractions());
      setHistory(readHistory());
      setDismissed(readDismissedPrompts());
    };
    load();
    window.addEventListener(CONTACTS_CHANGED_EVENT, load);
    return () => window.removeEventListener(CONTACTS_CHANGED_EVENT, load);
  }, []);

  const people = useMemo(
    () => contacts.filter((c) => !String(c.id).startsWith("sample_")),
    [contacts],
  );
  if (people.length === 0) return null;

  const completeness = dataCompleteness(people, interactions);
  const mismatch = attachmentContactMismatch(people, interactions);
  const overlay = overlayMembers([...people]);
  const suggestions = overlaySuggestions([...people]);
  const prompts = trendPrompts(people, history, interactions).filter(
    (p) => !dismissed.has(p.key),
  );
  const points = scatterPoints(people, interactions);
  const nameOf = (id: string) => people.find((p) => p.id === id)?.name ?? id;

  return (
    <section
      aria-labelledby="insights-heading"
      className="space-y-5"
      data-testid="relationship-insights"
    >
      <h2 id="insights-heading" className="text-lg font-semibold">
        Relationship insights
      </h2>

      <p className="text-sm" data-testid="completeness-summary">
        <strong>Data completeness</strong> ({completeness.people}{" "}
        {completeness.people === 1 ? "person" : "people"}): feelings{" "}
        {pct(completeness.stage)}, importance {pct(completeness.attachment)},
        trust/support/reciprocity {pct(completeness.quality)}, desired contact{" "}
        {pct(completeness.desired)}, interactions{" "}
        {pct(completeness.interactions)}. Details under Overview → Data
        validity. Insights use only what you entered.
      </p>

      {prompts.length > 0 && (
        <div>
          <h3 className="mb-2 text-sm font-semibold">Recent changes</h3>
          <ul className="space-y-2" aria-label="Trend prompts">
            {prompts.slice(0, 6).map((p) => (
              <li
                key={p.key}
                className="flex items-start justify-between gap-3 rounded-md border border-blue-200 bg-blue-50 p-3 text-sm dark:border-blue-800 dark:bg-blue-950"
              >
                <span>
                  {p.text}{" "}
                  <Link
                    to={`/contacts/edit/${encodeURIComponent(p.personId)}`}
                    className="underline"
                  >
                    Open
                  </Link>
                </span>
                <button
                  type="button"
                  className="min-h-[36px] shrink-0 text-gray-700 underline dark:text-gray-300"
                  onClick={() => dismissPrompt(p.key)}
                  aria-label={`Dismiss: ${p.text}`}
                >
                  Dismiss
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {(overlay.length > 0 || suggestions.length > 0) && (
        <div>
          <h3 className="mb-1 text-sm font-semibold">
            Important but difficult
          </h3>
          {overlay.length > 0 && (
            <p className="text-sm">
              On your overlay (not placed in a circle):{" "}
              {overlay.map((p) => p.name).join(", ")}.
            </p>
          )}
          {suggestions.length > 0 && (
            <p className="text-sm text-gray-700 dark:text-gray-300">
              You rated{" "}
              {suggestions.map((p, i) => (
                <span key={p.id}>
                  {i > 0 ? ", " : ""}
                  <Link
                    className="underline"
                    to={`/contacts/edit/${encodeURIComponent(p.id)}`}
                  >
                    {p.name}
                  </Link>
                </span>
              ))}{" "}
              as important but difficult. You can move them to the overlay from
              their page if that fits better; nothing changes unless you do.
            </p>
          )}
        </div>
      )}

      <div>
        <h3 className="mb-2 text-sm font-semibold">
          Importance and voluntary contact
        </h3>
        <ImportanceContactScatter points={points} nameOf={nameOf} />
      </div>

      <div>
        <h3 className="mb-1 text-sm font-semibold">
          Largest gaps between importance and contact
        </h3>
        {!mismatch.available ? (
          <p className="text-sm text-gray-700 dark:text-gray-300">
            Not shown yet. {mismatch.reason}
          </p>
        ) : mismatch.items.length === 0 ? (
          <p className="text-sm">
            For the {mismatch.eligible} people with enough data, voluntary
            contact roughly matches how important they are to you, relative to
            your other relationships.
          </p>
        ) : (
          <>
            <ul className="space-y-1 text-sm">
              {mismatch.items.slice(0, 8).map((m) => (
                <li key={m.id}>
                  <strong>{nameOf(m.id)}</strong>:{" "}
                  {m.z > 0
                    ? "more important to you than your voluntary contact suggests"
                    : "more voluntary contact than the importance you gave"}{" "}
                  (difference {Math.abs(m.z).toFixed(1)} standard deviations)
                </li>
              ))}
            </ul>
            <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">
              Based on {mismatch.eligible} people, last 90 days, voluntary
              interactions only. Low contact can be a choice, and obligatory or
              conflict contact is not counted.
            </p>
          </>
        )}
      </div>

      <p className="text-xs text-gray-600 dark:text-gray-400">
        Self-reported and stored only in your browser. Not a clinical
        assessment.
      </p>
    </section>
  );
}
