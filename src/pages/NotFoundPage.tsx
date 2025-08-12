import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { LiquidCard } from "@/components/ui/liquid-card";
import { LiquidButton } from "@/components/ui/liquid-button";
import { Home, Map } from "lucide-react";

export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Liquid background blobs */}
      <div className="absolute inset-0 pointer-events-none">
        <motion.div
          className="absolute top-1/4 left-1/4 w-64 h-64 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full"
          animate={{
            scale: [1, 1.2, 1],
            x: [0, 50, 0],
            y: [0, -30, 0],
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
          className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-gradient-to-br from-cyan-400/20 to-green-400/20 rounded-full"
          animate={{
            scale: [1.2, 1, 1.2],
            x: [0, -40, 0],
            y: [0, 40, 0],
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

      <div className="container mx-auto px-4 py-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
        >
          <LiquidCard className="max-w-md mx-auto text-center" glow>
            <div className="space-y-6">
              {/* 404 Number with liquid animation */}
              <motion.div
                className="relative"
                animate={{
                  scale: [1, 1.05, 1],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                <h1 className="text-8xl font-bold bg-gradient-to-r from-blue-500 via-purple-500 to-cyan-500 bg-clip-text text-transparent">
                  404
                </h1>

                {/* Floating droplets around 404 */}
                <motion.div
                  className="absolute top-4 right-8 w-2 h-2 bg-blue-400 rounded-full"
                  animate={{
                    opacity: [0, 1, 0],
                    scale: [0.5, 1, 0.5],
                    y: [0, -10, 0],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    delay: 0.5,
                  }}
                />
                <motion.div
                  className="absolute bottom-6 left-6 w-1.5 h-1.5 bg-purple-400 rounded-full"
                  animate={{
                    opacity: [0, 1, 0],
                    scale: [0.5, 1, 0.5],
                    y: [0, 8, 0],
                  }}
                  transition={{
                    duration: 2.5,
                    repeat: Infinity,
                    delay: 1,
                  }}
                />
              </motion.div>

              <div className="space-y-2">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Page Not Found
                </h2>
                <p className="text-gray-600 dark:text-gray-300">
                  The page you're looking for doesn't exist or has been moved.
                </p>
              </div>

              {/* Liquid buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/">
                  <LiquidButton
                    variant="primary"
                    className="flex items-center gap-2"
                  >
                    <Home className="w-4 h-4" />
                    Go to Overview
                  </LiquidButton>
                </Link>
                <Link to="/sitemap">
                  <LiquidButton
                    variant="ghost"
                    className="flex items-center gap-2"
                  >
                    <Map className="w-4 h-4" />
                    View Sitemap
                  </LiquidButton>
                </Link>
              </div>

              {/* Liquid wave at bottom */}
              <motion.div
                className="relative h-16 -mx-6 -mb-6 overflow-hidden rounded-b-2xl"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1, delay: 0.5 }}
              >
                <motion.div
                  className="absolute bottom-0 left-0 w-full h-full bg-gradient-to-t from-blue-500/10 to-transparent"
                  animate={{
                    clipPath: [
                      "polygon(0% 100%, 100% 100%, 100% 100%, 0% 100%)",
                      "polygon(0% 70%, 15% 75%, 32% 65%, 54% 80%, 70% 70%, 84% 75%, 100% 65%, 100% 100%, 0% 100%)",
                      "polygon(0% 80%, 16% 70%, 34% 75%, 51% 65%, 67% 80%, 84% 70%, 100% 75%, 100% 100%, 0% 100%)",
                      "polygon(0% 70%, 15% 75%, 32% 65%, 54% 80%, 70% 70%, 84% 75%, 100% 65%, 100% 100%, 0% 100%)",
                    ],
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />
              </motion.div>
            </div>
          </LiquidCard>
        </motion.div>
      </div>
    </div>
  );
}
