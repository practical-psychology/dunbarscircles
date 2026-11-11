import type { ReactElement } from "react";
import type { Level } from "@/types/relationships";
import {
  FEELING_KEYS,
  STAGE_LABELS,
  countsInCircles,
  layerFeelingMatrix,
  type FeelingKey,
  type RelationshipProfile,
  type ScatterPoint,
} from "@/lib/relationship-model";

/**
 * Feelings are shown with colour AND shape so they stay readable without
 * colour vision: positive = circle, negative = square, mixed = diamond,
 * neutral / not sure / not set = hollow ring.
 */
export const FEELING_STYLE: Record<
  FeelingKey,
  {
    color: string;
    shape: "circle" | "square" | "diamond" | "ring";
    label: string;
  }
> = {
  love: { color: "#db2777", shape: "circle", label: STAGE_LABELS.love },
  like: { color: "#16a34a", shape: "circle", label: STAGE_LABELS.like },
  indifferent: {
    color: "#64748b",
    shape: "ring",
    label: STAGE_LABELS.indifferent,
  },
  dislike: { color: "#ea580c", shape: "square", label: STAGE_LABELS.dislike },
  hate: { color: "#b91c1c", shape: "square", label: STAGE_LABELS.hate },
  mixed: { color: "#7c3aed", shape: "diamond", label: STAGE_LABELS.mixed },
  unknown: { color: "#94a3b8", shape: "ring", label: STAGE_LABELS.unknown },
  unset: { color: "#cbd5e1", shape: "ring", label: "Not set" },
};

export function FeelingMark({
  feeling,
  x,
  y,
  r = 5,
}: {
  feeling: FeelingKey;
  x: number;
  y: number;
  r?: number;
}): ReactElement {
  const s = FEELING_STYLE[feeling];
  switch (s.shape) {
    case "square":
      return (
        <rect
          x={x - r}
          y={y - r}
          width={r * 2}
          height={r * 2}
          fill={s.color}
          stroke="#fff"
          strokeWidth={1}
        />
      );
    case "diamond":
      return (
        <polygon
          points={`${x},${y - r * 1.3} ${x + r * 1.3},${y} ${x},${y + r * 1.3} ${x - r * 1.3},${y}`}
          fill={s.color}
          stroke="#fff"
          strokeWidth={1}
        />
      );
    case "ring":
      return (
        <circle
          cx={x}
          cy={y}
          r={r - 1}
          fill="none"
          stroke={s.color}
          strokeWidth={2}
        />
      );
    default:
      return (
        <circle
          cx={x}
          cy={y}
          r={r}
          fill={s.color}
          stroke="#fff"
          strokeWidth={1}
        />
      );
  }
}

export function FeelingsLegend({
  counts,
}: {
  counts?: Partial<Record<FeelingKey, number>>;
}) {
  return (
    <ul
      className="flex flex-wrap gap-x-4 gap-y-2 text-sm"
      aria-label="Legend: feelings"
    >
      {FEELING_KEYS.map((k) => (
        <li key={k} className="flex items-center gap-1.5">
          <svg width="14" height="14" aria-hidden="true">
            <FeelingMark feeling={k} x={7} y={7} r={5} />
          </svg>
          <span>
            {FEELING_STYLE[k].label}
            {counts ? ` (${counts[k] ?? 0})` : ""}
          </span>
        </li>
      ))}
    </ul>
  );
}

type Person = {
  id: string;
  name: string;
  levelId: string;
} & RelationshipProfile;

/**
 * Map of the user's circles with each person coloured by feeling (item 101).
 * Placement is the user's own circle; nothing is inferred.
 */
