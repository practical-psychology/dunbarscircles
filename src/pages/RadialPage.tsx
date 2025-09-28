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
import type { StoredContact } from "@/lib/contact-storage";
import { DatabaseService } from "@/lib/database-service";
import { db } from "@/firebase-config";
import { collection, getDocs, orderBy, query } from "firebase/firestore";

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
    const load = async () => {
      setLoading(true);
      try {
        // 1) Load level definitions from Firestore (fully dynamic)
        let fetchedLevels: Level[] = [];
        if (db) {
          const q = query(
            collection(db, "relationship_levels"),
            orderBy("order", "asc"),
          );
          const snap = await getDocs(q);
          fetchedLevels = snap.docs.map((d) => ({
            id: d.id,
            ...(d.data() as Omit<Level, "id" | "count">),
            count: 0,
          }));
        }

        const res = await DatabaseService.getUserContacts();
        if (res.success && res.data) {
          const contacts = res.data as StoredContact[];
          // Compute counts per level based on user's contacts
          const counts: Record<string, number> = contacts.reduce(
            (acc, c) => {
              const key = c.levelId || "recognition-group";
              acc[key] = (acc[key] || 0) + 1;
              return acc;
            },
            {} as Record<string, number>,
          );

          // Merge Firestore level definitions with counts. If a contact references a
          // level that doesn't exist in definitions, include it as a minimal entry
          // to keep everything dynamic (name derived from id).
          const levelIdsFromContacts = Object.keys(counts);
          const definedIds = new Set(fetchedLevels.map((l) => l.id));
          const missingLevels: Level[] = levelIdsFromContacts
            .filter((id) => !definedIds.has(id))
            .map((id) => ({
              id,
              name: id
                .split("-")
                .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
                .join(" "),
              count: 0,
            }));

          const combined = [...fetchedLevels, ...missingLevels].map((lvl) => ({
            ...lvl,
            count: counts[lvl.id] ?? 0,
          }));

          // Sort by provided order first, then by name to keep stability
          combined.sort((a, b) => {
            const ao = a.order ?? 9999;
            const bo = b.order ?? 9999;
            if (ao !== bo) return ao - bo;
            return a.name.localeCompare(b.name);
          });

          setLevels(combined);
        } else {
          // No contacts found; rely on level definitions only
          setLevels(fetchedLevels);
        }
      } catch (e) {
        console.error("Failed to load contacts for radial view", e);
        setError(e instanceof Error ? e.message : String(e));
        setLevels([]);
      } finally {
        setLoading(false);
      }
    };
    load();
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
            <div className="py-8 text-gray-600">Loading from cloud...</div>
          ) : error ? (
            <div className="py-8 text-red-600">{error}</div>
          ) : levels.length === 0 ? (
            <div className="py-8 text-gray-600">
              No level definitions found. Please add documents in the
              <code className="mx-1">relationship_levels</code> collection in
              Firestore with fields like id, name, description,
              contactFrequency, color, etc.
            </div>
          ) : (
            <RadialDiagram levels={levels as any} />
          )}
        </CardContent>
      </Card>
    </PageLayout>
  );
}
