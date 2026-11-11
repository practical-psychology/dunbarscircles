import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  attachmentContactMismatch,
  dataCompleteness,
  overlayMembers,
  overlaySuggestions,
  type Interaction,
  type RelationshipProfile,
} from "@/lib/relationship-model";
import { readInteractions } from "@/lib/relationship-log";
import { CONTACTS_CHANGED_EVENT } from "@/lib/contact-events";

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
 * Relationship insights. Data completeness is always shown first; the
 * standardized comparison appears only when there is enough varied data.
 * Nothing here moves anyone between circles.
 */
export function RelationshipTraitsSummary({ contacts }: Props) {
  const [interactions, setInteractions] = useState<Interaction[]>([]);
  useEffect(() => {
    const load = () => setInteractions(readInteractions());
    load();
    window.addEventListener(CONTACTS_CHANGED_EVENT, load);
    return () => window.removeEventListener(CONTACTS_CHANGED_EVENT, load);
  }, []);

  const people = useMemo(
    () => contacts.filter((c) => !String(c.id).startsWith("sample_")),
    [contacts],
  );
  const completeness = dataCompleteness(people, interactions);
  const mismatch = attachmentContactMismatch(people, interactions);
  const overlay = overlayMembers([...people]);
  const suggestions = overlaySuggestions([...people]);
  const nameOf = (id: string) => people.find((p) => p.id === id)?.name ?? id;

  if (people.length === 0) return null;

  const rows: [string, number][] = [
    ["Feelings set", completeness.stage],
    ["Importance rated", completeness.attachment],
    ["Trust, support or reciprocity rated", completeness.quality],
    ["Desired contact set", completeness.desired],
    ["At least one interaction logged", completeness.interactions],
  ];

  return (
    <section
      aria-labelledby="insights-heading"
      className="space-y-5"
      data-testid="relationship-insights"
    >
      <h2 id="insights-heading" className="text-lg font-semibold">
        Relationship insights
      </h2>

      <div>
        <h3 className="mb-2 text-sm font-semibold">
          Data completeness ({completeness.people}{" "}
          {completeness.people === 1 ? "person" : "people"})
        </h3>
        <ul className="space-y-2 text-sm">
          {rows.map(([label, share]) => (
            <li key={label}>
              <div className="flex justify-between">
                <span>{label}</span>
                <span className="tabular-nums">{pct(share)}</span>
              </div>
              <div
                className="h-1.5 rounded-full bg-gray-200 dark:bg-gray-700"
                role="progressbar"
                aria-label={`${label}: ${pct(share)}`}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={Math.round(share * 100)}
              >
                <div
                  className="h-1.5 rounded-full bg-blue-600"
                  style={{ width: pct(share) }}
                />
              </div>
            </li>
          ))}
        </ul>
        <p className="mt-2 text-xs text-gray-600 dark:text-gray-400">
          Insights below use only what you entered. More complete data makes
          them more meaningful; none of them is a verdict on a relationship.
        </p>
      </div>

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
        <h3 className="mb-1 text-sm font-semibold">
          Importance compared with voluntary contact
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
