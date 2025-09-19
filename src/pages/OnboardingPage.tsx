import { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  Users,
  Share2, // Alternative for Network
  Target as TargetIcon,
  Upload,
  Download,
  Eye,
  Settings,
  Play as PlayIcon,
  CheckCircle,
  Home,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

interface TutorialStep {
  id: number;
  title: string;
  description: string;
  content: React.ReactNode;
  icon: React.ReactNode;
  category:
    | "getting-started"
    | "visualization"
    | "data-management"
    | "advanced";
}

const tutorialSteps: TutorialStep[] = [
  {
    id: 1,
    title: "Welcome to Dunbar Circles",
    description: "Understanding Dunbar's Number and relationship visualization",
    category: "getting-started",
    icon: <Users className="w-6 h-6" />,
    content: (
      <div className="space-y-6">
        <div className="text-center">
          <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
            <Users className="w-10 h-10 text-white" />
          </div>
          <h3 className="text-2xl font-bold mb-2">Welcome to Dunbar Circles</h3>
          <p className="text-muted-foreground">
            Your personal relationship visualization tool
          </p>
        </div>

        <div className="bg-muted/50 rounded-lg p-6">
          <h4 className="font-semibold mb-3">What is Dunbar's Number?</h4>
          <p className="text-sm text-muted-foreground mb-4">
            Dunbar's Number suggests that humans can maintain stable social
            relationships with approximately 150 people. This theory breaks down
            into five distinct layers of social connection.
          </p>

          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 bg-red-500 rounded-full"></div>
              <span className="text-sm">
                <strong>Inner Circle (5)</strong> - Daily contact, highest
                emotional investment
              </span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 bg-orange-500 rounded-full"></div>
              <span className="text-sm">
                <strong>Sympathy Group (15)</strong> - Weekly contact, close
                friends
              </span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 bg-yellow-500 rounded-full"></div>
              <span className="text-sm">
                <strong>Affinity Group (50)</strong> - Monthly contact, party
                invitees
              </span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 bg-green-500 rounded-full"></div>
              <span className="text-sm">
                <strong>Active Network (150)</strong> - Quarterly contact,
                meaningful conversations
              </span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
              <span className="text-sm">
                <strong>Recognition Group (500)</strong> - Yearly contact, faces
                and names
              </span>
            </div>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: 2,
    title: "Navigation Overview",
    description: "Learn how to navigate through different views and features",
    category: "getting-started",
    icon: <TargetIcon className="w-6 h-6" />,
    content: (
      <div className="space-y-6">
        <h3 className="text-xl font-semibold">App Navigation</h3>

        <div className="grid gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Home className="w-4 h-4" />
                Home Page
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Your starting point with an overview of Dunbar's theory and
                quick access to all features.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <TargetIcon className="w-4 h-4" />
                Radial View
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Visualize your relationships in concentric circles based on
                Dunbar's hierarchy.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Share2 className="w-4 h-4" />
                Network Diagram
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Interactive force-directed graph showing connections between
                your contacts.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Users className="w-4 h-4" />
                Dashboard
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Manage your relationships, import data, and track relationship
                health.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    ),
  },
  {
    id: 3,
    title: "Radial Visualization",
    description:
      "Understanding the concentric circles view of your relationships",
    category: "visualization",
    icon: <TargetIcon className="w-6 h-6" />,
    content: (
      <div className="space-y-6">
        <h3 className="text-xl font-semibold">Radial Diagram Features</h3>

        <div className="bg-muted/50 rounded-lg p-6">
          <div className="text-center mb-4">
            <div className="relative w-48 h-48 mx-auto">
              {/* Simplified radial diagram illustration */}
              <div className="absolute inset-0 border-4 border-blue-200 rounded-full opacity-20"></div>
              <div className="absolute inset-4 border-4 border-green-200 rounded-full opacity-30"></div>
              <div className="absolute inset-8 border-4 border-yellow-200 rounded-full opacity-40"></div>
              <div className="absolute inset-12 border-4 border-orange-200 rounded-full opacity-50"></div>
              <div className="absolute inset-16 border-4 border-red-200 rounded-full opacity-60"></div>
              <div className="absolute inset-20 w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                <Users className="w-4 h-4 text-white" />
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
            <div>
              <h4 className="font-medium">Interactive Circles</h4>
              <p className="text-sm text-muted-foreground">
                Click on any circle to focus on that relationship level
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
            <div>
              <h4 className="font-medium">Mental Load Indicator</h4>
              <p className="text-sm text-muted-foreground">
                Visual representation of cognitive effort required for each
                level
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
            <div>
              <h4 className="font-medium">Contact Distribution</h4>
              <p className="text-sm text-muted-foreground">
                See how your contacts are distributed across Dunbar's levels
              </p>
            </div>
          </div>
        </div>

        <div className="bg-blue-50 dark:bg-blue-950/20 rounded-lg p-4">
          <p className="text-sm">
            <strong>Pro Tip:</strong> Use the radial view to quickly assess if
            your relationship distribution aligns with Dunbar's theory.
          </p>
        </div>
      </div>
    ),
  },
  {
    id: 4,
    title: "Share2 Diagram",
    description: "Exploring connections and relationship patterns",
    category: "visualization",
    icon: <Share2 className="w-6 h-6" />,
    content: (
      <div className="space-y-6">
        <h3 className="text-xl font-semibold">Share2 Visualization</h3>

        <div className="bg-muted/50 rounded-lg p-6">
          <h4 className="font-semibold mb-3">Interactive Features</h4>
          <div className="grid gap-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                <Eye className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="font-medium">Drag & Zoom</p>
                <p className="text-sm text-muted-foreground">
                  Pan around and zoom in/out to explore your network
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                <Users className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="font-medium">Node Interactions</p>
                <p className="text-sm text-muted-foreground">
                  Click on nodes to see relationship details
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                <TargetIcon className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="font-medium">Force Simulation</p>
                <p className="text-sm text-muted-foreground">
                  Nodes automatically arrange based on connection strength
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <h4 className="font-semibold">Understanding the Visualization</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <div className="w-2 h-2 bg-current rounded-full mt-2"></div>
              <span>
                <strong>Node Size:</strong> Represents the strength of your
                relationship
              </span>
            </li>
            <li className="flex items-start gap-2">
              <div className="w-2 h-2 bg-current rounded-full mt-2"></div>
              <span>
                <strong>Node Color:</strong> Indicates which Dunbar level the
                person belongs to
              </span>
            </li>
            <li className="flex items-start gap-2">
              <div className="w-2 h-2 bg-current rounded-full mt-2"></div>
              <span>
                <strong>Connections:</strong> Lines show mutual connections
                between people
              </span>
            </li>
            <li className="flex items-start gap-2">
              <div className="w-2 h-2 bg-current rounded-full mt-2"></div>
              <span>
                <strong>Clustering:</strong> People naturally group based on
                shared connections
              </span>
            </li>
          </ul>
        </div>
      </div>
    ),
  },
  {
    id: 5,
    title: "Importing Your Data",
    description: "Learn how to import contacts from social media platforms",
    category: "data-management",
    icon: <Upload className="w-6 h-6" />,
    content: (
      <div className="space-y-6">
        <h3 className="text-xl font-semibold">Data Import Options</h3>

        <div className="grid gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <div className="w-6 h-6 bg-blue-600 rounded flex items-center justify-center">
                  <span className="text-white text-xs font-bold">f</span>
                </div>
                Facebook Friends
              </CardTitle>
              <CardDescription>
                Import your Facebook friends list
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  Export your Facebook friends data and upload the JSON file.
                  Supports both old and new Facebook export formats.
                </p>
                <div className="bg-muted/50 rounded p-3">
                  <p className="text-xs font-mono">
                    facebook_friends.json or friends_v2.json
                  </p>
                </div>
                <Badge variant="secondary">Supported Format: JSON</Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <div className="w-6 h-6 bg-blue-700 rounded flex items-center justify-center">
                  <span className="text-white text-xs font-bold">in</span>
                </div>
                LinkedIn Connections
              </CardTitle>
              <CardDescription>Import your LinkedIn network</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  Export your LinkedIn connections and upload the CSV file.
                </p>
                <div className="bg-muted/50 rounded p-3">
                  <p className="text-xs font-mono">Connections.csv</p>
                </div>
                <Badge variant="secondary">Supported Format: CSV</Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="bg-yellow-50 dark:bg-yellow-950/20 rounded-lg p-4">
          <h4 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-2">
            Privacy First
          </h4>
          <p className="text-sm text-yellow-700 dark:text-yellow-300">
            All data processing happens locally in your browser. Your social
            media data never leaves your device.
          </p>
        </div>

        <div className="space-y-3">
          <h4 className="font-semibold">Import Process</h4>
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                1
              </div>
              <span className="text-sm">Go to Dashboard page</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                2
              </div>
              <span className="text-sm">Click "Import Data" button</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                3
              </div>
              <span className="text-sm">Select your data file</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                4
              </div>
              <span className="text-sm">Review auto-categorization</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                5
              </div>
              <span className="text-sm">Start visualizing!</span>
            </div>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: 6,
    title: "Managing Relationships",
    description: "Add, edit, and categorize your relationships manually",
    category: "data-management",
    icon: <Settings className="w-6 h-6" />,
    content: (
      <div className="space-y-6">
        <h3 className="text-xl font-semibold">Relationship Management</h3>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Manual Entry</CardTitle>
              <CardDescription>Add relationships one by one</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  Use the relationship inventory to manually add people to your
                  network.
                </p>
                <div className="flex flex-wrap gap-2">
                  <Badge>Name</Badge>
                  <Badge>Contact Frequency</Badge>
                  <Badge>Relationship Strength</Badge>
                  <Badge>Notes</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Auto-Categorization</CardTitle>
              <CardDescription>
                Smart assignment to Dunbar levels
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                The app automatically suggests which Dunbar level each person
                belongs to based on:
              </p>
              <ul className="text-sm text-muted-foreground mt-2 space-y-1">
                <li>• Contact frequency</li>
                <li>• Relationship strength indicators</li>
                <li>• Social media interaction patterns</li>
                <li>• Manual adjustments you make</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Relationship Health</CardTitle>
              <CardDescription>
                Track relationship decay over time
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Monitor which relationships might need attention based on time
                since last contact.
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="bg-green-50 dark:bg-green-950/20 rounded-lg p-4">
          <p className="text-sm text-green-700 dark:text-green-300">
            <strong>Tip:</strong> Regular maintenance of your relationship data
            helps keep visualizations accurate and meaningful.
          </p>
        </div>
      </div>
    ),
  },
  {
    id: 7,
    title: "Exporting Your Data",
    description: "Save and share your relationship visualizations",
    category: "data-management",
    icon: <Download className="w-6 h-6" />,
    content: (
      <div className="space-y-6">
        <h3 className="text-xl font-semibold">Export Options</h3>

        <div className="grid gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Visual Exports</CardTitle>
              <CardDescription>
                Save your visualizations as images
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline">PNG</Badge>
                <Badge variant="outline">SVG</Badge>
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                Perfect for presentations, reports, or sharing insights.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Data Exports</CardTitle>
              <CardDescription>Export your relationship data</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline">JSON</Badge>
                <Badge variant="outline">CSV</Badge>
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                Use in other tools or keep as backup.
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-3">
          <h4 className="font-semibold">How to Export</h4>
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                1
              </div>
              <span className="text-sm">
                Navigate to any visualization page
              </span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                2
              </div>
              <span className="text-sm">
                Look for the export button (usually in the top-right)
              </span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                3
              </div>
              <span className="text-sm">Choose your preferred format</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                4
              </div>
              <span className="text-sm">Download starts automatically</span>
            </div>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: 8,
    title: "Advanced Features",
    description: "Explore digital parallels, life stages, and analytics",
    category: "advanced",
    icon: <Eye className="w-6 h-6" />,
    content: (
      <div className="space-y-6">
        <h3 className="text-xl font-semibold">Advanced Analysis</h3>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Digital Parallels</CardTitle>
              <CardDescription>
                How Dunbar's theory applies to digital relationships
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Explore how social media connections, email contacts, and
                digital interactions map to traditional relationship
                hierarchies.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Life Stage Analysis</CardTitle>
              <CardDescription>
                How relationships change throughout life
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Compare relationship patterns across different life stages:
                childhood, adolescence, young adulthood, middle age, and later
                life.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Level Details</CardTitle>
              <CardDescription>
                Deep dive into each Dunbar level
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Learn about the characteristics, typical contact frequencies,
                and cognitive load associated with each relationship level.
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="bg-purple-50 dark:bg-purple-950/20 rounded-lg p-4">
          <h4 className="font-semibold text-purple-800 dark:text-purple-200 mb-2">
            Research-Based
          </h4>
          <p className="text-sm text-purple-700 dark:text-purple-300">
            All features are grounded in anthropological and psychological
            research about human social cognition.
          </p>
        </div>
      </div>
    ),
  },
];

const OnboardingPage = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);

  const currentTutorial = tutorialSteps[currentStep];
  const progress = ((currentStep + 1) / tutorialSteps.length) * 100;

  const nextStep = () => {
    if (currentStep < tutorialSteps.length - 1) {
      if (!completedSteps.includes(currentStep)) {
        setCompletedSteps([...completedSteps, currentStep]);
      }
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const goToStep = (stepIndex: number) => {
    setCurrentStep(stepIndex);
  };

  const markCompleted = () => {
    if (!completedSteps.includes(currentStep)) {
      setCompletedSteps([...completedSteps, currentStep]);
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "getting-started":
        return "bg-blue-500";
      case "visualization":
        return "bg-green-500";
      case "data-management":
        return "bg-orange-500";
      case "advanced":
        return "bg-purple-500";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2">Welcome to Dunbar Circles</h1>
          <p className="text-xl text-muted-foreground mb-4">
            Learn how to visualize and understand your relationships
          </p>
          <div className="flex items-center justify-center gap-4 mb-6">
            <Progress value={progress} className="w-64" />
            <span className="text-sm text-muted-foreground">
              {currentStep + 1} of {tutorialSteps.length}
            </span>
          </div>
        </div>

        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-4 gap-8">
            {/* Sidebar Navigation */}
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Tutorial Steps</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {tutorialSteps.map((step, index) => (
                    <button
                      key={step.id}
                      onClick={() => goToStep(index)}
                      className={`w-full text-left p-3 rounded-lg transition-colors ${
                        currentStep === index
                          ? "bg-primary text-primary-foreground"
                          : "hover:bg-muted"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center ${
                            completedSteps.includes(index)
                              ? "bg-green-500 text-white"
                              : currentStep === index
                                ? "bg-primary-foreground text-primary"
                                : getCategoryColor(step.category) +
                                  " text-white"
                          }`}
                        >
                          {completedSteps.includes(index) ? (
                            <CheckCircle className="w-4 h-4" />
                          ) : (
                            step.icon
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">
                            {step.title}
                          </p>
                          <p className="text-xs text-muted-foreground truncate">
                            {step.description}
                          </p>
                        </div>
                      </div>
                    </button>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3">
              <Card className="min-h-[600px]">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center ${getCategoryColor(currentTutorial.category)} text-white`}
                      >
                        {currentTutorial.icon}
                      </div>
                      <div>
                        <CardTitle className="text-2xl">
                          {currentTutorial.title}
                        </CardTitle>
                        <CardDescription className="text-base">
                          {currentTutorial.description}
                        </CardDescription>
                      </div>
                    </div>
                    <Badge variant="outline" className="capitalize">
                      {currentTutorial.category.replace("-", " ")}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={currentStep}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3 }}
                    >
                      {currentTutorial.content}
                    </motion.div>
                  </AnimatePresence>
                </CardContent>
              </Card>

              {/* Navigation Controls */}
              <div className="flex items-center justify-between mt-6">
                <Button
                  variant="outline"
                  onClick={prevStep}
                  disabled={currentStep === 0}
                  className="flex items-center gap-2"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Previous
                </Button>

                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    onClick={markCompleted}
                    disabled={completedSteps.includes(currentStep)}
                    className="flex items-center gap-2"
                  >
                    <CheckCircle className="w-4 h-4" />
                    {completedSteps.includes(currentStep)
                      ? "Completed"
                      : "Mark Complete"}
                  </Button>

                  {currentStep === tutorialSteps.length - 1 ? (
                    <Button asChild className="flex items-center gap-2">
                      <Link to="/">
                        <PlayIcon className="h-4 w-4" />
                        Start Using Dunbar Circles
                      </Link>
                    </Button>
                  ) : (
                    <Button
                      onClick={nextStep}
                      className="flex items-center gap-2"
                    >
                      Next
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>

              {/* Quick Links */}
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle className="text-lg">Quick Start</CardTitle>
                  <CardDescription>
                    Jump directly to key features
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <Button variant="outline" size="sm" asChild>
                      <Link to="/dashboard" className="flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        Dashboard
                      </Link>
                    </Button>
                    <Button variant="outline" size="sm" asChild>
                      <Link to="/radial" className="flex items-center gap-2">
                        <TargetIcon className="w-4 h-4" />
                        Radial View
                      </Link>
                    </Button>
                    <Button variant="outline" size="sm" asChild>
                      <Link to="/share2" className="flex items-center gap-2">
                        <Share2 className="w-4 h-4" />
                        Share2
                      </Link>
                    </Button>
                    <Button variant="outline" size="sm" asChild>
                      <Link to="/levels" className="flex items-center gap-2">
                        <Eye className="w-4 h-4" />
                        Levels
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OnboardingPage;
