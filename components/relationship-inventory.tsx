import type React from "react";
import type { Level, Person } from "@/types/relationships";

import { useState, useEffect, useRef } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { EnhancedContactStorage } from "@/lib/contact-storage-enhanced";
import { ErrorBoundary, DataErrorFallback } from "@/components/error-boundary";
import { DataStatus } from "@/components/data-status";
import {
  exportToJSON,
  exportToCSV,
  printReport,
  shareData,
  generateFilename,
  type ExportData,
} from "@/lib/export-utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import {
  Upload,
  Users,
  TrendingDown,
  AlertTriangle,
  Zap,
  Facebook,
  Linkedin,
  Download,
  FileText,
  Image,
  Share2,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

// Add these interfaces at the top of the file
interface FacebookFriend {
  name: string;
  timestamp: number;
  contact_info?: {
    email?: string;
  };
  about?: string;
  hometown?: {
    name: string;
  };
}

interface FacebookData {
  friends: {
    data: FacebookFriend[];
    paging?: {
      cursors: {
        before: string;
        after: string;
      };
    };
    summary?: {
      total_count: number;
    };
  };
  metadata?: {
    version: string;
    export_date: string;
  };
}

interface LinkedInConnection {
  "First Name": string;
  "Last Name": string;
  "Email Address": string;
  Company: string;
  Position: string;
  [key: string]: string;
}

// Level and Person interfaces imported from types

interface RelationshipInventoryProps {
  levels: Level[];
}

