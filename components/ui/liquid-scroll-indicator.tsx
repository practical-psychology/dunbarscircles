import { useEffect, useState } from "react";
import { motion } from "framer-motion";

export function LiquidScrollIndicator() {
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const updateScrollProgress = () => {
      const scrollPx = document.documentElement.scrollTop;
      const winHeightPx =
        document.documentElement.scrollHeight -
        document.documentElement.clientHeight;
      const scrolled = scrollPx / winHeightPx;
      setScrollProgress(scrolled);
    };

    window.addEventListener("scroll", updateScrollProgress);
    return () => window.removeEventListener("scroll", updateScrollProgress);
  }, []);

  return (
    <div className="fixed top-0 left-0 w-full h-1 bg-gray-200/30 dark:bg-gray-700/30 z-50 backdrop-blur-sm">
      <motion.div
        className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-cyan-500 origin-left"
        style={{
          scaleX: scrollProgress,
          borderRadius: "0 4px 4px 0",
        }}
        initial={{ scaleX: 0 }}
        animate={{
          borderRadius: ["0 4px 4px 0", "0 8px 8px 0", "0 4px 4px 0"],
        }}
        transition={{
          borderRadius: {
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          },
        }}
      />

      {/* Liquid droplet at the end */}
      {scrollProgress > 0.1 && (
        <motion.div
          className="absolute top-0 h-1 w-3 bg-gradient-to-r from-purple-500 to-cyan-500"
          style={{
            left: `${scrollProgress * 100}%`,
            borderRadius: "50%",
          }}
          animate={{
            scale: [1, 1.5, 1],
            opacity: [0.7, 1, 0.7],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      )}
    </div>
  );
}
