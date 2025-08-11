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

export default function RadialPage() {
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
          <RadialDiagram levels={dunbarLevels} />
        </CardContent>
      </Card>
    </PageLayout>
  );
}
