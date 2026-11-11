import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { SAMPLE_CONTACTS } from "@/lib/sample-contacts";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Users,
  ShieldCheck,
  Sparkles as Zap,
  ChevronRight,
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
  const [loadingSample, setLoadingSample] = useState(false);
  const navigate = useNavigate();

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
    } else if (
      !hasSeenWelcome &&
      !(typeof process !== "undefined" && process.env.NODE_ENV === "test")
    ) {
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

  const handleSampleData = async () => {
    setLoadingSample(true);
    try {
      const { ContactStorageService } = await import(
        "@/lib/contact-storage-service"
      );
      const service = ContactStorageService.getInstance();
      const { withChangeSource } = await import("@/lib/relationship-log");
      await withChangeSource("import", async () => {
        for (const contact of SAMPLE_CONTACTS) {
          await service.createContact(contact);
        }
      });
      handleClose();
      navigate("/contacts");
    } catch (error) {
      console.error("Failed to load sample data:", error);
      setLoadingSample(false);
    }
  };

  const handleSkip = () => {
    handleClose();
  };

  const steps = [
    {
      title: "See who's in your inner circle",
      description: "Map the people in your life across Dunbar's five layers",
      content: (
        <div className="space-y-5">
          <div className="text-center">
            <motion.div
              className="w-16 h-16 mx-auto mb-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center"
              animate={{ scale: [1, 1.08, 1] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            >
              <Users className="w-8 h-8 text-white" aria-hidden="true" />
            </motion.div>
            <p className="text-muted-foreground">
              Based on Robin Dunbar's research: roughly 5 closest, 15 good
              friends, 50 friends, 150 meaningful contacts and 500
              acquaintances.
            </p>
          </div>
          <ul className="grid gap-3">
            <li className="flex items-start gap-3">
              <Zap
                className="w-5 h-5 mt-0.5 text-green-600 shrink-0"
                aria-hidden="true"
              />
              <span>
                <strong>Spot who has drifted.</strong> See the people you meant
                to stay in touch with.
              </span>
            </li>
            <li className="flex items-start gap-3">
              <ShieldCheck
                className="w-5 h-5 mt-0.5 text-purple-600 shrink-0"
                aria-hidden="true"
              />
              <span>
                <strong>Private by default.</strong> Contacts stay in your
                browser. Cloud backup happens only if you sign in.
              </span>
            </li>
          </ul>
        </div>
      ),
    },
    {
      title: "Start your map",
      description: "Pick how you want to begin",
      content: (
        <div className="space-y-4">
          <p className="text-muted-foreground">
            Add someone you talk to often, or load ten made-up people to see how
            the circles look. You can delete the samples at any time.
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            <Button asChild size="lg" onClick={handleClose}>
              <Link to="/contacts/import">
                Add my first contact
                <ChevronRight className="w-4 h-4 ml-2" aria-hidden="true" />
              </Link>
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={handleSampleData}
              disabled={loadingSample}
            >
              {loadingSample ? "Loading…" : "Start with sample data"}
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">
            Prefer a guided walkthrough?{" "}
            <Link
              to="/onboarding"
              onClick={handleClose}
              className="underline underline-offset-2"
            >
              Take the 10 minute tour
            </Link>
            .
          </p>
        </div>
      ),
    },
  ];

  const currentStepData = steps[currentStep];

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => (open ? setIsOpen(true) : handleClose())}
    >
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
          <div className="flex gap-0">
            {steps.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentStep(index)}
                className="flex h-11 w-11 items-center justify-center"
                aria-label={`Go to step ${index + 1} of ${steps.length}`}
                aria-current={index === currentStep ? "step" : undefined}
              >
                <span
                  aria-hidden="true"
                  className={`block h-2.5 w-2.5 rounded-full transition-colors ${
                    index === currentStep
                      ? "bg-blue-600"
                      : index < currentStep
                        ? "bg-green-600"
                        : "bg-gray-300 dark:bg-gray-600"
                  }`}
                />
              </button>
            ))}
          </div>

          <div className="flex items-center gap-4">
            {currentStep < steps.length - 1 ? (
              <>
                <Button variant="ghost" onClick={handleSkip}>
                  Skip
                </Button>
                <Button
                  onClick={() => setCurrentStep(currentStep + 1)}
                  aria-label="Next step"
                >
                  Next
                  <ChevronRight className="w-4 h-4 ml-2" aria-hidden="true" />
                </Button>
              </>
            ) : (
              <Button variant="ghost" onClick={handleSkip}>
                Skip for now
              </Button>
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
