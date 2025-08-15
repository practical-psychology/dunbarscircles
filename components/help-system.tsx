import { useState } from "react";
import {
  HelpCircle,
  X,
  Book,
  Play,
  MessageCircle,
  ExternalLink,
  Home,
  Target,
  Network,
  Users,
  Upload,
  Download,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface HelpTopic {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  content: React.ReactNode;
  category: "basics" | "features" | "troubleshooting";
}

const helpTopics: HelpTopic[] = [
  {
    id: "getting-started",
    title: "Getting Started",
    description: "Learn the basics of YAKW and Dunbar's theory",
    category: "basics",
    icon: <Play className="w-4 h-4" />,
    content: (
      <div className="space-y-4">
        <p>Welcome to YAKW! Here's how to get started:</p>
        <ol className="list-decimal list-inside space-y-2 text-sm">
          <li>
            Take the interactive tutorial by clicking "Tutorial & Guide" on the
            homepage
          </li>
          <li>
            Optionally import your social media data from Facebook or LinkedIn
          </li>
          <li>
            Explore the different visualization types to understand your
            relationships
          </li>
          <li>Add or edit contacts manually to customize your network</li>
        </ol>
        <div className="bg-blue-50 dark:bg-blue-950/20 p-3 rounded-lg">
          <p className="text-sm text-blue-700 dark:text-blue-300">
            <strong>Tip:</strong> No account required! Your data stays private
            and local to your browser.
          </p>
        </div>
      </div>
    ),
  },
  {
    id: "dunbar-theory",
    title: "Understanding Dunbar's Number",
    description: "Learn about the five relationship levels",
    category: "basics",
    icon: <Users className="w-4 h-4" />,
    content: (
      <div className="space-y-4">
        <p>
          Dunbar's Number suggests humans can maintain ~150 stable
          relationships, organized in five levels:
        </p>
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-4 h-4 bg-red-500 rounded-full"></div>
            <div>
              <strong>Inner Circle (5)</strong> - Daily contact, highest
              emotional investment
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-4 h-4 bg-orange-500 rounded-full"></div>
            <div>
              <strong>Sympathy Group (15)</strong> - Weekly contact, close
              friends
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-4 h-4 bg-yellow-500 rounded-full"></div>
            <div>
              <strong>Affinity Group (50)</strong> - Monthly contact, party
              invitees
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-4 h-4 bg-green-500 rounded-full"></div>
            <div>
              <strong>Active Network (150)</strong> - Quarterly contact,
              meaningful conversations
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
            <div>
              <strong>Recognition Group (500)</strong> - Yearly contact, faces
              and names
            </div>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: "navigation",
    title: "Navigation Guide",
    description: "Learn how to navigate between different views",
    category: "basics",
    icon: <Home className="w-4 h-4" />,
    content: (
      <div className="space-y-4">
        <p>YAKW has several main pages, each with a specific purpose:</p>
        <div className="grid gap-3">
          <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
            <Home className="w-5 h-5 mt-0.5 text-blue-500" />
            <div>
              <strong>Home (/) </strong> - Overview and introduction
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
            <Target className="w-5 h-5 mt-0.5 text-green-500" />
            <div>
              <strong>Radial (/radial)</strong> - Concentric circles
              visualization
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
            <Network className="w-5 h-5 mt-0.5 text-purple-500" />
            <div>
              <strong>Network (/network)</strong> - Interactive relationship
              graph
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
            <Users className="w-5 h-5 mt-0.5 text-orange-500" />
            <div>
              <strong>Contacts (/contacts)</strong> - Manage your relationships
            </div>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: "data-import",
    title: "Importing Data",
    description: "How to import from Facebook and LinkedIn",
    category: "features",
    icon: <Upload className="w-4 h-4" />,
    content: (
      <div className="space-y-4">
        <p>
          You can import your social media connections to get started quickly:
        </p>
        <div className="space-y-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Facebook Friends</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-2">
                Export your Facebook data and upload the friends JSON file.
              </p>
              <Badge variant="secondary">Format: JSON</Badge>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">LinkedIn Connections</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-2">
                Export your LinkedIn connections and upload the CSV file.
              </p>
              <Badge variant="secondary">Format: CSV</Badge>
            </CardContent>
          </Card>
        </div>
        <div className="bg-green-50 dark:bg-green-950/20 p-3 rounded-lg">
          <p className="text-sm text-green-700 dark:text-green-300">
            <strong>Privacy:</strong> All processing happens locally in your
            browser. Your data never leaves your device.
          </p>
        </div>
      </div>
    ),
  },
  {
    id: "visualizations",
    title: "Understanding Visualizations",
    description: "How to read and interact with the diagrams",
    category: "features",
    icon: <Target className="w-4 h-4" />,
    content: (
      <div className="space-y-4">
        <p>YAKW offers several ways to visualize your relationships:</p>
        <div className="space-y-3">
          <div>
            <h4 className="font-semibold mb-2">Radial Diagram</h4>
            <ul className="text-sm space-y-1 text-muted-foreground">
              <li>• Concentric circles represent relationship levels</li>
              <li>• Click circles to focus on specific levels</li>
              <li>• Progress bars show mental load for each level</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-2">Network Diagram</h4>
            <ul className="text-sm space-y-1 text-muted-foreground">
              <li>• Interactive force-directed graph</li>
              <li>• Drag to pan, scroll to zoom</li>
              <li>• Node size represents relationship strength</li>
              <li>• Colors match Dunbar level categories</li>
            </ul>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: "export-data",
    title: "Exporting Data",
    description: "Save your visualizations and data",
    category: "features",
    icon: <Download className="w-4 h-4" />,
    content: (
      <div className="space-y-4">
        <p>You can export both visualizations and data in multiple formats:</p>
        <div className="grid gap-3">
          <div>
            <h4 className="font-semibold mb-2">Visual Exports</h4>
            <div className="flex gap-2">
              <Badge variant="outline">PNG</Badge>
              <Badge variant="outline">SVG</Badge>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              Perfect for presentations and reports
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-2">Data Exports</h4>
            <div className="flex gap-2">
              <Badge variant="outline">JSON</Badge>
              <Badge variant="outline">CSV</Badge>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              Use in other tools or keep as backup
            </p>
          </div>
        </div>
        <div className="bg-yellow-50 dark:bg-yellow-950/20 p-3 rounded-lg">
          <p className="text-sm text-yellow-700 dark:text-yellow-300">
            <strong>Backup Tip:</strong> Regularly export your data as JSON to
            avoid losing your relationship information.
          </p>
        </div>
      </div>
    ),
  },
  {
    id: "performance",
    title: "Performance Issues",
    description: "Troubleshoot slow loading or laggy animations",
    category: "troubleshooting",
    icon: <MessageCircle className="w-4 h-4" />,
    content: (
      <div className="space-y-4">
        <p>If YAKW is running slowly, try these solutions:</p>
        <div className="space-y-3">
          <div>
            <h4 className="font-semibold">Browser Optimization</h4>
            <ul className="text-sm space-y-1 text-muted-foreground">
              <li>• Close unnecessary browser tabs</li>
              <li>• Clear browser cache and cookies</li>
              <li>• Update to the latest browser version</li>
              <li>• Try using Chrome for best performance</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold">Data Management</h4>
            <ul className="text-sm space-y-1 text-muted-foreground">
              <li>• Work with smaller groups of contacts</li>
              <li>• Remove unused or duplicate contacts</li>
              <li>• Import data in smaller batches</li>
            </ul>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: "data-recovery",
    title: "Lost Data Recovery",
    description: "What to do if your data disappears",
    category: "troubleshooting",
    icon: <MessageCircle className="w-4 h-4" />,
    content: (
      <div className="space-y-4">
        <p>If your relationship data has disappeared:</p>
        <div className="space-y-3">
          <div>
            <h4 className="font-semibold text-red-600">Immediate Steps</h4>
            <ul className="text-sm space-y-1 text-muted-foreground">
              <li>• Don't clear browser data or refresh the page</li>
              <li>• Check if you have exported JSON backup files</li>
              <li>• Look in your Downloads folder for auto-exports</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-orange-600">Recovery Options</h4>
            <ul className="text-sm space-y-1 text-muted-foreground">
              <li>• Restore from JSON backup if available</li>
              <li>• Re-import original social media export files</li>
              <li>• Manually re-enter important relationships</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-green-600">Prevention</h4>
            <ul className="text-sm space-y-1 text-muted-foreground">
              <li>• Export JSON backups regularly</li>
              <li>• Store backups in cloud storage</li>
              <li>• Keep original social media export files</li>
            </ul>
          </div>
        </div>
      </div>
    ),
  },
];

interface HelpSystemProps {
  contextualTopic?: string;
  className?: string;
}

export function HelpSystem({
  contextualTopic,
  className = "",
}: HelpSystemProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState<string>(
    contextualTopic || "getting-started",
  );

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className={className}>
          <HelpCircle className="w-4 h-4 mr-2" />
          Help
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Book className="w-5 h-5" />
            YAKW Help Center
          </DialogTitle>
          <DialogDescription>
            Find answers to common questions and learn how to use YAKW
            effectively.
          </DialogDescription>
        </DialogHeader>

        <Tabs
          value={selectedTopic}
          onValueChange={setSelectedTopic}
          className="flex-1"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-full">
            {/* Topic List */}
            <div className="md:col-span-1">
              <TabsList className="grid w-full grid-cols-1 h-auto p-1">
                {helpTopics.map((topic) => (
                  <TabsTrigger
                    key={topic.id}
                    value={topic.id}
                    className="justify-start p-3 h-auto data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                  >
                    <div className="flex items-start gap-3 text-left">
                      <div className="mt-0.5">{topic.icon}</div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm truncate">
                          {topic.title}
                        </div>
                        <div className="text-xs opacity-70 truncate">
                          {topic.description}
                        </div>
                      </div>
                    </div>
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>

            {/* Content Area */}
            <div className="md:col-span-2 overflow-y-auto">
              {helpTopics.map((topic) => (
                <TabsContent key={topic.id} value={topic.id} className="mt-0">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        {topic.icon}
                        {topic.title}
                      </CardTitle>
                      <CardDescription>{topic.description}</CardDescription>
                    </CardHeader>
                    <CardContent>{topic.content}</CardContent>
                  </Card>
                </TabsContent>
              ))}
            </div>
          </div>
        </Tabs>

        {/* Footer with additional resources */}
        <div className="border-t pt-4 mt-4">
          <div className="flex flex-wrap gap-2 justify-between items-center">
            <div className="flex gap-2">
              <Button variant="outline" size="sm" asChild>
                <a href="/onboarding" onClick={() => setIsOpen(false)}>
                  <Play className="w-4 h-4 mr-2" />
                  Interactive Tutorial
                </a>
              </Button>
              <Button variant="outline" size="sm" asChild>
                <a
                  href="/docs/USER_GUIDE.md"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Full User Guide
                </a>
              </Button>
            </div>
            <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)}>
              <X className="w-4 h-4 mr-2" />
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Contextual help hook for specific pages
export function useContextualHelp(page: string) {
  const getContextualTopic = (page: string) => {
    switch (page) {
      case "home":
      case "/":
        return "getting-started";
      case "radial":
      case "/radial":
        return "visualizations";
      case "network":
      case "/network":
        return "visualizations";
      case "contacts":
      case "/contacts":
        return "data-import";
      case "onboarding":
      case "/onboarding":
        return "getting-started";
      default:
        return "getting-started";
    }
  };

  return getContextualTopic(page);
}
