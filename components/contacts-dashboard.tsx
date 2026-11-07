import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Users,
  Search,
  Filter,
  Facebook,
  Linkedin,
  User,
  Calendar,
  TrendingUp,
  AlertTriangle,
  RefreshCw,
  Download,
  FileText,
  Image,
  Share2,
  Upload,
} from "lucide-react";
import { EnhancedContactStorage } from "@/lib/contact-storage-enhanced";
import type { StoredContact } from "@/lib/contact-storage";
import { auth } from "@/firebase-config";
import { testFirebaseConnection, addTestContact } from "@/lib/firebase-test";
import {
  exportToJSON,
  exportToCSV,
  printReport,
  shareData,
  generateFilename,
  type ExportData,
} from "@/lib/export-utils";
// Dialog imports removed; using inline panels instead of modals
import type { Level } from "@/types/relationships";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Move, Edit as EditIcon, Trash2 } from "lucide-react";
import { ContactEditModal } from "./contact-edit-modal";
import { ContactDeleteConfirmation } from "./contact-delete-confirmation";
import type { ContactFormData, ContactUpdateData } from "@/lib/contact-models";

interface ContactsDashboardProps {
  levels: Level[];
}

export function ContactsDashboard({ levels }: ContactsDashboardProps) {
  const [contacts, setContacts] = useState<StoredContact[]>([]);
  const [filteredContacts, setFilteredContacts] = useState<StoredContact[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sourceFilter, setSourceFilter] = useState<string>("all");
  const [levelFilter, setLevelFilter] = useState<string>("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    bySource: { facebook: 0, linkedin: 0, manual: 0 },
    byLevel: {} as Record<string, number>,
  });
  const [, setDataSource] = useState<string>("loading");
  const [editingContact, setEditingContact] = useState<StoredContact | null>(
    null,
  );

  // Load contacts and stats
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);

      try {
        const result = await EnhancedContactStorage.loadContacts();
        const statsResult = await EnhancedContactStorage.getStats();

        if (result.success && result.data) {
          setContacts(result.data);
          setDataSource(result.source);

          if (result.fallbackUsed) {
            setError(
              `Loaded ${result.data.length} contacts from ${result.source} (some sample data included)`,
            );
          } else if (result.error) {
            setError(result.error);
          } else {
            setError(null);
          }

          if (statsResult.success && statsResult.data) {
            // Ensure the stats match our expected structure
            const statsData = statsResult.data;
            setStats({
              total: statsData.total,
              bySource: {
                facebook: statsData.bySource.facebook || 0,
                linkedin: statsData.bySource.linkedin || 0,
                manual: statsData.bySource.manual || 0,
              },
              byLevel: statsData.byLevel,
            });
          } else {
            // Calculate basic stats from loaded contacts
            const contacts = result.data;
            const total = contacts.length;
            const bySource = { facebook: 0, linkedin: 0, manual: 0 };
            const byLevel: Record<string, number> = {};

            contacts.forEach((contact: StoredContact) => {
              if (contact.source === "facebook") bySource.facebook++;
              else if (contact.source === "linkedin") bySource.linkedin++;
              else if (contact.source === "manual") bySource.manual++;

              byLevel[contact.levelId] = (byLevel[contact.levelId] || 0) + 1;
            });

            setStats({ total, bySource, byLevel });
          }

          console.log(
            `Loaded ${result.data.length} contacts from ${result.source}`,
          );
        } else {
          setError(result.error || "Failed to load contacts");
          setContacts([]);
          setStats({
            total: 0,
            bySource: { facebook: 0, linkedin: 0, manual: 0 },
            byLevel: {},
          });
          setDataSource("none");
        }
      } catch (error) {
        console.error("Failed to load contacts:", error);
        setError(
          `Failed to load contacts: ${error instanceof Error ? error.message : "Unknown error"}`,
        );
        setContacts([]);
        setStats({
          total: 0,
          bySource: { facebook: 0, linkedin: 0, manual: 0 },
          byLevel: {},
        });
        setDataSource("none");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Apply filters
  useEffect(() => {
    let filtered = contacts;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (contact) =>
          contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          contact.platform.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }

    // Source filter
    if (sourceFilter !== "all") {
      filtered = filtered.filter((contact) => contact.source === sourceFilter);
    }

    // Level filter
    if (levelFilter !== "all") {
      filtered = filtered.filter((contact) => contact.levelId === levelFilter);
    }

    setFilteredContacts(filtered);
  }, [contacts, searchTerm, sourceFilter, levelFilter]);

  const getSourceIcon = (source: string) => {
    switch (source) {
      case "facebook":
        return <Facebook className="w-4 h-4 text-blue-600" />;
      case "linkedin":
        return <Linkedin className="w-4 h-4 text-blue-700" />;
      default:
        return <User className="w-4 h-4 text-gray-600" />;
    }
  };

  const getRelationshipHealth = (contact: StoredContact) => {
    const daysSinceContact =
      (Date.now() - contact.lastContact.getTime()) / (1000 * 60 * 60 * 24);
    const isDecaying = daysSinceContact > contact.contactFrequency * 1.5;
    return { daysSinceContact: Math.floor(daysSinceContact), isDecaying };
  };

  const recalcStats = (list: StoredContact[]) => {
    const total = list.length;
    const bySource = { facebook: 0, linkedin: 0, manual: 0 } as Record<
      string,
      number
    > & { facebook: number; linkedin: number; manual: number };
    const byLevel: Record<string, number> = {};
    list.forEach((c) => {
      bySource[c.source] = (bySource[c.source] || 0) + 1;
      byLevel[c.levelId] = (byLevel[c.levelId] || 0) + 1;
    });
    setStats({
      total,
      bySource: {
        facebook: bySource.facebook || 0,
        linkedin: bySource.linkedin || 0,
        manual: bySource.manual || 0,
      },
      byLevel,
    });
  };

  const handleContactUpdate = async (
    contact: StoredContact,
    updates: Partial<StoredContact>,
  ) => {
    const targetId = contact.firestoreId || contact.id;
    try {
      const result = await EnhancedContactStorage.updateContact(
        targetId,
        updates,
      );
      if (result.success && result.data) {
        setContacts((prev) => {
          const next = prev.map((c) =>
            (c.firestoreId && c.firestoreId === targetId) || c.id === targetId
              ? { ...c, ...result.data }
              : c,
          );
          recalcStats(next);
          return next;
        });
      } else {
        throw new Error(result.error || "Failed to update contact");
      }
    } catch (err) {
      console.error("Update failed:", err);
      alert(
        `Failed to update contact: ${err instanceof Error ? err.message : "Unknown error"}`,
      );
    }
  };

  const handleContactDelete = async (contact: StoredContact) => {
    const targetId = contact.firestoreId || contact.id;
    try {
      const result = await EnhancedContactStorage.deleteContact(targetId);
      if (result.success) {
        setContacts((prev) => {
          const next = prev.filter((c) => {
            const cId = c.firestoreId || c.id;
            return cId !== targetId;
          });
          recalcStats(next);
          return next;
        });
      } else {
        throw new Error(result.error || "Failed to delete contact");
      }
    } catch (err) {
      console.error("Delete failed:", err);
      alert(
        `Failed to delete contact: ${err instanceof Error ? err.message : "Unknown error"}`,
      );
    }
  };

  const clearAllContacts = async () => {
    if (
      confirm(
        "Are you sure you want to clear all imported contacts? This action cannot be undone.",
      )
    ) {
      try {
        const userId = auth?.currentUser?.uid;
        if (userId) {
          await EnhancedContactStorage.clearAllContacts(
            `CONFIRM_DELETE_${userId}`,
          );
        }
        setContacts([]);
        setStats({
          total: 0,
          bySource: { facebook: 0, linkedin: 0, manual: 0 },
          byLevel: {},
        });
      } catch (error) {
        console.error("Failed to clear contacts:", error);
        alert("Failed to clear contacts. Please try again.");
      }
    }
  };

  const refreshContacts = async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await EnhancedContactStorage.loadContacts();
      const statsResult = await EnhancedContactStorage.getStats();

      const loadedContacts = result.data || [];
      const contactStats = statsResult.data || {
        total: 0,
        bySource: { facebook: 0, linkedin: 0, manual: 0 },
        byLevel: {},
      };

      setContacts(loadedContacts);
      setStats({
        total: contactStats.total,
        bySource: {
          facebook: contactStats.bySource.facebook || 0,
          linkedin: contactStats.bySource.linkedin || 0,
          manual: contactStats.bySource.manual || 0,
        },
        byLevel: contactStats.byLevel,
      });
    } catch (error) {
      console.error("Failed to refresh contacts:", error);
      setError("Failed to refresh contacts from Firebase");
    } finally {
      setLoading(false);
    }
  };

  const testFirebase = async () => {
    try {
      const isConnected = await testFirebaseConnection();
      if (isConnected) {
        await addTestContact();
        await refreshContacts();
        alert("Firebase test successful! Added a test contact.");
      } else {
        alert("Firebase connection test failed. Check console for details.");
      }
    } catch (error) {
      console.error("Firebase test error:", error);
      alert("Firebase test failed. Check console for details.");
    }
  };

  const getNetworkHealth = () => {
    if (contacts.length === 0) return 0;
    const healthyContacts = contacts.filter((contact) => {
      const daysSinceContact =
        (Date.now() - contact.lastContact.getTime()) / (1000 * 60 * 60 * 24);
      return daysSinceContact <= contact.contactFrequency * 1.5;
    });
    return (healthyContacts.length / contacts.length) * 100;
  };

  const prepareExportData = (): ExportData => {
    return {
      people: contacts,
      levels,
      metadata: {
        exportDate: new Date().toISOString(),
        version: "1.0.0",
        totalContacts: contacts.length,
        networkHealth: getNetworkHealth(),
      },
    };
  };

  const { toast } = useToast();

  const handleExportJSON = () => {
    const data = prepareExportData();
    const filename = generateFilename("dunbars-circles-contacts", "json");
    exportToJSON(data, filename);
    setShowExportDialog(false);
    toast({ title: "Export complete", description: `Saved ${filename}` });
  };

  const handleExportCSV = () => {
    const data = prepareExportData();
    exportToCSV(data.people, data.levels);
    setShowExportDialog(false);
    toast({
      title: "Export complete",
      description: "Your CSV file was downloaded.",
    });
  };

  const handlePrintReport = () => {
    const data = prepareExportData();
    printReport(data);
    setShowExportDialog(false);
  };

  const handleShareData = async () => {
    try {
      const data = prepareExportData();
      await shareData(data, "My Dunbar's Circles Relationship Network");
      setShowExportDialog(false);
    } catch (error) {
      console.error("Share failed:", error);
      toast({
        title: "Sharing failed",
        description: "Please try again.",
        variant: "destructive",
      });
    }
  };

  const isSampleNotice = !!error && error.includes("sample data");

  return (
    <div className="space-y-6">
      {/* Loading State */}
      {loading && (
        <Card>
          <CardContent className="flex items-center justify-center py-8">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              <span>Loading contacts from Firebase...</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Sample data / error banner */}
      {error && isSampleNotice && (
        <Card className="border-blue-200 bg-blue-50 dark:bg-blue-950/30 dark:border-blue-800">
          <CardContent className="py-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-blue-900 dark:text-blue-100">
                <AlertTriangle className="w-4 h-4" aria-hidden="true" />
                <span className="text-sm font-medium">
                  You&apos;re viewing sample data. Replace it with your own
                  contacts to see your real network.
                </span>
              </div>
              <Button asChild size="sm">
                <Link to="/contacts">Enter real contacts</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
      {error && !isSampleNotice && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-yellow-700">
                <AlertTriangle className="w-4 h-4" />
                <span className="text-sm">{error}</span>
              </div>
              <Badge variant="secondary" className="text-xs">
                Using Local Storage
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Firebase Status */}
      {!loading && !error && contacts.length > 0 && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-green-700">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm">Connected to Firebase</span>
              </div>
              <Badge
                variant="secondary"
                className="text-xs bg-green-100 text-green-700"
              >
                Cloud Storage Active
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats Overview */}
      {!loading && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Users className="w-4 h-4" />
                Total Contacts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
              <p className="text-xs text-gray-500 mt-1">
                Imported from all sources
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Facebook className="w-4 h-4 text-blue-600" />
                Facebook
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {stats.bySource.facebook}
              </div>
              <p className="text-xs text-gray-500 mt-1">Friends imported</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Linkedin className="w-4 h-4 text-blue-700" />
                LinkedIn
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-700">
                {stats.bySource.linkedin}
              </div>
              <p className="text-xs text-gray-500 mt-1">Connections imported</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Avg. Strength
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {contacts.length > 0
                  ? Math.round(
                      (contacts.reduce((sum, c) => sum + c.strength, 0) /
                        contacts.length) *
                        100,
                    )
                  : 0}
                %
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Relationship strength
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters and Search */}
      {false && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="w-5 h-5" />
              Filter & Search Contacts
            </CardTitle>
            <CardDescription>
              Search and filter your imported contacts by source, level, or name
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label htmlFor="search">Search</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    id="search"
                    placeholder="Search contacts..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Source</Label>
                <Select value={sourceFilter} onValueChange={setSourceFilter}>
                  <SelectTrigger aria-label="Filter contacts by source">
                    <SelectValue placeholder="Select source" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Sources</SelectItem>
                    <SelectItem value="facebook">Facebook</SelectItem>
                    <SelectItem value="linkedin">LinkedIn</SelectItem>
                    <SelectItem value="manual">Manual</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Dunbar Level</Label>
                <Select value={levelFilter} onValueChange={setLevelFilter}>
                  <SelectTrigger aria-label="Filter contacts by Dunbar level">
                    <SelectValue placeholder="Select level" />
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

              <div className="space-y-2">
                <Label>Actions</Label>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant="outline"
                    onClick={refreshContacts}
                    disabled={loading}
                    aria-label="Refresh contacts from Firebase"
                    title="Refresh contacts from Firebase"
                  >
                    <RefreshCw
                      className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`}
                    />
                    Refresh
                  </Button>
                  <Button
                    variant="outline"
                    disabled={contacts.length === 0 || loading}
                    className="text-green-600 hover:text-green-700"
                    aria-label={`Export ${contacts.length} contacts in various formats`}
                    title="Export contacts in various formats"
                    onClick={() => setShowExportDialog((v) => !v)}
                    aria-expanded={showExportDialog}
                    aria-controls="export-contacts-panel"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    {showExportDialog ? "Hide Export" : "Export"}
                  </Button>
                  {showExportDialog && (
                    <Card id="export-contacts-panel" className="max-w-md mt-3">
                      <CardHeader>
                        <CardTitle>Export Contacts</CardTitle>
                        <CardDescription>
                          Choose how you'd like to export your {contacts.length}{" "}
                          contacts
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <Button
                            onClick={handleExportJSON}
                            variant="outline"
                            className="w-full justify-start"
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
                        <div className="mt-3 flex justify-end">
                          <Button
                            variant="outline"
                            onClick={() => setShowExportDialog(false)}
                          >
                            Close
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                  <Button
                    variant="outline"
                    onClick={async () => {
                      try {
                        setLoading(true);
                        await EnhancedContactStorage.saveContacts(contacts);
                        setError(null);
                        alert("Successfully saved all contacts to Firebase!");
                      } catch (error) {
                        console.error("Failed to save to Firebase:", error);
                        alert(
                          "Failed to save contacts to Firebase. Check console for details.",
                        );
                      } finally {
                        setLoading(false);
                      }
                    }}
                    disabled={contacts.length === 0 || loading}
                    className="text-green-600 hover:text-green-700"
                    aria-label={`Save ${contacts.length} contacts to Firebase cloud storage`}
                    title="Save all contacts to Firebase"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Save to Firebase
                  </Button>
                  <Button
                    variant="outline"
                    onClick={testFirebase}
                    disabled={loading}
                    className="text-blue-600 hover:text-blue-700"
                    aria-label="Test Firebase connection and add sample contact"
                    title="Test Firebase connection"
                  >
                    Test Firebase
                  </Button>
                  <Button
                    variant="outline"
                    onClick={clearAllContacts}
                    className="text-red-600 hover:text-red-700"
                    disabled={contacts.length === 0 || loading}
                    aria-label={`Clear all ${contacts.length} contacts permanently`}
                    title="Clear all contacts (cannot be undone)"
                  >
                    Clear All
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Contacts List */}
      {!loading && (
        <Card>
          <CardHeader>
            <CardTitle>Contacts ({filteredContacts.length})</CardTitle>
            <CardDescription>
              All your imported contacts with relationship details
            </CardDescription>
          </CardHeader>
          <CardContent>
            {filteredContacts.length === 0 ? (
              <div className="text-center py-8">
                <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No contacts found
                </h3>
                <p className="text-gray-500">
                  {contacts.length === 0
                    ? "Your network is empty. Start by entering the people you regularly contact."
                    : "Try adjusting your search or filter criteria."}
                </p>
                {contacts.length === 0 && (
                  <Button asChild className="mt-4">
                    <Link to="/contacts">Enter your first contact</Link>
                  </Button>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                {filteredContacts.map((contact) => {
                  const level = levels.find((l) => l.id === contact.levelId);
                  const health = getRelationshipHealth(contact);

                  return (
                    <div
                      key={contact.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          {getSourceIcon(contact.source)}
                          <div
                            className={`w-3 h-3 ${level?.color} rounded-full`}
                          ></div>
                        </div>

                        <div className="flex-1">
                          <h4 className="font-medium">{contact.name}</h4>
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <span>{contact.platform}</span>
                            <span>•</span>
                            <span>{level?.name}</span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {health.daysSinceContact}d ago
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="text-right pr-2">
                          <div className="text-sm font-medium">
                            {Math.round(contact.strength * 100)}%
                          </div>
                          <div className="text-xs text-gray-500">strength</div>
                        </div>

                        {health.isDecaying && (
                          <Badge
                            variant="destructive"
                            className="flex items-center gap-1"
                          >
                            <AlertTriangle className="w-3 h-3" />
                            Decaying
                          </Badge>
                        )}

                        <Badge variant="secondary" className="capitalize">
                          {contact.source}
                        </Badge>

                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              aria-label="Contact actions menu"
                            >
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => setEditingContact(contact)}
                              data-testid="edit-contact"
                            >
                              <EditIcon className="w-4 h-4 mr-2" />
                              Edit Contact
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            {levels.map((lvl) => (
                              <DropdownMenuItem
                                key={lvl.id}
                                onClick={() =>
                                  handleContactUpdate(contact, {
                                    levelId: lvl.id,
                                  })
                                }
                              >
                                <Move className="w-4 h-4 mr-2" />
                                Move to {lvl.name}
                              </DropdownMenuItem>
                            ))}
                          </DropdownMenuContent>
                        </DropdownMenu>

                        <ContactDeleteConfirmation
                          contact={{
                            id: contact.firestoreId || contact.id,
                            name: contact.name,
                            levelId: contact.levelId,
                            platform: contact.platform,
                            lastContact: contact.lastContact,
                            strength: contact.strength,
                          }}
                          onDelete={async (contactId) => {
                            // Map back to the full contact by id
                            const full = contacts.find(
                              (c) =>
                                c.firestoreId === contactId ||
                                c.id === contactId,
                            );
                            if (full) {
                              await handleContactDelete(full);
                            }
                          }}
                          trigger={
                            <Button
                              variant="ghost"
                              size="sm"
                              aria-label={`Delete ${contact.name}`}
                              className="text-red-600 hover:text-red-700"
                              title={`Delete ${contact.name}`}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          }
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {editingContact && (
        <ContactEditModal
          contact={{
            id: editingContact.firestoreId || editingContact.id,
            name: editingContact.name,
            email: editingContact.email,
            phone: editingContact.phone,
            notes: editingContact.notes,
            levelId: editingContact.levelId,
            platform: editingContact.platform,
            contactFrequency: editingContact.contactFrequency,
            strength: editingContact.strength,
            lastContact: editingContact.lastContact,
          }}
          isOpen={!!editingContact}
          onOpenChange={(open) => {
            if (!open) setEditingContact(null);
          }}
          onSave={async (data: ContactFormData | ContactUpdateData) => {
            const contactId =
              "id" in data
                ? data.id
                : editingContact.firestoreId || editingContact.id;
            const { id, ...updates } = data as any;
            const result = await EnhancedContactStorage.updateContact(
              contactId,
              updates,
            );
            if (result.success && result.data) {
              setContacts((prev) => {
                const next = prev.map((c) =>
                  (c.firestoreId && c.firestoreId === contactId) ||
                  c.id === contactId
                    ? { ...c, ...result.data }
                    : c,
                );
                recalcStats(next);
                return next;
              });
              setEditingContact(null);
            } else {
              throw new Error(result.error || "Failed to save contact");
            }
          }}
        />
      )}
    </div>
  );
}
