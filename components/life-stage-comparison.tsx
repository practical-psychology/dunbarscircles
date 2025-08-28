import type React from "react";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Progress } from "@/components/ui/progress";
import {
  Clock,
  GraduationCap,
  Briefcase,
  Heart,
  Baby,
  Home,
  Sunset,
  PlayCircle,
  ArrowRight,
  TrendingUp,
  TrendingDown,
} from "lucide-react";

interface Level {
  id: string;
  name: string;
  count: number;
  color: string;
  textColor: string;
  bgColor: string;
}

interface LifeStage {
  id: string;
  name: string;
  ageRange: [number, number];
  icon: React.ReactNode;
  color: string;
  description: string;
  keyTransitions: string[];
  networkCharacteristics: {
    [levelId: string]: {
      percentage: number;
      examples: string[];
      importance: number;
    };
  };
}

interface LifeStageComparisonProps {
  levels: Level[];
}

const lifeStages: LifeStage[] = [
  {
    id: "childhood",
    name: "Childhood",
    ageRange: [0, 12],
    icon: <Baby className="w-5 h-5" />,
    color: "#FF6B9D",
    description: "Family-centered with emerging peer relationships",
    keyTransitions: [
      "Family bonding",
      "First friendships",
      "School socialization",
    ],
    networkCharacteristics: {
      "inner-circle": {
        percentage: 80,
        examples: ["Parents", "Siblings", "Grandparents"],
        importance: 95,
      },
      "sympathy-group": {
        percentage: 15,
        examples: ["Best friend", "Favorite teacher"],
        importance: 70,
      },
      "affinity-group": {
        percentage: 5,
        examples: ["Classmates", "Neighbors"],
        importance: 40,
      },
      "active-network": { percentage: 0, examples: [], importance: 10 },
      "recognition-group": { percentage: 0, examples: [], importance: 5 },
    },
  },
  {
    id: "adolescence",
    name: "Adolescence",
    ageRange: [13, 18],
    icon: <PlayCircle className="w-5 h-5" />,
    color: "#4ECDC4",
    description:
      "Peer relationships become central, family relationships shift",
    keyTransitions: [
      "Peer group formation",
      "Identity exploration",
      "First romantic relationships",
    ],
    networkCharacteristics: {
      "inner-circle": {
        percentage: 40,
        examples: ["Best friends", "Romantic partner"],
        importance: 90,
      },
      "sympathy-group": {
        percentage: 35,
        examples: ["Close friends", "Siblings"],
        importance: 85,
      },
      "affinity-group": {
        percentage: 20,
        examples: ["School friends", "Team members"],
        importance: 70,
      },
      "active-network": {
        percentage: 5,
        examples: ["Classmates", "Teachers"],
        importance: 40,
      },
      "recognition-group": { percentage: 0, examples: [], importance: 20 },
    },
  },
  {
    id: "college",
    name: "College Years",
    ageRange: [18, 25],
    icon: <GraduationCap className="w-5 h-5" />,
    color: "#45B7D1",
    description:
      "Network expansion and exploration, forming lifelong friendships",
    keyTransitions: [
      "Independence from family",
      "Diverse social exposure",
      "Career preparation",
    ],
    networkCharacteristics: {
      "inner-circle": {
        percentage: 25,
        examples: ["Roommates", "Best friends", "Partner"],
        importance: 85,
      },
      "sympathy-group": {
        percentage: 30,
        examples: ["Close college friends", "Study group"],
        importance: 80,
      },
      "affinity-group": {
        percentage: 30,
        examples: ["Classmates", "Club members", "Fraternity/Sorority"],
        importance: 75,
      },
      "active-network": {
        percentage: 15,
        examples: ["Professors", "Internship contacts"],
        importance: 60,
      },
      "recognition-group": { percentage: 0, examples: [], importance: 30 },
    },
  },
  {
    id: "early-career",
    name: "Early Career",
    ageRange: [25, 35],
    icon: <Briefcase className="w-5 h-5" />,
    color: "#96CEB4",
    description: "Professional network building, relationship consolidation",
    keyTransitions: [
      "Career establishment",
      "Serious relationships",
      "Geographic mobility",
    ],
    networkCharacteristics: {
      "inner-circle": {
        percentage: 20,
        examples: ["Spouse/Partner", "Best friends"],
        importance: 90,
      },
      "sympathy-group": {
        percentage: 25,
        examples: ["Close work friends", "College friends"],
        importance: 75,
      },
      "affinity-group": {
        percentage: 25,
        examples: ["Colleagues", "Neighbors", "Hobby groups"],
        importance: 70,
      },
      "active-network": {
        percentage: 25,
        examples: ["Professional contacts", "Alumni network"],
        importance: 80,
      },
      "recognition-group": {
        percentage: 5,
        examples: ["Industry contacts", "LinkedIn connections"],
        importance: 50,
      },
    },
  },
  {
    id: "family-building",
    name: "Family Building",
    ageRange: [30, 45],
    icon: <Home className="w-5 h-5" />,
    color: "#FFEAA7",
    description: "Family-focused with parent networks, career advancement",
    keyTransitions: [
      "Marriage/Partnership",
      "Having children",
      "Career advancement",
    ],
    networkCharacteristics: {
      "inner-circle": {
        percentage: 30,
        examples: ["Spouse", "Children", "Parents"],
        importance: 95,
      },
      "sympathy-group": {
        percentage: 25,
        examples: ["Close family friends", "Parent friends"],
        importance: 80,
      },
      "affinity-group": {
        percentage: 20,
        examples: ["School parents", "Neighbors"],
        importance: 65,
      },
      "active-network": {
        percentage: 20,
        examples: ["Work colleagues", "Professional network"],
        importance: 75,
      },
      "recognition-group": {
        percentage: 5,
        examples: ["Community members", "Service providers"],
        importance: 40,
      },
    },
  },
  {
    id: "midlife",
    name: "Midlife",
    ageRange: [45, 65],
    icon: <Heart className="w-5 h-5" />,
    color: "#DDA0DD",
    description: "Peak professional networks, community involvement",
    keyTransitions: [
      "Career peak",
      "Children leaving home",
      "Community leadership",
    ],
    networkCharacteristics: {
      "inner-circle": {
        percentage: 25,
        examples: ["Spouse", "Adult children", "Lifelong friends"],
        importance: 90,
      },
      "sympathy-group": {
        percentage: 20,
        examples: ["Close friends", "Siblings"],
        importance: 75,
      },
      "affinity-group": {
        percentage: 25,
        examples: ["Community groups", "Professional peers"],
        importance: 70,
      },
      "active-network": {
        percentage: 25,
        examples: ["Professional network", "Community contacts"],
        importance: 80,
      },
      "recognition-group": {
        percentage: 5,
        examples: ["Industry leaders", "Community figures"],
        importance: 60,
      },
    },
  },
  {
    id: "retirement",
    name: "Retirement",
    ageRange: [65, 100],
    icon: <Sunset className="w-5 h-5" />,
    color: "#FFB347",
    description: "Network consolidation, focus on close relationships",
    keyTransitions: ["Career end", "Health considerations", "Legacy focus"],
    networkCharacteristics: {
      "inner-circle": {
        percentage: 40,
        examples: ["Spouse", "Adult children", "Grandchildren"],
        importance: 95,
      },
      "sympathy-group": {
        percentage: 30,
        examples: ["Lifelong friends", "Close family"],
        importance: 85,
      },
      "affinity-group": {
        percentage: 20,
        examples: ["Retirement community", "Hobby groups"],
        importance: 60,
      },
      "active-network": {
        percentage: 10,
        examples: ["Former colleagues", "Community members"],
        importance: 50,
      },
      "recognition-group": { percentage: 0, examples: [], importance: 30 },
    },
  },
];

