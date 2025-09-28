import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
// Temporarily disable missing module imports
// import { LiquidScrollIndicator } from "../../components/ui/liquid-scroll-indicator";
// import { HelpSystem, useContextualHelp } from "../../components/help-system";

// Mock implementation for LiquidScrollIndicator
const LiquidScrollIndicator: React.FC = () => null;

// Define props for HelpSystem component
interface HelpSystemProps {
  contextualTopic?: {
    title?: string;
    content?: string;
  };
}

const HelpSystem: React.FC<HelpSystemProps> = () => null;
import {
  Users,
  Brain,
  Heart,
  Eye,
  Smartphone,
  Clock,
  Book,
  Plane,
  UserCheck,
} from "lucide-react";
import {
  signInWithGoogle,
  signInWithGoogleRedirect,
  handleRedirectResult,
  signOut,
  getUserDisplayName,
} from "../../lib/auth-utils";
import { onAuthStateChanged, type User } from "firebase/auth";
import { auth } from "../../firebase-config";

interface PageLayoutProps {
  children: React.ReactNode;
  title: string;
  description: string;
}

const navigationItems = [
  { path: "/", label: "Overview", icon: Brain },
  { path: "/dashboard", label: "Dashboard", icon: Book },
  { path: "/contacts", label: "Contacts", icon: UserCheck },
  { path: "/network", label: "Network Graph", icon: Heart },
  { path: "/radial", label: "Radial View", icon: Eye },
  { path: "/levels", label: "Levels", icon: Users },
  { path: "/lifecycle", label: "Life Stages", icon: Clock },
  { path: "/digital", label: "Digital", icon: Smartphone },
  { path: "/sitemap", label: "Sitemap", icon: Plane },
];

