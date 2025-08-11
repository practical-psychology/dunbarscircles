import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { NetworkDiagram } from "@/components/network-diagram";
import { Eye } from "lucide-react";
import PageLayout from "../components/PageLayout";
import { dunbarLevels } from "../data/dunbarLevels";

export default function HomePage() {
  const [selectedLevel, setSelectedLevel] = useState<string | null>(null);

  return (
    <PageLayout
      title="Overview"
      description="Interactive network diagram and relationship category overview"
    >
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="w-5 h-5" />
            Interactive Network Diagram
          </CardTitle>
          <CardDescription>
            Click on any level to explore the details of that relationship
            category
          </CardDescription>
        </CardHeader>
        <CardContent>
          <NetworkDiagram
            levels={dunbarLevels}
            selectedLevel={selectedLevel}
            onLevelSelect={setSelectedLevel}
          />
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-red-600">Intimate Levels</CardTitle>
            <CardDescription>5-50 people</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">
              High emotional investment, frequent contact, and deep personal
              connections.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-green-600">Social Levels</CardTitle>
            <CardDescription>150-1,500 people</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">
              Meaningful relationships with moderate maintenance requirements.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-purple-600">Extended Levels</CardTitle>
            <CardDescription>5,000-50,000 people</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">
              Awareness and recognition with minimal active maintenance.
            </p>
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
}