export function LifeStageComparison({ levels }: LifeStageComparisonProps) {
  const [currentAge, setCurrentAge] = useState([25]);

  const [animationSpeed] = useState(1);
  const [isAnimating, setIsAnimating] = useState(false);
  const [comparisonMode, setComparisonMode] = useState<"single" | "comparison">(
    "single",
  );

  const getCurrentStage = (age: number) => {
    return (
      lifeStages.find(
        (stage) => age >= stage.ageRange[0] && age <= stage.ageRange[1],
      ) || lifeStages[0]
    );
  };

  const currentStage = getCurrentStage(currentAge[0]);

  useEffect(() => {
    if (isAnimating) {
      const interval = setInterval(() => {
        setCurrentAge((prev) => {
          const newAge = prev[0] + animationSpeed;
          if (newAge >= 80) {
            setIsAnimating(false);
            return [80];
          }
          return [newAge];
        });
      }, 200);
      return () => clearInterval(interval);
    }
  }, [isAnimating, animationSpeed]);

  const getNetworkTransition = (
    fromStage: LifeStage,
    toStage: LifeStage,
    levelId: string,
  ) => {
    const fromPercentage =
      fromStage.networkCharacteristics[levelId]?.percentage || 0;
    const toPercentage =
      toStage.networkCharacteristics[levelId]?.percentage || 0;
    const change = toPercentage - fromPercentage;

    return {
      change,
      direction: change > 0 ? "increase" : change < 0 ? "decrease" : "stable",
      magnitude: Math.abs(change),
    };
  };

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Life Stage Network Evolution</h2>
          <p className="text-gray-600">
            Explore how social networks change across different life stages
          </p>
        </div>

        <div className="flex items-center gap-4">
          <Button
            variant={isAnimating ? "destructive" : "default"}
            onClick={() => setIsAnimating(!isAnimating)}
            className="flex items-center gap-2"
          >
            <Clock className="w-4 h-4" />
            {isAnimating ? "Stop Animation" : "Animate Lifecycle"}
          </Button>

          <Button
            variant="outline"
            onClick={() =>
              setComparisonMode(
                comparisonMode === "single" ? "comparison" : "single",
              )
            }
          >
            {comparisonMode === "single" ? "Compare Stages" : "Single View"}
          </Button>
        </div>
      </div>

      {/* Age Slider */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Life Stage Timeline
          </CardTitle>
          <CardDescription>
            Drag the slider or use animation to explore network changes across
            ages
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Age: {currentAge[0]}</span>
              <div className="flex items-center gap-2">
                <div style={{ color: currentStage.color }}>
                  {currentStage.icon}
                </div>
                <Badge
                  style={{
                    backgroundColor: currentStage.color,
                    color: "white",
                  }}
                >
                  {currentStage.name}
                </Badge>
              </div>
            </div>

            <Slider
              value={currentAge}
              onValueChange={setCurrentAge}
              max={80}
              min={0}
              step={1}
              className="w-full"
              disabled={isAnimating}
            />

            {/* Life stage markers */}
            <div className="relative h-8">
              {lifeStages.map((stage) => (
                <div
                  key={stage.id}
                  className="absolute flex flex-col items-center cursor-pointer"
                  style={{
                    left: `${(stage.ageRange[0] / 80) * 100}%`,
                    transform: "translateX(-50%)",
                  }}
                  onClick={() => setCurrentAge([stage.ageRange[0]])}
                >
                  <div
                    className="w-3 h-3 rounded-full border-2 border-white shadow-md"
                    style={{ backgroundColor: stage.color }}
                  />
                  <span
                    className="text-xs mt-1 whitespace-nowrap"
                    style={{ color: stage.color }}
                  >
                    {stage.name}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Current Stage Details */}
      <Card style={{ borderColor: currentStage.color, borderWidth: "2px" }}>
        <CardHeader style={{ backgroundColor: `${currentStage.color}20` }}>
          <CardTitle className="flex items-center gap-2">
            <div style={{ color: currentStage.color }}>{currentStage.icon}</div>
            {currentStage.name} ({currentStage.ageRange[0]}-
            {currentStage.ageRange[1]} years)
          </CardTitle>
          <CardDescription>{currentStage.description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-medium mb-2">Key Life Transitions</h4>
            <div className="flex flex-wrap gap-2">
              {currentStage.keyTransitions.map((transition, index) => (
                <div key={index}>
                  <Badge variant="outline">{transition}</Badge>
                </div>
              ))}
            </div>
          </div>

          {/* Network Distribution */}
          <div>
            <h4 className="font-medium mb-3">Social Network Distribution</h4>
            <div className="space-y-3">
              {levels.slice(0, 5).map((level) => {
                const characteristic =
                  currentStage.networkCharacteristics[level.id];
                if (!characteristic || characteristic.percentage === 0)
                  return null;

                return (
                  <div key={level.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-3 h-3 ${level.color} rounded-full`}
                        ></div>
                        <span className="text-sm font-medium">
                          {level.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm">
                          {characteristic.percentage}%
                        </span>
                        <div className="flex items-center">
                          {Array.from({ length: 5 }, (_, i) => (
                            <div
                              key={i}
                              className={`w-2 h-2 rounded-full mr-1 ${
                                i < characteristic.importance / 20
                                  ? level.color
                                  : "bg-gray-200"
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                    </div>

                    <Progress
                      value={characteristic.percentage}
                      className="h-2"
                    />

                    <div className="flex flex-wrap gap-1">
                      {characteristic.examples.map((example, index) => (
                        <div key={index}>
                          <Badge variant="secondary" className="text-xs">
                            {example}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stage Transitions */}
      {currentAge[0] < 75 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ArrowRight className="w-5 h-5" />
              Upcoming Network Changes
            </CardTitle>
            <CardDescription>
              How your social network will evolve in the next life stage
            </CardDescription>
          </CardHeader>
          <CardContent>
            {(() => {
              const nextStage = lifeStages.find(
                (stage) => stage.ageRange[0] > currentAge[0],
              );
              if (!nextStage) return null;

              return (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-4">
                    <span>Transitioning to:</span>
                    <div className="flex items-center gap-2">
                      <div style={{ color: nextStage.color }}>
                        {nextStage.icon}
                      </div>
                      <Badge
                        style={{
                          backgroundColor: nextStage.color,
                          color: "white",
                        }}
                      >
                        {nextStage.name}
                      </Badge>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {levels.slice(0, 5).map((level) => {
                      const transition = getNetworkTransition(
                        currentStage,
                        nextStage,
                        level.id,
                      );
                      if (transition.magnitude === 0) return null;

                      return (
                        <div
                          key={level.id}
                          className="p-3 bg-gray-50 rounded-lg"
                        >
                          <div className="flex items-center gap-2 mb-2">
                            <div
                              className={`w-3 h-3 ${level.color} rounded-full`}
                            ></div>
                            <span className="text-sm font-medium">
                              {level.name}
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            {transition.direction === "increase" ? (
                              <TrendingUp className="w-4 h-4 text-green-500" />
                            ) : (
                              <TrendingDown className="w-4 h-4 text-red-500" />
                            )}
                            <span
                              className={`text-sm font-medium ${
                                transition.direction === "increase"
                                  ? "text-green-600"
                                  : "text-red-600"
                              }`}
                            >
                              {transition.direction === "increase" ? "+" : ""}
                              {transition.change}%
                            </span>
                          </div>

                          <p className="text-xs text-gray-600 mt-1">
                            {transition.direction === "increase"
                              ? "Growing importance"
                              : "Declining focus"}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })()}
          </CardContent>
        </Card>
      )}

      {/* Small Multiples Comparison */}
      {comparisonMode === "comparison" && (
        <Card>
          <CardHeader>
            <CardTitle>Life Stage Network Comparison</CardTitle>
            <CardDescription>
              Compare network distributions across all life stages
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {lifeStages.map((stage) => (
                <div
                  key={stage.id}
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    stage.id === currentStage.id
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                  onClick={() => setCurrentAge([stage.ageRange[0]])}
                >
                  <div className="flex items-center gap-2 mb-3">
                    <div style={{ color: stage.color }}>{stage.icon}</div>
                    <h4 className="text-sm font-medium">{stage.name}</h4>
                  </div>

                  <div className="space-y-2">
                    {levels.slice(0, 4).map((level) => {
                      const characteristic =
                        stage.networkCharacteristics[level.id];
                      if (!characteristic || characteristic.percentage === 0)
                        return null;

                      return (
                        <div key={level.id} className="flex items-center gap-2">
                          <div
                            className={`w-2 h-2 ${level.color} rounded-full`}
                          ></div>
                          <div className="flex-1 bg-gray-200 rounded-full h-1">
                            <div
                              className={`h-1 rounded-full ${level.color}`}
                              style={{ width: `${characteristic.percentage}%` }}
                            />
                          </div>
                          <span className="text-xs">
                            {characteristic.percentage}%
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
