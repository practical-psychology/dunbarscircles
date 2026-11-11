import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Users, Heart, Target, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { LiquidCard } from "@/components/ui/liquid-card";
import type { StoredContact } from "@/lib/contact-storage-service";
import type { Level } from "@/types/relationships";
import {
  contactRhythm,
  countsInCircles,
  dataCompleteness,
  overlayMembers,
  type Interaction,
  type Stage,
} from "@/lib/relationship-model";
import { readInteractions } from "@/lib/relationship-log";
import { CONTACTS_CHANGED_EVENT } from "@/lib/contact-events";
import { isSampleContact } from "@/lib/sample-data";
import { contactKey } from "@/lib/backup";
import {
  FEELING_STYLE,
  FeelingMark,
  FeelingsMap,
  LayerFeelingMatrix,
} from "./relationship-visuals";

interface ContactStatsDashboardProps {
  contacts: StoredContact[];
  levels: Level[];
}

const pct = (x: number) => `${Math.round(x * 100)}%`;
const LIST_MAX = 12;

function FeelingBadge({ stage }: { stage?: Stage }) {
  const k = stage ?? "unset";
  return (
    <span className="inline-flex items-center gap-1 text-xs">
      <svg width="12" height="12" aria-hidden="true">
        <FeelingMark feeling={k} x={6} y={6} r={4} />
      </svg>
      {FEELING_STYLE[k].label}
    </span>
  );
}

function NameList({
  people,
  levelName,
}: {
  people: StoredContact[];
  levelName: (id: string) => string;
}) {
  if (people.length === 0)
    return (
      <p className="text-sm text-gray-600 dark:text-gray-400">Nobody yet.</p>
    );
  return (
    <ul className="space-y-1 text-sm">
      {people.slice(0, LIST_MAX).map((p) => (
        <li
          key={p.id}
          className="flex flex-wrap items-center justify-between gap-2"
        >
          <Link
            to={`/contacts/edit/${encodeURIComponent(p.id)}`}
            className="font-medium underline-offset-2 hover:underline"
          >
            {p.name}
          </Link>
          <span className="text-xs text-gray-600 dark:text-gray-400">
            {levelName(p.levelId)}
            {p.attachmentScore !== undefined
              ? ` · importance ${p.attachmentScore}`
              : ""}
          </span>
        </li>
      ))}
      {people.length > LIST_MAX && (
        <li className="text-xs text-gray-600 dark:text-gray-400">
          and {people.length - LIST_MAX} more
        </li>
      )}
    </ul>
  );
}

/**
 * Contacts overview built only from what the user entered: who is in the
 * inner circle, how the other circles look, how complete and valid the
 * data is, how often voluntary contact happens, and who they love or hate.
 * No scores are derived from contact frequency (docs/RELATIONSHIP_MODEL.md).
 */
