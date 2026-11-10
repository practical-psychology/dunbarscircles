import { useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import PageLayout from "../components/PageLayout";
// UI Components
import { LiquidCard } from "../../components/ui/liquid-card";
import { LiquidButton } from "../../components/ui/liquid-button";
import { Button } from "../../components/ui/button";
import { Progress } from "../../components/ui/progress";
import { Badge } from "../../components/ui/badge";

// Icons
import {
  Users,
  RefreshCw,
  Upload,
  FileText,
  ArrowLeft,
  CheckCircle,
  AlertTriangle,
  Download,
  Eye,
} from "lucide-react";
import { Facebook, Linkedin } from "../../components/brand-icons";

import type { StoredContact } from "@/lib/contact-storage-service";
import { ContactStorageService } from "@/lib/contact-storage-service";

interface ImportStats {
  total: number;
  successful: number;
  failed: number;
  duplicates: number;
}

// Minimal contact shape used for preview/import before saving via service
type ImportedContact = {
  id: string;
  name: string;
  levelId: string;
  lastContact: Date;
  contactFrequency: number;
  strength: number;
  decayRate: number;
  platform: string;
  source: "facebook" | "linkedin" | "manual";
  importDate: Date;
  email?: string;
  phone?: string;
  notes?: string;
  tags?: string[];
  firestoreId?: string;
};

interface ImportPreview {
  contacts: ImportedContact[];
  stats: ImportStats;
  errors: string[];
}

export default function ContactImportPage() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [importing, setImporting] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  const [importComplete, setImportComplete] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<ImportPreview | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const contactStorage = ContactStorageService.getInstance();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setError(null);
      setPreview(null);
      setImportComplete(false);
    }
  };

  const parseCSVFile = (content: string): ImportedContact[] => {
    const lines = content.split("\n").filter((line) => line.trim());
    if (lines.length < 2)
      throw new Error("CSV file must have at least a header and one data row");

    const headers = lines[0].split(",").map((h) => h.trim().toLowerCase());
    const contacts: ImportedContact[] = [];
    const now = new Date();

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(",").map((v) => v.trim().replace(/"/g, ""));

      if (values.length < headers.length) continue; // Skip incomplete rows

      // Create a new contact with all required fields and defaults
      const contact: ImportedContact = {
        id: `import_${Date.now()}_${i}`,
        name: "",
        levelId: "active-network", // Default level
        lastContact: now,
        contactFrequency: 90, // Default quarterly
        strength: 0.3, // Default strength for imported contacts
        decayRate: 0.1,
        platform: "LinkedIn",
        source: "linkedin",
        importDate: now,
        // Optional fields with defaults
        email: "",
        phone: "",
        notes: "",
        tags: [],
      };

      // Map CSV columns to contact fields
      headers.forEach((header, index) => {
        const value = values[index] || "";

        switch (header) {
          case "first name":
          case "firstname":
            contact.name = value;
            break;
          case "last name":
          case "lastname":
            contact.name = contact.name ? `${contact.name} ${value}` : value;
            break;
          case "name":
          case "full name":
            contact.name = value;
            break;
          case "email":
          case "email address":
            contact.email = value;
            break;
          case "phone":
          case "phone number":
            contact.phone = value;
            break;
          case "company":
          case "organization":
            contact.platform = value || "LinkedIn";
            break;
          case "position":
          case "title":
            contact.notes = value ? `Position: ${value}` : "";
            break;
          case "connected on":
          case "connection date":
            if (value) {
              const date = new Date(value);
              if (!isNaN(date.getTime())) {
                contact.lastContact = date;
              }
            }
            break;
        }
      });

      if (contact.name) {
        contacts.push(contact);
      }
    }

    return contacts;
  };

  const parseJSONFile = (content: string): ImportedContact[] => {
    let data;
    try {
      data = JSON.parse(content);
    } catch (error) {
      throw new Error("Invalid JSON format. Please check your file.");
    }

    const contacts: ImportedContact[] = [];
    const now = new Date();

    // Create a base contact with all required fields and defaults
    const createBaseContact = (): ImportedContact => ({
      id: `import_${Date.now()}_${Math.floor(Math.random() * 10000)}`,
      name: "",
      levelId: "active-network",
      lastContact: now,
      contactFrequency: 90,
      strength: 0.3,
      decayRate: 0.1,
      platform: "",
      source: "manual",
      importDate: now,
      // Optional fields with defaults
      email: "",
      phone: "",
      notes: "",
      tags: [],
    });

    // Handle Facebook friends format v2 (newer format)
    if (data.friends_v2 && Array.isArray(data.friends_v2)) {
      data.friends_v2.forEach((friend: any, index: number) => {
        if (friend.name && friend.name.trim()) {
          const contact = createBaseContact();
          contact.id = `import_${Date.now()}_${index}`;
          contact.name = friend.name.trim();
          contact.levelId = "recognition-group";
          contact.lastContact = friend.timestamp
            ? new Date(friend.timestamp * 1000)
            : now;
          contact.contactFrequency = 365;
          contact.strength = 0.2;
          contact.platform = "Facebook";
          contact.source = "facebook";
          contacts.push(contact);
        }
      });
    }
    // Handle Facebook friends format v1 (older format with more data)
    else if (data.friends?.data && Array.isArray(data.friends.data)) {
      data.friends.data.forEach((friend: any, index: number) => {
        if (friend.name && friend.name.trim()) {
          const contact = createBaseContact();
          contact.id = `import_${Date.now()}_${index}`;
          contact.name = friend.name.trim();
          contact.levelId = "recognition-group";
          contact.lastContact = friend.timestamp
            ? new Date(friend.timestamp * 1000)
            : now;
          contact.contactFrequency = 365;
          contact.strength = 0.2;
          contact.platform = "Facebook";
          contact.source = "facebook";
          contact.email = friend.contact_info?.email || "";
          contact.notes = friend.about || "";
          contacts.push(contact);
        }
      });
    }
    // Handle generic contact format
    else if (Array.isArray(data)) {
      data.forEach((item: any, index: number) => {
        if (item.name) {
          const contact = createBaseContact();
          contact.id = `import_${Date.now()}_${index}`;
          contact.name = item.name;
          contact.levelId = item.levelId || "active-network";
          contact.lastContact = item.lastContact
            ? new Date(item.lastContact)
            : now;
          contact.contactFrequency = item.contactFrequency || 90;
          contact.strength = item.strength || 0.3;
          contact.decayRate = item.decayRate || 0.1;
          contact.platform = item.platform || "Manual Import";
          contact.source = item.source || "manual";
          contact.email = item.email || "";
          contact.phone = item.phone || "";
          contact.notes = item.notes || "";
          contacts.push(contact);
        }
      });
    }
    // If no recognized format found, throw an error
    else {
      throw new Error(
        "Unrecognized JSON format. Please ensure you're uploading a Facebook friends export file.",
      );
    }

    return contacts;
  };

  const previewImport = async () => {
    if (!selectedFile) return;

    setImporting(true);
    setError(null);
    setImportProgress(10);

    try {
      const content = await selectedFile.text();
      setImportProgress(30);

      let contacts: ImportedContact[] = [];

      if (selectedFile.name.toLowerCase().endsWith(".csv")) {
        contacts = parseCSVFile(content);
      } else if (selectedFile.name.toLowerCase().endsWith(".json")) {
        contacts = parseJSONFile(content);
      } else {
        throw new Error(
          "Unsupported file format. Please use CSV or JSON files.",
        );
      }

      setImportProgress(60);

      // Load existing contacts to check for duplicates (use the same service as /contacts page)
      const existingResult = await contactStorage.readContacts();
      const existingContacts = existingResult.data || [];
      const existingNames = new Set(
        existingContacts.map((c: StoredContact) => c.name.toLowerCase()),
      );

      setImportProgress(80);

      // Categorize contacts
      const newContacts: ImportedContact[] = [];
      const duplicates: ImportedContact[] = [];

      contacts.forEach((contact) => {
        if (existingNames.has(contact.name.toLowerCase())) {
          duplicates.push(contact);
        } else {
          newContacts.push(contact);
        }
      });

      const stats: ImportStats = {
        total: contacts.length,
        successful: newContacts.length,
        failed: 0,
        duplicates: duplicates.length,
      };

      setPreview({
        contacts: newContacts,
        stats,
        errors: [],
      });

      setImportProgress(100);
    } catch (err) {
      console.error("Import preview failed:", err);
      setError(err instanceof Error ? err.message : "Failed to preview import");
    } finally {
      setImporting(false);
      setImportProgress(0);
    }
  };

  const executeImport = async () => {
    if (!preview) return;

    setImporting(true);
    setError(null);
    setImportProgress(10);

    try {
      // Create each new contact via ContactStorageService so it's saved under yakw_contacts
      const total = preview.stats.successful;
      let created = 0;
      for (const c of preview.contacts) {
        // Map to ContactForm fields expected by the service
        const result = await contactStorage.createContact({
          name: c.name,
          email: c.email || "",
          phone: c.phone || "",
          notes: c.notes || "",
          levelId: c.levelId,
          platform: c.platform || "manual",
          tags: c.tags || [],
          contactFrequency: c.contactFrequency || 90,
          strength: c.strength || 0.3,
        });
        if (result.success) {
          created++;
        } else {
          console.error("Failed to create contact:", result.error);
        }
        // Update progress roughly proportionally
        const base = 30; // after starting
        const range = 60 - base; // up to before finalizing
        const pct = base + Math.round((created / Math.max(1, total)) * range);
        setImportProgress(pct);
      }

      setImportProgress(90);

      setImportProgress(100);
      setImportComplete(true);

      // Navigate to contacts page after a delay
      setTimeout(() => {
        navigate("/contacts");
      }, 2000);
    } catch (err) {
      console.error("Import execution failed:", err);
      setError(
        err instanceof Error ? err.message : "Failed to import contacts",
      );
    } finally {
      setImporting(false);
      setImportProgress(0);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: [0.4, 0, 0.2, 1] as const,
      },
    },
  };

  return (
    <PageLayout
      title="Import Contacts"
      description="Import contacts from social media exports or CSV files"
    >
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-4xl mx-auto space-y-8"
      >
        {/* Header with navigation */}
        <motion.div variants={itemVariants}>
          <div className="flex items-center justify-between">
            <Link to="/contacts">
              <Button variant="ghost" className="flex items-center gap-2">
                <ArrowLeft className="w-4 h-4" />
                Back to Contacts
              </Button>
            </Link>
          </div>
        </motion.div>

        {/* Import Status */}
        {importComplete && (
          <motion.div variants={itemVariants}>
            <LiquidCard className="border-green-200 bg-green-50 dark:bg-green-900/20">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-6 h-6 text-green-600" />
                <div>
                  <h3 className="font-semibold text-green-800 dark:text-green-200">
                    Import Successful!
                  </h3>
                  <p className="text-green-700 dark:text-green-300">
                    {preview?.stats.successful} contacts have been imported.
                    Redirecting to contacts page...
                  </p>
                </div>
              </div>
            </LiquidCard>
          </motion.div>
        )}

        {error && (
          <motion.div variants={itemVariants}>
            <LiquidCard className="border-red-200 bg-red-50 dark:bg-red-900/20">
              <div className="flex items-center gap-2 text-red-700 dark:text-red-400">
                <AlertTriangle className="w-5 h-5" />
                <span>{error}</span>
              </div>
            </LiquidCard>
          </motion.div>
        )}

        {/* File Upload Section */}
        <motion.div variants={itemVariants}>
          <LiquidCard glow>
            <div className="space-y-6">
              <div className="flex items-center gap-3 pb-4 border-b border-gray-200 dark:border-gray-700">
                <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl text-white">
                  <Upload className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">Import Your Contacts</h2>
                  <p className="text-gray-600 dark:text-gray-300">
                    Upload CSV or JSON files from social media exports
                  </p>
                </div>
              </div>

              {/* Supported Formats */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3 p-4 border border-blue-200 rounded-lg bg-blue-50 dark:bg-blue-900/20">
                  <Facebook className="w-8 h-8 text-blue-600" />
                  <div>
                    <h3 className="font-semibold text-blue-800 dark:text-blue-200">
                      Facebook Friends
                    </h3>
                    <p className="text-sm text-blue-700 dark:text-blue-300">
                      JSON format from Facebook data export
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-4 border border-blue-200 rounded-lg bg-blue-50 dark:bg-blue-900/20">
                  <Linkedin className="w-8 h-8 text-blue-700" />
                  <div>
                    <h3 className="font-semibold text-blue-800 dark:text-blue-200">
                      LinkedIn Connections
                    </h3>
                    <p className="text-sm text-blue-700 dark:text-blue-300">
                      CSV format from LinkedIn export
                    </p>
                  </div>
                </div>
              </div>

              {/* File Upload */}
              <div className="space-y-4">
                <div
                  className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center hover:border-blue-400 transition-colors cursor-pointer"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    {selectedFile
                      ? selectedFile.name
                      : "Choose a file to import"}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-4">
                    {selectedFile
                      ? `File size: ${(selectedFile.size / 1024).toFixed(1)} KB`
                      : "Drag and drop your CSV or JSON file here, or click to browse"}
                  </p>
                  <Button variant="outline" disabled={importing}>
                    {selectedFile ? "Change File" : "Select File"}
                  </Button>
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv,.json"
                  onChange={handleFileSelect}
                  className="hidden"
                />

                {selectedFile && !preview && (
                  <div className="flex justify-center">
                    <LiquidButton
                      onClick={previewImport}
                      disabled={importing}
                      className="flex items-center gap-2"
                    >
                      {importing ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Analyzing...
                        </>
                      ) : (
                        <>
                          <Eye className="w-4 h-4" />
                          Preview Import
                        </>
                      )}
                    </LiquidButton>
                  </div>
                )}
              </div>

              {/* Progress Bar */}
              {importing && importProgress > 0 && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Processing...</span>
                    <span>{importProgress}%</span>
                  </div>
                  <Progress value={importProgress} className="w-full" />
                </div>
              )}
            </div>
          </LiquidCard>
        </motion.div>

        {/* Import Preview */}
        {preview && !importComplete && (
          <motion.div variants={itemVariants}>
            <LiquidCard>
              <div className="space-y-6">
                <div className="flex items-center gap-3 pb-4 border-b border-gray-200 dark:border-gray-700">
                  <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl text-white">
                    <Users className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">Import Preview</h2>
                    <p className="text-gray-600 dark:text-gray-300">
                      Review the contacts that will be imported
                    </p>
                  </div>
                </div>

                {/* Import Statistics */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">
                      {preview.stats.total}
                    </div>
                    <div className="text-sm text-blue-700 dark:text-blue-300">
                      Total Found
                    </div>
                  </div>

                  <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      {preview.stats.successful}
                    </div>
                    <div className="text-sm text-green-700 dark:text-green-300">
                      New Contacts
                    </div>
                  </div>

                  <div className="text-center p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                    <div className="text-2xl font-bold text-yellow-600">
                      {preview.stats.duplicates}
                    </div>
                    <div className="text-sm text-yellow-700 dark:text-yellow-300">
                      Duplicates
                    </div>
                  </div>

                  <div className="text-center p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                    <div className="text-2xl font-bold text-red-600">
                      {preview.stats.failed}
                    </div>
                    <div className="text-sm text-red-700 dark:text-red-300">
                      Failed
                    </div>
                  </div>
                </div>

                {/* Sample Contacts */}
                {preview.contacts.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="text-lg font-semibold">
                      Sample Contacts ({Math.min(5, preview.contacts.length)} of{" "}
                      {preview.contacts.length})
                    </h3>
                    <div className="space-y-2">
                      {preview.contacts.slice(0, 5).map((contact, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
                              <Users className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                            </div>
                            <div>
                              <div className="font-medium">{contact.name}</div>
                              <div className="text-sm text-gray-600 dark:text-gray-400">
                                {contact.platform} • {contact.source}
                              </div>
                            </div>
                          </div>
                          <Badge variant="secondary">
                            {contact.levelId.replace("-", " ")}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setPreview(null);
                      setSelectedFile(null);
                    }}
                    disabled={importing}
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Start Over
                  </Button>

                  <div className="flex gap-3">
                    <Link to="/contacts">
                      <Button variant="outline" disabled={importing}>
                        Cancel
                      </Button>
                    </Link>
                    <LiquidButton
                      onClick={executeImport}
                      disabled={importing || preview.stats.successful === 0}
                      className="flex items-center gap-2"
                    >
                      {importing ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Importing...
                        </>
                      ) : (
                        <>
                          <Download className="w-4 h-4" />
                          Import {preview.stats.successful} Contacts
                        </>
                      )}
                    </LiquidButton>
                  </div>
                </div>
              </div>
            </LiquidCard>
          </motion.div>
        )}

        {/* Help Section */}
        {!preview && !importComplete && (
          <motion.div variants={itemVariants}>
            <LiquidCard>
              <div className="space-y-4">
                <h3 className="text-lg font-bold">How to Export Your Data</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Facebook className="w-5 h-5 text-blue-600" />
                      <h4 className="font-semibold">Facebook</h4>
                    </div>
                    <ol className="text-sm text-gray-600 dark:text-gray-300 space-y-1 list-decimal list-inside">
                      <li>Go to Settings & Privacy → Settings</li>
                      <li>Click "Your Facebook Information"</li>
                      <li>Select "Download Your Information"</li>
                      <li>Choose "Friends" and JSON format</li>
                      <li>Download and extract the friends.json file</li>
                    </ol>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Linkedin className="w-5 h-5 text-blue-700" />
                      <h4 className="font-semibold">LinkedIn</h4>
                    </div>
                    <ol className="text-sm text-gray-600 dark:text-gray-300 space-y-1 list-decimal list-inside">
                      <li>Go to Settings & Privacy → Data Privacy</li>
                      <li>Click "Get a copy of your data"</li>
                      <li>Select "Connections" data</li>
                      <li>Choose CSV format</li>
                      <li>Download the connections.csv file</li>
                    </ol>
                  </div>
                </div>
              </div>
            </LiquidCard>
          </motion.div>
        )}
      </motion.div>
    </PageLayout>
  );
}
