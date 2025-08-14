import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Search,
  Filter,
  MoreHorizontal,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Trash2,
  Move,
  Download,
  Edit,
  Calendar,
  AlertTriangle,
  CheckSquare,
  Square,
  User,
  Facebook,
  Linkedin,
} from "lucide-react";
import { LiquidCard } from "@/components/ui/liquid-card";
import { LiquidButton } from "@/components/ui/liquid-button";
import type { StoredContact } from "@/lib/contact-storage-service";
import type { Level } from "@/types/relationships";
import { relationshipStrengthCalculator } from "@/lib/contact-models";

interface ContactListProps {
  contacts: StoredContact[];
  levels: Level[];
  onContactUpdate?: (contactId: string, updates: Partial<StoredContact>) => void;
  onContactDelete?: (contactId: string) => void;
  onBulkDelete?: (contactIds: string[]) => void;
  onBulkMove?: (contactIds: string[], levelId: string) => void;
  onBulkExport?: (contactIds: string[]) => void;
  loading?: boolean;
}

type SortField = 'name' | 'levelId' | 'platform' | 'strength' | 'lastContact' | 'createdAt';
type SortOrder = 'asc' | 'desc';

export function ContactList({
  contacts,
  levels,
  onContactUpdate,
  onContactDelete,
  onBulkDelete,
  onBulkMove,
  onBulkExport,
  loading = false,
}: ContactListProps) {
  const [selectedContacts, setSelectedContacts] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState("");
  const [levelFilter, setLevelFilter] = useState<string>("all");
  const [platformFilter, setPlatformFilter] = useState<string>("all");
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [contactToDelete, setContactToDelete] = useState<string | null>(null);
  const [showBulkDeleteDialog, setShowBulkDeleteDialog] = useState(false);

  // Filter and sort contacts
  const filteredAndSortedContacts = useMemo(() => {
    let filtered = contacts;

    // Apply search filter
    if (searchTerm) {
      const query = searchTerm.toLowerCase();
      filtered = filtered.filter(contact =>
        contact.name.toLowerCase().includes(query) ||
        contact.email?.toLowerCase().includes(query) ||
        contact.phone?.includes(query) ||
        contact.notes?.toLowerCase().includes(query) ||
        contact.tags?.some(tag => tag.toLowerCase().includes(query))
      );
    }

    // Apply level filter
    if (levelFilter !== "all") {
      filtered = filtered.filter(contact => contact.levelId === levelFilter);
    }

    // Apply platform filter
    if (platformFilter !== "all") {
      filtered = filtered.filter(contact => contact.platform === platformFilter);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue: any = a[sortField];
      let bValue: any = b[sortField];

      if (sortField === 'levelId') {
        // Sort by level order
        const aLevel = levels.find(l => l.id === a.levelId);
        const bLevel = levels.find(l => l.id === b.levelId);
        aValue = levels.indexOf(aLevel!);
        bValue = levels.indexOf(bLevel!);
      } else if (aValue instanceof Date) {
        aValue = aValue.getTime();
        bValue = bValue.getTime();
      } else if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      const comparison = aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      return sortOrder === 'desc' ? -comparison : comparison;
    });

    return filtered;
  }, [contacts, searchTerm, levelFilter, platformFilter, sortField, sortOrder, levels]);

  // Get unique platforms for filter
  const uniquePlatforms = useMemo(() => {
    const platforms = new Set(contacts.map(c => c.platform));
    return Array.from(platforms).sort();
  }, [contacts]);

  // Selection handlers
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedContacts(new Set(filteredAndSortedContacts.map(c => c.id)));
    } else {
      setSelectedContacts(new Set());
    }
  };

  const handleSelectContact = (contactId: string, checked: boolean) => {
    const newSelected = new Set(selectedContacts);
    if (checked) {
      newSelected.add(contactId);
    } else {
      newSelected.delete(contactId);
    }
    setSelectedContacts(newSelected);
  };

  // Sort handlers
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <ArrowUpDown className="w-4 h-4" />;
    }
    return sortOrder === 'asc' ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />;
  };

  // Action handlers
  const handleDeleteContact = (contactId: string) => {
    setContactToDelete(contactId);
    setShowDeleteDialog(true);
  };

  const confirmDeleteContact = () => {
    if (contactToDelete && onContactDelete) {
      onContactDelete(contactToDelete);
      setContactToDelete(null);
      setShowDeleteDialog(false);
    }
  };

  const handleBulkDelete = () => {
    setShowBulkDeleteDialog(true);
  };

  const confirmBulkDelete = () => {
    if (onBulkDelete) {
      onBulkDelete(Array.from(selectedContacts));
      setSelectedContacts(new Set());
      setShowBulkDeleteDialog(false);
    }
  };

  const handleBulkMove = (levelId: string) => {
    if (onBulkMove) {
      onBulkMove(Array.from(selectedContacts), levelId);
      setSelectedContacts(new Set());
    }
  };

  const handleBulkExport = () => {
    if (onBulkExport) {
      onBulkExport(Array.from(selectedContacts));
    }
  };

  // Helper functions
  const getSourceIcon = (platform: string) => {
    switch (platform.toLowerCase()) {
      case 'facebook':
        return <Facebook className="w-4 h-4 text-blue-600" />;
      case 'linkedin':
        return <Linkedin className="w-4 h-4 text-blue-700" />;
      default:
        return <User className="w-4 h-4 text-gray-600" />;
    }
  };

  const getRelationshipHealth = (contact: StoredContact) => {
    const health = relationshipStrengthCalculator.calculateHealthScore({
      strength: contact.strength,
      lastContact: contact.lastContact,
      contactFrequency: contact.contactFrequency,
      decayRate: contact.decayRate || 0.1,
    });
    return health;
  };

  const getLevelInfo = (levelId: string) => {
    return levels.find(l => l.id === levelId);
  };

  const isAllSelected = filteredAndSortedContacts.length > 0 && 
    filteredAndSortedContacts.every(contact => selectedContacts.has(contact.id));
  const isIndeterminate = selectedContacts.size > 0 && !isAllSelected;

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <LiquidCard>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Filter className="w-5 h-5" />
              Search & Filter Contacts
            </h3>
            {selectedContacts.size > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">
                  {selectedContacts.size} selected
                </span>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <LiquidButton variant="secondary" size="sm">
                      Bulk Actions
                    </LiquidButton>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={handleBulkExport}>
                      <Download className="w-4 h-4 mr-2" />
                      Export Selected
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      onClick={handleBulkDelete}
                      className="text-red-600"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete Selected
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    {levels.map(level => (
                      <DropdownMenuItem 
                        key={level.id}
                        onClick={() => handleBulkMove(level.id)}
                      >
                        <Move className="w-4 h-4 mr-2" />
                        Move to {level.name}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            )}
          </div>

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
              <Label>Dunbar Level</Label>
              <Select value={levelFilter} onValueChange={setLevelFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Levels</SelectItem>
                  {levels.map(level => (
                    <SelectItem key={level.id} value={level.id}>
                      {level.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Platform</Label>
              <Select value={platformFilter} onValueChange={setPlatformFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Platforms</SelectItem>
                  {uniquePlatforms.map(platform => (
                    <SelectItem key={platform} value={platform}>
                      {platform.charAt(0).toUpperCase() + platform.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Results</Label>
              <div className="text-sm text-gray-600 py-2">
                {filteredAndSortedContacts.length} of {contacts.length} contacts
              </div>
            </div>
          </div>
        </div>
      </LiquidCard>

      {/* Contact Table */}
      <LiquidCard>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Contact List</h3>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedContacts(new Set())}
                disabled={selectedContacts.size === 0}
              >
                Clear Selection
              </Button>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                <span>Loading contacts...</span>
              </div>
            </div>
          ) : filteredAndSortedContacts.length === 0 ? (
            <div className="text-center py-8">
              <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No contacts found
              </h3>
              <p className="text-gray-500">
                {contacts.length === 0
                  ? "No contacts have been imported yet."
                  : "Try adjusting your search or filter criteria."}
              </p>
            </div>
          ) : (
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <Checkbox
                        checked={isAllSelected}
                        onCheckedChange={handleSelectAll}
                        aria-label="Select all contacts"
                      />
                    </TableHead>
                    <TableHead>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleSort('name')}
                        className="h-auto p-0 font-medium"
                      >
                        Name {getSortIcon('name')}
                      </Button>
                    </TableHead>
                    <TableHead>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleSort('levelId')}
                        className="h-auto p-0 font-medium"
                      >
                        Level {getSortIcon('levelId')}
                      </Button>
                    </TableHead>
                    <TableHead>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleSort('platform')}
                        className="h-auto p-0 font-medium"
                      >
                        Platform {getSortIcon('platform')}
                      </Button>
                    </TableHead>
                    <TableHead>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleSort('strength')}
                        className="h-auto p-0 font-medium"
                      >
                        Strength {getSortIcon('strength')}
                      </Button>
                    </TableHead>
                    <TableHead>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleSort('lastContact')}
                        className="h-auto p-0 font-medium"
                      >
                        Last Contact {getSortIcon('lastContact')}
                      </Button>
                    </TableHead>
                    <TableHead>Health</TableHead>
                    <TableHead className="w-12">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <AnimatePresence>
                    {filteredAndSortedContacts.map((contact, index) => {
                      const level = getLevelInfo(contact.levelId);
                      const health = getRelationshipHealth(contact);
                      const isSelected = selectedContacts.has(contact.id);

                      return (
                        <motion.tr
                          key={contact.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -20 }}
                          transition={{ delay: index * 0.05 }}
                          className={`border-b transition-colors hover:bg-gray-50 ${
                            isSelected ? 'bg-blue-50' : ''
                          }`}
                        >
                          <TableCell>
                            <Checkbox
                              checked={isSelected}
                              onCheckedChange={(checked) => 
                                handleSelectContact(contact.id, checked as boolean)
                              }
                              aria-label={`Select ${contact.name}`}
                            />
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              {getSourceIcon(contact.platform)}
                              <div>
                                <div className="font-medium">{contact.name}</div>
                                {contact.email && (
                                  <div className="text-sm text-gray-500">
                                    {contact.email}
                                  </div>
                                )}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            {level && (
                              <Badge 
                                variant="secondary"
                                className={`${level.bgColor} ${level.textColor}`}
                              >
                                {level.name}
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            <span className="capitalize">{contact.platform}</span>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div className="w-16 bg-gray-200 rounded-full h-2">
                                <div
                                  className="bg-blue-600 h-2 rounded-full"
                                  style={{ width: `${contact.strength * 100}%` }}
                                />
                              </div>
                              <span className="text-sm">
                                {Math.round(contact.strength * 100)}%
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1 text-sm">
                              <Calendar className="w-3 h-3" />
                              {Math.floor(
                                (Date.now() - contact.lastContact.getTime()) / 
                                (1000 * 60 * 60 * 24)
                              )}d ago
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                health.status === 'excellent' ? 'default' :
                                health.status === 'good' ? 'secondary' :
                                health.status === 'fair' ? 'outline' :
                                'destructive'
                              }
                              className="flex items-center gap-1"
                            >
                              {health.status === 'poor' || health.status === 'critical' ? (
                                <AlertTriangle className="w-3 h-3" />
                              ) : null}
                              {health.score}%
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <MoreHorizontal className="w-4 h-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem>
                                  <Edit className="w-4 h-4 mr-2" />
                                  Edit Contact
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                {levels.map(level => (
                                  <DropdownMenuItem 
                                    key={level.id}
                                    onClick={() => onContactUpdate?.(contact.id, { levelId: level.id })}
                                  >
                                    <Move className="w-4 h-4 mr-2" />
                                    Move to {level.name}
                                  </DropdownMenuItem>
                                ))}
                                <DropdownMenuSeparator />
                                <DropdownMenuItem 
                                  onClick={() => handleDeleteContact(contact.id)}
                                  className="text-red-600"
                                >
                                  <Trash2 className="w-4 h-4 mr-2" />
                                  Delete Contact
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </motion.tr>
                      );
                    })}
                  </AnimatePresence>
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </LiquidCard>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Contact</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this contact? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteContact}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Bulk Delete Confirmation Dialog */}
      <AlertDialog open={showBulkDeleteDialog} onOpenChange={setShowBulkDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Selected Contacts</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {selectedContacts.size} selected contacts? 
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmBulkDelete}>
              Delete {selectedContacts.size} Contacts
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}