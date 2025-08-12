import { Moon, Sun } from "lucide-react";
import { motion } from "framer-motion";
import { useTheme } from "@/components/theme-provider";

export function LiquidThemeToggle() {
  const { theme, setTheme } = useTheme();

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  return (
    <motion.button
      onClick={toggleTheme}
      className="relative p-3 rounded-2xl bg-white/60 dark:bg-gray-900/60 backdrop-blur-xl border border-white/20 dark:border-gray-700/20 shadow-lg overflow-hidden group"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
    >
      {/* Liquid background effect */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-yellow-400/20 to-blue-400/20"
        initial={{ borderRadius: "60% 40% 30% 70% / 60% 30% 70% 40%" }}
        animate={{
          borderRadius: [
            "60% 40% 30% 70% / 60% 30% 70% 40%",
            "30% 60% 70% 40% / 50% 60% 30% 60%",
            "70% 30% 40% 60% / 40% 70% 60% 30%",
            "60% 40% 30% 70% / 60% 30% 70% 40%",
          ],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Icon container */}
      <motion.div
        className="relative z-10 w-6 h-6 flex items-center justify-center"
        animate={{ rotate: theme === "dark" ? 180 : 0 }}
        transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
      >
        <motion.div
          initial={false}
          animate={{
            scale: theme === "light" ? 1 : 0,
            opacity: theme === "light" ? 1 : 0,
          }}
          transition={{ duration: 0.3 }}
          className="absolute"
        >
          <Sun className="w-5 h-5 text-yellow-600" />
        </motion.div>

        <motion.div
          initial={false}
          animate={{
            scale: theme === "dark" ? 1 : 0,
            opacity: theme === "dark" ? 1 : 0,
          }}
          transition={{ duration: 0.3 }}
          className="absolute"
        >
          <Moon className="w-5 h-5 text-blue-400" />
        </motion.div>
      </motion.div>

      {/* Ripple effect */}
      <motion.div
        className="absolute inset-0 bg-white/30 dark:bg-gray-800/30 rounded-2xl opacity-0 group-active:opacity-100"
        initial={{ scale: 0 }}
        whileTap={{ scale: 1 }}
        transition={{ duration: 0.2 }}
      />
    </motion.button>
  );
}
