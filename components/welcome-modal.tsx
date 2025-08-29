import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import {
  Users,
  PlayCircle,
  Book,
  ShieldCheck,
  Sparkles as Zap,
  ChevronRight,
  X,
  Star,
} from "lucide-react";

interface WelcomeModalProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export function WelcomeModal({
  isOpen: controlledOpen,
  onClose,
}: WelcomeModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    // Check if user has seen the welcome modal before
    let hasSeenWelcome = false;

    try {
      if (
        typeof window !== "undefined" &&
        window.localStorage &&
        typeof window.localStorage.getItem === "function"
      ) {
        hasSeenWelcome = !!localStorage.getItem("yakw-welcome-seen");
      }
    } catch (error) {
      // localStorage is not available or throws an error - treat as first time user
      console.warn("localStorage is not available for welcome modal:", error);
    }

    if (controlledOpen !== undefined) {
      setIsOpen(controlledOpen);
    } else if (!hasSeenWelcome) {
      // Show welcome modal for first-time users after a short delay
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [controlledOpen]);

  const handleClose = () => {
    setIsOpen(false);

    // Try to save that user has seen the welcome modal
    try {
      if (
        typeof window !== "undefined" &&
        window.localStorage &&
        typeof window.localStorage.setItem === "function"
      ) {
        localStorage.setItem("yakw-welcome-seen", "true");
      }
    } catch (error) {
      // localStorage is not available or throws an error - ignore silently
      console.warn("Failed to save welcome modal state:", error);
    }

    onClose?.();
  };

  const handleStartTutorial = () => {
    handleClose();
    // Navigation will be handled by the Link component
  };

  const handleSkip = () => {
    handleClose();
  };

  const steps = [
    {
      title: "Welcome to Dunbar Circles",
      description: "Your personal relationship visualization tool",
      content: (
        <div className="space-y-6">
          <div className="text-center">
            <motion.div
              className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center"
              animate={{
                scale: [1, 1.1, 1],
                rotate: [0, 5, -5, 0],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              <Users className="w-10 h-10 text-white" />
            </motion.div>
            <h3 className="text-2xl font-bold mb-2">
              Welcome to Dunbar Circles
            </h3>
            <p className="text-muted-foreground">
              Discover and visualize your social relationships using Robin
              Dunbar's research
            </p>
          </div>

          <div className="grid gap-4">
            <Card className="border-blue-200 dark:border-blue-800">
              <CardContent className="pt-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                    <Users className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold">Understand Your Network</h4>
                    <p className="text-sm text-muted-foreground">
                      Explore the five levels of human relationships
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-green-200 dark:border-green-800">
              <CardContent className="pt-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                    <Zap className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold">
                      Interactive Visualizations
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      See your relationships in radial diagrams and network
                      graphs
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-purple-200 dark:border-purple-800">
              <CardContent className="pt-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                    <ShieldCheck className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold">Privacy First</h4>
                    <p className="text-sm text-muted-foreground">
                      All data processing happens locally in your browser
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      ),
    },
    {
      title: "Dunbar's Five Levels",
      description: "Understanding the hierarchy of human relationships",
      content: (
        <div className="space-y-4">
          <p className="text-center text-muted-foreground mb-6">
            Research shows humans can maintain stable relationships with ~150
            people, organized in five levels:
          </p>

          <div className="space-y-3">
            <motion.div
              className="flex items-center gap-3 p-3 rounded-lg bg-red-50 dark:bg-red-950/20"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                5
              </div>
              <div>
                <strong>Inner Circle</strong> - Daily contact, highest emotional
                investment
              </div>
            </motion.div>

            <motion.div
              className="flex items-center gap-3 p-3 rounded-lg bg-orange-50 dark:bg-orange-950/20"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                15
              </div>
              <div>
                <strong>Sympathy Group</strong> - Weekly contact, close friends
              </div>
            </motion.div>

            <motion.div
              className="flex items-center gap-3 p-3 rounded-lg bg-yellow-50 dark:bg-yellow-950/20"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <div className="w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                50
              </div>
              <div>
                <strong>Affinity Group</strong> - Monthly contact, party
                invitees
              </div>
            </motion.div>

            <motion.div
              className="flex items-center gap-3 p-3 rounded-lg bg-green-50 dark:bg-green-950/20"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                150
              </div>
              <div>
                <strong>Active Network</strong> - Quarterly contact, meaningful
                conversations
              </div>
            </motion.div>

            <motion.div
              className="flex items-center gap-3 p-3 rounded-lg bg-blue-50 dark:bg-blue-950/20"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
            >
              <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                500
              </div>
              <div>
                <strong>Recognition Group</strong> - Yearly contact, faces and
                names
              </div>
            </motion.div>
          </div>
        </div>
      ),
    },
    {
      title: "Ready to Explore?",
      description: "Choose how you'd like to get started",
      content: (
        <div className="space-y-6">
          <div className="text-center">
            <motion.div
              className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-green-500 to-blue-600 rounded-full flex items-center justify-center"
              animate={{
                scale: [1, 1.05, 1],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              <Star className="w-8 h-8 text-white" />
            </motion.div>
            <h3 className="text-xl font-bold mb-2">You're all set!</h3>
            <p className="text-muted-foreground">
              Choose how you'd like to begin exploring your relationships
            </p>
          </div>

          <div className="grid gap-4">
            <Card className="border-blue-200 dark:border-blue-800 hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <PlayCircle className="w-4 h-4 text-blue-500" />
                  Interactive Tutorial
                  <Badge variant="secondary">Recommended</Badge>
                </CardTitle>
                <CardDescription>
                  Step-by-step guided tour of all features (10 minutes)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link to="/onboarding" onClick={handleStartTutorial}>
                  <Button className="w-full">
                    Start Tutorial
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="border-green-200 dark:border-green-800 hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Book className="w-4 h-4 text-green-500" />
                  Quick Start Guide
                </CardTitle>
                <CardDescription>
                  Essential information to get started immediately
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={handleClose}
                >
                  <a
                    href="/docs/QUICK_START.md"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center w-full justify-center"
                  >
                    Read Guide
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </a>
                </Button>
              </CardContent>
            </Card>

            <Card className="border-purple-200 dark:border-purple-800 hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Users className="w-4 h-4 text-purple-500" />
                  Explore Freely
                </CardTitle>
                <CardDescription>
                  Jump right in and discover features on your own
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  variant="ghost"
                  className="w-full"
                  onClick={handleClose}
                >
                  Start Exploring
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              </CardContent>
            </Card>
          </div>

          <div className="text-center text-sm text-muted-foreground">
            You can always access help and tutorials from any page using the
            Help button
          </div>
        </div>
      ),
    },
  ];

  const currentStepData = steps[currentStep];

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-2xl">
                {currentStepData.title}
              </DialogTitle>
              <DialogDescription className="text-base">
                {currentStepData.description}
              </DialogDescription>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
              aria-label="Close welcome modal"
              title="Close welcome modal"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="py-4">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {currentStepData.content}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between pt-4 border-t">
          <div className="flex gap-2">
            {steps.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentStep(index)}
                className={`w-2 h-2 rounded-full transition-colors ${
                  index === currentStep
                    ? "bg-blue-500"
                    : index < currentStep
                      ? "bg-green-500"
                      : "bg-gray-300 dark:bg-gray-600"
                }`}
                aria-label={`Go to step ${index + 1} of ${steps.length}`}
                aria-current={index === currentStep ? "step" : undefined}
              />
            ))}
          </div>

          <div className="flex gap-2">
            {currentStep < steps.length - 1 ? (
              <>
                <Button variant="ghost" onClick={handleSkip}>
                  Skip
                </Button>
                <Button onClick={() => setCurrentStep(currentStep + 1)}>
                  Next
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              </>
            ) : (
              <div className="text-sm text-muted-foreground">
                Choose an option above to continue
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Hook to trigger welcome modal
export function useWelcomeModal() {
  const [isOpen, setIsOpen] = useState(false);

  const showWelcome = () => setIsOpen(true);
  const hideWelcome = () => setIsOpen(false);

  return {
    isOpen,
    showWelcome,
    hideWelcome,
    WelcomeModal: () => <WelcomeModal isOpen={isOpen} onClose={hideWelcome} />,
  };
}