export function ContactStatsDashboard({
  contacts,
  levels,
}: ContactStatsDashboardProps) {
  const [interactions, setInteractions] = useState<Interaction[]>([]);
  useEffect(() => {
    const load = () => setInteractions(readInteractions());
    load();
    window.addEventListener(CONTACTS_CHANGED_EVENT, load);
    return () => window.removeEventListener(CONTACTS_CHANGED_EVENT, load);
  }, []);

  const s = useMemo(() => {
    const real = contacts.filter((c) => !String(c.id).startsWith("sample_"));
    const inCircles = real.filter(countsInCircles);
    const levelName = (id: string) =>
      levels.find((l) => l.id === id)?.name ?? id;
    const rhythm = new Map(
      real.map((p) => [
        p.id,
        contactRhythm(p.id, interactions, p.desiredContactPerMonth),
      ]),
    );
    const inner = inCircles
      .filter((p) => p.levelId === levels[0]?.id)
      .sort((a, b) => (b.attachmentScore ?? -1) - (a.attachmentScore ?? -1));

    const others = levels.slice(1).map((level) => {
      const ps = inCircles.filter((p) => p.levelId === level.id);
      const rated = ps.filter((p) => p.attachmentScore !== undefined);
      const avg =
        rated.length > 0
          ? Math.round(
              rated.reduce((a, p) => a + (p.attachmentScore ?? 0), 0) /
                rated.length,
            )
          : undefined;
      const pos = ps.filter(
        (p) => p.stage === "love" || p.stage === "like",
      ).length;
      const neg = ps.filter(
        (p) => p.stage === "dislike" || p.stage === "hate",
      ).length;
      const mixed = ps.filter((p) => p.stage === "mixed").length;
      const voluntary =
        Math.round(
          ps.reduce(
            (a, p) => a + (rhythm.get(p.id)?.voluntaryPerMonth ?? 0),
            0,
          ) * 10,
        ) / 10;
      return {
        level,
        count: ps.length,
        rated: rated.length,
        avg,
        pos,
        neg,
        mixed,
        voluntary,
      };
    });

    const completeness = dataCompleteness(real, interactions);
    const dupKeys = new Map<string, number>();
    for (const p of real) {
      const k = contactKey(p);
      dupKeys.set(k, (dupKeys.get(k) ?? 0) + 1);
    }
    const duplicates = [...dupKeys.values()]
      .filter((n) => n > 1)
      .reduce((a, n) => a + n, 0);
    const unreviewed = real.filter(
      (p) =>
        p.levelId === levels[levels.length - 1]?.id &&
        !p.stage &&
        p.attachmentScore === undefined &&
        !isSampleContact(p),
    ).length;
    const samples = real.filter(isSampleContact).length;

    const totals = {
      voluntary: 0,
      obligatory: 0,
      conflict: 0,
      unclassified: 0,
    };
    for (const r of rhythm.values()) {
      totals.voluntary += r.voluntaryPerMonth;
      totals.obligatory += r.obligatoryPerMonth;
      totals.conflict += r.conflictPerMonth;
      totals.unclassified += r.unclassifiedPerMonth;
    }
    const round = (n: number) => Math.round(n * 10) / 10;
    const below = real.filter(
      (p) => rhythm.get(p.id)?.status === "below-desired",
    );
    const noLogs = real.filter(
      (p) => (rhythm.get(p.id)?.total ?? 0) === 0,
    ).length;
    const mostVoluntary = [...real]
      .filter((p) => (rhythm.get(p.id)?.voluntaryPerMonth ?? 0) > 0)
      .sort(
        (a, b) =>
          (rhythm.get(b.id)?.voluntaryPerMonth ?? 0) -
          (rhythm.get(a.id)?.voluntaryPerMonth ?? 0),
      )
      .slice(0, 5);

    return {
      real,
      inCircles,
      levelName,
      rhythm,
      inner,
      others,
      completeness,
      duplicates,
      unreviewed,
      samples,
      totals: {
        voluntary: round(totals.voluntary),
        obligatory: round(totals.obligatory),
        conflict: round(totals.conflict),
        unclassified: round(totals.unclassified),
      },
      below,
      noLogs,
      mostVoluntary,
      love: real.filter((p) => p.stage === "love"),
      hate: real.filter((p) => p.stage === "hate"),
      like: real.filter((p) => p.stage === "like").length,
      dislike: real.filter((p) => p.stage === "dislike").length,
      mixed: real.filter((p) => p.stage === "mixed").length,
      excluded: real.filter((p) => p.contactStatus === "excluded").length,
      noContact: real.filter((p) => p.contactStatus === "no-contact").length,
      overlay: overlayMembers(real).length,
    };
  }, [contacts, levels, interactions]);

  const tiles = [
    { label: "People", value: s.real.length, icon: Users },
    { label: "Placed in circles", value: s.inCircles.length, icon: Target },
    {
      label: "Excluded or no contact",
      value: s.excluded + s.noContact,
      icon: User,
    },
    { label: "On the overlay", value: s.overlay, icon: Heart },
  ];
  const innerLevel = levels[0];
  const totalContacts =
    s.totals.voluntary +
    s.totals.obligatory +
    s.totals.conflict +
    s.totals.unclassified;

  return (
    <div className="space-y-6" data-testid="contact-stats-dashboard">
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {tiles.map(({ label, value, icon: Icon }) => (
          <LiquidCard key={label}>
            <div className="flex items-center gap-3">
              <Icon className="h-5 w-5 text-blue-600" aria-hidden="true" />
              <div>
                <div className="text-2xl font-bold tabular-nums">{value}</div>
                <div className="text-sm text-gray-600 dark:text-gray-300">
                  {label}
                </div>
              </div>
            </div>
          </LiquidCard>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <LiquidCard>
          <section
            aria-labelledby="inner-heading"
            data-testid="inner-circle-section"
          >
            <div className="mb-3 flex items-center justify-between gap-2">
              <h3 id="inner-heading" className="text-lg font-semibold">
                Your {innerLevel?.name ?? "inner circle"}
              </h3>
              <Badge variant="secondary">
                {s.inner.length} / about {innerLevel?.count ?? 5}
              </Badge>
            </div>
            {s.inner.length === 0 ? (
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Nobody is in your inner circle yet. Open a person and choose
                this circle for the few people you would call in a crisis.
              </p>
            ) : (
              <ul
                className="divide-y text-sm"
                aria-label="People in your inner circle"
              >
                {s.inner.slice(0, 15).map((p) => {
                  const r = s.rhythm.get(p.id);
                  return (
                    <li
                      key={p.id}
                      className="flex flex-wrap items-center justify-between gap-2 py-2"
                    >
                      <div>
                        <Link
                          to={`/contacts/edit/${encodeURIComponent(p.id)}`}
                          className="font-medium underline-offset-2 hover:underline"
                        >
                          {p.name}
                        </Link>
                        <div>
                          <FeelingBadge stage={p.stage} />
                        </div>
                      </div>
                      <div className="text-right text-xs text-gray-600 dark:text-gray-400">
                        <div>
                          Importance{" "}
                          <span className="font-medium text-gray-900 dark:text-gray-100">
                            {p.attachmentScore ?? "not rated"}
                          </span>
                        </div>
                        <div>
                          {r && r.total > 0
                            ? `${r.voluntaryPerMonth} voluntary / month`
                            : "no interactions logged"}
                          {p.desiredContactPerMonth !== undefined &&
                            ` · wish ${p.desiredContactPerMonth}`}
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>
        </LiquidCard>

        <LiquidCard>
          <section aria-labelledby="others-heading">
            <h3 id="others-heading" className="mb-3 text-lg font-semibold">
              Your other circles
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[420px] text-sm">
                <thead>
                  <tr className="text-left text-xs text-gray-600 dark:text-gray-400">
                    <th scope="col" className="py-1">
                      Circle
                    </th>
                    <th scope="col">People</th>
                    <th scope="col">Avg importance</th>
                    <th scope="col">Love/like · dislike/hate · mixed</th>
                    <th scope="col">Voluntary / mo</th>
                  </tr>
                </thead>
                <tbody>
                  {s.others.map((o) => (
                    <tr
                      key={o.level.id}
                      className="border-t border-gray-200 dark:border-gray-700"
                    >
                      <th
                        scope="row"
                        className={`py-2 text-left font-medium ${o.level.textColor}`}
                      >
                        {o.level.name}
                      </th>
                      <td className="tabular-nums">
                        {o.count}
                        <span className="text-xs text-gray-500">
                          {" "}
                          / ~{o.level.count}
                        </span>
                      </td>
                      <td className="tabular-nums">
                        {o.avg ?? "—"}
                        {o.rated > 0 && (
                          <span className="text-xs text-gray-500">
                            {" "}
                            ({o.rated} rated)
                          </span>
                        )}
                      </td>
                      <td className="tabular-nums">
                        {o.pos} · {o.neg} · {o.mixed}
                      </td>
                      <td className="tabular-nums">{o.voluntary}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-2 text-xs text-gray-600 dark:text-gray-400">
              Layer sizes are rough averages, not targets. Excluded, no-contact
              and overlay people are not counted.
            </p>
          </section>
        </LiquidCard>

        <LiquidCard>
          <section
            aria-labelledby="validity-heading"
            data-testid="data-validity-section"
          >
            <h3 id="validity-heading" className="mb-3 text-lg font-semibold">
              Data validity
            </h3>
            <ul className="space-y-2 text-sm">
              {(
                [
                  ["Feelings set", s.completeness.stage],
                  ["Importance rated", s.completeness.attachment],
                  [
                    "Trust, support or reciprocity rated",
                    s.completeness.quality,
                  ],
                  ["Desired contact set", s.completeness.desired],
                  ["Interactions logged", s.completeness.interactions],
                ] as [string, number][]
              ).map(([label, share]) => (
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
            <ul className="mt-4 space-y-1 text-sm">
              <li>
                <strong className="tabular-nums">{s.unreviewed}</strong>{" "}
                {s.unreviewed === 1 ? "person" : "people"} still in the outer
                circle with no feelings or importance (not reviewed yet)
              </li>
              <li>
                <strong className="tabular-nums">{s.duplicates}</strong> entries
                share a name and circle with someone else
              </li>
              <li>
                <strong className="tabular-nums">{s.samples}</strong> made-up
                sample people
              </li>
            </ul>
            <p className="mt-2 text-xs text-gray-600 dark:text-gray-400">
              Insights are only as good as what you enter; nothing here is
              guessed for you.
            </p>
          </section>
        </LiquidCard>

        <LiquidCard>
          <section
            aria-labelledby="freq-heading"
            data-testid="contact-frequency-section"
          >
            <h3 id="freq-heading" className="mb-3 text-lg font-semibold">
              Frequency of contact
            </h3>
            <dl className="grid grid-cols-2 gap-2 text-sm sm:grid-cols-4">
              {(
                [
                  ["Voluntary", s.totals.voluntary],
                  ["Obligatory", s.totals.obligatory],
                  ["Conflict", s.totals.conflict],
                  ["Unclassified", s.totals.unclassified],
                ] as [string, number][]
              ).map(([label, v]) => (
                <div key={label} className="rounded-md border p-2">
                  <dt className="text-xs text-gray-600 dark:text-gray-400">
                    {label} / month
                  </dt>
                  <dd className="text-lg font-semibold tabular-nums">{v}</dd>
                </div>
              ))}
            </dl>
            <p className="mt-2 text-sm">
              {totalContacts > 0
                ? `${pct(s.totals.voluntary / totalContacts)} of logged contact is voluntary.`
                : "No interactions logged in the last 90 days."}{" "}
              {s.noLogs} {s.noLogs === 1 ? "person has" : "people have"} no
              logged interactions.
            </p>
            {s.mostVoluntary.length > 0 && (
              <p className="mt-2 text-sm">
                Most voluntary contact:{" "}
                {s.mostVoluntary
                  .map(
                    (p) =>
                      `${p.name} (${s.rhythm.get(p.id)?.voluntaryPerMonth}/mo)`,
                  )
                  .join(", ")}
                .
              </p>
            )}
            {s.below.length > 0 && (
              <p className="mt-2 text-sm">
                Below the contact you want:{" "}
                {s.below
                  .slice(0, 8)
                  .map((p) => p.name)
                  .join(", ")}
                {s.below.length > 8 ? ` and ${s.below.length - 8} more` : ""}.
              </p>
            )}
            <p className="mt-2 text-xs text-gray-600 dark:text-gray-400">
              Last 90 days. Low contact does not mean a weak bond.
            </p>
          </section>
        </LiquidCard>

        <LiquidCard>
          <section
            aria-labelledby="love-heading"
            data-testid="love-hate-section"
          >
            <h3 id="love-heading" className="mb-3 text-lg font-semibold">
              People you love
            </h3>
            <NameList people={s.love} levelName={s.levelName} />
            <p className="mt-2 text-xs text-gray-600 dark:text-gray-400">
              Plus {s.like} you like.
            </p>
          </section>
        </LiquidCard>
        <LiquidCard>
          <section aria-labelledby="hate-heading">
            <h3 id="hate-heading" className="mb-3 text-lg font-semibold">
              People you hate
            </h3>
            <NameList people={s.hate} levelName={s.levelName} />
            <p className="mt-2 text-xs text-gray-600 dark:text-gray-400">
              Plus {s.dislike} you dislike and {s.mixed} with mixed feelings.
              Strong negative feelings can sit alongside high importance; they
              never move anyone between circles.
            </p>
          </section>
        </LiquidCard>
      </div>

      <LiquidCard>
        <section aria-labelledby="map-heading">
          <h3 id="map-heading" className="mb-1 text-lg font-semibold">
            Circles by feeling
          </h3>
          <FeelingsMap people={s.real} levels={levels} />
        </section>
      </LiquidCard>

      <LiquidCard>
        <section aria-labelledby="matrix-heading">
          <h3 id="matrix-heading" className="mb-3 text-lg font-semibold">
            Circle × feeling
          </h3>
          <LayerFeelingMatrix people={s.real} levels={levels} />
        </section>
      </LiquidCard>
    </div>
  );
}