export function RelationshipInventory({ levels }: RelationshipInventoryProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [people, setPeople] = useState<Person[]>([]);

  // Load stored contacts on component mount with enhanced error handling
  useEffect(() => {
    const loadContacts = async () => {
      try {
        const result = await EnhancedContactStorage.loadContacts();
        if (result.success && result.data) {
          setPeople(result.data);

          // Show status message if fallback was used
          if (result.fallbackUsed) {
            setImportStatus(
              `Loaded ${result.data.length} contacts from ${result.source} (some sample data included)`,
            );
            setTimeout(() => setImportStatus(""), 5000);
          }
        } else {
          setImportStatus(
            `Failed to load contacts: ${result.error || "Unknown error"}`,
          );
          setTimeout(() => setImportStatus(""), 5000);
        }
      } catch (error) {
        console.error("Failed to load contacts:", error);
        setImportStatus(
          `Error loading contacts: ${error instanceof Error ? error.message : "Unknown error"}`,
        );
        setTimeout(() => setImportStatus(""), 5000);
      }
    };

    loadContacts();
  }, []);

  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null);
  const [filterLevel, setFilterLevel] = useState<string>("all");
  const [showDecayWarnings, setShowDecayWarnings] = useState(true);
  const [isImporting, setIsImporting] = useState(false);
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [importedData, setImportedData] = useState<{
    facebook?: FacebookData;
    linkedin?: LinkedInConnection[];
  }>({});
  const [importStatus, setImportStatus] = useState<string>("");

  // Force-directed graph simulation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // Initialize positions if not set
    const updatedPeople = people.map((person) => ({
      ...person,
      x: person.x ?? Math.random() * width,
      y: person.y ?? Math.random() * height,
      vx: person.vx ?? 0,
      vy: person.vy ?? 0,
    }));

    let animationId: number;

    const simulate = () => {
      // Clear canvas
      ctx.clearRect(0, 0, width, height);

      // Update positions with force simulation
      updatedPeople.forEach((person, i) => {
        // Center force
        const centerX = width / 2;
        const centerY = height / 2;
        const centerForce = 0.01;
        person.vx += (centerX - person.x!) * centerForce;
        person.vy += (centerY - person.y!) * centerForce;

        // Repulsion from other nodes
        updatedPeople.forEach((other, j) => {
          if (i !== j) {
            const dx = person.x! - other.x!;
            const dy = person.y! - other.y!;
            const distance = Math.sqrt(dx * dx + dy * dy);
            if (distance < 100) {
              const force = (100 - distance) * 0.01;
              person.vx += (dx / distance) * force;
              person.vy += (dy / distance) * force;
            }
          }
        });

        // Level-based clustering
        const level = levels.find((l) => l.id === person.levelId);
        if (level) {
          const levelIndex = levels.findIndex((l) => l.id === person.levelId);
          const angle = (levelIndex / levels.length) * 2 * Math.PI;
          const targetX = centerX + Math.cos(angle) * (100 + levelIndex * 30);
          const targetY = centerY + Math.sin(angle) * (100 + levelIndex * 30);
          const clusterForce = 0.005;
          person.vx += (targetX - person.x!) * clusterForce;
          person.vy += (targetY - person.y!) * clusterForce;
        }

        // Apply velocity with damping
        person.vx *= 0.9;
        person.vy *= 0.9;
        person.x! += person.vx;
        person.y! += person.vy;

        // Boundary constraints
        person.x = Math.max(20, Math.min(width - 20, person.x!));
        person.y = Math.max(20, Math.min(height - 20, person.y!));
      });

      // Draw connections
      ctx.strokeStyle = "#e5e7eb";
      ctx.lineWidth = 1;
      updatedPeople.forEach((person) => {
        const level = levels.find((l) => l.id === person.levelId);
        if (level) {
          const levelIndex = levels.findIndex((l) => l.id === person.levelId);
          if (levelIndex < 4) {
            // Only show connections for closer relationships
            ctx.beginPath();
            ctx.moveTo(width / 2, height / 2);
            ctx.lineTo(person.x!, person.y!);
            ctx.stroke();
          }
        }
      });

      // Draw nodes
      updatedPeople.forEach((person) => {
        const level = levels.find((l) => l.id === person.levelId);
        if (!level || (filterLevel !== "all" && filterLevel !== person.levelId))
          return;

        const radius = 8 + person.strength * 12;
        const color = level.color.replace("bg-", "#");

        // Node circle
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(person.x!, person.y!, radius, 0, 2 * Math.PI);
        ctx.fill();

        // Decay warning ring
        if (showDecayWarnings && isRelationshipDecaying(person)) {
          ctx.strokeStyle = "#ef4444";
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(person.x!, person.y!, radius + 4, 0, 2 * Math.PI);
          ctx.stroke();
        }

        // Name label
        ctx.fillStyle = "#374151";
        ctx.font = "12px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(person.name, person.x!, person.y! + radius + 15);
      });

      animationId = requestAnimationFrame(simulate);
    };

    simulate();

    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, [people, levels, filterLevel, showDecayWarnings]);

  const isRelationshipDecaying = (person: Person) => {
    const daysSinceContact =
      (Date.now() - person.lastContact.getTime()) / (1000 * 60 * 60 * 24);
    return daysSinceContact > person.contactFrequency * 1.5;
  };

  const getDecayingRelationships = () => {
    return people.filter(isRelationshipDecaying);
  };

  const getRelationshipHealth = () => {
    const total = people.length;
    const healthy = people.filter((p) => !isRelationshipDecaying(p)).length;
    return (healthy / total) * 100;
  };

  const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    // Find clicked person
    const clickedPerson = people.find((person) => {
      const dx = x - person.x!;
      const dy = y - person.y!;
      const distance = Math.sqrt(dx * dx + dy * dy);
      return distance < 20;
    });

    setSelectedPerson(clickedPerson || null);
  };

  // Auto-categorization logic based on relationship strength and recency
  const categorizePerson = (person: Person): string => {
    const daysSinceContact =
      (Date.now() - person.lastContact.getTime()) / (1000 * 60 * 60 * 24);

    // Inner circle: Recent contact (< 30 days) and high interaction
    if (daysSinceContact < 30 && person.strength > 0.8) {
      return "inner-circle";
    }

    // Sympathy group: Regular contact (< 90 days) and good relationship
    if (daysSinceContact < 90 && person.strength > 0.6) {
      return "sympathy-group";
    }

    // Affinity group: Occasional contact (< 180 days) or moderate relationship
    if (daysSinceContact < 180 && person.strength > 0.4) {
      return "affinity-group";
    }

    // Active network: Professional connections or distant but meaningful
    if (person.platform.includes("LinkedIn") || person.strength > 0.3) {
      return "active-network";
    }

    // Recognition group: Old connections or low interaction
    return "recognition-group";
  };

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
    type: "facebook" | "linkedin",
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setImportStatus(`Processing ${type} data...`);

    try {
      if (type === "facebook") {
        // Handle Facebook JSON
        const text = await file.text();
        const facebookData: FacebookData = JSON.parse(text);

        const newPeople: Person[] = facebookData.friends.data.map(
          (friend, index) => {
            const lastContactDate = new Date(friend.timestamp * 1000); // Convert Unix timestamp
            const daysSinceContact =
              (Date.now() - lastContactDate.getTime()) / (1000 * 60 * 60 * 24);

            // Calculate relationship strength based on recency and available info
            let strength = 0.5; // Base strength
            if (daysSinceContact < 365) strength += 0.2; // Recent connection
            if (friend.contact_info?.email) strength += 0.1; // Has email
            if (friend.about) strength += 0.1; // Has description
            if (friend.hometown) strength += 0.05; // Has location info

            const person: Person = {
              id: `fb_${Date.now()}_${index}`,
              name: friend.name,
              levelId: "", // Will be set by categorization
              lastContact: lastContactDate,
              contactFrequency: Math.max(30, daysSinceContact), // Estimate frequency
              strength: Math.min(strength, 1),
              decayRate: 0.01 + daysSinceContact / 10000, // Older connections decay faster
              platform: `Facebook${friend.contact_info?.email ? " (Email)" : ""}`,
            };

            person.levelId = categorizePerson(person);
            return person;
          },
        );

        setImportedData((prev) => ({ ...prev, facebook: facebookData }));
        setPeople((prevPeople) => [...prevPeople, ...newPeople]);

        // Store contacts using enhanced storage
        const addResult = await EnhancedContactStorage.addContacts(
          newPeople,
          "facebook",
        );
        if (addResult.success) {
          setImportStatus(
            `Successfully imported ${addResult.data?.added || 0} Facebook friends (${addResult.data?.skipped || 0} duplicates skipped)`,
          );
        } else {
          setImportStatus(
            `Import failed: ${addResult.error || "Unknown error"}`,
          );
        }
      } else if (type === "linkedin") {
        // Handle LinkedIn CSV
        const text = await file.text();
        const lines = text.split("\n");
        const headers = lines[0].split(",");

        const connections: LinkedInConnection[] = lines
          .slice(1)
          .filter((line) => line.trim())
          .map((line) => {
            const values = line.split(",");
            const connection: LinkedInConnection = {
              "First Name": "",
              "Last Name": "",
              "Email Address": "",
              Company: "",
              Position: "",
            };
            headers.forEach((header, index) => {
              connection[header.trim()] = values[index]?.trim() || "";
            });
            return connection;
          });

        const newPeople: Person[] = connections.map((connection, index) => {
          const connectedDate = new Date(connection["Connected On"]);
          const daysSinceConnection =
            (Date.now() - connectedDate.getTime()) / (1000 * 60 * 60 * 24);

          // LinkedIn connections are typically professional
          let strength = 0.4; // Base professional strength
          if (daysSinceConnection < 365) strength += 0.2; // Recent connection
          if (connection.Company) strength += 0.1; // Has company info
          if (connection.Position) strength += 0.1; // Has position info

          const person: Person = {
            id: `li_${Date.now()}_${index}`,
            name: `${connection["First Name"]} ${connection["Last Name"]}`,
            levelId: "", // Will be set by categorization
            lastContact: connectedDate,
            contactFrequency: Math.max(90, daysSinceConnection), // Professional contacts less frequent
            strength: Math.min(strength, 1),
            decayRate: 0.005 + daysSinceConnection / 20000, // Professional connections decay slower
            platform: `LinkedIn - ${connection.Company} (${connection.Position})`,
          };

          person.levelId = categorizePerson(person);
          return person;
        });

        setImportedData((prev) => ({ ...prev, linkedin: connections }));
        setPeople((prevPeople) => [...prevPeople, ...newPeople]);

        // Store contacts using enhanced storage
        const addResult = await EnhancedContactStorage.addContacts(
          newPeople,
          "linkedin",
        );
        if (addResult.success) {
          setImportStatus(
            `Successfully imported ${addResult.data?.added || 0} LinkedIn connections (${addResult.data?.skipped || 0} duplicates skipped)`,
          );
        } else {
          setImportStatus(
            `Import failed: ${addResult.error || "Unknown error"}`,
          );
        }
      }

      setTimeout(() => setImportStatus(""), 3000);
      setIsImporting(false);
    } catch (error) {
      console.error("Import error:", error);
      setImportStatus(
        `Error importing ${type} data: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
      setTimeout(() => setImportStatus(""), 5000);
    }
  };

  const getNetworkHealth = () => {
    if (people.length === 0) return 0;
    const healthyContacts = people.filter(
      (person) => !isRelationshipDecaying(person),
    );
    return (healthyContacts.length / people.length) * 100;
  };

  const prepareExportData = (): ExportData => {
    return {
      people,
      levels,
      metadata: {
        exportDate: new Date().toISOString(),
        version: "1.0.0",
        totalContacts: people.length,
        networkHealth: getNetworkHealth(),
      },
    };
  };

  const handleExportJSON = () => {
    const data = prepareExportData();
    const filename = generateFilename("yakw_relationships", "json");
    exportToJSON(data, filename);
    setShowExportDialog(false);
  };

  const handleExportCSV = () => {
    const filename = generateFilename("yakw_relationships", "csv");
    exportToCSV(people, levels, filename);
    setShowExportDialog(false);
  };

  const handlePrintReport = () => {
    const data = prepareExportData();
    printReport(data);
    setShowExportDialog(false);
  };

  const handleShareData = async () => {
    try {
      const data = prepareExportData();
      await shareData(data, "My YAKW Relationship Network");
      setShowExportDialog(false);
    } catch (error) {
      console.error("Share failed:", error);
      alert("Sharing failed. Please try again.");
    }
  };

  return (
    <ErrorBoundary
      fallback={({ error, retry }) => (
        <DataErrorFallback
          error={error}
          retry={retry}
          showSampleData={() => {
            // Load sample data as fallback
            setPeople([
              {
                id: "sample_1",
                name: "Sarah Johnson",
                levelId: "inner-circle",
                lastContact: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
                contactFrequency: 1,
                strength: 0.95,
                decayRate: 0.001,
                platform: "Real Life",
              },
              {
                id: "sample_2",
                name: "Mike Chen",
                levelId: "sympathy-group",
                lastContact: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
                contactFrequency: 7,
                strength: 0.8,
                decayRate: 0.005,
                platform: "Work",
              },
            ]);
          }}
        />
      )}
    >
      <div
        data-testid="relationship-inventory"
        className="space-y-6"
        role="region"
        aria-label="Relationship inventory management system"
      >
        {/* Data Status Component */}
        <DataStatus
          onImportClick={() => setIsImporting(true)}
          onRefresh={() => window.location.reload()}
        />
        {/* Header with stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Users className="w-4 h-4" />
                Total Contacts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{people.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Zap className="w-4 h-4" />
                Network Health
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {getRelationshipHealth().toFixed(0)}%
              </div>
              <Progress value={getRelationshipHealth()} className="mt-2" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <TrendingDown className="w-4 h-4" />
                Decaying
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {getDecayingRelationships().length}
              </div>
              <span className="text-xs text-gray-500">
                You haven&apos;t added any notes yet. Click to add one.
              </span>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                Avg. Strength
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {(
                  (people.reduce((sum, p) => sum + p.strength, 0) /
                    people.length) *
                  100
                ).toFixed(0)}
                %
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Status Message */}
        {importStatus && (
          <Card
            className={`${importStatus.includes("Error") || importStatus.includes("Failed") ? "border-red-200 bg-red-50" : "border-green-200 bg-green-50"}`}
          >
            <CardContent className="py-3">
              <div
                className={`text-sm ${importStatus.includes("Error") || importStatus.includes("Failed") ? "text-red-700" : "text-green-700"}`}
              >
                {importStatus}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Controls */}
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <Label htmlFor="filter">Filter by level:</Label>
            <Select value={filterLevel} onValueChange={setFilterLevel}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                {levels.map((level) => (
                  <SelectItem key={level.id} value={level.id}>
                    {level.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowDecayWarnings(!showDecayWarnings)}
            className={showDecayWarnings ? "bg-red-50 text-red-700" : ""}
          >
            <AlertTriangle className="w-4 h-4 mr-2" />
            Decay Warnings
          </Button>

          <Dialog open={isImporting} onOpenChange={setIsImporting}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Upload className="w-4 h-4 mr-2" />
                Import Contacts
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Import Social Graph Data</DialogTitle>
                <DialogDescription>
                  Upload your Facebook friends export (JSON) or LinkedIn
                  connections (CSV) to automatically map your network.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6">
                {importStatus && (
                  <div
                    className={`p-3 rounded-lg ${importStatus.includes("Error") ? "bg-red-50 text-red-700" : "bg-green-50 text-green-700"}`}
                  >
                    {importStatus}
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Facebook Import */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 p-4 border-2 border-dashed border-blue-200 rounded-lg">
                      <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
                        <Facebook className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium">Facebook Friends</h3>
                        <p className="text-sm text-gray-600">
                          Upload friends.json from Facebook data export
                        </p>
                      </div>
                    </div>

                    <input
                      type="file"
                      accept=".json"
                      onChange={(e) => handleFileUpload(e, "facebook")}
                      className="w-full p-2 border border-gray-300 rounded-md"
                      id="facebook-upload"
                      data-testid="file-input"
                    />
                    <label
                      htmlFor="facebook-upload"
                      className="text-xs text-gray-500"
                    >
                      Expected format: Facebook JSON export with friends data
                    </label>

                    {importedData.facebook && (
                      <div className="p-3 bg-blue-50 rounded-lg">
                        <p className="text-sm font-medium text-blue-700">
                          &quot;Imported{" "}
                          {importedData.facebook.friends.data.length}&quot;{" "}
                          Facebook friends
                        </p>
                        <p className="text-xs text-blue-600">
                          Export date:{" "}
                          {importedData.facebook.metadata?.export_date ||
                            "Unknown"}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* LinkedIn Import */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 p-4 border-2 border-dashed border-blue-200 rounded-lg">
                      <div className="w-12 h-12 bg-blue-700 rounded-lg flex items-center justify-center">
                        <Linkedin className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium">LinkedIn Connections</h3>
                        <p className="text-sm text-gray-600">
                          Upload connections.csv from LinkedIn export
                        </p>
                      </div>
                    </div>

                    <input
                      type="file"
                      accept=".csv"
                      onChange={(e) => handleFileUpload(e, "linkedin")}
                      className="w-full p-2 border border-gray-300 rounded-md"
                      id="linkedin-upload"
                      data-testid="file-input"
                    />
                    <label
                      htmlFor="linkedin-upload"
                      className="text-xs text-gray-500"
                    >
                      Expected format: CSV with First Name, Last Name, Email,
                      Company, Position, Connected On
                    </label>

                    {importedData.linkedin && (
                      <div className="p-3 bg-blue-50 rounded-lg">
                        <p className="text-sm font-medium text-blue-700">
                          &quot;Imported {importedData.linkedin.length}&quot;
                          LinkedIn connections
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Import Instructions */}
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium mb-2">How to get your data:</h4>
                  <div className="space-y-2 text-sm text-gray-600">
                    <div>
                      <strong>Facebook:</strong> Settings → Your Facebook
                      Information → Download Your Information → Select
                      &quot;&quot;Friends&quot;&quot; → JSON format
                    </div>
                    <div>
                      <strong>LinkedIn:</strong> Settings → Data Privacy → Get a
                      copy of your data → Select
                      &quot;&quot;Connections&quot;&quot; → Download CSV
                    </div>
                  </div>
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setIsImporting(false)}>
                  Close
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Button
            variant="outline"
            size="sm"
            onClick={async () => {
              try {
                const saveResult = await EnhancedContactStorage.saveContacts(
                  people.map((person) => ({
                    ...person,
                    importDate: new Date(),
                    source: "manual" as const,
                  })),
                );

                if (saveResult.success) {
                  setImportStatus(
                    `Successfully saved ${saveResult.data?.saved || 0} contacts!`,
                  );
                } else {
                  setImportStatus(
                    `Save failed: ${saveResult.error || "Unknown error"}`,
                  );
                }
                setTimeout(() => setImportStatus(""), 3000);
              } catch (error) {
                console.error("Failed to save contacts:", error);
                setImportStatus(
                  `Error saving contacts: ${error instanceof Error ? error.message : "Unknown error"}`,
                );
                setTimeout(() => setImportStatus(""), 3000);
              }
            }}
            disabled={people.length === 0}
            className="text-green-600 hover:text-green-700"
          >
            <Upload className="w-4 h-4 mr-2" />
            Save Contacts
          </Button>

          <Dialog open={showExportDialog} onOpenChange={setShowExportDialog}>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                disabled={people.length === 0}
              >
                <Download className="w-4 h-4 mr-2" />
                Export Data
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Export Relationship Data</DialogTitle>
                <DialogDescription>
                  Export your {people.length} relationships and network analysis
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-3">
                <Button
                  onClick={handleExportJSON}
                  variant="outline"
                  className="w-full justify-start"
                  data-testid="export-json"
                >
                  <FileText className="w-4 h-4 mr-3" />
                  <div className="text-left">
                    <div className="font-medium">JSON Format</div>
                    <div className="text-xs text-gray-500">
                      Complete data with metadata
                    </div>
                  </div>
                </Button>

                <Button
                  onClick={handleExportCSV}
                  variant="outline"
                  className="w-full justify-start"
                  data-testid="export-csv"
                >
                  <FileText className="w-4 h-4 mr-3" />
                  <div className="text-left">
                    <div className="font-medium">CSV Format</div>
                    <div className="text-xs text-gray-500">
                      Spreadsheet compatible
                    </div>
                  </div>
                </Button>

                <Button
                  onClick={handlePrintReport}
                  variant="outline"
                  className="w-full justify-start"
                >
                  <Image className="w-4 h-4 mr-3" />
                  <div className="text-left">
                    <div className="font-medium">Print Report</div>
                    <div className="text-xs text-gray-500">
                      Formatted for printing
                    </div>
                  </div>
                </Button>

                <Button
                  onClick={handleShareData}
                  variant="outline"
                  className="w-full justify-start"
                >
                  <Share2 className="w-4 h-4 mr-3" />
                  <div className="text-left">
                    <div className="font-medium">Share Summary</div>
                    <div className="text-xs text-gray-500">
                      Share network statistics
                    </div>
                  </div>
                </Button>
              </div>

              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setShowExportDialog(false)}
                >
                  Cancel
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Main network graph */}
        <Card>
          <CardHeader>
            <CardTitle>Force-Directed Network Graph</CardTitle>
            <CardDescription>
              Interactive visualization of your personal relationships. Click on
              nodes to see details.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <canvas
              ref={canvasRef}
              width={800}
              height={500}
              className="border rounded-lg cursor-pointer bg-gradient-to-br from-blue-50 to-purple-50"
              onClick={handleCanvasClick}
            />
          </CardContent>
        </Card>

        {/* Relationship decay warnings */}
        {getDecayingRelationships().length > 0 && (
          <Card className="border-red-200 bg-red-50">
            <CardHeader>
              <CardTitle className="text-red-700 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                Relationships Needing Attention
              </CardTitle>
              <CardDescription className="text-red-600">
                These relationships haven&apos;t been maintained according to
                their expected frequency.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {getDecayingRelationships().map((person) => {
                  const daysSinceContact = Math.floor(
                    (Date.now() - person.lastContact.getTime()) /
                      (1000 * 60 * 60 * 24),
                  );
                  const level = levels.find((l) => l.id === person.levelId);
                  return (
                    <div
                      key={person.id}
                      className="flex items-center justify-between p-3 bg-white rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-3 h-3 ${level?.color} rounded-full`}
                        ></div>
                        <div>
                          <h4 className="font-medium">{person.name}</h4>
                          <p className="text-sm text-gray-600">
                            Last contact: {daysSinceContact} days ago •
                            Expected: every {person.contactFrequency} days
                          </p>
                        </div>
                      </div>
                      <Badge variant="destructive">Overdue</Badge>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Selected person details */}
        {selectedPerson && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                {selectedPerson.name}
              </CardTitle>
              <CardDescription>
                Relationship details and maintenance history
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Relationship Level</Label>
                  <p className="text-sm font-medium">
                    {levels.find((l) => l.id === selectedPerson.levelId)?.name}
                  </p>
                </div>
                <div>
                  <Label>Platform</Label>
                  <p className="text-sm font-medium">
                    {selectedPerson.platform}
                  </p>
                </div>
                <div>
                  <Label>Relationship Strength</Label>
                  <div className="flex items-center gap-2">
                    <Progress
                      value={selectedPerson.strength * 100}
                      className="flex-1"
                    />
                    <span className="text-sm">
                      {(selectedPerson.strength * 100).toFixed(0)}%
                    </span>
                  </div>
                </div>
                <div>
                  <Label>Last Contact</Label>
                  <p className="text-sm font-medium">
                    {selectedPerson.lastContact.toLocaleDateString()}
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedPerson(null)}
                className="w-full"
              >
                Close Details
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </ErrorBoundary>
  );
}
