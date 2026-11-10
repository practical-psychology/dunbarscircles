import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { RadialDiagram } from "@/components/radial-diagram";
import { Eye } from "lucide-react";
import PageLayout from "../components/PageLayout";
import { dunbarLevels } from "../data/dunbarLevels";
import { CONTACTS_CHANGED_EVENT } from "@/lib/contact-events";

type Level = {
  id: string;
  name: string;
  count: number;
  description?: string;
  contactFrequency?: string;
  digitalParallel?: string;
  maintenanceCost?: string;
  color?: string;
  textColor?: string;
  bgColor?: string;
  category?: string;
  order?: number;
};

export default function RadialPage() {
  const [levels, setLevels] = useState<Level[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Level definitions ship with the app (src/data/dunbarLevels.ts); counts
    // come from the browser contact store, the app's single source of truth.
    const load = () => {
      try {
        let stored: Array<{ levelId?: string; id?: string }> = [];
        try {
          const raw =
            localStorage.getItem("yakw_contacts") ??
            sessionStorage.getItem("yakw_contacts");
          const parsed = raw ? JSON.parse(raw) : [];
          stored = Array.isArray(parsed) ? parsed : [];
        } catch {
          stored = [];
        }
        const counts: Record<string, number> = {};
        for (const c of stored) {
          const key = c.levelId || "recognition-group";
          counts[key] = (counts[key] || 0) + 1;
        }
        const hasContacts = stored.length > 0;
        setLevels(
          dunbarLevels.map((lvl, order) => ({
            ...lvl,
            order,
            // With no contacts yet, show the typical layer sizes instead.
            count: hasContacts ? (counts[lvl.id] ?? 0) : lvl.count,
          })),
        );
        setError(null);
      } catch (e) {
        console.error("Failed to load contacts for radial view", e);
        setError(e instanceof Error ? e.message : String(e));
        setLevels([]);
      } finally {
        setLoading(false);
      }
    };
    load();
    window.addEventListener(CONTACTS_CHANGED_EVENT, load);
    return () => window.removeEventListener(CONTACTS_CHANGED_EVENT, load);
  }, []);

  return (
    <PageLayout
      title="Radial View"
      description="Explore the concentric circles of social relationships with cognitive load visualization"
    >
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="w-5 h-5" />
            Interactive Radial Diagram
          </CardTitle>
          <CardDescription>
            Explore the concentric circles of social relationships with
            cognitive load visualization
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="py-8 text-gray-600">Loading…</div>
          ) : error ? (
            <div className="py-8 text-red-600">{error}</div>
          ) : (
            <RadialDiagram levels={levels as any} />
          )}
        </CardContent>
      </Card>
    </PageLayout>
  );
}
