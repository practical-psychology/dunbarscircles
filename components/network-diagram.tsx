"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"

interface Level {
  id: string
  name: string
  count: number
  description: string
  color: string
  textColor: string
  bgColor: string
  category: string
}

interface NetworkDiagramProps {
  levels: Level[]
  selectedLevel: string | null
  onLevelSelect: (levelId: string | null) => void
}

export function NetworkDiagram({ levels, selectedLevel, onLevelSelect }: NetworkDiagramProps) {
  const [hoveredLevel, setHoveredLevel] = useState<string | null>(null)

  const getCircleSize = (count: number) => {
    if (count <= 5) return 40
    if (count <= 15) return 60
    if (count <= 50) return 80
    if (count <= 150) return 100
    if (count <= 500) return 120
    if (count <= 1500) return 140
    if (count <= 5000) return 160
    if (count <= 15000) return 180
    return 200
  }

  const getPosition = (index: number, total: number) => {
    const angle = (index * 2 * Math.PI) / total
    const radius = 200 + index * 20
    return {
      x: 300 + radius * Math.cos(angle),
      y: 300 + radius * Math.sin(angle),
    }
  }

  return (
    <div className="relative w-full h-[600px] bg-white rounded-lg border overflow-hidden">
      <svg width="100%" height="100%" viewBox="0 0 800 600">
        {/* Center point */}
        <circle cx="400" cy="300" r="20" fill="#1f2937" className="cursor-pointer" />
        <text x="400" y="305" textAnchor="middle" className="text-xs fill-white font-medium">
          YOU
        </text>

        {/* Connection lines */}
        {levels.map((level, index) => {
          const pos = getPosition(index, levels.length)
          return (
            <line
              key={`line-${level.id}`}
              x1="400"
              y1="300"
              x2={pos.x}
              y2={pos.y}
              stroke="#e5e7eb"
              strokeWidth="2"
              strokeDasharray={level.category === "extended" ? "5,5" : "none"}
            />
          )
        })}

        {/* Level circles */}
        {levels.map((level, index) => {
          const pos = getPosition(index, levels.length)
          const size = getCircleSize(level.count)
          const isSelected = selectedLevel === level.id
          const isHovered = hoveredLevel === level.id

          return (
            <g key={level.id}>
              <circle
                cx={pos.x}
                cy={pos.y}
                r={size / 2}
                fill={level.color.replace("bg-", "#")}
                fillOpacity={isSelected || isHovered ? 0.8 : 0.6}
                stroke={isSelected ? "#1f2937" : "white"}
                strokeWidth={isSelected ? 3 : 2}
                className="cursor-pointer transition-all duration-200"
                onMouseEnter={() => setHoveredLevel(level.id)}
                onMouseLeave={() => setHoveredLevel(null)}
                onClick={() => onLevelSelect(isSelected ? null : level.id)}
              />
              <text
                x={pos.x}
                y={pos.y - 5}
                textAnchor="middle"
                className="text-xs fill-white font-bold pointer-events-none"
              >
                {level.count.toLocaleString()}
              </text>
              <text
                x={pos.x}
                y={pos.y + 8}
                textAnchor="middle"
                className="text-xs fill-white font-medium pointer-events-none"
              >
                {level.name.split(" ")[0]}
              </text>
            </g>
          )
        })}
      </svg>

      {/* Legend */}
      <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg p-4 shadow-lg">
        <h3 className="font-semibold text-sm mb-2">Categories</h3>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <span className="text-xs">Intimate (5-50)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-xs">Social (150-1.5K)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
            <span className="text-xs">Extended (5K-50K)</span>
          </div>
        </div>
      </div>

      {/* Selected level info */}
      {selectedLevel && (
        <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm rounded-lg p-4 shadow-lg max-w-xs">
          {(() => {
            const level = levels.find((l) => l.id === selectedLevel)
            if (!level) return null
            return (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <div className={`w-4 h-4 ${level.color} rounded-full`}></div>
                  <h3 className="font-semibold text-sm">{level.name}</h3>
                  <Badge variant="secondary">{level.count.toLocaleString()}</Badge>
                </div>
                <p className="text-xs text-gray-600">{level.description}</p>
              </div>
            )
          })()}
        </div>
      )}
    </div>
  )
}
