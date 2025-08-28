import { useState } from "react";
import { motion } from "framer-motion";
import {
  User as UserIcon,
  Facebook as FacebookIcon,
  Linkedin as LinkedinIcon,
  Mail as MailIcon,
  Phone as PhoneIcon,
  Calendar as CalendarIcon,
  AlertTriangle as AlertTriangleIcon,
  MessageSquare,
  Edit,
} from "lucide-react";

// Import components
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

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
// Removed unused imports

// Types
export type HealthStatus = "critical" | "poor" | "fair" | "good" | "excellent";

export interface HealthInfo {
  score: number;
  status: HealthStatus;
  recommendations: string[];
}

export interface StoredContact {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  platform: string;
  lastContact: Date;
  contactFrequency: number;
  strength: number;
  notes?: string;
  tags?: string[];
  x?: number;
  y?: number;
  vx?: number;
  vy?: number;
}

export interface Level {
  id: string;
  name: string;
  description: string;
  color: string;
  bgColor?: string;
  textColor?: string;
  maxContacts?: number;
}

interface ContactCardProps {
  contact: StoredContact;
  level: Level;
  onEdit?: (contact: StoredContact) => void;
  onDelete?: (contactId: string) => void;
  onMove?: (contactId: string, levelId: string) => void;
  onUpdateLastContact?: (contactId: string) => void;
  compact?: boolean;
  className?: string;
}

// Types are exported above where they are defined

// Card component
export function LiquidCard({
  children,
  className = "",
  hover = false,
}: {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
}) {
  return (
    <Card
      className={`relative overflow-hidden ${hover ? "hover:shadow-lg transition-shadow" : ""} ${className}`}
    >
      {children}
    </Card>
  );
}

// Relationship strength calculator with health score
const relationshipStrengthCalculator = {
  calculateHealthScore: ({
    strength,
    lastContact,
    contactFrequency,
    decayRate = 0.1,
    currentStrength = 0.5,
  }: {
    strength: number;
    lastContact: Date;
    contactFrequency: number;
    decayRate?: number;
    currentStrength?: number;
  }): HealthInfo => {
    const lastContactDate =
      lastContact instanceof Date ? lastContact : new Date(lastContact);

    const daysSinceLastContact = Math.floor(
      (Date.now() - lastContactDate.getTime()) / (1000 * 60 * 60 * 24),
    );

    const decayFactor = Math.max(
      0,
      1 - (daysSinceLastContact * decayRate) / 100,
    );
    const baseScore = (strength * 0.7 + contactFrequency * 0.3) * 100;
    const healthScore = Math.min(
      100,
      Math.max(0, Math.round(baseScore * decayFactor)),
    );

    const status: HealthStatus =
      healthScore < 30
        ? "critical"
        : healthScore < 60
          ? "poor"
          : healthScore < 80
            ? "fair"
            : "good";

    const recommendations: string[] = [];
    if (daysSinceLastContact > 30) {
      recommendations.push("Reach out soon to maintain connection");
    }
    if (contactFrequency < 0.5) {
      recommendations.push("Consider increasing contact frequency");
    }
    if (currentStrength < 0.5) {
      recommendations.push("Work on strengthening this relationship");
    }

    return {
      score: healthScore,
      status,
      recommendations,
    };
  },
};

