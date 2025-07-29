"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import {
  Users,
  Smartphone,
  Heart,
  MessageCircle,
  Instagram,
  Linkedin,
  Facebook,
  Youtube,
  Twitter,
  Mail,
  Zap,
  TrendingUp,
  Bell,
} from "lucide-react"

interface Level {
  id: string
  name: string
  count: number
  description: string
  contactFrequency: string
  digitalParallel: string
  color: string
  textColor: string
  bgColor: string
  category: string
}

interface DigitalPlatform {
  id: string
  name: string
  icon: React.ReactNode
  color: string
  dopamineLevel: number
  compressionFactor: number // how much it compresses/expands layers
  primaryLayers: string[]
  features: string[]
  engagementPattern: string
}

interface DigitalParallelsExplorerProps {
  levels: Level[]
}

const digitalPlatforms: DigitalPlatform[] = [
  {
    id: "whatsapp",
    name: "WhatsApp",
    icon: <MessageCircle className="w-5 h-5" />,
    color: "#25D366",
    dopamineLevel: 70,
    compressionFactor: 0.8, // compresses - makes intimate feel closer
    primaryLayers: ["inner-circle", "sympathy-group"],
    features: ["Daily messaging", "Voice notes", "Video calls", "Status updates"],
    engagementPattern: "High frequency, intimate conversations",
  },
  {
    id: "instagram",
    name: "Instagram",
    icon: <Instagram className="w-5 h-5" />,
    color: "#E4405F",
    dopamineLevel: 85,
    compressionFactor: 1.5, // expands - makes distant feel closer
    primaryLayers: ["affinity-group", "active-network", "parasocial-familiar"],
    features: ["Stories", "Likes", "Comments", "DMs", "Reels"],
    engagementPattern: "Visual consumption, parasocial connections",
  },
  {
    id: "linkedin",
    name: "LinkedIn",
    icon: <Linkedin className="w-5 h-5" />,
    color: "#0077B5",
    dopamineLevel: 45,
    compressionFactor: 1.2,
    primaryLayers: ["active-network", "recognition-group", "acquaintance-network"],
    features: ["Professional updates", "Endorsements", "Messages", "Articles"],
    engagementPattern: "Professional networking, career updates",
  },
  {
    id: "facebook",
    name: "Facebook",
    icon: <Facebook className="w-5 h-5" />,
    color: "#1877F2",
    dopamineLevel: 75,
    compressionFactor: 1.3,
    primaryLayers: ["sympathy-group", "affinity-group", "active-network"],
    features: ["News feed", "Reactions", "Comments", "Events", "Groups"],
    engagementPattern: "Life updates, event coordination, group discussions",
  },
  {
    id: "youtube",
    name: "YouTube",
    icon: <Youtube className="w-5 h-5" />,
    color: "#FF0000",
    dopamineLevel: 80,
    compressionFactor: 2.0, // heavily expands parasocial
    primaryLayers: ["parasocial-familiar", "cultural-recognition", "awareness-network"],
    features: ["Subscriptions", "Comments", "Likes", "Notifications"],
    engagementPattern: "One-way consumption, parasocial relationships",
  },
  {
    id: "twitter",
    name: "Twitter/X",
    icon: <Twitter className="w-5 h-5" />,
    color: "#1DA1F2",
    dopamineLevel: 90,
    compressionFactor: 1.8,
    primaryLayers: ["cultural-recognition", "awareness-network"],
    features: ["Tweets", "Retweets", "Likes", "Replies", "Trending"],
    engagementPattern: "Real-time information, cultural awareness",
  },
  {
    id: "email",
    name: "Email",
    icon: <Mail className="w-5 h-5" />,
    color: "#EA4335",
    dopamineLevel: 30,
    compressionFactor: 0.9,
    primaryLayers: ["inner-circle", "sympathy-group", "active-network"],
    features: ["Messages", "Attachments", "Scheduling", "Groups"],
    engagementPattern: "Formal communication, work coordination",
  },
]

