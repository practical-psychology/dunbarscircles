import { useState } from "react";
import { motion } from "framer-motion";
import { CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
  User,
  Facebook,
  Linkedin,
  Mail,
  Phone,
  Calendar,
  MoreHorizontal,
  Edit,
  Trash2,
  Move,
  AlertTriangle,
  Clock,
  Heart,
  MessageCircle,
  Tag,
} from "lucide-react";
import { LiquidCard } from "@/components/ui/liquid-card";
import type { StoredContact } from "@/lib/contact-storage-service";
import type { Level } from "@/types/relationships";
import { relationshipStrengthCalculator } from "@/lib/contact-models";
import { formatDistanceToNow } from "date-fns";

interface ContactCardProps {
  contact: StoredContact;
  level?: Level;
  onEdit?: (contact: StoredContact) => void;
  onDelete?: (contactId: string) => void;
  onMove?: (contactId: string, levelId: string) => void;
  onUpdateLastContact?: (contactId: string) => void;
  levels?: Level[];
  compact?: boolean;
}

export function ContactCard({
  contact,
  level,
  onEdit,
  onDelete,
  onMove,
  onUpdateLastContact,
  levels = [],
  compact = false,
}: ContactCardProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  // Calculate relationship health
  const health = relationshipStrengthCalculator.calculateHealthScore({
    strength: contact.strength,
    lastContact: contact.lastContact,
    contactFrequency: contact.contactFrequency,
    decayRate: contact.decayRate || 0.1,
  });

  // Get platform icon
  const getSourceIcon = (platform: string) => {
    switch (platform.toLowerCase()) {
      case "facebook":
        return <Facebook className="w-4 h-4 text-blue-600" />;
      case "linkedin":
        return <Linkedin className="w-4 h-4 text-blue-700" />;
      default:
        return <User className="w-4 h-4 text-gray-600" />;
    }
  };

  // Get health status color
  const getHealthColor = (status: string) => {
    switch (status) {
      case "excellent":
        return "text-green-600 bg-green-50 border-green-200";
      case "good":
        return "text-blue-600 bg-blue-50 border-blue-200";
      case "fair":
        return "text-yellow-600 bg-yellow-50 border-yellow-200";
      case "poor":
        return "text-orange-600 bg-orange-50 border-orange-200";
      case "critical":
        return "text-red-600 bg-red-50 border-red-200";
      default:
        return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  // Calculate days since last contact
  const daysSinceContact = Math.floor(
    (Date.now() - contact.lastContact.getTime()) / (1000 * 60 * 60 * 24),
  );

  // Check if contact is overdue
  const isOverdue = daysSinceContact > contact.contactFrequency * 1.5;

  const handleDelete = () => {
    setShowDeleteDialog(true);
  };

  const confirmDelete = () => {
    if (onDelete) {
      onDelete(contact.id);
    }
    setShowDeleteDialog(false);
  };

  const handleMove = (levelId: string) => {
    if (onMove) {
      onMove(contact.id, levelId);
    }
  };

  const handleUpdateLastContact = () => {
    if (onUpdateLastContact) {
      onUpdateLastContact(contact.id);
    }
  };

  if (compact) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors"
        data-testid="contact-card"
      >
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            {getSourceIcon(contact.platform)}
            {level && <div className={`w-3 h-3 ${level.color} rounded-full`} />}
          </div>
          <div>
            <h4 className="font-medium">{contact.name}</h4>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span className="capitalize">{contact.platform}</span>
              {level && (
                <>
                  <span>•</span>
                  <span>{level.name}</span>
                </>
              )}
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

          {isOverdue && (
            <Badge variant="destructive" className="flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" />
              Overdue
            </Badge>
          )}

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
                onClick={() => onEdit?.(contact)}
                data-testid="edit-contact"
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit Contact
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleUpdateLastContact}>
                <MessageCircle className="w-4 h-4 mr-2" />
                Mark as Contacted
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {levels.map((level) => (
                <DropdownMenuItem
                  key={level.id}
                  onClick={() => handleMove(level.id)}
                >
                  <Move className="w-4 h-4 mr-2" />
                  Move to {level.name}
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleDelete} className="text-red-600">
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Contact
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </motion.div>
    );
  }

  return (
    <>
      <LiquidCard hover className="relative" data-testid="contact-card">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center">
                  {getSourceIcon(contact.platform)}
                </div>
                {level && (
                  <div
                    className={`absolute -bottom-1 -right-1 w-4 h-4 ${level.color} rounded-full border-2 border-white`}
                  />
                )}
              </div>
              <div>
                <h3 className="font-semibold text-lg">{contact.name}</h3>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <span className="capitalize">{contact.platform}</span>
                  {level && (
                    <>
                      <span>•</span>
                      <Badge
                        variant="secondary"
                        className={`${level.bgColor} ${level.textColor}`}
                      >
                        {level.name}
                      </Badge>
                    </>
                  )}
                </div>
              </div>
            </div>

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
                  onClick={() => onEdit?.(contact)}
                  data-testid="edit-contact"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Contact
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleUpdateLastContact}>
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Mark as Contacted
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                {levels.map((level) => (
                  <DropdownMenuItem
                    key={level.id}
                    onClick={() => handleMove(level.id)}
                  >
                    <Move className="w-4 h-4 mr-2" />
                    Move to {level.name}
                  </DropdownMenuItem>
                ))}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleDelete}
                  className="text-red-600"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Contact
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Contact Information */}
          <div className="space-y-2">
            {contact.email && (
              <div className="flex items-center gap-2 text-sm">
                <Mail className="w-4 h-4 text-gray-400" />
                <span className="text-gray-600">{contact.email}</span>
              </div>
            )}
            {contact.phone && (
              <div className="flex items-center gap-2 text-sm">
                <Phone className="w-4 h-4 text-gray-400" />
                <span className="text-gray-600">{contact.phone}</span>
              </div>
            )}
          </div>

          {/* Notes */}
          {contact.notes && (
            <div className="space-y-1">
              <div className="text-sm font-medium text-gray-700">Notes</div>
              <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                {contact.notes}
              </p>
            </div>
          )}

          {/* Tags */}
          {contact.tags && contact.tags.length > 0 && (
            <div className="space-y-2">
              <div className="text-sm font-medium text-gray-700 flex items-center gap-1">
                <Tag className="w-3 h-3" />
                Tags
              </div>
              <div className="flex flex-wrap gap-1">
                {contact.tags.map((tag, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Relationship Metrics */}
          <div className="grid grid-cols-2 gap-4 pt-2 border-t">
            <div className="space-y-1">
              <div className="text-sm font-medium text-gray-700 flex items-center gap-1">
                <Heart className="w-3 h-3" />
                Strength
              </div>
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full"
                    style={{ width: `${contact.strength * 100}%` }}
                  />
                </div>
                <span className="text-sm font-medium">
                  {Math.round(contact.strength * 100)}%
                </span>
              </div>
            </div>

            <div className="space-y-1">
              <div className="text-sm font-medium text-gray-700 flex items-center gap-1">
                <Clock className="w-3 h-3" />
                Health
              </div>
              <Badge className={`${getHealthColor(health.status)} border`}>
                {health.status === "poor" || health.status === "critical" ? (
                  <AlertTriangle className="w-3 h-3 mr-1" />
                ) : null}
                {health.score}%
              </Badge>
            </div>
          </div>

          {/* Last Contact */}
          <div className="flex items-center justify-between pt-2 border-t">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Calendar className="w-4 h-4" />
              <span>
                Last contact:{" "}
                {formatDistanceToNow(contact.lastContact, { addSuffix: true })}
              </span>
            </div>
            {isOverdue && (
              <Badge variant="destructive" className="flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" />
                Overdue
              </Badge>
            )}
          </div>

          {/* Health Recommendations */}
          {health.recommendations.length > 0 && (
            <div className="space-y-2 pt-2 border-t">
              <div className="text-sm font-medium text-gray-700">
                Recommendations
              </div>
              <ul className="space-y-1">
                {health.recommendations.slice(0, 2).map((rec, index) => (
                  <li
                    key={index}
                    className="text-xs text-gray-600 flex items-start gap-1"
                  >
                    <span className="text-blue-500 mt-0.5">•</span>
                    {rec}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleUpdateLastContact}
              className="flex-1"
            >
              <MessageCircle className="w-4 h-4 mr-2" />
              Mark Contacted
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit?.(contact)}
              className="flex-1"
              data-testid="edit-contact"
            >
              <Edit className="w-4 h-4 mr-2" />
              Edit
            </Button>
          </div>
        </CardContent>
      </LiquidCard>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Contact</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {contact.name}? This action cannot
              be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
