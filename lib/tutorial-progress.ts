// Tutorial progress tracking utilities

export interface TutorialStep {
  id: string;
  title: string;
  completed: boolean;
  completedAt?: Date;
}

export interface TutorialProgress {
  steps: TutorialStep[];
  currentStep: number;
  completed: boolean;
  completedAt?: Date;
  startedAt?: Date;
}

const TUTORIAL_STORAGE_KEY = "yakw-tutorial-progress";

// Default tutorial steps
const DEFAULT_TUTORIAL_STEPS: Omit<
  TutorialStep,
  "completed" | "completedAt"
>[] = [
  { id: "welcome", title: "Welcome to Dunbar Circles" },
  { id: "navigation", title: "Navigation Overview" },
  { id: "radial", title: "Radial Visualization" },
  { id: "network", title: "Network Diagram" },
  { id: "import", title: "Importing Your Data" },
  { id: "management", title: "Managing Relationships" },
  { id: "export", title: "Exporting Your Data" },
  { id: "advanced", title: "Advanced Features" },
];

export class TutorialProgressManager {
  private progress: TutorialProgress;

  constructor() {
    this.progress = this.loadProgress();
  }

  private loadProgress(): TutorialProgress {
    try {
      const stored = localStorage.getItem(TUTORIAL_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Convert date strings back to Date objects
        if (parsed.completedAt) {
          parsed.completedAt = new Date(parsed.completedAt);
        }
        if (parsed.startedAt) {
          parsed.startedAt = new Date(parsed.startedAt);
        }
        parsed.steps = parsed.steps.map((step: any) => ({
          ...step,
          completedAt: step.completedAt
            ? new Date(step.completedAt)
            : undefined,
        }));
        return parsed;
      }
    } catch (error) {
      console.warn("Failed to load tutorial progress:", error);
    }

    // Return default progress
    return {
      steps: DEFAULT_TUTORIAL_STEPS.map((step) => ({
        ...step,
        completed: false,
      })),
      currentStep: 0,
      completed: false,
    };
  }

  private saveProgress(): void {
    try {
      localStorage.setItem(TUTORIAL_STORAGE_KEY, JSON.stringify(this.progress));
    } catch (error) {
      console.warn("Failed to save tutorial progress:", error);
    }
  }

  public getProgress(): TutorialProgress {
    return { ...this.progress };
  }

  public startTutorial(): void {
    if (!this.progress.startedAt) {
      this.progress.startedAt = new Date();
      this.saveProgress();
    }
  }

  public completeStep(stepId: string): void {
    const stepIndex = this.progress.steps.findIndex(
      (step) => step.id === stepId,
    );
    if (stepIndex !== -1) {
      this.progress.steps[stepIndex].completed = true;
      this.progress.steps[stepIndex].completedAt = new Date();

      // Update current step to next incomplete step
      const nextIncompleteIndex = this.progress.steps.findIndex(
        (step, index) => index > stepIndex && !step.completed,
      );

      if (nextIncompleteIndex !== -1) {
        this.progress.currentStep = nextIncompleteIndex;
      } else {
        // All steps completed
        this.progress.completed = true;
        this.progress.completedAt = new Date();
        this.progress.currentStep = this.progress.steps.length;
      }

      this.saveProgress();
    }
  }

  public setCurrentStep(stepIndex: number): void {
    if (stepIndex >= 0 && stepIndex <= this.progress.steps.length) {
      this.progress.currentStep = stepIndex;
      this.saveProgress();
    }
  }

  public resetProgress(): void {
    this.progress = {
      steps: DEFAULT_TUTORIAL_STEPS.map((step) => ({
        ...step,
        completed: false,
      })),
      currentStep: 0,
      completed: false,
    };
    this.saveProgress();
  }

  public getCompletionPercentage(): number {
    const completedSteps = this.progress.steps.filter(
      (step) => step.completed,
    ).length;
    return Math.round((completedSteps / this.progress.steps.length) * 100);
  }

  public isStepCompleted(stepId: string): boolean {
    const step = this.progress.steps.find((step) => step.id === stepId);
    return step?.completed || false;
  }

  public getNextIncompleteStep(): TutorialStep | null {
    return this.progress.steps.find((step) => !step.completed) || null;
  }

  public getTutorialStats() {
    const completedSteps = this.progress.steps.filter(
      (step) => step.completed,
    ).length;
    const totalSteps = this.progress.steps.length;
    const completionPercentage = this.getCompletionPercentage();

    let timeSpent = 0;
    if (this.progress.startedAt) {
      const endTime = this.progress.completedAt || new Date();
      timeSpent = Math.round(
        (endTime.getTime() - this.progress.startedAt.getTime()) / 1000 / 60,
      ); // minutes
    }

    return {
      completedSteps,
      totalSteps,
      completionPercentage,
      timeSpent,
      isCompleted: this.progress.completed,
      startedAt: this.progress.startedAt,
      completedAt: this.progress.completedAt,
    };
  }
}

// Singleton instance
export const tutorialProgress = new TutorialProgressManager();

// React hook for tutorial progress
import { useState, useEffect } from "react";

export function useTutorialProgress() {
  const [progress, setProgress] = useState(tutorialProgress.getProgress());

  const refreshProgress = () => {
    setProgress(tutorialProgress.getProgress());
  };

  const completeStep = (stepId: string) => {
    tutorialProgress.completeStep(stepId);
    refreshProgress();
  };

  const setCurrentStep = (stepIndex: number) => {
    tutorialProgress.setCurrentStep(stepIndex);
    refreshProgress();
  };

  const startTutorial = () => {
    tutorialProgress.startTutorial();
    refreshProgress();
  };

  const resetProgress = () => {
    tutorialProgress.resetProgress();
    refreshProgress();
  };

  useEffect(() => {
    // Listen for storage changes from other tabs
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === TUTORIAL_STORAGE_KEY) {
        refreshProgress();
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  return {
    progress,
    completeStep,
    setCurrentStep,
    startTutorial,
    resetProgress,
    getCompletionPercentage: () => tutorialProgress.getCompletionPercentage(),
    isStepCompleted: (stepId: string) =>
      tutorialProgress.isStepCompleted(stepId),
    getNextIncompleteStep: () => tutorialProgress.getNextIncompleteStep(),
    getTutorialStats: () => tutorialProgress.getTutorialStats(),
  };
}