export default function PageLayout({
  children,
  title,
  description,
}: PageLayoutProps) {
  const location = useLocation();

  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [showRedirectOption, setShowRedirectOption] = useState(false);

  useEffect(() => {
    if (!auth) return;

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
    });

    const checkRedirectResult = async () => {
      try {
        const result = await handleRedirectResult();
        if (result) {
          setUser(result.user);
        }
      } catch (error) {
        console.error("Error handling redirect result:", error);
        setAuthError(
          error instanceof Error ? error.message : "Failed to complete sign-in",
        );
      }
    };

    checkRedirectResult();

    return () => unsubscribe();
  }, []);

  const handleGoogleSignIn = async () => {
    setAuthLoading(true);
    setAuthError(null);
    setShowRedirectOption(false);

    try {
      const result = await signInWithGoogle();
      setUser(result.user);
    } catch (error: unknown) {
      console.error("Error signing in with Google:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to sign in with Google";
      setAuthError(errorMessage);

      if (errorMessage.includes("popup") || errorMessage.includes("blocked")) {
        setShowRedirectOption(true);
      }
    } finally {
      setAuthLoading(false);
    }
  };

  const handleGoogleSignInRedirect = async () => {
    setAuthLoading(true);
    setAuthError(null);

    try {
      await signInWithGoogleRedirect();
    } catch (error: unknown) {
      console.error("Error initiating Google redirect sign-in:", error);
      setAuthError(
        error instanceof Error
          ? error.message
          : "Failed to initiate sign-in redirect",
      );
      setAuthLoading(false);
    }
  };

  const handleSignOut = async () => {
    setAuthLoading(true);
    setAuthError(null);
    try {
      await signOut();
      setUser(null);
    } catch (error: unknown) {
      console.error("Error signing out:", error);
      setAuthError(
        error instanceof Error ? error.message : "Failed to sign out",
      );
    } finally {
      setAuthLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative">
      <LiquidScrollIndicator />

      <div className="fixed inset-0 bg-gradient-to-br from-blue-50/80 via-purple-50/80 to-cyan-50/80 dark:from-gray-900/80 dark:via-blue-900/80 dark:to-purple-900/80" />

      <div className="relative z-10 container mx-auto px-4 py-8">
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
        >
          <motion.h1
            className="text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 bg-clip-text text-transparent"
            animate={{
              backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            style={{
              backgroundSize: "200% 200%",
            }}
          >
            Dunbar Circles
          </motion.h1>
          <motion.p
            className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Explore your relationships across different levels of intimacy and
            frequency of contact
          </motion.p>
        </motion.div>

        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <nav className="flex flex-wrap justify-center items-center gap-2 p-3 bg-white/60 dark:bg-gray-900/60 rounded-2xl backdrop-blur-xl border border-white/20 dark:border-gray-700/20">
            {navigationItems.map((item, index) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;

              return (
                <motion.div
                  key={item.path}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{
                    duration: 0.4,
                    delay: 0.4 + index * 0.05,
                    type: "spring",
                    stiffness: 400,
                    damping: 17,
                  }}
                >
                  <Link
                    to={item.path}
                    className={`relative flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all duration-300 overflow-hidden group ${
                      isActive
                        ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg"
                        : "text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"
                    }`}
                  >
                    {!isActive && (
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-xl opacity-0 group-hover:opacity-100"
                        initial={{
                          scale: 0,
                          borderRadius: "60% 40% 30% 70% / 60% 30% 70% 40%",
                        }}
                        whileHover={{
                          scale: 1,
                          borderRadius: [
                            "60% 40% 30% 70% / 60% 30% 70% 40%",
                            "30% 60% 70% 40% / 50% 60% 30% 60%",
                            "60% 40% 30% 70% / 60% 30% 70% 40%",
                          ],
                        }}
                        transition={{
                          scale: { duration: 0.3 },
                          borderRadius: { duration: 2, repeat: Infinity },
                        }}
                      />
                    )}

                    <motion.div
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      transition={{
                        type: "spring",
                        stiffness: 400,
                        damping: 17,
                      }}
                    >
                      <Icon className="w-4 h-4 relative z-10" />
                    </motion.div>
                    <span className="relative z-10 font-medium">
                      {item.label}
                    </span>
                  </Link>
                </motion.div>
              );
            })}

            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{
                duration: 0.4,
                delay: 0.4 + navigationItems.length * 0.05,
                type: "spring",
                stiffness: 400,
                damping: 17,
              }}
            >
              {user ? (
                <div className="flex items-center space-x-3 px-4 py-2.5 bg-white/60 dark:bg-gray-900/60 text-gray-800 dark:text-white font-medium rounded-xl backdrop-blur-xl border border-white/20 dark:border-gray-700/20 w-full max-w-xs mx-auto">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                    {user.photoURL ? (
                      <img
                        src={user.photoURL}
                        alt="User avatar"
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      getUserDisplayName(user).charAt(0).toUpperCase()
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {getUserDisplayName(user)}
                    </p>
                  </div>
                  <button
                    onClick={handleSignOut}
                    disabled={authLoading}
                    className="text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors disabled:opacity-50"
                  >
                    {authLoading ? "..." : "Logout"}
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <button
                    onClick={handleGoogleSignIn}
                    disabled={authLoading}
                    className="px-4 py-2.5 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-medium rounded-xl shadow-lg transition-all duration-300 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed w-full max-w-xs mx-auto"
                  >
                    {authLoading ? (
                      <>
                        <svg
                          className="w-4 h-4 text-white animate-spin"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        <span>Signing in...</span>
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4" viewBox="0 0 24 24">
                          <path
                            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                            fill="white"
                          />
                          <path
                            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                            fill="#34A853"
                          />
                          <path
                            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                            fill="#FBBC05"
                          />
                          <path
                            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                            fill="#EA4335"
                          />
                        </svg>
                        <span>Sign in</span>
                      </>
                    )}
                  </button>

                  {showRedirectOption && (
                    <button
                      onClick={handleGoogleSignInRedirect}
                      disabled={authLoading}
                      className="px-3 py-2 bg-white/60 dark:bg-gray-900/60 border border-blue-300 dark:border-blue-600 text-blue-700 dark:text-blue-400 font-medium rounded-xl shadow-sm hover:bg-blue-50/60 dark:hover:bg-blue-900/60 transition-all duration-300 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed w-full max-w-xs mx-auto text-sm"
                    >
                      <svg
                        className="w-3 h-3"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                        />
                      </svg>
                      <span>Try Redirect</span>
                    </button>
                  )}

                  {authError && (
                    <div className="p-2 text-xs text-red-600 dark:text-red-400 bg-red-50/60 dark:bg-red-900/20 rounded-lg max-w-xs mx-auto text-center">
                      {authError}
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          </nav>
        </motion.div>

        {/* Page Title */}
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          <div className="flex items-center justify-center gap-4 mb-4">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-200 bg-clip-text text-transparent">
              {title}
            </h2>
            <HelpSystem />
          </div>
          <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            {description}
          </p>
        </motion.div>

        {/* Page Content */}
        <motion.div
          className="space-y-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          {children}
        </motion.div>
      </div>

      {/* Floating liquid elements */}
      <motion.div
        className="fixed top-20 left-10 w-16 h-16 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full pointer-events-none"
        animate={{
          y: [0, -20, 0],
          scale: [1, 1.1, 1],
          rotate: [0, 180, 360],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      <motion.div
        className="fixed bottom-20 right-10 w-12 h-12 bg-gradient-to-br from-cyan-400/20 to-green-400/20 rounded-full pointer-events-none"
        animate={{
          y: [0, 15, 0],
          scale: [1, 0.9, 1],
          rotate: [360, 180, 0],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 2,
        }}
        style={{
          borderRadius: "40% 60% 54% 46% / 49% 60% 40% 51%",
        }}
      />
    </div>
  );
}