export function DigitalParallelsExplorer({ levels }: DigitalParallelsExplorerProps) {
  const [viewMode, setViewMode] = useState<"human" | "digital">("human")
  const [selectedPlatform, setSelectedPlatform] = useState<string | null>(null)
  const [showDopamineEffects, setShowDopamineEffects] = useState(true)
  const [animationPhase, setAnimationPhase] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setAnimationPhase((prev) => (prev + 1) % 100)
    }, 100)
    return () => clearInterval(interval)
  }, [])

  const getDigitalEquivalent = (levelId: string) => {
    return digitalPlatforms.filter((platform) => platform.primaryLayers.includes(levelId))
  }

  const getDopamineIntensity = (platform: DigitalPlatform) => {
    return showDopamineEffects ? 0.5 + Math.sin(animationPhase * 0.1) * 0.3 * (platform.dopamineLevel / 100) : 0.5
  }

  // In the component, add safety checks for color operations
  const getCompressionVisualization = (level: Level) => {
    const platforms = getDigitalEquivalent(level.id)
    const avgCompression = platforms.reduce((sum, p) => sum + p.compressionFactor, 0) / platforms.length || 1

    return {
      originalSize: level.count,
      digitalSize: Math.round(level.count * avgCompression),
      compressionRatio: avgCompression,
    }
  }

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Digital Parallels Explorer</h2>
          <p className="text-gray-600">Compare organic relationships with their digital equivalents</p>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center space-x-2">
            <Switch id="dopamine-effects" checked={showDopamineEffects} onCheckedChange={setShowDopamineEffects} />
            <Label htmlFor="dopamine-effects">Dopamine Effects</Label>
          </div>

          <div className="flex items-center space-x-2">
            <Label htmlFor="view-mode">View Mode:</Label>
            <div className="flex bg-gray-100 rounded-lg p-1">
              <Button
                variant={viewMode === "human" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("human")}
                className="flex items-center gap-2"
              >
                <Users className="w-4 h-4" />
                Human Network
              </Button>
              <Button
                variant={viewMode === "digital" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("digital")}
                className="flex items-center gap-2"
              >
                <Smartphone className="w-4 h-4" />
                Digital Network
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Split View Comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Human Network Side */}
        <Card className={`transition-all duration-500 ${viewMode === "human" ? "ring-2 ring-blue-500" : ""}`}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Organic Human Network
            </CardTitle>
            <CardDescription>Traditional face-to-face and direct communication relationships</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* In the rendering section, add safety checks: */}
            {levels.slice(0, 5).map((level) => {
              const compression = getCompressionVisualization(level)
              const safeColor = level.color || "bg-gray-500"
              const safeBgColor = level.bgColor || "bg-gray-50"
              const safeTextColor = level.textColor || "text-gray-700"

              return (
                <div key={level.id} className={`p-4 rounded-lg ${safeBgColor} transition-all duration-300`}>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className={`font-medium ${safeTextColor}`}>{level.name}</h3>
                    <Badge variant="secondary">{level.count}</Badge>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">{level.contactFrequency}</p>

                  {/* Organic relationship bar */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span>Relationship Depth</span>
                      <span>{100 - levels.indexOf(level) * 15}%</span>
                    </div>
                    <div className="w-full bg-white/50 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${safeColor} transition-all duration-500`}
                        style={{ width: `${100 - levels.indexOf(level) * 15}%` }}
                      />
                    </div>
                  </div>
                </div>
              )
            })}
          </CardContent>
        </Card>

        {/* Digital Network Side */}
        <Card className={`transition-all duration-500 ${viewMode === "digital" ? "ring-2 ring-purple-500" : ""}`}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Smartphone className="w-5 h-5" />
              Digital Network Equivalents
            </CardTitle>
            <CardDescription>How digital platforms map to and transform relationship layers</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {levels.slice(0, 5).map((level) => {
              const platforms = getDigitalEquivalent(level.id)
              const compression = getCompressionVisualization(level)
              const safeColor = level.color || "bg-gray-500"
              const safeBgColor = level.bgColor || "bg-gray-50"
              const safeTextColor = level.textColor || "text-gray-700"

              return (
                <div key={level.id} className={`p-4 rounded-lg ${safeBgColor} transition-all duration-300`}>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className={`font-medium ${safeTextColor}`}>{level.name}</h3>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">{compression.originalSize}</Badge>
                      <span className="text-xs">→</span>
                      <Badge
                        variant={compression.compressionRatio > 1 ? "destructive" : "default"}
                        className={compression.compressionRatio > 1 ? "bg-orange-500" : "bg-green-500"}
                      >
                        {compression.digitalSize}
                      </Badge>
                    </div>
                  </div>

                  {/* Digital platforms */}
                  <div className="flex flex-wrap gap-1 mb-3">
                    {platforms.map((platform) => (
                      <div
                        key={platform.id}
                        className="flex items-center gap-1 px-2 py-1 bg-white/70 rounded-full text-xs cursor-pointer hover:bg-white transition-colors"
                        style={{
                          borderColor: platform.color,
                          borderWidth: showDopamineEffects ? `${getDopamineIntensity(platform) * 3}px` : "1px",
                          borderStyle: "solid",
                        }}
                        onClick={() => setSelectedPlatform(selectedPlatform === platform.id ? null : platform.id)}
                      >
                        <div style={{ color: platform.color }}>{platform.icon}</div>
                        <span>{platform.name}</span>
                        {showDopamineEffects && (
                          <div className="flex items-center gap-1">
                            <Zap className="w-3 h-3 text-yellow-500" />
                            <span className="text-xs">{platform.dopamineLevel}</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Compression visualization */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span>Digital Compression</span>
                      <span className={compression.compressionRatio > 1 ? "text-orange-600" : "text-green-600"}>
                        {compression.compressionRatio > 1 ? "+" : ""}
                        {((compression.compressionRatio - 1) * 100).toFixed(0)}%
                      </span>
                    </div>
                    <div className="w-full bg-white/50 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all duration-500 ${
                          compression.compressionRatio > 1 ? "bg-orange-500" : "bg-green-500"
                        }`}
                        style={{
                          width: `${Math.min(compression.compressionRatio * 50, 100)}%`,
                          opacity: showDopamineEffects
                            ? getDopamineIntensity(platforms[0] || digitalPlatforms[0])
                            : 0.7,
                        }}
                      />
                    </div>
                  </div>
                </div>
              )
            })}
          </CardContent>
        </Card>
      </div>

      {/* Platform Details */}
      {selectedPlatform && (
        <Card className="border-purple-200 bg-purple-50">
          <CardHeader>
            {(() => {
              const platform = digitalPlatforms.find((p) => p.id === selectedPlatform)
              if (!platform) return null
              return (
                <>
                  <CardTitle className="flex items-center gap-2">
                    <div style={{ color: platform.color }}>{platform.icon}</div>
                    {platform.name} Analysis
                  </CardTitle>
                  <CardDescription>How this platform transforms social relationship dynamics</CardDescription>
                </>
              )
            })()}
          </CardHeader>
          <CardContent>
            {(() => {
              const platform = digitalPlatforms.find((p) => p.id === selectedPlatform)
              if (!platform) return null

              return (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium mb-2 flex items-center gap-2">
                        <Zap className="w-4 h-4 text-yellow-500" />
                        Dopamine Feedback Loop
                      </h4>
                      <div className="flex items-center gap-2 mb-2">
                        <Progress value={platform.dopamineLevel} className="flex-1" />
                        <span className="text-sm font-medium">{platform.dopamineLevel}/100</span>
                      </div>
                      <p className="text-sm text-gray-600">{platform.engagementPattern}</p>
                    </div>

                    <div>
                      <h4 className="font-medium mb-2 flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-blue-500" />
                        Layer Compression Effect
                      </h4>
                      <div className="flex items-center gap-2">
                        <span className="text-sm">
                          {platform.compressionFactor < 1 ? "Compresses" : "Expands"} relationships by
                        </span>
                        <Badge variant={platform.compressionFactor > 1 ? "destructive" : "default"}>
                          {((platform.compressionFactor - 1) * 100).toFixed(0)}%
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium mb-2 flex items-center gap-2">
                        <Bell className="w-4 h-4 text-green-500" />
                        Key Features
                      </h4>
                      <div className="flex flex-wrap gap-1">
                        {platform.features.map((feature, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {feature}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium mb-2">Primary Dunbar Layers</h4>
                      <div className="space-y-1">
                        {platform.primaryLayers.map((layerId) => {
                          const level = levels.find((l) => l.id === layerId)
                          if (!level) return null
                          return (
                            <div key={layerId} className="flex items-center gap-2">
                              <div className={`w-3 h-3 ${level.color} rounded-full`}></div>
                              <span className="text-sm">{level.name}</span>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })()}
          </CardContent>
        </Card>
      )}

      {/* Digital Transformation Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-red-500" />
            Digital Transformation Insights
          </CardTitle>
          <CardDescription>How digital tools are reshaping the Dunbar hierarchy</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-blue-700 mb-2">Compression Effect</h4>
              <p className="text-sm text-blue-600">
                Intimate platforms like WhatsApp make close relationships feel even closer through constant
                connectivity.
              </p>
            </div>

            <div className="p-4 bg-orange-50 rounded-lg">
              <h4 className="font-medium text-orange-700 mb-2">Expansion Effect</h4>
              <p className="text-sm text-orange-600">
                Social media creates false intimacy with distant connections, expanding our perceived social circle.
              </p>
            </div>

            <div className="p-4 bg-purple-50 rounded-lg">
              <h4 className="font-medium text-purple-700 mb-2">Parasocial Explosion</h4>
              <p className="text-sm text-purple-600">
                Digital platforms have massively expanded our parasocial network, creating cognitive overload.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
