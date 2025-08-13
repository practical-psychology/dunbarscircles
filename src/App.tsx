import { Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { ThemeProvider } from "@/components/theme-provider";
import HomePage from "./pages/HomePage";
import OnboardingPage from "./pages/OnboardingPage";
import RadialPage from "./pages/RadialPage";
import LevelsPage from "./pages/LevelsPage";
import NetworkPage from "./pages/NetworkPage";
import DigitalPage from "./pages/DigitalPage";
import LifecyclePage from "./pages/LifecyclePage";
import DashboardPage from "./pages/DashboardPage";
import FirebaseTestPage from "./pages/FirebaseTestPage";
import SitemapPage from "./pages/SitemapPage";
import NotFoundPage from "./pages/NotFoundPage";
import LiquidLoadingScreen from "./components/LiquidLoadingScreen";
import { LiquidThemeToggle } from "@/components/ui/liquid-theme-toggle";
import { useState, useEffect } from "react";

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
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return <LiquidLoadingScreen />;
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
          <Routes location={location}>
            <Route path="/" element={<HomePage />} />
            <Route path="/onboarding" element={<OnboardingPage />} />
            <Route path="/radial" element={<RadialPage />} />
            <Route path="/levels" element={<LevelsPage />} />
            <Route path="/network" element={<NetworkPage />} />
            <Route path="/digital" element={<DigitalPage />} />
            <Route path="/lifecycle" element={<LifecyclePage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/firebase-test" element={<FirebaseTestPage />} />
            <Route path="/sitemap" element={<SitemapPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
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
