import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { notifyContactSaved } from "@/lib/sample-data";
import { cleanProfile } from "@/lib/relationship-model";
import { hasCloudConsent, requestCloudConsent } from "@/lib/cloud-consent";
import { CONTACTS_CHANGED_EVENT } from "../../components/sample-cleanup-prompt";
import { MobileAddContactFab } from "../../components/mobile-add-contact-fab";
import { SavedLocallyIndicator } from "../../components/saved-locally-indicator";
import PageLayout from "../components/PageLayout";
import { Button } from "@/components/ui/button";
import { Loader2, Upload } from "lucide-react";
// UI Components
import { ContactsDashboard } from "../../components/contacts-dashboard";
import { ContactList } from "../../components/contact-list";
import { ContactStatsDashboard } from "../../components/contact-stats-dashboard";
import { ContactEditModal } from "../../components/contact-edit-modal";
import { LiquidCard } from "../../components/ui/liquid-card";
import { LiquidButton } from "../../components/ui/liquid-button";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../components/ui/tabs";

// Data and Types
import {
  type ContactFormData,
  type ContactUpdateData,
  type ContactForm,
} from "../../lib/contact-models";

// Icons - Using available icons from lucide-react
import { Users } from "lucide-react";

// Fallback components for missing icons
const Plus = () => <span>+</span>;
const Search = () => <span>🔍</span>;
const Filter = () => <span>⚙️</span>;
const Download = () => <span>⬇️</span>;
const Settings = () => <span>⚙️</span>;
import { dunbarLevels } from "../data/dunbarLevels";
import {
  ContactStorageService,
  type StoredContact,
} from "@/lib/contact-storage-service";
import { exportToJSON } from "@/lib/export-utils";
import { RelationshipTraitsSummary } from "@/components/relationship-traits-summary";
import { trackEvent } from "@/lib/analytics";
import { BackupPanel } from "../../components/backup-panel";

