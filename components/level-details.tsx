import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Smartphone, DollarSign } from "lucide-react";

interface Level {
  id: string;
  name: string;
  count: number;
  description: string;
  contactFrequency: string;
  digitalParallel: string;
  maintenanceCost: string;
  color: string;
  textColor: string;
  bgColor: string;
  category: string;
}

interface LevelDetailsProps {
  levels: Level[];
  selectedLevel: string | null;
  onLevelSelect: (levelId: string | null) => void;
}

export function LevelDetails({
  levels,
  selectedLevel,
  onLevelSelect,
}: LevelDetailsProps) {
  const categories = [
    {
      id: "intimate",
      name: "Intimate Levels",
      range: "5-50 people",
      color: "text-red-600",
    },
    {
      id: "social",
      name: "Social Levels",
      range: "150-1,500 people",
      color: "text-green-600",
    },
    {
      id: "extended",
      name: "Extended Levels",
      range: "5,000-50,000 people",
      color: "text-purple-600",
    },
  ];

  return (
    <div className="space-y-8">
      {categories.map((category) => (
        <div key={category.id}>
          <div className="mb-4">
            <h2 className={`text-2xl font-bold ${category.color}`}>
              {category.name}
            </h2>
            <p className="text-gray-600">{category.range}</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {levels
              .filter((level) => level.category === category.id)
              .map((level) => (
                <Card
                  key={level.id}
                  className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
                    selectedLevel === level.id
                      ? "ring-2 ring-blue-500 shadow-lg"
                      : ""
                  }`}
                  onClick={() =>
                    onLevelSelect(selectedLevel === level.id ? null : level.id)
                  }
                >
                  <CardHeader className={level.bgColor}>
                    <div className="flex items-center justify-between">
                      <CardTitle className={`text-lg ${level.textColor}`}>
                        {level.name}
                      </CardTitle>
                      <Badge variant="secondary" className="text-lg font-bold">
                        {level.count.toLocaleString()}
                      </Badge>
                    </div>
                    <CardDescription className="text-gray-700">
                      {level.description}
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <div className="flex items-start gap-3">
                      <Clock className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <h4 className="font-medium text-sm">
                          Contact Frequency
                        </h4>
                        <p className="text-sm text-gray-600">
                          {level.contactFrequency}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <Smartphone className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <h4 className="font-medium text-sm">
                          Digital Parallel
                        </h4>
                        <p className="text-sm text-gray-600">
                          {level.digitalParallel}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <DollarSign className="w-5 h-5 text-orange-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <h4 className="font-medium text-sm">
                          Maintenance Cost
                        </h4>
                        <p className="text-sm text-gray-600">
                          {level.maintenanceCost}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        </div>
      ))}
    </div>
  );
}
