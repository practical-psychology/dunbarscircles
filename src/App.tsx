import { Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { ThemeProvider } from "@/components/theme-provider";
import HomePage from "./pages/HomePage";
const OnboardingPage = lazy(() => import("./pages/OnboardingPage"));
const RadialPage = lazy(() => import("./pages/RadialPage"));
const LevelsPage = lazy(() => import("./pages/LevelsPage"));
const NetworkPage = lazy(() => import("./pages/NetworkPage"));
const DigitalPage = lazy(() => import("./pages/DigitalPage"));
const LifecyclePage = lazy(() => import("./pages/LifecyclePage"));
const DashboardPage = lazy(() => import("./pages/DashboardPage"));
const FirebaseTestPage = lazy(() => import("./pages/FirebaseTestPage"));
const SitemapPage = lazy(() => import("./pages/SitemapPage"));
const ContactsPage = lazy(() => import("./pages/ContactsPage"));
const ContactEditPage = lazy(() => import("./pages/ContactEditPage"));
const ContactImportPage = lazy(() => import("./pages/ContactImportPage"));
const ColorContrastTestPage = lazy(
  () => import("./pages/ColorContrastTestPage"),
);
const NotFoundPage = lazy(() => import("./pages/NotFoundPage"));
const PrivacyPage = lazy(() => import("./pages/PrivacyPage"));
const AboutPage = lazy(() => import("./pages/AboutPage"));
const EvidencePage = lazy(() => import("./pages/EvidencePage"));
import LiquidLoadingScreen from "./components/LiquidLoadingScreen";
import { LiquidThemeToggle } from "@/components/ui/liquid-theme-toggle";
import { WelcomeModal } from "@/components/welcome-modal";
import { ConsentBanner } from "@/components/consent-banner";
import { Toaster } from "@/components/ui/toaster";
import { lazy, Suspense, useState, useEffect } from "react";

const liquidPageVariants = {
  initial: {
    opacity: 0,
    y: 60,
    scale: 0.95,
  },
  in: {
    opacity: 1,
    y: 0,
    scale: 1,
  },
  out: {
    opacity: 0,
    y: -60,
    scale: 1.05,
  },
};

const liquidPageTransition = {
  type: "tween" as const,
  ease: [0.4, 0, 0.2, 1] as const,
  duration: 0.6,
};

function AppContent() {
  const location = useLocation();

  // Check if we're in a test environment
  const isTestEnvironment =
    typeof process !== "undefined" && process.env.NODE_ENV === "test";

  // In test environment, skip loading screen entirely
  const [isLoading, setIsLoading] = useState(!isTestEnvironment);

  useEffect(() => {
    if (isTestEnvironment) {
      // Skip loading in tests
      return;
    }

    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 600);

    return () => clearTimeout(timer);
  }, [isTestEnvironment]);

  if (isLoading) {
    return <LiquidLoadingScreen skipDelay={isTestEnvironment} />;
  }

  return (
    <div className="min-h-screen font-sans relative overflow-hidden">
      {/* Liquid Background Blobs */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-10 left-10 w-32 h-32 bg-gradient-to-br from-blue-400/10 to-purple-400/10 rounded-full animate-liquid-blob"></div>
        <div
          className="absolute top-1/3 right-20 w-24 h-24 bg-gradient-to-br from-green-400/10 to-blue-400/10 rounded-full animate-liquid-blob"
          style={{ animationDelay: "2s" }}
        ></div>
        <div
          className="absolute bottom-20 left-1/4 w-40 h-40 bg-gradient-to-br from-purple-400/10 to-pink-400/10 rounded-full animate-liquid-blob"
          style={{ animationDelay: "4s" }}
        ></div>
        <div
          className="absolute bottom-1/3 right-1/3 w-28 h-28 bg-gradient-to-br from-cyan-400/10 to-green-400/10 rounded-full animate-liquid-blob"
          style={{ animationDelay: "6s" }}
        ></div>
      </div>

      {/* Theme Toggle */}
      <div className="fixed top-4 right-4 z-50">
        <LiquidThemeToggle />
      </div>

      <Toaster />

      {/* Welcome Modal for first-time users */}
      <WelcomeModal />
      <ConsentBanner />

      <AnimatePresence mode="wait">
        <motion.div
          key={location.pathname}
          initial="initial"
          animate="in"
          exit="out"
          variants={liquidPageVariants}
          transition={liquidPageTransition}
          className="relative z-10"
        >
          <Suspense
            fallback={
              <div
                role="status"
                className="p-12 text-center text-gray-600 dark:text-gray-300"
              >
                Loading…
              </div>
            }
          >
            <Routes location={location}>
              <Route path="/" element={<HomePage />} />
              <Route path="/onboarding" element={<OnboardingPage />} />
              <Route path="/radial" element={<RadialPage />} />
              <Route path="/levels" element={<LevelsPage />} />
              <Route path="/network" element={<NetworkPage />} />
              <Route path="/digital" element={<DigitalPage />} />
              <Route path="/lifecycle" element={<LifecyclePage />} />
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/contacts" element={<ContactsPage />} />
              <Route path="/contacts/edit/:id" element={<ContactEditPage />} />
              <Route path="/contacts/import" element={<ContactImportPage />} />
              {import.meta.env.DEV && (
                <>
                  <Route
                    path="/color-contrast-test"
                    element={<ColorContrastTestPage />}
                  />

                  <Route path="/firebase-test" element={<FirebaseTestPage />} />
                </>
              )}
              <Route path="/sitemap" element={<SitemapPage />} />
              <Route path="/privacy" element={<PrivacyPage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/evidence" element={<EvidencePage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </Suspense>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function App() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="yakw-theme">
      <AppContent />
    </ThemeProvider>
  );
}

export default App;
