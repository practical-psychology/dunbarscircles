import { useCallback, useEffect, useState } from "react";
import type { FormEvent } from "react";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Plus } from "lucide-react";
import type { Level } from "@/types/relationships";
import { ContactStorageService } from "@/lib/contact-storage-service";
import { trackEvent } from "@/lib/analytics";
import { notifyContactSaved } from "@/lib/sample-data";
import { countsInCircles } from "@/lib/relationship-model";
import { CONTACTS_CHANGED_EVENT } from "./sample-cleanup-prompt";

interface ContactManagerProps {
  levels: Level[];
}

/** Typical days between contacts per layer (CLAIMS.md #6: approximate). */
const DEFAULT_FREQUENCY: Record<string, number> = {
  "inner-circle": 7,
  "sympathy-group": 14,
  "affinity-group": 30,
  "active-network": 90,
  "recognition-group": 365,
};

const EMPTY_FORM = { name: "", levelId: "", notes: "", lastContact: "" };

/**
 * Dashboard header: per-layer counts and a quick "Add contact" panel.
 * Reads and writes the same browser store as the rest of the app; the
 * contact list with edit/move/delete lives in ContactsDashboard below.
 */
export function ContactManager({ levels }: ContactManagerProps) {
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [newContact, setNewContact] = useState(EMPTY_FORM);
  const [isAddingContact, setIsAddingContact] = useState(false);
  const [saving, setSaving] = useState(false);

  const refresh = useCallback(async () => {
    const result = await ContactStorageService.getInstance().readContacts();
    const next: Record<string, number> = {};
    for (const c of result.success && result.data ? result.data : []) {
      // Excluded, no-contact and overlay people are not counted in circles.
      if (!countsInCircles(c)) continue;
      next[c.levelId] = (next[c.levelId] ?? 0) + 1;
    }
    setCounts(next);
  }, []);

  useEffect(() => {
    void refresh();
    const handler = () => void refresh();
    window.addEventListener(CONTACTS_CHANGED_EVENT, handler);
    return () => window.removeEventListener(CONTACTS_CHANGED_EVENT, handler);
  }, [refresh]);

  const addContact = async () => {
    const name = newContact.name.trim();
    if (!name || !newContact.levelId) {
      toast.error("Add a name and choose a circle first.");
      return;
    }
    setSaving(true);
    try {
      const result = await ContactStorageService.getInstance().createContact({
        name,
        levelId: newContact.levelId,
        notes: newContact.notes.trim() || undefined,
        platform: "manual",
        contactFrequency: DEFAULT_FREQUENCY[newContact.levelId] ?? 30,
        strength: 0.5,
        ...(newContact.lastContact
          ? { lastContact: new Date(newContact.lastContact) }
          : {}),
      } as Parameters<ContactStorageService["createContact"]>[0]);
      if (!result.success || !result.data) {
        throw new Error(result.error || "Failed to add contact");
      }
      trackEvent("add_contact");
      toast.success("Contact added", {
        description: `${name} is saved in this browser.`,
      });
      setNewContact(EMPTY_FORM);
      setIsAddingContact(false);
      window.dispatchEvent(new CustomEvent(CONTACTS_CHANGED_EVENT));
      notifyContactSaved(result.data);
    } catch (error) {
      console.error("Failed to add contact:", error);
      toast.error("Could not add the contact. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6" data-testid="contact-manager">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold">My Social Network</h2>
          <p className="text-gray-600 dark:text-gray-300">
            Manage and track your relationships according to Dunbar&apos;s
            hierarchy
          </p>
        </div>

        <Button
          className="flex min-h-[44px] items-center gap-2"
          data-testid="add-contact"
          onClick={() => setIsAddingContact((v) => !v)}
          aria-expanded={isAddingContact}
          aria-controls="add-contact-panel"
        >
          <Plus className="w-4 h-4" aria-hidden="true" />
          {isAddingContact ? "Hide Add Contact" : "Add Contact"}
        </Button>
      </div>

      {isAddingContact && (
        <Card id="add-contact-panel">
          <CardHeader>
            <CardTitle>Add New Contact</CardTitle>
            <CardDescription>
              Add someone to your social network and categorize them according
              to Dunbar&apos;s hierarchy.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form
              className="space-y-4"
              onSubmit={(e: FormEvent<HTMLFormElement>) => {
                e.preventDefault();
                void addContact();
              }}
            >
              <div>
                <Label htmlFor="cm-name">Name</Label>
                <Input
                  id="cm-name"
                  value={newContact.name}
                  onChange={(e) =>
                    setNewContact({ ...newContact, name: e.target.value })
                  }
                  placeholder="Enter contact name"
                  required
                />
              </div>

              <div>
                <Label htmlFor="cm-level">Relationship Level</Label>
                <Select
                  value={newContact.levelId}
                  onValueChange={(value) =>
                    setNewContact({ ...newContact, levelId: value })
                  }
                >
                  <SelectTrigger
                    id="cm-level"
                    aria-label="Select relationship level for new contact"
                  >
                    <SelectValue placeholder="Select relationship level" />
                  </SelectTrigger>
                  <SelectContent>
                    {levels.map((level) => (
                      <SelectItem key={level.id} value={level.id}>
                        {level.name} ({level.count})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="cm-notes">Notes</Label>
                <Textarea
                  id="cm-notes"
                  value={newContact.notes}
                  onChange={(e) =>
                    setNewContact({ ...newContact, notes: e.target.value })
                  }
                  placeholder="Add notes about this relationship"
                />
              </div>

              <div>
                <Label htmlFor="cm-lastContact">Last Contact</Label>
                <Input
                  id="cm-lastContact"
                  type="date"
                  value={newContact.lastContact}
                  onChange={(e) =>
                    setNewContact({
                      ...newContact,
                      lastContact: e.target.value,
                    })
                  }
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsAddingContact(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={saving}>
                  {saving ? "Saving…" : "Add Contact"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Network Statistics */}
      <Card>
        <CardHeader>
          <CardTitle>Network Statistics</CardTitle>
          <CardDescription>
            How many people you have placed in each layer, against the typical
            size of that layer. The sizes are rough averages, not limits.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {levels.map((level) => {
              const actual = counts[level.id] ?? 0;
              const capacity = level.count;
              return (
                <div
                  key={level.id}
                  className={`p-4 rounded-lg ${level.bgColor}`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className={`font-medium ${level.textColor}`}>
                      {level.name}
                    </h3>
                    <Badge variant="secondary">
                      {actual}/{capacity}
                    </Badge>
                  </div>
                  <div
                    className="w-full bg-white/50 rounded-full h-2"
                    role="progressbar"
                    aria-label={`${level.name}: ${actual} of about ${capacity}`}
                    aria-valuemin={0}
                    aria-valuemax={capacity}
                    aria-valuenow={Math.min(actual, capacity)}
                  >
                    <div
                      className={`h-2 rounded-full ${level.color}`}
                      style={{
                        width: `${Math.min((actual / capacity) * 100, 100)}%`,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