export function FeelingsMap({
  people,
  levels,
}: {
  people: ReadonlyArray<Person>;
  levels: ReadonlyArray<Level>;
}) {
  const size = 420;
  const c = size / 2;
  const ringStep = 190 / levels.length;
  const placed = people.filter(countsInCircles);
  const overlay = people.filter((p) => p.overlay === true);
  const counts: Partial<Record<FeelingKey, number>> = {};
  for (const p of placed) {
    const k = p.stage ?? "unset";
    counts[k] = (counts[k] ?? 0) + 1;
  }
  const golden = Math.PI * (3 - Math.sqrt(5));
  const dots: ReactElement[] = [];
  levels.forEach((level, li) => {
    const inLayer = placed.filter((p) => p.levelId === level.id);
    const inner = li * ringStep + 6;
    const outer = (li + 1) * ringStep - 6;
    inLayer.forEach((p, i) => {
      const t = inLayer.length === 1 ? 0.5 : (i % 7) / 6;
      const radius = inner + (outer - inner) * t;
      const angle = i * golden + li;
      const x = c + radius * Math.cos(angle);
      const y = c + radius * Math.sin(angle);
      dots.push(
        <g key={p.id}>
          <title>{`${p.name}: ${FEELING_STYLE[p.stage ?? "unset"].label}, ${level.name}`}</title>
          <FeelingMark
            feeling={p.stage ?? "unset"}
            x={x}
            y={y}
            r={inLayer.length > 200 ? 2.5 : 4.5}
          />
        </g>,
      );
    });
  });
  overlay.forEach((p, i) => {
    const angle = (i / Math.max(1, overlay.length)) * Math.PI * 2;
    const x = c + 203 * Math.cos(angle);
    const y = c + 203 * Math.sin(angle);
    dots.push(
      <g key={`o-${p.id}`}>
        <title>{`${p.name}: ${FEELING_STYLE[p.stage ?? "unset"].label}, on the overlay`}</title>
        <FeelingMark feeling={p.stage ?? "unset"} x={x} y={y} r={5} />
      </g>,
    );
  });
  const summary = FEELING_KEYS.filter((k) => counts[k])
    .map((k) => `${counts[k]} ${FEELING_STYLE[k].label.toLowerCase()}`)
    .join(", ");

  return (
    <figure className="space-y-3" data-testid="feelings-map">
      <svg
        viewBox={`0 0 ${size} ${size}`}
        className="mx-auto w-full max-w-md"
        role="img"
        aria-labelledby="fm-title fm-desc"
      >
        <title id="fm-title">Your circles coloured by feeling</title>
        <desc id="fm-desc">
          {placed.length} people placed in {levels.length} circles
          {summary ? `: ${summary}` : ""}.
          {overlay.length
            ? ` ${overlay.length} on the overlay ring outside the circles.`
            : ""}
        </desc>
        {overlay.length > 0 && (
          <circle
            cx={c}
            cy={c}
            r={203}
            fill="none"
            stroke="#a78bfa"
            strokeDasharray="4 4"
          />
        )}
        {[...levels].reverse().map((level, ri) => {
          const li = levels.length - 1 - ri;
          return (
            <circle
              key={level.id}
              cx={c}
              cy={c}
              r={(li + 1) * ringStep}
              fill={
                li % 2 ? "rgba(148,163,184,0.10)" : "rgba(148,163,184,0.18)"
              }
              stroke="rgba(100,116,139,0.5)"
            />
          );
        })}
        {levels.map((level, li) => (
          <text
            key={`t-${level.id}`}
            x={c}
            y={c - (li + 1) * ringStep + 12}
            textAnchor="middle"
            className="fill-gray-600 dark:fill-gray-300"
            fontSize="10"
          >
            {level.name}
          </text>
        ))}
        {dots}
      </svg>
      <figcaption className="space-y-2">
        <FeelingsLegend counts={counts} />
        <p className="text-xs text-gray-600 dark:text-gray-400">
          Each mark is one person in the circle you chose. Colour and shape show
          your feeling; position within a ring carries no meaning.
          {overlay.length > 0 && " The dashed ring is your overlay."} Excluded
          and no-contact people are not shown.
        </p>
      </figcaption>
    </figure>
  );
}

