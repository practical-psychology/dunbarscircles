import { motion } from "framer-motion";
import { LiquidCard } from "@/components/ui/liquid-card";
import { LiquidButton } from "@/components/ui/liquid-button";
import { LiquidInput } from "@/components/ui/liquid-input";
import { Droplet, Waves, Zap } from "lucide-react";

export function LiquidShowcase() {
  return (
    <div className="space-y-8 p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-center"
      >
        <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 bg-clip-text text-transparent mb-4">
          Liquid Animation Showcase
        </h2>
        <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
          Experience the fluid, organic animations that bring life to every
          interaction
        </p>
      </motion.div>

      {/* Button Showcase */}
      <LiquidCard>
        <div className="space-y-4">
          <div className="flex items-center gap-3 mb-4">
            <motion.div
              className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl text-white"
              whileHover={{ scale: 1.1, rotate: 5 }}
            >
              <Zap className="w-5 h-5" />
            </motion.div>
            <h3 className="text-xl font-bold">Liquid Buttons</h3>
          </div>

          <div className="flex flex-wrap gap-4">
            <LiquidButton variant="primary">Primary Action</LiquidButton>
            <LiquidButton variant="secondary">Secondary</LiquidButton>
            <LiquidButton variant="ghost">Ghost Button</LiquidButton>
            <LiquidButton variant="default" size="lg">
              Large Button
            </LiquidButton>
          </div>

          <p className="text-sm text-gray-600 dark:text-gray-300">
            Each button features ripple effects, morphing backgrounds, and
            smooth hover animations
          </p>
        </div>
      </LiquidCard>

      {/* Input Showcase */}
      <LiquidCard>
        <div className="space-y-4">
          <div className="flex items-center gap-3 mb-4">
            <motion.div
              className="p-2 bg-gradient-to-br from-cyan-500 to-green-600 rounded-xl text-white"
              whileHover={{ scale: 1.1, rotate: -5 }}
            >
              <Droplet className="w-5 h-5" />
            </motion.div>
            <h3 className="text-xl font-bold">Liquid Inputs</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <LiquidInput label="Email Address" placeholder="Enter your email" />
            <LiquidInput label="Full Name" placeholder="Your name" />
            <LiquidInput label="Message" placeholder="Type your message..." />
            <LiquidInput label="Phone" placeholder="+1 (555) 123-4567" />
          </div>

          <p className="text-sm text-gray-600 dark:text-gray-300">
            Floating labels, liquid focus effects, and animated droplets enhance
            the input experience
          </p>
        </div>
      </LiquidCard>

      {/* Animation Showcase */}
      <LiquidCard>
        <div className="space-y-6">
          <div className="flex items-center gap-3 mb-4">
            <motion.div
              className="p-2 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl text-white"
              whileHover={{ scale: 1.1, rotate: 5 }}
            >
              <Waves className="w-5 h-5" />
            </motion.div>
            <h3 className="text-xl font-bold">Liquid Animations</h3>
          </div>

          {/* Morphing Blobs */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center space-y-3">
              <motion.div
                className="w-20 h-20 bg-gradient-to-br from-blue-400 to-purple-600 mx-auto"
                animate={{
                  borderRadius: [
                    "63% 37% 54% 46% / 55% 48% 52% 45%",
                    "40% 60% 54% 46% / 49% 60% 40% 51%",
                    "54% 46% 38% 62% / 49% 70% 30% 51%",
                    "63% 37% 54% 46% / 55% 48% 52% 45%",
                  ],
                  scale: [1, 1.1, 1],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
              <h4 className="font-semibold">Morphing Blobs</h4>
              <p className="text-xs text-gray-600 dark:text-gray-300">
                Organic shape transformations
              </p>
            </div>

            <div className="text-center space-y-3">
              <div className="relative w-20 h-20 mx-auto">
                <motion.div
                  className="absolute inset-0 bg-gradient-to-br from-cyan-400 to-green-600 rounded-full"
                  animate={{
                    scale: [1, 1.3, 1],
                    opacity: [0.7, 0.3, 0.7],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />
                <motion.div
                  className="absolute inset-2 bg-gradient-to-br from-cyan-500 to-green-700 rounded-full"
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [1, 0.8, 1],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 0.5,
                  }}
                />
              </div>
              <h4 className="font-semibold">Ripple Effects</h4>
              <p className="text-xs text-gray-600 dark:text-gray-300">
                Concentric wave animations
              </p>
            </div>

            <div className="text-center space-y-3">
              <div className="relative w-20 h-20 mx-auto overflow-hidden rounded-2xl bg-gradient-to-br from-purple-400 to-pink-600">
                <motion.div
                  className="absolute bottom-0 left-0 w-full h-full bg-gradient-to-t from-white/30 to-transparent"
                  animate={{
                    clipPath: [
                      "polygon(0% 100%, 100% 100%, 100% 100%, 0% 100%)",
                      "polygon(0% 70%, 15% 75%, 32% 65%, 54% 80%, 70% 70%, 84% 75%, 100% 65%, 100% 100%, 0% 100%)",
                      "polygon(0% 80%, 16% 70%, 34% 75%, 51% 65%, 67% 80%, 84% 70%, 100% 75%, 100% 100%, 0% 100%)",
                      "polygon(0% 70%, 15% 75%, 32% 65%, 54% 80%, 70% 70%, 84% 75%, 100% 65%, 100% 100%, 0% 100%)",
                    ],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />
              </div>
              <h4 className="font-semibold">Wave Motion</h4>
              <p className="text-xs text-gray-600 dark:text-gray-300">
                Flowing wave patterns
              </p>
            </div>
          </div>

          <p className="text-sm text-gray-600 dark:text-gray-300">
            All animations are optimized for performance using CSS transforms
            and GPU acceleration
          </p>
        </div>
      </LiquidCard>
    </div>
  );
}
