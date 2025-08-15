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
import { Plus, User, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

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

        <Dialog open={isAddingContact} onOpenChange={setIsAddingContact}>
          <DialogTrigger asChild>
            <Button
              className="flex items-center gap-2"
              data-testid="add-contact"
            >
              <Plus className="w-4 h-4" />
              Add Contact
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Contact</DialogTitle>
              <DialogDescription>
                Add someone to your social network and categorize them according
                to Dunbar&apos;s hierarchy.
              </DialogDescription>
            </DialogHeader>

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
                  <SelectTrigger>
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

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsAddingContact(false)}
              >
                Cancel
              </Button>
              <Button onClick={addContact}>Add Contact</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
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
            <Card key={level.id}>
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
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeContact(contact.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