export default function ContactsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [contacts, setContacts] = useState<StoredContact[]>([]);
  const [activeTab, setActiveTab] = useState("overview");

  const contactStorage = ContactStorageService.getInstance();

  // Handle saving contacts to Firebase
  const handleSaveToCloud = useCallback(async () => {
    if (!contacts.length) {
      toast.info("No contacts to save");
      return;
    }
    // Cloud backup needs sign-in AND an explicit, recorded choice.
    const { currentUserId } = await import("@/lib/cloud-sync");
    const uid = currentUserId();
    if (!uid) {
      toast.info("Sign in first to use optional cloud backup.");
      return;
    }
    if (!hasCloudConsent(uid)) {
      requestCloudConsent(uid);
      return;
    }

    setIsSaving(true);
    try {
      // This will trigger the sync process in ContactStorageService
      const result = await contactStorage.syncContacts(contacts);

      if (result.success) {
        toast.success("Contacts saved to cloud successfully!");
      } else {
        throw new Error(result.error || "Failed to save contacts to cloud");
      }
    } catch (error) {
      console.error("Failed to save contacts to cloud:", error);
      toast.error("Failed to save contacts to cloud. Please try again.");
    } finally {
      setIsSaving(false);
    }
  }, [contacts]);

  // Load contacts on component mount
  useEffect(() => {
    const loadContacts = async () => {
      setIsLoading(true);

      try {
        const result = await contactStorage.readContacts();
        if (result.success && result.data) {
          setContacts(result.data);
          if (
            result.data.length > 0 &&
            !sessionStorage.getItem("dc.first_map")
          ) {
            try {
              sessionStorage.setItem("dc.first_map", "1");
            } catch {
              /* ignore */
            }
            trackEvent("first_map");
          }
        } else {
          console.error("Failed to load contacts:", result.error);
          setContacts([]);
        }

        // One-time migration: move contacts from legacy key used by EnhancedContactStorage
        try {
          const LEGACY_KEY = "yakw_imported_contacts";
          const legacy = localStorage.getItem(LEGACY_KEY);
          if (legacy) {
            const parsed = JSON.parse(legacy) as Array<any>;
            if (Array.isArray(parsed) && parsed.length > 0) {
              console.info(
                `Found ${parsed.length} contacts in legacy storage. Migrating to current storage...`,
              );
              for (const c of parsed) {
                // Best-effort mapping to ContactForm expected by ContactStorageService
                await contactStorage.createContact({
                  name: c.name || "",
                  email: c.email || "",
                  phone: c.phone || "",
                  notes: c.notes || "",
                  levelId: c.levelId || "active-network",
                  platform: c.platform || "manual",
                  tags: c.tags || [],
                  contactFrequency: c.contactFrequency || 90,
                  strength: c.strength || 0.3,
                });
              }
              // Clear legacy key after migration
              localStorage.removeItem(LEGACY_KEY);
              // Reload contacts from current storage
              const migrated = await contactStorage.readContacts();
              if (migrated.success && migrated.data) {
                setContacts(migrated.data);
              }
            }
          }
        } catch (migrationErr) {
          console.warn("Legacy contacts migration skipped:", migrationErr);
        }
      } catch (error) {
        console.error("Failed to load contacts:", error);
        setContacts([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadContacts();
  }, []);

  // Reload when contacts change elsewhere (e.g. sample cleanup prompt).
  useEffect(() => {
    const reload = async () => {
      const result = await contactStorage.readContacts();
      if (result.success && result.data) setContacts(result.data);
    };
    const handler = () => void reload();
    window.addEventListener(CONTACTS_CHANGED_EVENT, handler);
    return () => window.removeEventListener(CONTACTS_CHANGED_EVENT, handler);
  }, []);

  // Contact management handlers
  const handleContactCreate = async (data: ContactFormData) => {
    try {
      const newContactData: ContactForm = {
        name: data.name,
        email: data.email || undefined,
        phone: data.phone || undefined,
        notes: data.notes || undefined,
        levelId: data.levelId,
        platform: data.platform,
        contactFrequency: data.contactFrequency,
        strength: data.strength,
        ...cleanProfile(data as unknown as Record<string, unknown>),
        tags: data.tags,
      };

      const result = await contactStorage.createContact(newContactData);
      if (result.success && result.data) {
        setContacts((prev) => [...prev, result.data!]);
        trackEvent("add_contact");
        notifyContactSaved(result.data);
      } else {
        console.error("Failed to create contact:", result.error);
        throw new Error(result.error || "Failed to create contact");
      }
    } catch (error) {
      console.error("Failed to create contact:", error);
      throw error;
    }
  };

  const handleContactSave = async (
    data: ContactFormData | ContactUpdateData,
  ) => {
    if ("id" in data) {
      // Update existing contact
      return handleContactUpdate(data.id, data);
    } else {
      // Create new contact
      return handleContactCreate(data);
    }
  };

  const handleContactUpdate = async (
    contactId: string,
    updates: Partial<StoredContact>,
  ) => {
    try {
      const result = await contactStorage.updateContact(contactId, {
        id: contactId,
        ...updates,
      });
      if (result.success && result.data) {
        setContacts((prev) =>
          prev.map((c) => (c.id === contactId ? result.data! : c)),
        );
      } else {
        console.error("Failed to update contact:", result.error);
        throw new Error(result.error || "Failed to update contact");
      }
    } catch (error) {
      console.error("Failed to update contact:", error);
      throw error;
    }
  };

  const handleContactDelete = async (contactId: string) => {
    try {
      const result = await contactStorage.deleteContact(contactId);
      if (result.success) {
        const name = contacts.find((c) => c.id === contactId)?.name;
        setContacts((prev) => prev.filter((c) => c.id !== contactId));
        toast.success("Contact deleted", {
          description: name ? `${name} has been removed.` : undefined,
        });
      } else {
        console.error("Failed to delete contact:", result.error);
        toast.error("Could not delete the contact. Please try again.");
      }
    } catch (error) {
      console.error("Failed to delete contact:", error);
      toast.error("Could not delete the contact. Please try again.");
    }
  };

  const handleBulkDelete = async (contactIds: string[]) => {
    try {
      const results = await Promise.all(
        contactIds.map((id) => contactStorage.deleteContact(id)),
      );

      const failedDeletes = results.filter((r) => !r.success);
      if (failedDeletes.length > 0) {
        console.error(`Failed to delete ${failedDeletes.length} contacts`);
        toast.error(`Could not delete ${failedDeletes.length} contacts`);
      }
      const okCount = contactIds.length - failedDeletes.length;
      if (okCount > 0) {
        toast.success(`Deleted ${okCount} contact${okCount === 1 ? "" : "s"}`);
      }

      // Remove successfully deleted contacts
      const successfulDeletes = contactIds.filter(
        (_, index) => results[index].success,
      );
      setContacts((prev) =>
        prev.filter((c) => !successfulDeletes.includes(c.id)),
      );
    } catch (error) {
      console.error("Failed to bulk delete contacts:", error);
    }
  };

  const handleBulkMove = async (contactIds: string[], levelId: string) => {
    try {
      const results = await Promise.all(
        contactIds.map((id) =>
          contactStorage.updateContact(id, { id, levelId }),
        ),
      );

      const failedUpdates = results.filter((r) => !r.success);
      if (failedUpdates.length > 0) {
        console.error(`Failed to move ${failedUpdates.length} contacts`);
        toast.error(`Could not move ${failedUpdates.length} contacts`);
      }
      const movedCount = contactIds.length - failedUpdates.length;
      const levelName = dunbarLevels.find((l) => l.id === levelId)?.name;
      if (movedCount > 0) {
        toast.success(
          `Moved ${movedCount} contact${movedCount === 1 ? "" : "s"}${levelName ? ` to ${levelName}` : ""}`,
        );
      }

      // Update successfully moved contacts
      setContacts((prev) =>
        prev.map((contact) => {
          const resultIndex = contactIds.indexOf(contact.id);
          if (resultIndex >= 0 && results[resultIndex].success) {
            return { ...contact, levelId };
          }
          return contact;
        }),
      );
    } catch (error) {
      console.error("Failed to bulk move contacts:", error);
    }
  };

  const handleBackupAdd = async (
    contact: ContactForm,
  ): Promise<string | null> => {
    const result = await contactStorage.createContact(contact);
    return result.success && result.data ? result.data.id : null;
  };

  const reloadContacts = async () => {
    const result = await contactStorage.readContacts();
    if (result.success && result.data) setContacts(result.data);
  };

  const handleBulkExport = (contactIds: string[]) => {
    const selectedContacts = contacts.filter((c) => contactIds.includes(c.id));
    const filename = `yakw_selected_contacts_${new Date().toISOString().split("T")[0]}`;
    exportToJSON(
      {
        people: selectedContacts as any[], // StoredContact extends Person
        levels: dunbarLevels,
        metadata: {
          exportDate: new Date().toISOString(),
          version: "1.0.0",
          totalContacts: selectedContacts.length,
          networkHealth: 100,
        },
      },
      `${filename}.json`,
    );
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

  if (isLoading) {
    return (
      <PageLayout
        title="Contact Management"
        description="Manage your relationships and social network data"
      >
        <div className="flex items-center justify-center py-12">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-lg text-gray-600 dark:text-gray-300">
              Loading contacts...
            </span>
          </div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout
      title="Contact Management"
      description="Manage your relationships and social network data"
    >
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-8"
      >
        {/* Quick Actions Header */}
        <motion.div variants={itemVariants}>
          <LiquidCard glow>
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <motion.div
                  className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl text-white"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ type: "spring", stiffness: 400, damping: 17 }}
                >
                  <Users className="w-6 h-6" />
                </motion.div>
                <div>
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    Contact Management Hub
                  </h2>
                  <p className="text-gray-600 dark:text-gray-300">
                    Import, organize, and manage your social network
                    relationships
                  </p>
                  <SavedLocallyIndicator className="mt-1" />
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <Link to="/contacts/import">
                  <LiquidButton
                    variant="primary"
                    className="flex items-center gap-2"
                  >
                    <Upload className="w-4 h-4" />
                    Import Contacts
                  </LiquidButton>
                </Link>
                <ContactEditModal
                  onSave={handleContactSave}
                  trigger={
                    <LiquidButton
                      variant="secondary"
                      className="flex items-center gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      Add Contact
                    </LiquidButton>
                  }
                />
              </div>
            </div>
          </LiquidCard>
        </motion.div>

        {/* Quick Stats Cards */}
        <motion.div variants={itemVariants}>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <LiquidCard hover>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg text-white">
                  <Search className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-green-600 dark:text-green-400">
                    Quick Search
                  </h3>
                  <p className="text-sm text-gray-500">Find contacts</p>
                </div>
              </div>
            </LiquidCard>

            <LiquidCard hover>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-lg text-white">
                  <Filter className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-blue-600 dark:text-blue-400">
                    Smart Filters
                  </h3>
                  <p className="text-sm text-gray-500">By level & source</p>
                </div>
              </div>
            </LiquidCard>

            <LiquidCard hover>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg text-white">
                  <Download className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-purple-600 dark:text-purple-400">
                    Export Data
                  </h3>
                  <p className="text-sm text-gray-500">Multiple formats</p>
                </div>
              </div>
            </LiquidCard>

            <LiquidCard hover>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg text-white">
                  <Settings className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-orange-600 dark:text-orange-400">
                    Manage Settings
                  </h3>
                  <p className="text-sm text-gray-500">Preferences</p>
                </div>
              </div>
            </LiquidCard>
          </div>
        </motion.div>

        {/* Main Content Tabs */}
        <motion.div variants={itemVariants}>
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="space-y-6"
          >
            <div className="flex flex-wrap justify-between items-center w-full gap-4">
              <TabsList className="grid h-auto grid-cols-2">
                <TabsTrigger value="overview" className="min-h-[40px] px-4">
                  Overview
                </TabsTrigger>
                <TabsTrigger value="list" className="min-h-[40px] px-4">
                  All Contacts
                </TabsTrigger>
              </TabsList>
              <Button
                onClick={handleSaveToCloud}
                disabled={isSaving || !contacts.length}
                className="gap-2"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4" />
                    Optional cloud backup
                  </>
                )}
              </Button>
            </div>

            <TabsContent value="overview" className="space-y-6">
              <ContactStatsDashboard
                contacts={contacts}
                levels={dunbarLevels}
              />
            </TabsContent>

            <TabsContent value="list" className="space-y-6">
              <ContactList
                contacts={contacts}
                levels={dunbarLevels}
                onContactUpdate={(id, updates) => {
                  void handleContactUpdate(id, updates)
                    .then(() => {
                      const lvl = updates.levelId
                        ? dunbarLevels.find((l) => l.id === updates.levelId)
                            ?.name
                        : undefined;
                      toast.success(
                        lvl ? `Moved to ${lvl}` : "Contact updated",
                      );
                    })
                    .catch(() => toast.error("Could not update the contact."));
                }}
                onContactDelete={handleContactDelete}
                onBulkDelete={handleBulkDelete}
                onBulkMove={handleBulkMove}
                onBulkExport={handleBulkExport}
                loading={isLoading}
              />
            </TabsContent>

            <TabsContent value="dashboard" className="space-y-6">
              <ContactsDashboard levels={dunbarLevels} />
            </TabsContent>
          </Tabs>
        </motion.div>

        <motion.div variants={itemVariants}>
          <LiquidCard>
            <RelationshipTraitsSummary contacts={contacts} />
            <BackupPanel
              contacts={contacts}
              onAddContact={handleBackupAdd}
              onImported={() => void reloadContacts()}
            />
          </LiquidCard>
        </motion.div>

        {/* Navigation Help */}
        <motion.div variants={itemVariants}>
          <LiquidCard>
            <div className="text-center space-y-4">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                Need Help Getting Started?
              </h3>
              <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                Import your social media data to automatically categorize your
                relationships according to Dunbar's hierarchy, or manually add
                contacts to build your network.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Link to="/contacts/import">
                  <LiquidButton variant="primary">
                    Import from Social Media
                  </LiquidButton>
                </Link>
                <Link to="/network">
                  <LiquidButton variant="ghost">
                    View Network Visualization
                  </LiquidButton>
                </Link>
              </div>
            </div>
          </LiquidCard>
        </motion.div>
      </motion.div>
      <MobileAddContactFab />
    </PageLayout>
  );
}
