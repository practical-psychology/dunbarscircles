import { useMemo } from "react";
import { motion } from "framer-motion";
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Users,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Heart,
  Clock,
  Target,
  Activity,
  BarChart3,
  PieChart,
} from "lucide-react";
import { LiquidCard } from "@/components/ui/liquid-card";
import type { StoredContact } from "@/lib/contact-storage-service";
import type { Level } from "@/types/relationships";

interface ContactStatsDashboardProps {
  contacts: StoredContact[];
  levels: Level[];
}

interface LevelStats {
  level: Level;
  current: number;
  capacity: number;
  percentage: number;
  averageStrength: number;
  healthyContacts: number;
  overdueContacts: number;
  trend: "up" | "down" | "stable";
}

interface OverallStats {
  totalContacts: number;
  averageStrength: number;
  networkHealth: number;
  overdueContacts: number;
  strongRelationships: number;
  weakRelationships: number;
  recentlyAdded: number;
  platformDistribution: Record<string, number>;
}

export function ContactStatsDashboard({
  contacts,
  levels,
}: ContactStatsDashboardProps) {
  // Calculate level-specific statistics
  const levelStats: LevelStats[] = useMemo(() => {
    return levels.map((level) => {
      const levelContacts = contacts.filter((c) => c.levelId === level.id);
      const current = levelContacts.length;
      const capacity = level.count;
      const percentage = capacity > 0 ? (current / capacity) * 100 : 0;

      // Calculate average strength for this level
      const averageStrength =
        levelContacts.length > 0
          ? levelContacts.reduce((sum, c) => sum + c.strength, 0) /
            levelContacts.length
          : 0;

      // Calculate health metrics
      const healthyContacts = levelContacts.filter((contact) => {
        const daysSinceContact =
          (Date.now() - (contact.lastContact ?? new Date()).getTime()) /
          (1000 * 60 * 60 * 24);
        return daysSinceContact <= contact.contactFrequency * 1.5;
      }).length;

      const overdueContacts = current - healthyContacts;

      // Simple trend calculation (could be enhanced with historical data)
      const trend: "up" | "down" | "stable" =
        percentage > 80 ? "up" : percentage < 50 ? "down" : "stable";

      return {
        level,
        current,
        capacity,
        percentage,
        averageStrength,
        healthyContacts,
        overdueContacts,
        trend,
      };
    });
  }, [contacts, levels]);

  // Calculate overall statistics
  const overallStats: OverallStats = useMemo(() => {
    const totalContacts = contacts.length;

    const averageStrength =
      totalContacts > 0
        ? contacts.reduce((sum, c) => sum + c.strength, 0) / totalContacts
        : 0;

    // Calculate network health (percentage of contacts that are not overdue)
    const healthyContacts = contacts.filter((contact) => {
      const daysSinceContact =
        (Date.now() - (contact.lastContact ?? new Date()).getTime()) /
        (1000 * 60 * 60 * 24);
      return daysSinceContact <= contact.contactFrequency * 1.5;
    }).length;
    const networkHealth =
      totalContacts > 0 ? (healthyContacts / totalContacts) * 100 : 0;

    const overdueContacts = totalContacts - healthyContacts;

    // Strong vs weak relationships
    const strongRelationships = contacts.filter(
      (c) => c.strength >= 0.7,
    ).length;
    const weakRelationships = contacts.filter((c) => c.strength < 0.4).length;

    // Recently added (last 30 days)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const recentlyAdded = contacts.filter(
      (c) => c.createdAt > thirtyDaysAgo,
    ).length;

    // Platform distribution
    const platformDistribution: Record<string, number> = {};
    contacts.forEach((contact) => {
      platformDistribution[contact.platform] =
        (platformDistribution[contact.platform] || 0) + 1;
    });

    return {
      totalContacts,
      averageStrength,
      networkHealth,
      overdueContacts,
      strongRelationships,
      weakRelationships,
      recentlyAdded,
      platformDistribution,
    };
  }, [contacts]);

  const getHealthColor = (percentage: number) => {
    if (percentage >= 80) return "text-green-600 bg-green-50";
    if (percentage >= 60) return "text-blue-600 bg-blue-50";
    if (percentage >= 40) return "text-yellow-600 bg-yellow-50";
    return "text-red-600 bg-red-50";
  };

  const getTrendIcon = (trend: "up" | "down" | "stable") => {
    switch (trend) {
      case "up":
        return <TrendingUp className="w-4 h-4 text-green-600" />;
      case "down":
        return <TrendingDown className="w-4 h-4 text-red-600" />;
      default:
        return <Activity className="w-4 h-4 text-gray-600" />;
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: [0.4, 0, 0.2, 1] as const,
      },
    },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Overall Statistics */}
      <motion.div variants={itemVariants}>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <LiquidCard hover>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-600" />
                Total Contacts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {overallStats.totalContacts}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {overallStats.recentlyAdded} added this month
              </p>
            </CardContent>
          </LiquidCard>

          <LiquidCard hover>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Heart className="w-4 h-4 text-purple-600" />
                Avg. Strength
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">
                {Math.round(overallStats.averageStrength * 100)}%
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div
                  className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full"
                  style={{ width: `${overallStats.averageStrength * 100}%` }}
                />
              </div>
            </CardContent>
          </LiquidCard>

          <LiquidCard hover>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Activity className="w-4 h-4 text-green-600" />
                Network Health
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {Math.round(overallStats.networkHealth)}%
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {overallStats.overdueContacts} contacts overdue
              </p>
            </CardContent>
          </LiquidCard>

          <LiquidCard hover>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Target className="w-4 h-4 text-orange-600" />
                Strong Bonds
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">
                {overallStats.strongRelationships}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {overallStats.weakRelationships} need attention
              </p>
            </CardContent>
          </LiquidCard>
        </div>
      </motion.div>

      {/* Dunbar Level Distribution */}
      <motion.div variants={itemVariants}>
        <LiquidCard>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Dunbar Level Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {levelStats.map((stat) => (
                <div key={stat.level.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-4 h-4 ${stat.level.color} rounded-full`}
                      />
                      <div>
                        <h4 className="font-medium">{stat.level.name}</h4>
                        <p className="text-sm text-gray-600">
                          {stat.current} of {stat.capacity} contacts
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getTrendIcon(stat.trend)}
                      <Badge variant="secondary">
                        {Math.round(stat.percentage)}%
                      </Badge>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <Progress
                      value={stat.percentage}
                      className="h-2"
                      style={{
                        background: `linear-gradient(to right, ${stat.level.color.replace("bg-", "")} 0%, ${stat.level.color.replace("bg-", "")} ${stat.percentage}%, #e5e7eb ${stat.percentage}%, #e5e7eb 100%)`,
                      }}
                    />
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>
                        Avg. strength: {Math.round(stat.averageStrength * 100)}%
                      </span>
                      <span>
                        {stat.overdueContacts > 0 && (
                          <span className="text-red-600 flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3" />
                            {stat.overdueContacts} overdue
                          </span>
                        )}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </LiquidCard>
      </motion.div>

      {/* Platform Distribution and Health Insights */}
      <motion.div variants={itemVariants}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Platform Distribution */}
          <LiquidCard>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="w-5 h-5" />
                Platform Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Object.entries(overallStats.platformDistribution)
                  .sort(([, a], [, b]) => b - a)
                  .map(([platform, count]) => {
                    const percentage =
                      (count / overallStats.totalContacts) * 100;
                    return (
                      <div
                        key={platform}
                        className="flex items-center justify-between"
                      >
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 bg-blue-500 rounded-full" />
                          <span className="capitalize text-sm">{platform}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-16 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-blue-500 h-2 rounded-full"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                          <span className="text-sm font-medium w-8 text-right">
                            {count}
                          </span>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </CardContent>
          </LiquidCard>

          {/* Health Insights */}
          <LiquidCard>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Health Insights
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div
                  className={`p-3 rounded-lg ${getHealthColor(overallStats.networkHealth)}`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">Overall Network Health</span>
                    <Badge variant="secondary">
                      {Math.round(overallStats.networkHealth)}%
                    </Badge>
                  </div>
                  <p className="text-sm opacity-80">
                    {overallStats.networkHealth >= 80
                      ? "Excellent! Your network is well-maintained."
                      : overallStats.networkHealth >= 60
                        ? "Good network health with room for improvement."
                        : "Your network needs attention - many contacts are overdue."}
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Strong Relationships (70%+)</span>
                    <Badge variant="default">
                      {overallStats.strongRelationships}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>Weak Relationships (&lt;40%)</span>
                    <Badge variant="outline">
                      {overallStats.weakRelationships}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>Overdue Contacts</span>
                    <Badge variant="destructive">
                      {overallStats.overdueContacts}
                    </Badge>
                  </div>
                </div>

                {overallStats.overdueContacts > 0 && (
                  <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-center gap-2 text-yellow-800 mb-1">
                      <AlertTriangle className="w-4 h-4" />
                      <span className="font-medium">Action Needed</span>
                    </div>
                    <p className="text-sm text-yellow-700">
                      You have {overallStats.overdueContacts} contacts that
                      haven't been contacted within their expected frequency.
                      Consider reaching out soon.
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </LiquidCard>
        </div>
      </motion.div>
    </motion.div>
  );
}
