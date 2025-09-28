import { useState } from "react";
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
import { Plus, User, MoreVertical, Edit, Move, Trash } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
// Removed Dialog imports; this component now renders inline panels instead of modals

interface Level {
  id: string;
  name: string;
  count: number;
  color: string;
  textColor: string;
  bgColor: string;
}

interface Contact {
  id: string;
  name: string;
  levelId: string;
  notes: string;
  lastContact: string;
}

interface ContactManagerProps {
  levels: Level[];
}

export function ContactManager({ levels }: ContactManagerProps) {
  const [contacts, setContacts] = useState<Contact[]>([
    {
      id: "1",
      name: "Sarah Johnson",
      levelId: "inner-circle",
      notes: "Best friend since college, daily texts",
      lastContact: "2024-01-15",
    },
    {
      id: "2",
      name: "Mike Chen",
      levelId: "sympathy-group",
      notes: "Close work colleague, weekly coffee",
      lastContact: "2024-01-10",
    },
    {
      id: "3",
      name: "Emma Davis",
      levelId: "affinity-group",
      notes: "Friend from book club",
      lastContact: "2024-01-05",
    },
  ]);

  const [newContact, setNewContact] = useState({
    name: "",
    levelId: "",
    notes: "",
    lastContact: "",
  });

  const [isAddingContact, setIsAddingContact] = useState(false);
  const [isEditingContact, setIsEditingContact] = useState(false);
  const [editingContactId, setEditingContactId] = useState<string | null>(null);
  const [editContact, setEditContact] = useState({
    name: "",
    levelId: "",
    notes: "",
    lastContact: "",
  });

  const addContact = () => {
    if (newContact.name && newContact.levelId) {
      const contact: Contact = {
        id: Date.now().toString(),
        ...newContact,
      };
      setContacts([...contacts, contact]);
      setNewContact({ name: "", levelId: "", notes: "", lastContact: "" });
      setIsAddingContact(false);
    }
  };

  const removeContact = (id: string) => {
    setContacts(contacts.filter((c) => c.id !== id));
  };

  const openEdit = (contact: Contact) => {
    setEditingContactId(contact.id);
    setEditContact({
      name: contact.name,
      levelId: contact.levelId,
      notes: contact.notes,
      lastContact: contact.lastContact || "",
    });
    setIsEditingContact(true);
  };

  const saveEdit = () => {
    if (!editingContactId) return;
    setContacts((prev) =>
      prev.map((c) =>
        c.id === editingContactId
          ? {
              ...c,
              name: editContact.name,
              levelId: editContact.levelId,
              notes: editContact.notes,
              lastContact: editContact.lastContact,
            }
          : c,
      ),
    );
    setIsEditingContact(false);
    setEditingContactId(null);
  };

  const getContactStats = () => {
    const stats = levels.map((level) => ({
      level,
      actual: contacts.filter((c) => c.levelId === level.id).length,
      capacity: level.count,
    }));
    return stats;
  };

  return (
    <div className="space-y-6" data-testid="contact-manager">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">My Social Network</h2>
          <p className="text-gray-600">
            Manage and track your relationships according to Dunbar&apos;s
            hierarchy
          </p>
        </div>

        <div>
          <Button
            className="flex items-center gap-2"
            data-testid="add-contact"
            onClick={() => setIsAddingContact((v) => !v)}
            aria-expanded={isAddingContact}
            aria-controls="add-contact-panel"
          >
            <Plus className="w-4 h-4" />
            {isAddingContact ? "Hide Add Contact" : "Add Contact"}
          </Button>
        </div>
        {isAddingContact && (
          <Card id="add-contact-panel" className="mt-4">
            <CardHeader>
              <CardTitle>Add New Contact</CardTitle>
              <CardDescription>
                Add someone to your social network and categorize them according
                to Dunbar&apos;s hierarchy.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={newContact.name}
                    onChange={(e) =>
                      setNewContact({ ...newContact, name: e.target.value })
                    }
                    placeholder="Enter contact name"
                  />
                </div>

                <div>
                  <Label htmlFor="level">Relationship Level</Label>
                  <Select
                    value={newContact.levelId}
                    onValueChange={(value) =>
                      setNewContact({ ...newContact, levelId: value })
                    }
                  >
                    <SelectTrigger aria-label="Select relationship level for new contact">
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
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    value={newContact.notes}
                    onChange={(e) =>
                      setNewContact({ ...newContact, notes: e.target.value })
                    }
                    placeholder="Add notes about this relationship"
                  />
                </div>

                <div>
                  <Label htmlFor="lastContact">Last Contact</Label>
                  <Input
                    id="lastContact"
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
              </div>
              <div className="mt-4 flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setIsAddingContact(false)}
                >
                  Cancel
                </Button>
                <Button onClick={addContact}>Add Contact</Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Network Statistics */}
      <Card>
        <CardHeader>
          <CardTitle>Network Statistics</CardTitle>
          <CardDescription>
            Your current network distribution vs. Dunbar&apos;s theoretical
            limits
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {getContactStats().map(({ level, actual, capacity }) => (
              <div key={level.id} className={`p-4 rounded-lg ${level.bgColor}`}>
                <div className="flex items-center justify-between mb-2">
                  <h3 className={`font-medium ${level.textColor}`}>
                    {level.name}
                  </h3>
                  <Badge variant="secondary">
                    {actual}/{capacity}
                  </Badge>
                </div>
                <div className="w-full bg-white/50 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${level.color}`}
                    style={{
                      width: `${Math.min((actual / capacity) * 100, 100)}%`,
                    }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Contact Lists by Level */}
      <div className="space-y-6">
        {levels.map((level) => {
          const levelContacts = contacts.filter((c) => c.levelId === level.id);
          if (levelContacts.length === 0) return null;

          return (
            <div key={level.id}>
              <Card>
                <CardHeader className={level.bgColor}>
                  <div className="flex items-center justify-between">
                    <CardTitle className={level.textColor}>
                      {level.name}
                    </CardTitle>
                    <Badge variant="secondary">
                      {levelContacts.length} contacts
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="divide-y">
                    {levelContacts.map((contact) => (
                      <div
                        key={contact.id}
                        className="p-4 flex items-center justify-between hover:bg-gray-50"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                            <User className="w-5 h-5 text-gray-600" />
                          </div>
                          <div>
                            <h3 className="font-medium">{contact.name}</h3>
                            <p className="text-sm text-gray-600">
                              {contact.notes}
                            </p>
                            {contact.lastContact && (
                              <p className="text-xs text-gray-500">
                                Last contact:{" "}
                                {new Date(
                                  contact.lastContact,
                                ).toLocaleDateString()}
                              </p>
                            )}
                          </div>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              aria-label={`Open actions for ${contact.name}`}
                            >
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              data-testid="edit-contact"
                              onSelect={(e) => {
                                e.preventDefault();
                                openEdit(contact);
                              }}
                            >
                              <Edit className="w-4 h-4 mr-2" /> Edit Contact
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem>
                              <Move className="w-4 h-4 mr-2" /> Move to Inner
                              Circle
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Move className="w-4 h-4 mr-2" /> Move to Sympathy
                              Group
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Move className="w-4 h-4 mr-2" /> Move to Affinity
                              Group
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Move className="w-4 h-4 mr-2" /> Move to Active
                              Network
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Move className="w-4 h-4 mr-2" /> Move to
                              Recognition Group
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-red-600 focus:text-red-700"
                              onSelect={(e) => {
                                e.preventDefault();
                                removeContact(contact.id);
                              }}
                              data-testid="delete-contact"
                            >
                              <Trash className="w-4 h-4 mr-2" /> Delete Contact
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          );
        })}
      </div>

      {/* Edit Contact Inline Panel */}
      {isEditingContact && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Edit Contact</CardTitle>
            <CardDescription>
              Update contact details and circle.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-name">Name</Label>
                <Input
                  id="edit-name"
                  value={editContact.name}
                  onChange={(e) =>
                    setEditContact({ ...editContact, name: e.target.value })
                  }
                  placeholder="Enter contact name"
                />
              </div>
              <div>
                <Label htmlFor="edit-level">Relationship Level</Label>
                <Select
                  value={editContact.levelId}
                  onValueChange={(value) =>
                    setEditContact({ ...editContact, levelId: value })
                  }
                >
                  <SelectTrigger
                    id="edit-level"
                    aria-label="Select relationship level for editing contact"
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
                <Label htmlFor="edit-notes">Notes</Label>
                <Textarea
                  id="edit-notes"
                  value={editContact.notes}
                  onChange={(e) =>
                    setEditContact({ ...editContact, notes: e.target.value })
                  }
                  placeholder="Add notes about this relationship"
                />
              </div>
              <div>
                <Label htmlFor="edit-lastContact">Last Contact</Label>
                <Input
                  id="edit-lastContact"
                  type="date"
                  value={editContact.lastContact}
                  onChange={(e) =>
                    setEditContact({
                      ...editContact,
                      lastContact: e.target.value,
                    })
                  }
                />
              </div>
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setIsEditingContact(false)}
              >
                Cancel
              </Button>
              <Button onClick={saveEdit}>Save Changes</Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
