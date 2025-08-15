import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { dunbarLevels } from "@/data/dunbarLevels";
import { Users, Clock, Brain } from "lucide-react";
import { cn } from "@/lib/utils";

interface CircleSelectorProps {
  selectedLevelId: string;
  onLevelSelect: (levelId: string) => void;
  error?: string;
  disabled?: boolean;
  showDescription?: boolean;
}

export function CircleSelector({
  selectedLevelId,
  onLevelSelect,
  error,
  disabled = false,
  showDescription = true,
}: CircleSelectorProps) {
  const getContactFrequencyInfo = (levelId: string) => {
    const frequencyMap: Record<string, { days: string; description: string }> =
      {
        "inner-circle": { days: "1-7", description: "Daily to weekly contact" },
        "sympathy-group": {
          days: "3-14",
          description: "Few times a week to bi-weekly",
        },
        "affinity-group": {
          days: "14-45",
          description: "Bi-weekly to monthly",
        },
        "active-network": {
          days: "30-120",
          description: "Monthly to quarterly",
        },
        "recognition-group": {
          days: "90-365",
          description: "Quarterly to yearly",
        },
      };
    return (
      frequencyMap[levelId] || { days: "30", description: "Monthly contact" }
    );
  };

  const getMentalLoadInfo = (levelId: string) => {
    const loadMap: Record<string, { percentage: number; description: string }> =
      {
        "inner-circle": {
          percentage: 95,
          description: "Very high emotional investment",
        },
        "sympathy-group": {
          percentage: 80,
          description: "High emotional investment",
        },
        "affinity-group": {
          percentage: 60,
          description: "Moderate emotional investment",
        },
        "active-network": {
          percentage: 40,
          description: "Low emotional investment",
        },
        "recognition-group": {
          percentage: 25,
          description: "Minimal emotional investment",
        },
      };
    return (
      loadMap[levelId] || { percentage: 50, description: "Moderate investment" }
    );
  };

  return (
    <div className="space-y-3">
      <Label className="text-base font-medium">
        Select Dunbar Circle <span className="text-red-500">*</span>
      </Label>

      <div className="grid grid-cols-1 gap-3">
        {dunbarLevels.map((level) => {
          const isSelected = selectedLevelId === level.id;
          const frequencyInfo = getContactFrequencyInfo(level.id);
          const mentalLoadInfo = getMentalLoadInfo(level.id);

          return (
            <Card
              key={level.id}
              className={cn(
                "cursor-pointer transition-all duration-200 hover:shadow-md",
                isSelected && "ring-2 ring-blue-500 shadow-lg",
                disabled && "opacity-50 cursor-not-allowed",
                error && !isSelected && "border-red-200",
              )}
              onClick={() => !disabled && onLevelSelect(level.id)}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div
                        className={cn("w-4 h-4 rounded-full", level.color)}
                      />
                      <h4 className="font-semibold text-lg">{level.name}</h4>
                      <Badge variant="secondary" className="text-sm">
                        {level.count} people
                      </Badge>
                    </div>

                    {showDescription && (
                      <p className="text-sm text-gray-600 mb-3">
                        {level.description}
                      </p>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-blue-500" />
                        <div>
                          <div className="font-medium">
                            Contact: {frequencyInfo.days} days
                          </div>
                          <div className="text-gray-500 text-xs">
                            {frequencyInfo.description}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Brain className="w-4 h-4 text-purple-500" />
                        <div>
                          <div className="font-medium">
                            Mental Load: {mentalLoadInfo.percentage}%
                          </div>
                          <div className="text-gray-500 text-xs">
                            {mentalLoadInfo.description}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-green-500" />
                        <div>
                          <div className="font-medium">
                            Typical Size: {level.count}
                          </div>
                          <div className="text-gray-500 text-xs">
                            {level.category === "intimate"
                              ? "Close relationships"
                              : level.category === "social"
                                ? "Social connections"
                                : "Extended network"}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {isSelected && (
                    <div className="ml-4">
                      <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center">
                        <div className="w-2 h-2 rounded-full bg-white" />
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {error && <p className="text-sm text-red-500 mt-2">{error}</p>}

      <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
        <h5 className="font-medium text-sm mb-2">💡 Circle Selection Tips:</h5>
        <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
          <li>
            • <strong>Inner Circle:</strong> Family and closest friends you talk
            to daily
          </li>
          <li>
            • <strong>Sympathy Group:</strong> Close friends you'd genuinely
            mourn losing
          </li>
          <li>
            • <strong>Affinity Group:</strong> People you'd invite to a large
            party
          </li>
          <li>
            • <strong>Active Network:</strong> Colleagues and acquaintances you
            know well
          </li>
          <li>
            • <strong>Recognition Group:</strong> People whose faces and names
            you remember
          </li>
        </ul>
      </div>
    </div>
  );
}
