import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { LiquidCard } from "@/components/ui/liquid-card";
import { LiquidButton } from "@/components/ui/liquid-button";
import { NetworkDiagram } from "@/components/network-diagram";
import { Eye, Users, Heart, Book, Share2 } from "lucide-react";
import PageLayout from "../components/PageLayout";
import { dunbarLevels } from "../data/dunbarLevels";

export default function HomePage() {
  const [selectedLevel, setSelectedLevel] = useState<string | null>(null);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: [0.4, 0, 0.2, 1] as const,
      },
    },
  };

  return (
    <PageLayout
      title="Overview"
      description="Interactive network diagram and relationship category overview"
    >
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-8"
      >
        <motion.div variants={itemVariants}>
          <LiquidCard glow>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <motion.div
                  className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl text-white"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ type: "spring", stiffness: 400, damping: 17 }}
                >
                  <Eye className="w-5 h-5" />
                </motion.div>
                <div>
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    Interactive Network Diagram
                  </h2>
                  <p className="text-gray-600 dark:text-gray-300">
                    Click on any level to explore the details of that
                    relationship category
                  </p>
                </div>
              </div>

              <div className="relative">
                <NetworkDiagram
                  levels={dunbarLevels}
                  selectedLevel={selectedLevel}
                  onLevelSelect={setSelectedLevel}
                />

                {/* Liquid overlay effects */}
                <motion.div
                  className="absolute top-4 left-4 w-3 h-3 bg-gradient-to-br from-blue-400 to-cyan-400 rounded-full opacity-60"
                  animate={{
                    scale: [1, 1.5, 1],
                    opacity: [0.6, 0.3, 0.6],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />
                <motion.div
                  className="absolute bottom-6 right-6 w-2 h-2 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full opacity-60"
                  animate={{
                    scale: [1, 1.3, 1],
                    opacity: [0.6, 0.4, 0.6],
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 1,
                  }}
                />
              </div>
            </div>
          </LiquidCard>
        </motion.div>

        <motion.div
          variants={itemVariants}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          <LiquidCard hover>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <motion.div
                  className="p-2 bg-gradient-to-br from-red-500 to-pink-600 rounded-xl text-white"
                  whileHover={{ scale: 1.1, rotate: -5 }}
                  transition={{ type: "spring", stiffness: 400, damping: 17 }}
                >
                  <Heart className="w-5 h-5" />
                </motion.div>
                <div>
                  <h3 className="text-xl font-bold text-red-600 dark:text-red-400">
                    Intimate Levels
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    5-50 people
                  </p>
                </div>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                High emotional investment, frequent contact, and deep personal
                connections.
              </p>
              <LiquidButton
                variant="primary"
                size="sm"
                className="w-full"
                aria-label="Explore intimate relationship levels (5-50 people)"
              >
                Explore Intimate Bonds
              </LiquidButton>
            </div>
          </LiquidCard>

          <LiquidCard hover>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <motion.div
                  className="p-2 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl text-white"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ type: "spring", stiffness: 400, damping: 17 }}
                >
                  <Users className="w-5 h-5" />
                </motion.div>
                <div>
                  <h3 className="text-xl font-bold text-green-600 dark:text-green-400">
                    Social Levels
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    150-1,500 people
                  </p>
                </div>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Meaningful relationships with moderate maintenance requirements.
              </p>
              <LiquidButton
                variant="secondary"
                size="sm"
                className="w-full"
                aria-label="Discover social relationship levels (150-1,500 people)"
              >
                Discover Social Circles
              </LiquidButton>
            </div>
          </LiquidCard>

          <LiquidCard hover>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <motion.div
                  className="p-2 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl text-white"
                  whileHover={{ scale: 1.1, rotate: -5 }}
                  transition={{ type: "spring", stiffness: 400, damping: 17 }}
                >
                  <Share2 className="w-5 h-5" />
                </motion.div>
                <div>
                  <h3 className="text-xl font-bold text-purple-600 dark:text-purple-400">
                    Extended Levels
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    5,000-50,000 people
                  </p>
                </div>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Awareness and recognition with minimal active maintenance.
              </p>
              <LiquidButton
                variant="ghost"
                size="sm"
                className="w-full"
                aria-label="View extended network levels (5,000-50,000 people)"
              >
                View Extended Network
              </LiquidButton>
            </div>
          </LiquidCard>
        </motion.div>

        {/* Floating action section */}
        <motion.div variants={itemVariants} className="text-center space-y-4">
          <motion.h3
            className="text-2xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 bg-clip-text text-transparent"
            animate={{
              backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
            }}
            transition={{
              duration: 5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            Ready to explore your social network?
          </motion.h3>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/dashboard">
              <LiquidButton
                variant="primary"
                size="lg"
                aria-label="Start exploring your social network visualization"
              >
                Start Visualization
              </LiquidButton>
            </Link>
            <Link to="/onboarding">
              <LiquidButton
                variant="ghost"
                size="lg"
                className="flex items-center gap-2"
                aria-label="Start interactive tutorial and user guide"
              >
                <Book className="w-4 h-4" />
                Tutorial & Guide
              </LiquidButton>
            </Link>
          </div>
        </motion.div>
      </motion.div>
    </PageLayout>
  );
}
