"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { NetworkDiagram } from "@/components/network-diagram"
import { LevelDetails } from "@/components/level-details"
import { RadialDiagram } from "@/components/radial-diagram"
import { RelationshipInventory } from "@/components/relationship-inventory"
import { DigitalParallelsExplorer } from "@/components/digital-parallels-explorer"
import { LifeStageComparison } from "@/components/life-stage-comparison"
import { Users, Brain, Heart, Eye, Smartphone, Clock } from "lucide-react"

const dunbarLevels = [
  {
    id: "inner-circle",
    name: "Inner Circle",
    count: 5,
    description: "Requires constant emotional maintenance, shared experiences, frequent contact.",
    contactFrequency: "Daily Contact",
    digitalParallel:
      "Subscription services you check compulsively – email, news apps, social feeds from your most important people.",
    maintenanceCost: "High but automatic; these relationships shape your daily mental landscape.",
    color: "bg-red-500",
    textColor: "text-red-700",
    bgColor: "bg-red-50",
    category: "intimate",
  },
  {
    id: "sympathy-group",
    name: "Sympathy Group",
    count: 15,
    description: "Close friends you'd genuinely mourn if they died.",
    contactFrequency: "Weekly Contact",
    digitalParallel: "Weekly newsletters or podcasts you never miss – anticipated and valued content.",
    maintenanceCost: "Moderate but intentional; requires conscious effort to sustain.",
    color: "bg-orange-500",
    textColor: "text-orange-700",
    bgColor: "bg-orange-50",
    category: "intimate",
  },
  {
    id: "affinity-group",
    name: "Affinity Group",
    count: 50,
    description: "People you'd invite to a large party.",
    contactFrequency: "Monthly Contact",
    digitalParallel: "Monthly magazine subscriptions or services you engage with regularly but not constantly.",
    maintenanceCost: "Low to moderate; operates on social rhythms and life event triggers.",
    color: "bg-yellow-500",
    textColor: "text-yellow-700",
    bgColor: "bg-yellow-50",
    category: "intimate",
  },
  {
    id: "active-network",
    name: "Active Network",
    count: 150,
    description: "People you could have a meaningful conversation with.",
    contactFrequency: "Quarterly Contact",
    digitalParallel: "Quarterly reports or seasonal check-ins that provide valuable but non-urgent updates.",
    maintenanceCost: "Minimal but strategic; maintained through social proof and mutual connections.",
    color: "bg-green-500",
    textColor: "text-green-700",
    bgColor: "bg-green-50",
    category: "social",
  },
  {
    id: "recognition-group",
    name: "Recognition Group",
    count: 500,
    description: "Faces and names you can match.",
    contactFrequency: "Yearly Contact",
    digitalParallel: 'Annual services that you barely use but maintain "just in case."',
    maintenanceCost: "Nearly effortless; sustained through algorithmic reminders and social platforms.",
    color: "bg-blue-500",
    textColor: "text-blue-700",
    bgColor: "bg-blue-50",
    category: "social",
  },
]

export default function DunbarHierarchyApp() {
  const [selectedLevel, setSelectedLevel] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("overview")

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">The Dunbar Hierarchy</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Explore the cognitive limits of human social relationships across different levels of intimacy and frequency
            of contact.
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <Brain className="w-4 h-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="radial" className="flex items-center gap-2">
              <Eye className="w-4 h-4" />
              Radial View
            </TabsTrigger>
            <TabsTrigger value="levels" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Levels
            </TabsTrigger>
            <TabsTrigger value="inventory" className="flex items-center gap-2">
              <Heart className="w-4 h-4" />
              Network Graph
            </TabsTrigger>
            <TabsTrigger value="digital" className="flex items-center gap-2">
              <Smartphone className="w-4 h-4" />
              Digital
            </TabsTrigger>
            <TabsTrigger value="lifecycle" className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Life Stages
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="w-5 h-5" />
                  Interactive Network Diagram
                </CardTitle>
                <CardDescription>
                  Click on any level to explore the details of that relationship category
                </CardDescription>
              </CardHeader>
              <CardContent>
                <NetworkDiagram levels={dunbarLevels} selectedLevel={selectedLevel} onLevelSelect={setSelectedLevel} />
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-red-600">Intimate Levels</CardTitle>
                  <CardDescription>5-50 people</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600">
                    High emotional investment, frequent contact, and deep personal connections.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-green-600">Social Levels</CardTitle>
                  <CardDescription>150-1,500 people</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600">
                    Meaningful relationships with moderate maintenance requirements.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-purple-600">Extended Levels</CardTitle>
                  <CardDescription>5,000-50,000 people</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600">Awareness and recognition with minimal active maintenance.</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="radial" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="w-5 h-5" />
                  Interactive Radial Diagram
                </CardTitle>
                <CardDescription>
                  Explore the concentric circles of social relationships with cognitive load visualization
                </CardDescription>
              </CardHeader>
              <CardContent>
                <RadialDiagram levels={dunbarLevels} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="levels" className="space-y-6">
            <LevelDetails levels={dunbarLevels} selectedLevel={selectedLevel} onLevelSelect={setSelectedLevel} />
          </TabsContent>

          <TabsContent value="inventory" className="space-y-6">
            <RelationshipInventory levels={dunbarLevels} />
          </TabsContent>

          <TabsContent value="digital" className="space-y-6">
            <DigitalParallelsExplorer levels={dunbarLevels} />
          </TabsContent>

          <TabsContent value="lifecycle" className="space-y-6">
            <LifeStageComparison levels={dunbarLevels} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