// Main ContactCard Component
export default function ContactCard({
  contact,
  level,
  onEdit,
  onDelete,
  onUpdateLastContact,
  compact = false,
  className = "",
}: ContactCardProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  // Get platform icon
  const getSourceIcon = (platform: string) => {
    switch (platform.toLowerCase()) {
      case "facebook":
        return <FacebookIcon className="w-4 h-4 text-blue-600" />;
      case "linkedin":
        return <LinkedinIcon className="w-4 h-4 text-blue-700" />;
      default:
        return <UserIcon className="w-4 h-4 text-gray-600" />;
    }
  };

  // Get health status color
  const getHealthColor = (status: HealthStatus) => {
    switch (status) {
      case "critical":
        return "text-red-600 bg-red-50 border-red-200";
      case "poor":
        return "text-amber-600 bg-amber-50 border-amber-200";
      case "fair":
        return "text-yellow-600 bg-yellow-50 border-yellow-200";
      case "good":
        return "text-green-600 bg-green-50 border-green-200";
      case "excellent":
        return "text-emerald-600 bg-emerald-50 border-emerald-200";
      default:
        return "text-green-600 bg-green-50 border-green-200";
    }
  };

  // Calculate days since last contact
  const daysSinceContact = Math.floor(
    (Date.now() - contact.lastContact.getTime()) / (1000 * 60 * 60 * 24),
  );

  // Check if contact is overdue
  const isOverdue = daysSinceContact > contact.contactFrequency * 1.5;

  const confirmDelete = () => {
    if (onDelete) {
      onDelete(contact.id);
    }
    setShowDeleteDialog(false);
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
        className={`bg-white rounded-lg border p-3 hover:shadow-md transition-shadow ${className}`}
        data-testid="contact-card-compact"
      >
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-8 h-8 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center">
              {getSourceIcon(contact.platform)}
            </div>
            {level && (
              <div
                className={`absolute -bottom-1 -right-1 w-3 h-3 ${level.color} rounded-full border border-white`}
              />
            )}
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
                      <span>{level.name}</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Contact Information */}
          <div className="space-y-2">
            {contact.email && (
              <div className="flex items-center gap-2 text-sm">
                <MailIcon className="w-4 h-4 text-gray-400" />
                <span className="text-gray-600">{contact.email}</span>
              </div>
            )}
            {contact.phone && (
              <div className="flex items-center gap-2 text-sm">
                <PhoneIcon className="w-4 h-4 text-gray-400" />
                <span className="text-gray-600">{contact.phone}</span>
              </div>
            )}
          </div>

          {/* Notes */}
          {contact.notes && (
            <div className="space-y-2">
              <div className="text-sm font-medium text-gray-700">Notes</div>
              <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                {contact.notes}
              </p>
            </div>
          )}

          {/* Last Contact */}
          <div className="flex items-center gap-2 text-sm">
            <CalendarIcon className="w-4 h-4 text-gray-400" />
            <span className="text-gray-600">
              Last contact: {contact.lastContact.toLocaleDateString()}
            </span>
            {isOverdue && (
              <Badge variant="destructive" className="ml-2">
                <AlertTriangleIcon className="w-3 h-3 mr-1" />
                Overdue
              </Badge>
            )}
          </div>

          {/* Relationship Strength */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-700 font-medium">
                Relationship Strength
              </span>
              <span className="text-gray-600">
                {Math.round(contact.strength * 100)}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full"
                style={{ width: `${contact.strength * 100}%` }}
              />
            </div>
          </div>

          {/* Health Score */}
          {(() => {
            const healthInfo =
              relationshipStrengthCalculator.calculateHealthScore({
                strength: contact.strength,
                lastContact: contact.lastContact,
                contactFrequency: contact.contactFrequency,
              });

            return (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-700 font-medium">
                    Relationship Health
                  </span>
                  <Badge className={getHealthColor(healthInfo.status)}>
                    {healthInfo.status.charAt(0).toUpperCase() +
                      healthInfo.status.slice(1)}{" "}
                    ({healthInfo.score}%)
                  </Badge>
                </div>

                {healthInfo.recommendations.length > 0 && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <div className="text-sm font-medium text-blue-800 mb-2">
                      Recommendations
                    </div>
                    <ul className="space-y-1">
                      {healthInfo.recommendations.map((rec, index) => (
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
              </div>
            );
          })()}

          {/* Action Buttons */}
          <div className="flex gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleUpdateLastContact}
              className="flex-1"
            >
              <MessageSquare className="w-4 h-4 mr-2" />
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