/** Importance (x) against voluntary contact per month (y) (item 102). */
export function ImportanceContactScatter({
  points,
  nameOf,
}: {
  points: ScatterPoint[];
  nameOf: (id: string) => string;
}) {
  if (points.length < 3) {
    return (
      <p className="text-sm text-gray-700 dark:text-gray-300">
        Needs at least 3 people with an importance rating and logged
        interactions (you have {points.length}).
      </p>
    );
  }
  const W = 420;
  const H = 260;
  const pad = { l: 44, r: 12, t: 12, b: 36 };
  const maxY = Math.max(1, ...points.map((p) => p.voluntaryPerMonth));
  const x = (v: number) => pad.l + (v / 100) * (W - pad.l - pad.r);
  const y = (v: number) => H - pad.b - (v / maxY) * (H - pad.t - pad.b);
  return (
    <figure className="space-y-2" data-testid="importance-scatter">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full max-w-xl"
        role="img"
        aria-labelledby="sc-title sc-desc"
      >
        <title id="sc-title">Importance compared with voluntary contact</title>
        <desc id="sc-desc">
          {points.length} people. Horizontal axis importance 0 to 100; vertical
          axis voluntary contacts per month, 0 to {maxY}. A table version
          follows.
        </desc>
        <line
          x1={pad.l}
          y1={H - pad.b}
          x2={W - pad.r}
          y2={H - pad.b}
          stroke="#94a3b8"
        />
        <line
          x1={pad.l}
          y1={pad.t}
          x2={pad.l}
          y2={H - pad.b}
          stroke="#94a3b8"
        />
        {[0, 25, 50, 75, 100].map((v) => (
          <text
            key={v}
            x={x(v)}
            y={H - pad.b + 14}
            fontSize="10"
            textAnchor="middle"
            className="fill-gray-600 dark:fill-gray-300"
          >
            {v}
          </text>
        ))}
        {[0, maxY / 2, maxY].map((v) => (
          <text
            key={v}
            x={pad.l - 6}
            y={y(v) + 3}
            fontSize="10"
            textAnchor="end"
            className="fill-gray-600 dark:fill-gray-300"
          >
            {Math.round(v * 10) / 10}
          </text>
        ))}
        <text
          x={(W + pad.l) / 2}
          y={H - 4}
          fontSize="11"
          textAnchor="middle"
          className="fill-gray-700 dark:fill-gray-200"
        >
          Importance to you
        </text>
        <text
          x={12}
          y={(H - pad.b) / 2}
          fontSize="11"
          textAnchor="middle"
          transform={`rotate(-90 12 ${(H - pad.b) / 2})`}
          className="fill-gray-700 dark:fill-gray-200"
        >
          Voluntary / month
        </text>
        {points.map((p) => (
          <g key={p.id}>
            <title>{`${nameOf(p.id)}: importance ${p.importance}, ${p.voluntaryPerMonth} voluntary contacts a month`}</title>
            <FeelingMark
              feeling={p.stage ?? "unset"}
              x={x(p.importance)}
              y={y(p.voluntaryPerMonth)}
              r={5}
            />
          </g>
        ))}
      </svg>
      <details>
        <summary className="min-h-[44px] cursor-pointer py-3 text-sm">
          Show as a table
        </summary>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left">
              <th scope="col">Person</th>
              <th scope="col">Importance</th>
              <th scope="col">Voluntary / month</th>
              <th scope="col">Feeling</th>
            </tr>
          </thead>
          <tbody>
            {points.map((p) => (
              <tr key={p.id}>
                <th scope="row" className="font-normal">
                  {nameOf(p.id)}
                </th>
                <td>{p.importance}</td>
                <td>{p.voluntaryPerMonth}</td>
                <td>{FEELING_STYLE[p.stage ?? "unset"].label}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </details>
      <p className="text-xs text-gray-600 dark:text-gray-400">
        Last 90 days, voluntary contact only. A point far from the others is not
        a problem in itself: low contact can be a choice.
      </p>
    </figure>
  );
}

/** Circles x feelings counts (item 102). */
export function LayerFeelingMatrix({
  people,
  levels,
}: {
  people: ReadonlyArray<Person>;
  levels: ReadonlyArray<Level>;
}) {
  const m = layerFeelingMatrix(
    people,
    levels.map((l) => l.id),
  );
  const max = Math.max(
    1,
    ...levels.flatMap((l) => FEELING_KEYS.map((k) => m[l.id][k])),
  );
  return (
    <div className="overflow-x-auto" data-testid="layer-feeling-matrix">
      <table className="w-full min-w-[560px] border-collapse text-sm">
        <caption className="mb-2 text-left text-xs text-gray-600 dark:text-gray-400">
          Number of people in each circle by feeling. Darker cells hold more
          people.
        </caption>
        <thead>
          <tr>
            <th scope="col" className="p-1 text-left">
              Circle
            </th>
            {FEELING_KEYS.map((k) => (
              <th key={k} scope="col" className="p-1 text-center font-medium">
                {FEELING_STYLE[k].label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {levels.map((l) => (
            <tr key={l.id}>
              <th scope="row" className="p-1 text-left font-medium">
                {l.name}
              </th>
              {FEELING_KEYS.map((k) => {
                const v = m[l.id][k];
                const a = v === 0 ? 0 : 0.12 + 0.6 * (v / max);
                return (
                  <td
                    key={k}
                    className="border border-gray-200 p-1 text-center tabular-nums dark:border-gray-700"
                    style={{ backgroundColor: `rgba(59,130,246,${a})` }}
                  >
                    {v}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
