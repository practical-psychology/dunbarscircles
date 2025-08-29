import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface LiquidCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  hover?: boolean;
  glow?: boolean;
}

const LiquidCard = React.forwardRef<HTMLDivElement, LiquidCardProps>(
  ({ className, children, hover = true, glow = false, ...props }, ref) => {
    return (
      <motion.div
        ref={ref}
        className={cn(
          "relative overflow-hidden",
          "bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl",
          "border border-gray-200/50 dark:border-gray-700/50",
          "shadow-lg",
          className,
        )}
        style={{
          borderRadius: "24px",
        }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
        whileHover={
          hover
            ? {
                y: -4,
                boxShadow: "0 20px 40px rgba(0, 0, 0, 0.1)",
              }
            : undefined
        }
        {...(props as any)}
      >
        {/* Liquid border animation */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-cyan-500/20 opacity-0"
          style={{
            borderRadius: "26px",
            margin: "-2px",
          }}
          initial={{
            opacity: 0,
            scale: 1,
          }}
          whileHover={{
            opacity: glow ? 1 : 0.5,
            scale: [1, 1.02, 1],
          }}
          transition={{
            opacity: { duration: 0.3 },
            scale: {
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            },
          }}
        />

        {/* Liquid wave effect */}
        <motion.div
          className="absolute bottom-0 left-0 w-full h-full bg-gradient-to-t from-blue-500/5 to-transparent opacity-0"
          initial={{
            clipPath: "polygon(0% 100%, 100% 100%, 100% 100%, 0% 100%)",
            opacity: 0,
          }}
          whileHover={{
            opacity: 1,
            clipPath: [
              "polygon(0% 100%, 100% 100%, 100% 100%, 0% 100%)",
              "polygon(0% 85%, 15% 88%, 32% 82%, 54% 90%, 70% 85%, 84% 88%, 100% 82%, 100% 100%, 0% 100%)",
              "polygon(0% 90%, 16% 85%, 34% 88%, 51% 82%, 67% 90%, 84% 85%, 100% 88%, 100% 100%, 0% 100%)",
              "polygon(0% 85%, 15% 88%, 32% 82%, 54% 90%, 70% 85%, 84% 88%, 100% 82%, 100% 100%, 0% 100%)",
            ],
          }}
          transition={{
            opacity: { duration: 0.3 },
            clipPath: {
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut",
            },
          }}
        />

        {/* Content */}
        <div className="relative z-10 p-6">{children}</div>

        {/* Floating liquid droplets */}
        <motion.div
          className="absolute top-4 right-4 w-2 h-2 bg-gradient-to-br from-blue-400 to-purple-400 rounded-full opacity-0"
          animate={{
            opacity: [0, 1, 0],
            scale: [0.5, 1, 0.5],
            y: [0, -10, 0],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            delay: Math.random() * 2,
          }}
        />
        <motion.div
          className="absolute top-8 right-8 w-1.5 h-1.5 bg-gradient-to-br from-cyan-400 to-green-400 rounded-full opacity-0"
          animate={{
            opacity: [0, 1, 0],
            scale: [0.5, 1, 0.5],
            y: [0, -8, 0],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            delay: Math.random() * 2,
          }}
        />
      </motion.div>
    );
  },
);

LiquidCard.displayName = "LiquidCard";

export { LiquidCard };
