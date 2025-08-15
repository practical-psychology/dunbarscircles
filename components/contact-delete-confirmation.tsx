import { useState } from "react";
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
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trash2, AlertTriangle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { dunbarLevels } from "@/data/dunbarLevels";

interface ContactDeleteConfirmationProps {
  contact: {
    id: string;
    name: string;
    levelId: string;
    platform?: string;
    lastContact?: Date;
    strength?: number;
  };
  onDelete: (contactId: string) => Promise<void>;
  trigger?: React.ReactNode;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  isLoading?: boolean;
}

export function ContactDeleteConfirmation({
  contact,
  onDelete,
  trigger,
  isOpen,
  onOpenChange,
  isLoading = false,
}: ContactDeleteConfirmationProps) {
  const [open, setOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleOpenChange = (newOpen: boolean) => {
    if (onOpenChange) {
      onOpenChange(newOpen);
    } else {
      setOpen(newOpen);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await onDelete(contact.id);
      toast.success("Contact deleted", {
        description: `${contact.name} has been removed from your contacts.`,
      });
      handleOpenChange(false);
    } catch (error) {
      console.error("Failed to delete contact:", error);
      toast.error("Failed to delete contact", {
        description:
          error instanceof Error ? error.message : "Please try again.",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const isControlled = isOpen !== undefined && onOpenChange !== undefined;
  const modalOpen = isControlled ? isOpen : open;

  // Get level information
  const level = dunbarLevels.find((l) => l.id === contact.levelId);
  const levelName = level?.name || "Unknown Circle";

  // Determine warning level based on relationship strength and circle
  const getWarningLevel = () => {
    if (!contact.strength) return "medium";

    if (
      contact.strength >= 0.7 ||
      contact.levelId === "inner-circle" ||
      contact.levelId === "sympathy-group"
    ) {
      return "high";
    } else if (
      contact.strength >= 0.4 ||
      contact.levelId === "affinity-group"
    ) {
      return "medium";
    } else {
      return "low";
    }
  };

  const warningLevel = getWarningLevel();

  const getWarningMessage = () => {
    switch (warningLevel) {
      case "high":
        return {
          title: "⚠️ High Impact Deletion",
          message:
            "This contact is in your close circle with strong relationship ties. Deleting them may significantly impact your social network visualization.",
          color: "text-red-600",
        };
      case "medium":
        return {
          title: "⚠️ Moderate Impact Deletion",
          message:
            "This contact has moderate relationship strength. Consider if you want to move them to a different circle instead of deleting.",
          color: "text-orange-600",
        };
      case "low":
        return {
          title: "ℹ️ Low Impact Deletion",
          message:
            "This contact has low relationship strength and can be safely removed with minimal impact on your network.",
          color: "text-blue-600",
        };
    }
  };

  const warning = getWarningMessage();

  return (
    <AlertDialog open={modalOpen} onOpenChange={handleOpenChange}>
      <AlertDialogTrigger asChild>
        {trigger || (
          <Button variant="destructive" size="sm">
            <Trash2 className="w-4 h-4 mr-2" />
            Delete
          </Button>
        )}
      </AlertDialogTrigger>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-500" />
            Delete Contact
          </AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-4">
              <p>
                Are you sure you want to delete <strong>{contact.name}</strong>?
                This action cannot be undone.
              </p>

              {/* Contact Information */}
              <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Circle:</span>
                  <Badge variant="secondary">{levelName}</Badge>
                </div>

                {contact.platform && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Platform:</span>
                    <span className="text-sm capitalize">
                      {contact.platform}
                    </span>
                  </div>
                )}

                {contact.strength !== undefined && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">
                      Relationship Strength:
                    </span>
                    <span className="text-sm">
                      {Math.round(contact.strength * 100)}%
                    </span>
                  </div>
                )}

                {contact.lastContact && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Last Contact:</span>
                    <span className="text-sm">
                      {contact.lastContact.toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>

              {/* Warning Message */}
              <div
                className={`p-3 rounded-lg border-l-4 ${
                  warningLevel === "high"
                    ? "bg-red-50 border-red-400 dark:bg-red-950"
                    : warningLevel === "medium"
                      ? "bg-orange-50 border-orange-400 dark:bg-orange-950"
                      : "bg-blue-50 border-blue-400 dark:bg-blue-950"
                }`}
              >
                <h4 className={`font-medium text-sm ${warning.color}`}>
                  {warning.title}
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                  {warning.message}
                </p>
              </div>

              {/* Alternative Actions */}
              {warningLevel !== "low" && (
                <div className="bg-blue-50 dark:bg-blue-950 p-3 rounded-lg">
                  <h4 className="font-medium text-sm text-blue-700 dark:text-blue-300">
                    💡 Alternative Actions:
                  </h4>
                  <ul className="text-sm text-blue-600 dark:text-blue-400 mt-1 space-y-1">
                    <li>• Move to a different circle (Recognition Group)</li>
                    <li>• Edit contact information instead of deleting</li>
                    <li>• Mark as inactive rather than removing completely</li>
                  </ul>
                </div>
              )}
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting || isLoading}>
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isDeleting || isLoading}
            className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
          >
            {isDeleting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Deleting...
              </>
            ) : (
              <>
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Contact
              </>
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
