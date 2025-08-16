import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";

interface Level {
  id: string;
  name: string;
  count: number;
  description: string;
  color: string;
  textColor: string;
  bgColor: string;
  category: string;
}

interface NetworkDiagramProps {
  levels: Level[];
  selectedLevel: string | null;
  onLevelSelect: (levelId: string | null) => void;
}

export function NetworkDiagram({
  levels,
  selectedLevel,
  onLevelSelect,
}: NetworkDiagramProps) {
  const [hoveredLevel, setHoveredLevel] = useState<string | null>(null);
  useEffect(() => {
    // Trigger re-render when levels change
  }, [levels]);

  const getCircleSize = (count: number) => {
    if (count <= 5) return 40;
    if (count <= 15) return 60;
    if (count <= 50) return 80;
    if (count <= 150) return 100;
    if (count <= 500) return 120;
    if (count <= 1500) return 140;
    if (count <= 5000) return 160;
    if (count <= 15000) return 180;
    return 200;
  };

  const getPosition = (index: number, total: number) => {
    const angle = (index * 2 * Math.PI) / total;
    const radius = 200 + index * 20;
    const toFixed = (n: number) => Number(n.toFixed(3));
    return {
      x: toFixed(300 + radius * Math.cos(angle)),
      y: toFixed(300 + radius * Math.sin(angle)),
    };
  };

  return (
    <div
      data-testid="network-diagram"
      className="relative w-full h-[600px] bg-gradient-to-br from-blue-50/50 to-purple-50/50 dark:from-gray-900/50 dark:to-blue-900/50 rounded-2xl border border-white/20 dark:border-gray-700/20 backdrop-blur-xl overflow-hidden"
      role="region"
      aria-label="Interactive network diagram showing relationship levels according to Dunbar's hierarchy"
    >
      {/* Liquid background animation */}
      <div className="absolute inset-0 opacity-30">
        <motion.div
          className="absolute top-10 left-10 w-20 h-20 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full"
          animate={{
            scale: [1, 1.2, 1],
            x: [0, 30, 0],
            y: [0, -20, 0],
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
          className="absolute bottom-10 right-10 w-16 h-16 bg-gradient-to-br from-cyan-400/20 to-green-400/20 rounded-full"
          animate={{
            scale: [1.2, 1, 1.2],
            x: [0, -25, 0],
            y: [0, 15, 0],
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

      <svg
        width="100%"
        height="100%"
        viewBox="0 0 800 600"
        className="relative z-10"
        aria-labelledby="network-diagram-title"
        aria-describedby="network-diagram-desc"
      >
        <title id="network-diagram-title">
          Dunbar's Number Network Visualization
        </title>
        <desc id="network-diagram-desc">
          Interactive network diagram showing {levels.length} relationship
          levels. Click on circles to select levels and view details.
          {selectedLevel
            ? `Currently selected: ${levels.find((l) => l.id === selectedLevel)?.name}`
            : "No level selected"}
        </desc>
        {/* Liquid gradient definitions */}
        <defs>
          <radialGradient id="centerGradient" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#3b82f6" />
            <stop offset="100%" stopColor="#8b5cf6" />
          </radialGradient>
          <filter id="liquidGlow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Center point with liquid animation */}
        <motion.g
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.8, type: "spring", stiffness: 200 }}
        >
          <motion.circle
            cx={400}
            cy={300}
            r={25}
            fill="url(#centerGradient)"
            className="cursor-pointer drop-shadow-lg"
            filter="url(#liquidGlow)"
            animate={{
              r: [25, 28, 25],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            role="button"
            aria-label="Center node representing you in the relationship network"
            tabIndex={0}
          />
          <text
            x={400}
            y={305}
            textAnchor="middle"
            className="text-sm fill-white font-bold pointer-events-none"
            aria-hidden="true"
          >
            YOU
          </text>
        </motion.g>

        {/* Connection lines with liquid flow */}
        {levels.map((level, index) => {
          const pos = getPosition(index, levels.length);
          return (
            <motion.g key={`line-${level.id}`}>
              <motion.line
                x1={400}
                y1={300}
                x2={pos.x}
                y2={pos.y}
                stroke="url(#liquidConnection)"
                strokeWidth={3}
                strokeOpacity={0.4}
                strokeDasharray={
                  level.category === "extended" ? "8,4" : undefined
                }
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1.5, delay: index * 0.1 }}
              />
              <defs>
                <linearGradient
                  id="liquidConnection"
                  x1="0%"
                  y1="0%"
                  x2="100%"
                  y2="0%"
                >
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.6" />
                  <stop offset="50%" stopColor="#8b5cf6" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.6" />
                </linearGradient>
              </defs>
            </motion.g>
          );
        })}

        {/* Level circles with liquid morphing */}
        {levels.map((level, index) => {
          const pos = getPosition(index, levels.length);
          const size = getCircleSize(level.count);
          const isSelected = selectedLevel === level.id;
          const isHovered = hoveredLevel === level.id;

          return (
            <motion.g
              key={level.id}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{
                duration: 0.6,
                delay: 0.5 + index * 0.1,
                type: "spring",
                stiffness: 200,
              }}
            >
              <defs>
                <radialGradient
                  id={`gradient-${level.id}`}
                  cx="50%"
                  cy="50%"
                  r="50%"
                >
                  <stop
                    offset="0%"
                    stopColor={
                      level.color.includes("red")
                        ? "#ef4444"
                        : level.color.includes("green")
                          ? "#10b981"
                          : level.color.includes("blue")
                            ? "#3b82f6"
                            : level.color.includes("purple")
                              ? "#8b5cf6"
                              : "#06b6d4"
                    }
                    stopOpacity="0.9"
                  />
                  <stop
                    offset="100%"
                    stopColor={
                      level.color.includes("red")
                        ? "#dc2626"
                        : level.color.includes("green")
                          ? "#059669"
                          : level.color.includes("blue")
                            ? "#2563eb"
                            : level.color.includes("purple")
                              ? "#7c3aed"
                              : "#0891b2"
                    }
                    stopOpacity="0.7"
                  />
                </radialGradient>
              </defs>

              <motion.circle
                cx={pos.x}
                cy={pos.y}
                r={size / 2}
                fill={`url(#gradient-${level.id})`}
                stroke={isSelected ? "#1f2937" : "white"}
                strokeWidth={isSelected ? 4 : 2}
                className="cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                filter="url(#liquidGlow)"
                onMouseEnter={() => setHoveredLevel(level.id)}
                onMouseLeave={() => setHoveredLevel(null)}
                onClick={() => onLevelSelect(isSelected ? null : level.id)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    onLevelSelect(isSelected ? null : level.id);
                  }
                }}
                animate={{
                  r: isHovered || isSelected ? size / 2 + 5 : size / 2,
                  strokeWidth: isSelected ? 4 : isHovered ? 3 : 2,
                }}
                transition={{ duration: 0.3, type: "spring", stiffness: 300 }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                role="button"
                aria-label={`${level.name} level with ${level.count} relationships. ${level.description}. ${isSelected ? "Currently selected" : "Click to select"}`}
                aria-pressed={isSelected}
                tabIndex={0}
                data-testid={index === 0 ? "mock-node" : undefined}
              />

              {/* Ripple effect on hover */}
              {(isHovered || isSelected) && (
                <motion.circle
                  cx={pos.x}
                  cy={pos.y}
                  r={size / 2}
                  fill="none"
                  stroke={`url(#gradient-${level.id})`}
                  strokeWidth={2}
                  strokeOpacity={0.6}
                  initial={{ r: size / 2, opacity: 0.6 }}
                  animate={{ r: size / 2 + 20, opacity: 0 }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                />
              )}

              <text
                x={pos.x}
                y={pos.y - 5}
                textAnchor="middle"
                className="text-xs fill-white font-bold pointer-events-none drop-shadow-sm"
                aria-hidden="true"
              >
                {level.count.toLocaleString()}
              </text>
              <text
                x={pos.x}
                y={pos.y + 8}
                textAnchor="middle"
                className="text-xs fill-white font-medium pointer-events-none drop-shadow-sm"
                aria-hidden="true"
              >
                {level.name.split(" ")[0]}
              </text>
            </motion.g>
          );
        })}
      </svg>

      {/* Legend with liquid styling */}
      <motion.div
        className="absolute top-4 left-4 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-2xl p-4 shadow-xl border border-white/20 dark:border-gray-700/20"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, delay: 0.8 }}
      >
        <h3 className="font-bold text-sm mb-3 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Categories
        </h3>
        <div className="space-y-2">
          <motion.div
            className="flex items-center gap-3"
            whileHover={{ x: 2 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
          >
            <motion.div
              className="w-3 h-3 bg-gradient-to-br from-red-400 to-red-600 rounded-full"
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity, delay: 0 }}
            />
            <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
              Intimate (5-50)
            </span>
          </motion.div>
          <motion.div
            className="flex items-center gap-3"
            whileHover={{ x: 2 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
          >
            <motion.div
              className="w-3 h-3 bg-gradient-to-br from-green-400 to-green-600 rounded-full"
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
            />
            <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
              Social (150-1.5K)
            </span>
          </motion.div>
          <motion.div
            className="flex items-center gap-3"
            whileHover={{ x: 2 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
          >
            <motion.div
              className="w-3 h-3 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full"
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity, delay: 1 }}
            />
            <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
              Extended (5K-50K)
            </span>
          </motion.div>
        </div>
      </motion.div>

      {/* Selected level info with liquid styling */}
      {selectedLevel && (
        <motion.div
          className="absolute bottom-4 right-4 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-2xl p-4 shadow-xl max-w-xs border border-white/20 dark:border-gray-700/20"
          initial={{ opacity: 0, y: 20, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.9 }}
          transition={{ duration: 0.4, type: "spring", stiffness: 300 }}
        >
          {(() => {
            const level = levels.find((l) => l.id === selectedLevel);
            if (!level) return null;
            return (
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <motion.div
                    className={`w-4 h-4 bg-gradient-to-br ${
                      level.color.includes("red")
                        ? "from-red-400 to-red-600"
                        : level.color.includes("green")
                          ? "from-green-400 to-green-600"
                          : level.color.includes("blue")
                            ? "from-blue-400 to-blue-600"
                            : level.color.includes("purple")
                              ? "from-purple-400 to-purple-600"
                              : "from-cyan-400 to-cyan-600"
                    } rounded-full`}
                    animate={{ rotate: [0, 360] }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                  />
                  <h3 className="font-bold text-sm text-gray-900 dark:text-white">
                    {level.name}
                  </h3>
                  <Badge
                    variant="secondary"
                    className="bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900 text-blue-800 dark:text-blue-200 border-0"
                  >
                    {level.count.toLocaleString()}
                  </Badge>
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
                  {level.description}
                </p>
              </div>
            );
          })()}
        </motion.div>
      )}
    </div>
  );
}
