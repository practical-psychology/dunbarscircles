import React, { useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface LiquidInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

const LiquidInput = React.forwardRef<HTMLInputElement, LiquidInputProps>(
  ({ className, label, error, ...props }, ref) => {
    const [isFocused, setIsFocused] = useState(false);
    const [hasValue, setHasValue] = useState(false);

    const handleFocus = () => setIsFocused(true);
    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(false);
      setHasValue(e.target.value.length > 0);
      props.onBlur?.(e);
    };

    return (
      <div className="relative">
        <motion.div
          className="relative"
          whileFocus={{ scale: 1.02 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
        >
          {/* Liquid background */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-2xl opacity-0"
            animate={{
              opacity: isFocused ? 1 : 0,
              borderRadius: isFocused
                ? [
                    "60% 40% 30% 70% / 60% 30% 70% 40%",
                    "30% 60% 70% 40% / 50% 60% 30% 60%",
                    "60% 40% 30% 70% / 60% 30% 70% 40%",
                  ]
                : "20px",
            }}
            transition={{
              opacity: { duration: 0.3 },
              borderRadius: { duration: 4, repeat: Infinity },
            }}
          />

          <input
            ref={ref}
            className={cn(
              "relative z-10 w-full px-4 py-3 text-sm",
              "bg-white/60 dark:bg-gray-900/60 backdrop-blur-xl",
              "border border-gray-200/50 dark:border-gray-700/50",
              "rounded-2xl transition-all duration-300",
              "focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent",
              "placeholder:text-gray-400 dark:placeholder:text-gray-500",
              "text-gray-900 dark:text-white",
              error && "border-red-500/50 focus:ring-red-500/50",
              className,
            )}
            onFocus={handleFocus}
            onBlur={handleBlur}
            {...props}
          />

          {/* Floating label */}
          {label && (
            <motion.label
              className={cn(
                "absolute left-4 pointer-events-none transition-all duration-300",
                "text-gray-500 dark:text-gray-400",
                isFocused || hasValue || props.value
                  ? "top-2 text-xs text-blue-600 dark:text-blue-400"
                  : "top-3 text-sm",
              )}
              animate={{
                y: isFocused || hasValue || props.value ? -8 : 0,
                scale: isFocused || hasValue || props.value ? 0.85 : 1,
              }}
              transition={{ duration: 0.2 }}
            >
              {label}
            </motion.label>
          )}

          {/* Liquid ripple effect */}
          {isFocused && (
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-2xl pointer-events-none"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
            />
          )}
        </motion.div>

        {/* Error message */}
        {error && (
          <motion.p
            className="mt-2 text-xs text-red-600 dark:text-red-400"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {error}
          </motion.p>
        )}

        {/* Floating droplets */}
        {isFocused && (
          <>
            <motion.div
              className="absolute top-2 right-4 w-1 h-1 bg-blue-400 rounded-full"
              animate={{
                opacity: [0, 1, 0],
                scale: [0.5, 1, 0.5],
                y: [0, -5, 0],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: 0.5,
              }}
            />
            <motion.div
              className="absolute top-4 right-6 w-0.5 h-0.5 bg-purple-400 rounded-full"
              animate={{
                opacity: [0, 1, 0],
                scale: [0.5, 1, 0.5],
                y: [0, -3, 0],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                delay: 1,
              }}
            />
          </>
        )}
      </div>
    );
  },
);

LiquidInput.displayName = "LiquidInput";

export { LiquidInput };
