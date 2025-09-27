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
import {
  ContactStorageService,
  type StoredContact,
} from "@/lib/contact-storage-service";

export default function RadialPage() {
  const [levels, setLevels] = useState(dunbarLevels);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const storage = ContactStorageService.getInstance();
        const res = await storage.readContacts();
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

          const computed = dunbarLevels.map((lvl) => ({
            ...lvl,
            count: counts[lvl.id] ?? 0,
          }));
          setLevels(computed);
        } else {
          // Fallback: keep predefined levels
          setLevels(dunbarLevels);
        }
      } catch (e) {
        console.error("Failed to load contacts for radial view", e);
        setLevels(dunbarLevels);
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
          ) : (
            <RadialDiagram levels={levels} />
          )}
        </CardContent>
      </Card>
    </PageLayout>
  );
}
