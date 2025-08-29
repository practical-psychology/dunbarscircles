import { motion } from "framer-motion";

interface LiquidLoadingScreenProps {
  skipDelay?: boolean;
}

const LiquidLoadingScreen = ({}: LiquidLoadingScreenProps) => {
  return (
    <div className="fixed inset-0 bg-gradient-to-br from-blue-50 via-purple-50 to-cyan-50 dark:from-gray-900 dark:via-blue-900 dark:to-purple-900 flex items-center justify-center z-50">
      {/* Animated liquid blobs */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute top-1/4 left-1/4 w-64 h-64 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full"
          animate={{
            scale: [1, 1.2, 1],
            x: [0, 50, 0],
            y: [0, -30, 0],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute top-1/2 right-1/4 w-48 h-48 bg-gradient-to-br from-cyan-400/20 to-green-400/20 rounded-full"
          animate={{
            scale: [1.2, 1, 1.2],
            x: [0, -40, 0],
            y: [0, 40, 0],
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1,
          }}
          style={{
            borderRadius: "40% 60% 54% 46% / 49% 60% 40% 51%",
          }}
        />
        <motion.div
          className="absolute bottom-1/4 left-1/2 w-56 h-56 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-full"
          animate={{
            scale: [1, 1.3, 1],
            x: [0, 30, 0],
            y: [0, -50, 0],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2,
          }}
          style={{
            borderRadius: "54% 46% 38% 62% / 49% 70% 30% 51%",
          }}
        />
      </div>

      {/* Loading content */}
      <div className="relative z-10 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 bg-clip-text text-transparent mb-2">
            Dunbar Circles
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Dunbar's Number Visualization
          </p>
        </motion.div>

        {/* Liquid loading animation */}
        <motion.div
          className="relative w-64 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden mx-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <motion.div
            className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-500 via-purple-500 to-cyan-500 rounded-full"
            initial={{ width: "0%" }}
            animate={{ width: "100%" }}
            transition={{
              duration: 1.5,
              delay: 0.8,
              ease: [0.4, 0, 0.2, 1],
            }}
            style={{
              borderRadius: "60% 40% 30% 70% / 60% 30% 70% 40%",
            }}
          />

          {/* Liquid droplets */}
          <motion.div
            className="absolute top-0 right-0 w-3 h-3 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full"
            animate={{
              scale: [0, 1, 0],
              x: [0, -20, -40],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              delay: 1.2,
            }}
          />
        </motion.div>

        <motion.p
          className="text-sm text-gray-500 dark:text-gray-400 mt-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 1.5 }}
        >
          Preparing your social network visualization...
        </motion.p>
      </div>
    </div>
  );
};

export default LiquidLoadingScreen;
