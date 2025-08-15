import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { LiquidScrollIndicator } from "@/components/ui/liquid-scroll-indicator";
import { HelpSystem, useContextualHelp } from "@/components/help-system";
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

interface PageLayoutProps {
  children: React.ReactNode;
  title: string;
  description: string;
}

const navigationItems = [
  { path: "/", label: "Overview", icon: Brain },
  { path: "/radial", label: "Radial View", icon: Eye },
  { path: "/levels", label: "Levels", icon: Users },
  { path: "/network", label: "Network Graph", icon: Heart },
  { path: "/digital", label: "Digital", icon: Smartphone },
  { path: "/lifecycle", label: "Life Stages", icon: Clock },
  { path: "/contacts", label: "Contacts", icon: UserCheck },
  { path: "/dashboard", label: "Dashboard", icon: Book },
  { path: "/sitemap", label: "Sitemap", icon: Plane },
];

export default function PageLayout({
  children,
  title,
  description,
}: PageLayoutProps) {
  const location = useLocation();
  const contextualTopic = useContextualHelp(location.pathname);

  return (
    <div className="min-h-screen relative">
      {/* Liquid scroll indicator */}
      <LiquidScrollIndicator />

      {/* Liquid background gradient */}
      <div className="fixed inset-0 bg-gradient-to-br from-blue-50/80 via-purple-50/80 to-cyan-50/80 dark:from-gray-900/80 dark:via-blue-900/80 dark:to-purple-900/80" />

      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Header */}
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
            The Dunbar Hierarchy
          </motion.h1>
          <motion.p
            className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Explore the cognitive limits of human social relationships across
            different levels of intimacy and frequency of contact.
          </motion.p>
        </motion.div>

        {/* Navigation */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <nav className="flex flex-wrap justify-center gap-2 p-3 bg-white/60 dark:bg-gray-900/60 rounded-2xl backdrop-blur-xl border border-white/20 dark:border-gray-700/20">
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
                    {/* Liquid hover effect */}
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
            <HelpSystem contextualTopic={contextualTopic} />
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
        style={{
          borderRadius: "63% 37% 54% 46% / 55% 48% 52% 45%",
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
