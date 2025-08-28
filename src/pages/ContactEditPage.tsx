import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import PageLayout from "../components/PageLayout";
// UI Components - Update paths as needed
import { LiquidCard } from "../../components/ui/liquid-card";
import { LiquidButton } from "../../components/ui/liquid-button";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Textarea } from "../../components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { Badge } from "../../components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../../components/ui/alert-dialog";

// Icons
import {
  User,
  Save,
  Trash2,
  ArrowLeft,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";

// Data and Types
import { dunbarLevels } from "../../data/dunbarLevels";
import { EnhancedContactStorage } from "../../lib/contact-storage-enhanced";
import type { StoredContact } from "../../lib/contact-storage";

interface ContactFormData {
  name: string;
  email: string;
  phone: string;
  levelId: string;
  notes: string;
  lastContact: string;
  contactFrequency: number;
  strength: number;
  platform: string;
  source: "facebook" | "linkedin" | "manual";
}

export default function ContactEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isNewContact = id === "new";

  const [loading, setLoading] = useState(!isNewContact);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [formData, setFormData] = useState<ContactFormData>({
    name: "",
    email: "",
    phone: "",
    levelId: "active-network",
    notes: "",
    lastContact: new Date().toISOString().split("T")[0],
    contactFrequency: 90, // Default to quarterly contact
    strength: 0.5,
    platform: "",
    source: "manual",
  });

  const [originalContact, setOriginalContact] = useState<StoredContact | null>(
    null,
  );

  // Load existing contact data
  useEffect(() => {
    if (!isNewContact && id) {
      loadContact(id);
    }
  }, [id, isNewContact]);

  const loadContact = async (contactId: string) => {
    setLoading(true);
    setError(null);

    try {
      const result = await EnhancedContactStorage.loadContacts();
      if (result.success && result.data) {
        const contact = result.data.find((c) => c.id === contactId);
        if (contact) {
          setOriginalContact(contact);
          setFormData({
            name: contact.name,
            email: contact.email || "",
            phone: contact.phone || "",
            levelId: contact.levelId,
            notes: contact.notes || "",
            lastContact: contact.lastContact.toISOString().split("T")[0],
            contactFrequency: contact.contactFrequency,
            strength: contact.strength,
            platform: contact.platform,
            source: contact.source,
          });
        } else {
          setError("Contact not found");
        }
      } else {
        setError("Failed to load contact data");
      }
    } catch (err) {
      console.error("Failed to load contact:", err);
      setError("Failed to load contact data");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (
    field: keyof ContactFormData,
    value: string | number,
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setError(null);
    setSuccess(null);
  };

  const validateForm = (): string | null => {
    if (!formData.name.trim()) {
      return "Name is required";
    }
    if (!formData.levelId) {
      return "Please select a relationship level";
    }
    if (formData.contactFrequency < 1) {
      return "Contact frequency must be at least 1 day";
    }
    if (formData.strength < 0 || formData.strength > 1) {
      return "Relationship strength must be between 0 and 1";
    }
    return null;
  };

  const handleSave = async () => {
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const contactData: StoredContact = {
        id: isNewContact ? `contact_${Date.now()}` : originalContact!.id,
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        levelId: formData.levelId,
        notes: formData.notes.trim(),
        lastContact: new Date(formData.lastContact),
        contactFrequency: formData.contactFrequency,
        strength: formData.strength,
        platform: formData.platform.trim() || "Manual Entry",
        source: formData.source,
        decayRate: 0.1, // Default decay rate
        importDate: isNewContact ? new Date() : originalContact!.importDate,
        firestoreId: originalContact?.firestoreId,
      };

      if (isNewContact) {
        // Add new contact
        const result = await EnhancedContactStorage.loadContacts();
        const existingContacts = result.data || [];
        const updatedContacts = [...existingContacts, contactData];
        await EnhancedContactStorage.saveContacts(updatedContacts);
      } else {
        // Update existing contact
        const result = await EnhancedContactStorage.loadContacts();
        const existingContacts = result.data || [];
        const updatedContacts = existingContacts.map((c) =>
          c.id === contactData.id ? contactData : c,
        );
        await EnhancedContactStorage.saveContacts(updatedContacts);
      }

      setSuccess(
        isNewContact
          ? "Contact created successfully!"
          : "Contact updated successfully!",
      );

      // Navigate back to contacts page after a short delay
      setTimeout(() => {
        navigate("/contacts");
      }, 1500);
    } catch (err) {
      console.error("Failed to save contact:", err);
      setError("Failed to save contact. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!originalContact) return;

    setSaving(true);
    setError(null);

    try {
      const result = await EnhancedContactStorage.loadContacts();
      const existingContacts = result.data || [];
      const updatedContacts = existingContacts.filter(
        (c) => c.id !== originalContact.id,
      );
      await EnhancedContactStorage.saveContacts(updatedContacts);

      setSuccess("Contact deleted successfully!");

      // Navigate back to contacts page after a short delay
      setTimeout(() => {
        navigate("/contacts");
      }, 1000);
    } catch (err) {
      console.error("Failed to delete contact:", err);
      setError("Failed to delete contact. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const selectedLevel = dunbarLevels.find(
    (level) => level.id === formData.levelId,
  );

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

  if (loading) {
    return (
      <PageLayout
        title={isNewContact ? "Add New Contact" : "Edit Contact"}
        description={
          isNewContact
            ? "Add a new contact to your network"
            : "Edit contact details and relationship information"
        }
      >
        <div className="flex items-center justify-center py-12">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-lg text-gray-600 dark:text-gray-300">
              Loading contact...
            </span>
          </div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout
      title={isNewContact ? "Add New Contact" : "Edit Contact"}
      description={
        isNewContact
          ? "Add a new contact to your network"
          : "Edit contact details and relationship information"
      }
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

            <div className="flex items-center gap-2">
              {!isNewContact && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" size="sm" disabled={saving}>
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Contact</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete "{formData.name}"? This
                        action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleDelete}
                        className="bg-red-600 hover:bg-red-700"
                      >
                        Delete Contact
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </div>
          </div>
        </motion.div>

        {/* Status Messages */}
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

        {success && (
          <motion.div variants={itemVariants}>
            <LiquidCard className="border-green-200 bg-green-50 dark:bg-green-900/20">
              <div className="flex items-center gap-2 text-green-700 dark:text-green-400">
                <CheckCircle className="w-5 h-5" />
                <span>{success}</span>
              </div>
            </LiquidCard>
          </motion.div>
        )}

        {/* Contact Form */}
        <motion.div variants={itemVariants}>
          <LiquidCard glow>
            <div className="space-y-6">
              <div className="flex items-center gap-3 pb-4 border-b border-gray-200 dark:border-gray-700">
                <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl text-white">
                  <User className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">
                    {isNewContact ? "New Contact" : "Edit Contact"}
                  </h2>
                  <p className="text-gray-600 dark:text-gray-300">
                    {isNewContact
                      ? "Add someone to your social network"
                      : "Update contact information and relationship details"}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Basic Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Basic Information</h3>

                  <div className="space-y-2">
                    <Label htmlFor="name">Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) =>
                        handleInputChange("name", e.target.value)
                      }
                      placeholder="Enter contact name"
                      disabled={saving}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) =>
                        handleInputChange("email", e.target.value)
                      }
                      placeholder="Enter email address"
                      disabled={saving}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) =>
                        handleInputChange("phone", e.target.value)
                      }
                      placeholder="Enter phone number"
                      disabled={saving}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="platform">Platform/Source</Label>
                    <Input
                      id="platform"
                      value={formData.platform}
                      onChange={(e) =>
                        handleInputChange("platform", e.target.value)
                      }
                      placeholder="Where you know them from"
                      disabled={saving}
                    />
                  </div>
                </div>

                {/* Relationship Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">
                    Relationship Details
                  </h3>

                  <div className="space-y-2">
                    <Label htmlFor="levelId">Dunbar Level *</Label>
                    <Select
                      value={formData.levelId}
                      onValueChange={(value) =>
                        handleInputChange("levelId", value)
                      }
                      disabled={saving}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select relationship level" />
                      </SelectTrigger>
                      <SelectContent>
                        {dunbarLevels.map((level) => (
                          <SelectItem key={level.id} value={level.id}>
                            <div className="flex items-center gap-2">
                              <div
                                className={`w-3 h-3 ${level.color} rounded-full`}
                              ></div>
                              {level.name} ({level.count})
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {selectedLevel && (
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {selectedLevel.description}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="lastContact">Last Contact</Label>
                    <Input
                      id="lastContact"
                      type="date"
                      value={formData.lastContact}
                      onChange={(e) =>
                        handleInputChange("lastContact", e.target.value)
                      }
                      disabled={saving}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="contactFrequency">
                      Contact Frequency (days)
                    </Label>
                    <Input
                      id="contactFrequency"
                      type="number"
                      min="1"
                      value={formData.contactFrequency}
                      onChange={(e) =>
                        handleInputChange(
                          "contactFrequency",
                          parseInt(e.target.value) || 1,
                        )
                      }
                      disabled={saving}
                    />
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      How often you typically contact this person
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="strength">Relationship Strength</Label>
                    <div className="flex items-center gap-4">
                      <Input
                        id="strength"
                        type="range"
                        min="0"
                        max="1"
                        step="0.1"
                        value={formData.strength}
                        onChange={(e) =>
                          handleInputChange(
                            "strength",
                            parseFloat(e.target.value),
                          )
                        }
                        disabled={saving}
                        className="flex-1"
                      />
                      <Badge variant="secondary">
                        {Math.round(formData.strength * 100)}%
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      How strong is your relationship with this person?
                    </p>
                  </div>
                </div>
              </div>

              {/* Notes */}
              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => handleInputChange("notes", e.target.value)}
                  placeholder="Add notes about this relationship..."
                  rows={4}
                  disabled={saving}
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <Link to="/contacts">
                  <Button variant="outline" disabled={saving}>
                    Cancel
                  </Button>
                </Link>
                <LiquidButton
                  onClick={handleSave}
                  disabled={saving}
                  className="flex items-center gap-2"
                >
                  {saving ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      {isNewContact ? "Create Contact" : "Save Changes"}
                    </>
                  )}
                </LiquidButton>
              </div>
            </div>
          </LiquidCard>
        </motion.div>
      </motion.div>
    </PageLayout>
  );
}
