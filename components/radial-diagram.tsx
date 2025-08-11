import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Brain, Users, Clock, Zap } from "lucide-react";

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

interface RadialDiagramProps {
  levels: Level[];
}

export function RadialDiagram({ levels }: RadialDiagramProps) {
  const [selectedLevel, setSelectedLevel] = useState<string | null>(null);
  const [hoveredLevel, setHoveredLevel] = useState<string | null>(null);
  const [zoomedLevel, setZoomedLevel] = useState<string | null>(null);
  const [animationPhase, setAnimationPhase] = useState(0);

  // Mental load calculations
  const getMentalLoad = (level: Level) => {
    const loadMap: { [key: string]: number } = {
      "inner-circle": 95,
      "sympathy-group": 80,
      "affinity-group": 60,
      "active-network": 40,
      "recognition-group": 25,
      "acquaintance-network": 15,
      "parasocial-familiar": 10,
      "cultural-recognition": 5,
      "awareness-network": 2,
    };
    return loadMap[level.id] || 0;
  };

  const getExampleRelationships = (levelId: string) => {
    const examples: { [key: string]: string[] } = {
      "inner-circle": [
        "Spouse/Partner",
        "Best Friend",
        "Parent",
        "Child",
        "Sibling",
      ],
      "sympathy-group": [
        "Close Work Friend",
        "College Roommate",
        "Neighbor",
        "Gym Buddy",
        "Book Club Friend",
      ],
      "affinity-group": [
        "Coworker",
        "High School Friend",
        "Cousin",
        "Tennis Partner",
        "Former Colleague",
      ],
      "active-network": [
        "LinkedIn Connection",
        "Conference Contact",
        "Friend of Friend",
        "Local Business Owner",
      ],
      "recognition-group": [
        "Barista at Coffee Shop",
        "Mailman",
        "Grocery Store Clerk",
        "Uber Driver",
      ],
      "acquaintance-network": [
        "Wedding Guest",
        "Conference Attendee",
        "Old Neighbor",
        "Customer",
      ],
      "parasocial-familiar": [
        "YouTuber",
        "Local News Anchor",
        "Coworker from Other Dept",
        "Instagram Influencer",
      ],
      "cultural-recognition": [
        "Local Politician",
        "Regional Celebrity",
        "Community Leader",
        "Viral Personality",
      ],
      "awareness-network": [
        "Minor Celebrity",
        "Industry Person",
        "Author",
        "Podcast Host",
      ],
    };
    return examples[levelId] || [];
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setAnimationPhase((prev) => (prev + 1) % 360);
    }, 50);
    return () => clearInterval(interval);
  }, []);

  const centerX = 400;
  const centerY = 300;
  const maxRadius = 280;

  return (
    <div className="space-y-6">
      {/* Mental Load Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Brain className="w-4 h-4" />
              Total Cognitive Load
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {levels.reduce((sum, level) => sum + getMentalLoad(level), 0)}%
            </div>
            <p className="text-xs text-gray-600">Mental bandwidth used</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Users className="w-4 h-4" />
              Total Network Size
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {levels
                .reduce((sum, level) => sum + level.count, 0)
                .toLocaleString()}
            </div>
            <p className="text-xs text-gray-600">Potential connections</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Zap className="w-4 h-4" />
              Active Maintenance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {levels.slice(0, 4).reduce((sum, level) => sum + level.count, 0)}
            </div>
            <p className="text-xs text-gray-600">
              Relationships requiring effort
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Radial Diagram */}
      <div className="flex gap-6">
        <div className="flex-1">
          <div className="relative w-full h-[600px] bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg border overflow-hidden">
            <svg width="100%" height="100%" viewBox="0 0 800 600">
              {/* Animated background rings */}
              {levels.map((level, index) => {
                const radius = (maxRadius / levels.length) * (index + 1);
                const opacity =
                  0.1 +
                  Math.sin((animationPhase + index * 40) * (Math.PI / 180)) *
                    0.05;
                return (
                  <circle
                    key={`bg-${level.id}`}
                    cx={centerX}
                    cy={centerY}
                    r={radius}
                    fill="none"
                    stroke={level.color.replace("bg-", "#")}
                    strokeWidth="1"
                    strokeOpacity={opacity}
                    strokeDasharray="5,5"
                  />
                );
              })}

              {/* Main rings */}
              {levels.map((level, index) => {
                const radius = (maxRadius / levels.length) * (index + 1);
                const prevRadius =
                  index > 0 ? (maxRadius / levels.length) * index : 0;
                const isSelected = selectedLevel === level.id;
                const isHovered = hoveredLevel === level.id;
                const isZoomed = zoomedLevel === level.id;

                // Add safety check for color
                const levelColor = level.color || "bg-gray-500";
                const safeColor = levelColor.replace("bg-", "#") || "#6b7280";

                return (
                  <g key={level.id}>
                    {/* Ring area */}
                    <circle
                      cx={centerX}
                      cy={centerY}
                      r={radius}
                      fill={safeColor}
                      fillOpacity={isHovered || isSelected ? 0.3 : 0.2}
                      stroke={safeColor}
                      strokeWidth={isSelected ? 4 : 2}
                      className="cursor-pointer transition-all duration-300"
                      onMouseEnter={() => setHoveredLevel(level.id)}
                      onMouseLeave={() => setHoveredLevel(null)}
                      onClick={() => {
                        setSelectedLevel(isSelected ? null : level.id);
                        setZoomedLevel(isZoomed ? null : level.id);
                      }}
                    />

                    {/* Inner circle to create ring effect */}
                    {index > 0 && (
                      <circle
                        cx={centerX}
                        cy={centerY}
                        r={prevRadius}
                        fill="white"
                        fillOpacity={0.9}
                        className="pointer-events-none"
                      />
                    )}

                    {/* Level labels */}
                    <text
                      x={centerX + radius - 20}
                      y={centerY - 10}
                      className="text-sm font-bold pointer-events-none"
                      fill={level.color.replace("bg-", "#")}
                    >
                      {level.count.toLocaleString()}
                    </text>
                    <text
                      x={centerX + radius - 20}
                      y={centerY + 5}
                      className="text-xs pointer-events-none"
                      fill={level.color.replace("bg-", "#")}
                    >
                      {level.name.split(" ")[0]}
                    </text>

                    {/* Mental load indicator */}
                    <rect
                      x={centerX + radius - 40}
                      y={centerY + 15}
                      width={30}
                      height={4}
                      fill="#e5e7eb"
                      rx={2}
                      className="pointer-events-none"
                    />
                    <rect
                      x={centerX + radius - 40}
                      y={centerY + 15}
                      width={(30 * getMentalLoad(level)) / 100}
                      height={4}
                      fill={level.color.replace("bg-", "#")}
                      rx={2}
                      className="pointer-events-none"
                    />
                  </g>
                );
              })}

              {/* Center point */}
              <circle
                cx={centerX}
                cy={centerY}
                r="25"
                fill="#1f2937"
                className="cursor-pointer"
              />
              <text
                x={centerX}
                y={centerY + 5}
                textAnchor="middle"
                className="text-sm fill-white font-bold"
              >
                YOU
              </text>
            </svg>

            {/* Hover tooltip */}
            {hoveredLevel && (
              <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-sm rounded-lg p-4 shadow-lg max-w-xs">
                {(() => {
                  const level = levels.find((l) => l.id === hoveredLevel);
                  if (!level) return null;
                  return (
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <div
                          className={`w-4 h-4 ${level.color} rounded-full`}
                        ></div>
                        <h3 className="font-semibold">{level.name}</h3>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Size:</span>
                          <Badge variant="secondary">
                            {level.count.toLocaleString()}
                          </Badge>
                        </div>
                        <div className="flex justify-between">
                          <span>Contact:</span>
                          <span className="text-gray-600">
                            {level.contactFrequency}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span>Mental Load:</span>
                          <div className="flex items-center gap-2">
                            <Progress
                              value={getMentalLoad(level)}
                              className="w-16 h-2"
                            />
                            <span className="text-xs">
                              {getMentalLoad(level)}%
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}
          </div>
        </div>

        {/* Side panel for selected level */}
        {selectedLevel && (
          <div className="w-80">
            <Card>
              <CardHeader>
                {(() => {
                  const level = levels.find((l) => l.id === selectedLevel);
                  if (!level) return null;
                  return (
                    <>
                      <CardTitle className="flex items-center gap-2">
                        <div
                          className={`w-4 h-4 ${level.color} rounded-full`}
                        ></div>
                        {level.name}
                      </CardTitle>
                      <CardDescription>{level.description}</CardDescription>
                    </>
                  );
                })()}
              </CardHeader>
              <CardContent className="space-y-4">
                {(() => {
                  const level = levels.find((l) => l.id === selectedLevel);
                  if (!level) return null;
                  const examples = getExampleRelationships(level.id);
                  return (
                    <>
                      <div>
                        <h4 className="font-medium mb-2 flex items-center gap-2">
                          <Brain className="w-4 h-4" />
                          Cognitive Load
                        </h4>
                        <div className="flex items-center gap-2">
                          <Progress
                            value={getMentalLoad(level)}
                            className="flex-1"
                          />
                          <span className="text-sm font-medium">
                            {getMentalLoad(level)}%
                          </span>
                        </div>
                        <p className="text-xs text-gray-600 mt-1">
                          {level.maintenanceCost}
                        </p>
                      </div>

                      <div>
                        <h4 className="font-medium mb-2 flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          Contact Pattern
                        </h4>
                        <p className="text-sm text-gray-600">
                          {level.contactFrequency}
                        </p>
                      </div>

                      <div>
                        <h4 className="font-medium mb-2 flex items-center gap-2">
                          <Users className="w-4 h-4" />
                          Example Relationships
                        </h4>
                        <div className="flex flex-wrap gap-1">
                          {examples.slice(0, 5).map((example, index) => (
                            <Badge
                              key={index}
                              variant="outline"
                              className="text-xs"
                            >
                              {example}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedLevel(null);
                          setZoomedLevel(null);
                        }}
                        className="w-full"
                      >
                        Close Details
                      </Button>
                    </>
                  );
                })()}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
