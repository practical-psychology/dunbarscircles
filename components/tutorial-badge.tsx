import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { CheckCircle, Play, Trophy, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Progress } from "@/components/ui/progress";
import { useTutorialProgress } from "@/lib/tutorial-progress";

interface TutorialBadgeProps {
  className?: string;
  variant?: "compact" | "detailed";
}

export function TutorialBadge({
  className = "",
  variant = "compact",
}: TutorialBadgeProps) {
  const { getTutorialStats, getNextIncompleteStep } = useTutorialProgress();
  const stats = getTutorialStats();
  const nextStep = getNextIncompleteStep();

  if (variant === "compact") {
    return (
      <motion.div
        className={`inline-flex items-center gap-2 ${className}`}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        {stats.isCompleted ? (
          <Badge
            variant="secondary"
            className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
          >
            <Trophy className="w-3 h-3 mr-1" />
            Tutorial Complete
          </Badge>
        ) : (
          <Badge
            variant="outline"
            className="border-blue-200 text-blue-700 dark:border-blue-800 dark:text-blue-300"
          >
            <Play className="w-3 h-3 mr-1" />
            {stats.completionPercentage}% Complete
          </Badge>
        )}
      </motion.div>
    );
  }

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="border-blue-200 dark:border-blue-800">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                {stats.isCompleted ? (
                  <>
                    <Trophy className="w-5 h-5 text-yellow-500" />
                    Tutorial Complete!
                  </>
                ) : (
                  <>
                    <Play className="w-5 h-5 text-blue-500" />
                    Tutorial Progress
                  </>
                )}
              </CardTitle>
              <CardDescription>
                {stats.isCompleted
                  ? `Completed in ${stats.timeSpent} minutes`
                  : `${stats.completedSteps} of ${stats.totalSteps} steps completed`}
              </CardDescription>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {stats.completionPercentage}%
              </div>
              <div className="text-xs text-muted-foreground">Complete</div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <Progress value={stats.completionPercentage} className="h-2" />

          {!stats.isCompleted && nextStep && (
            <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
              <div>
                <p className="font-medium text-blue-900 dark:text-blue-100">
                  Next: {nextStep.title}
                </p>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  Continue your learning journey
                </p>
              </div>
              <Link to="/onboarding">
                <Button size="sm">
                  Continue
                  <Play className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
          )}

          {stats.isCompleted && (
            <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-950/20 rounded-lg">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <div>
                  <p className="font-medium text-green-900 dark:text-green-100">
                    Well done!
                  </p>
                  <p className="text-sm text-green-700 dark:text-green-300">
                    You've mastered Dunbar's Circles
                  </p>
                </div>
              </div>
              {stats.timeSpent > 0 && (
                <div className="flex items-center gap-1 text-green-600 dark:text-green-400">
                  <Clock className="w-4 h-4" />
                  <span className="text-sm">{stats.timeSpent}m</span>
                </div>
              )}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <div className="text-lg font-semibold text-green-600 dark:text-green-400">
                {stats.completedSteps}
              </div>
              <div className="text-xs text-muted-foreground">Completed</div>
            </div>
            <div>
              <div className="text-lg font-semibold text-blue-600 dark:text-blue-400">
                {stats.totalSteps - stats.completedSteps}
              </div>
              <div className="text-xs text-muted-foreground">Remaining</div>
            </div>
          </div>

          {!stats.isCompleted && (
            <Link to="/onboarding" className="block">
              <Button className="w-full" variant="outline">
                <Play className="w-4 h-4 mr-2" />
                {stats.completedSteps === 0
                  ? "Start Tutorial"
                  : "Continue Tutorial"}
              </Button>
            </Link>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

// Mini progress indicator for navigation
export function TutorialProgressIndicator({
  className = "",
}: {
  className?: string;
}) {
  const { getTutorialStats } = useTutorialProgress();
  const stats = getTutorialStats();

  if (stats.isCompleted) {
    return (
      <div className={`flex items-center gap-1 ${className}`}>
        <CheckCircle className="w-4 h-4 text-green-500" />
        <span className="text-xs text-green-600 dark:text-green-400">
          Tutorial Complete
        </span>
      </div>
    );
  }

  if (stats.completedSteps === 0) {
    return (
      <Link
        to="/onboarding"
        className={`flex items-center gap-1 hover:text-blue-600 dark:hover:text-blue-400 transition-colors ${className}`}
      >
        <Play className="w-4 h-4 text-blue-500" />
        <span className="text-xs text-blue-600 dark:text-blue-400">
          Start Tutorial
        </span>
      </Link>
    );
  }

  return (
    <Link
      to="/onboarding"
      className={`flex items-center gap-1 hover:text-blue-600 dark:hover:text-blue-400 transition-colors ${className}`}
    >
      <div className="w-4 h-4 relative">
        <div className="w-4 h-4 rounded-full border-2 border-blue-200 dark:border-blue-800">
          <div
            className="h-full bg-blue-500 rounded-full transition-all duration-300"
            style={{ width: `${stats.completionPercentage}%` }}
          />
        </div>
      </div>
      <span className="text-xs text-blue-600 dark:text-blue-400">
        {stats.completionPercentage}%
      </span>
    </Link>
  );
}
