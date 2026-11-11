import { useMemo } from "react";
import { Users, Heart, Target, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { LiquidCard } from "@/components/ui/liquid-card";
import type { StoredContact } from "@/lib/contact-storage-service";
import type { Level } from "@/types/relationships";
import {
  STAGES,
  STAGE_LABELS,
  countsInCircles,
  overlayMembers,
} from "@/lib/relationship-model";

interface ContactStatsDashboardProps {
  contacts: StoredContact[];
  levels: Level[];
}

/**
 * Overview of what the user has entered. Only counts and distributions of
 * the user's own assignments and ratings; no scores are derived from
 * contact frequency (see docs/RELATIONSHIP_MODEL.md).
 */
export function ContactStatsDashboard({
  contacts,
  levels,
}: ContactStatsDashboardProps) {
  const stats = useMemo(() => {
    const inCircles = contacts.filter(countsInCircles);
    const byLevel = levels.map((level) => ({
      level,
      current: inCircles.filter((c) => c.levelId === level.id).length,
    }));
    const byStage = STAGES.map((s) => ({
      stage: s,
      n: contacts.filter((c) => c.stage === s).length,
    }));
    return {
      total: contacts.length,
      inCircles: inCircles.length,
      excluded: contacts.filter((c) => c.contactStatus === "excluded").length,
      noContact: contacts.filter((c) => c.contactStatus === "no-contact")
        .length,
      overlay: overlayMembers(contacts).length,
      byLevel,
      byStage,
      stageUnset: contacts.filter((c) => !c.stage).length,
    };
  }, [contacts, levels]);

  const tiles = [
    { label: "People", value: stats.total, icon: Users },
    { label: "Placed in circles", value: stats.inCircles, icon: Target },
    {
      label: "Excluded or no contact",
      value: stats.excluded + stats.noContact,
      icon: User,
    },
    { label: "On the overlay", value: stats.overlay, icon: Heart },
  ];

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

      <LiquidCard>
        <h3 className="mb-1 text-lg font-semibold">Your circles</h3>
        <p className="mb-4 text-sm text-gray-600 dark:text-gray-300">
          People you placed in each layer, next to its typical size. The sizes
          are rough averages, not targets. Excluded, no-contact and overlay
          people are not counted.
        </p>
        <ul className="space-y-3">
          {stats.byLevel.map(({ level, current }) => (
            <li key={level.id}>
              <div className="mb-1 flex items-center justify-between text-sm">
                <span className={`font-medium ${level.textColor}`}>
                  {level.name}
                </span>
                <Badge variant="secondary">
                  {current} / about {level.count}
                </Badge>
              </div>
              <div
                className="h-2 w-full rounded-full bg-gray-200 dark:bg-gray-700"
                role="progressbar"
                aria-label={`${level.name}: ${current} of about ${level.count}`}
                aria-valuemin={0}
                aria-valuemax={level.count}
                aria-valuenow={Math.min(current, level.count)}
              >
                <div
                  className={`h-2 rounded-full ${level.color}`}
                  style={{
                    width: `${Math.min(100, (current / level.count) * 100)}%`,
                  }}
                />
              </div>
            </li>
          ))}
        </ul>
      </LiquidCard>

      <LiquidCard>
        <h3 className="mb-1 text-lg font-semibold">Feelings</h3>
        <p className="mb-4 text-sm text-gray-600 dark:text-gray-300">
          How you described your feelings towards each person. Feelings are kept
          separate from importance and from the circle you chose.
        </p>
        <dl className="grid grid-cols-2 gap-2 text-sm sm:grid-cols-4">
          {stats.byStage.map(({ stage, n }) => (
            <div key={stage} className="rounded-md border p-3">
              <dt>{STAGE_LABELS[stage]}</dt>
              <dd className="text-xl font-bold tabular-nums">{n}</dd>
            </div>
          ))}
          <div className="rounded-md border p-3">
            <dt>Not set</dt>
            <dd className="text-xl font-bold tabular-nums">
              {stats.stageUnset}
            </dd>
          </div>
        </dl>
      </LiquidCard>
    </div>
  );
}
