import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
} from "lucide-react";
import { ContactStorage, type StoredContact } from "@/lib/contact-storage";
import type { Level } from "@/types/relationships";

interface ContactsDashboardProps {
  levels: Level[];
}

export function ContactsDashboard({ levels }: ContactsDashboardProps) {
  const [contacts, setContacts] = useState<StoredContact[]>([]);
  const [filteredContacts, setFilteredContacts] = useState<StoredContact[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sourceFilter, setSourceFilter] = useState<string>("all");
  const [levelFilter, setLevelFilter] = useState<string>("all");
  const [stats, setStats] = useState({
    total: 0,
    bySource: { facebook: 0, linkedin: 0, manual: 0 },
    byLevel: {} as Record<string, number>,
  });

  // Load contacts and stats
  useEffect(() => {
    const loadedContacts = ContactStorage.loadContacts();
    const contactStats = ContactStorage.getContactStats();
    
    setContacts(loadedContacts);
    setStats(contactStats);
  }, []);

  // Apply filters
  useEffect(() => {
    let filtered = contacts;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(contact =>
        contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contact.platform.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Source filter
    if (sourceFilter !== "all") {
      filtered = filtered.filter(contact => contact.source === sourceFilter);
    }

    // Level filter
    if (levelFilter !== "all") {
      filtered = filtered.filter(contact => contact.levelId === levelFilter);
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
    const daysSinceContact = (Date.now() - contact.lastContact.getTime()) / (1000 * 60 * 60 * 24);
    const isDecaying = daysSinceContact > contact.contactFrequency * 1.5;
    return { daysSinceContact: Math.floor(daysSinceContact), isDecaying };
  };

  const clearAllContacts = () => {
    if (confirm("Are you sure you want to clear all imported contacts? This action cannot be undone.")) {
      ContactStorage.clearContacts();
      setContacts([]);
      setStats({ total: 0, bySource: { facebook: 0, linkedin: 0, manual: 0 }, byLevel: {} });
    }
  };

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
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
            <div className="text-2xl font-bold text-blue-600">{stats.bySource.facebook}</div>
            <p className="text-xs text-gray-500 mt-1">
              Friends imported
            </p>
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
            <div className="text-2xl font-bold text-blue-700">{stats.bySource.linkedin}</div>
            <p className="text-xs text-gray-500 mt-1">
              Connections imported
            </p>
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
                ? Math.round((contacts.reduce((sum, c) => sum + c.strength, 0) / contacts.length) * 100)
                : 0}%
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Relationship strength
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
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
                <SelectTrigger>
                  <SelectValue />
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
                <SelectTrigger>
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

            <div className="space-y-2">
              <Label>Actions</Label>
              <Button
                variant="outline"
                onClick={clearAllContacts}
                className="w-full text-red-600 hover:text-red-700"
                disabled={contacts.length === 0}
              >
                Clear All Contacts
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contacts List */}
      <Card>
        <CardHeader>
          <CardTitle>
            Contacts ({filteredContacts.length})
          </CardTitle>
          <CardDescription>
            All your imported contacts with relationship details
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredContacts.length === 0 ? (
            <div className="text-center py-8">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No contacts found</h3>
              <p className="text-gray-500">
                {contacts.length === 0 
                  ? "Import contacts from the Network page to see them here."
                  : "Try adjusting your search or filter criteria."
                }
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredContacts.map((contact) => {
                const level = levels.find(l => l.id === contact.levelId);
                const health = getRelationshipHealth(contact);
                
                return (
                  <div
                    key={contact.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        {getSourceIcon(contact.source)}
                        <div className={`w-3 h-3 ${level?.color} rounded-full`}></div>
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

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <div className="text-sm font-medium">
                          {Math.round(contact.strength * 100)}%
                        </div>
                        <div className="text-xs text-gray-500">strength</div>
                      </div>
                      
                      {health.isDecaying && (
                        <Badge variant="destructive" className="flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" />
                          Decaying
                        </Badge>
                      )}
                      
                      <Badge variant="secondary" className="capitalize">
                        {contact.source}
                      </Badge>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}