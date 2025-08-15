import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ContactForm } from "./contact-form";
import {
  type ContactFormData,
  type ContactUpdateData,
} from "@/lib/contact-models";
import { Edit, User } from "lucide-react";

interface ContactEditModalProps {
  contact?: {
    id: string;
    name: string;
    email?: string;
    phone?: string;
    notes?: string;
    levelId: string;
    platform: string;
    contactFrequency: number;
    strength: number;
  };
  onSave: (data: ContactFormData | ContactUpdateData) => Promise<void>;
  trigger?: React.ReactNode;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  isLoading?: boolean;
}

export function ContactEditModal({
  contact,
  onSave,
  trigger,
  isOpen,
  onOpenChange,
  isLoading = false,
}: ContactEditModalProps) {
  const [open, setOpen] = useState(false);

  const handleOpenChange = (newOpen: boolean) => {
    if (onOpenChange) {
      onOpenChange(newOpen);
    } else {
      setOpen(newOpen);
    }
  };

  const handleSave = async (data: ContactFormData) => {
    try {
      if (contact) {
        // Update existing contact
        const updateData: ContactUpdateData = {
          id: contact.id,
          ...data,
        };
        await onSave(updateData);
      } else {
        // Create new contact
        await onSave(data);
      }
      handleOpenChange(false);
    } catch (error) {
      // Error handling is done in ContactForm component
      throw error;
    }
  };

  const handleCancel = () => {
    handleOpenChange(false);
  };

  const isControlled = isOpen !== undefined && onOpenChange !== undefined;
  const modalOpen = isControlled ? isOpen : open;

  return (
    <Dialog open={modalOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm">
            {contact ? (
              <>
                <Edit className="w-4 h-4 mr-2" />
                Edit Contact
              </>
            ) : (
              <>
                <User className="w-4 h-4 mr-2" />
                Add Contact
              </>
            )}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {contact ? (
              <>
                <Edit className="w-5 h-5" />
                Edit Contact: {contact.name}
              </>
            ) : (
              <>
                <User className="w-5 h-5" />
                Add New Contact
              </>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="mt-4">
          <ContactForm
            onSubmit={handleSave}
            onCancel={handleCancel}
            initialData={
              contact
                ? {
                    name: contact.name,
                    email: contact.email || "",
                    phone: contact.phone || "",
                    notes: contact.notes || "",
                    levelId: contact.levelId,
                    platform: contact.platform,
                    contactFrequency: contact.contactFrequency,
                    strength: contact.strength,
                  }
                : undefined
            }
            isLoading={isLoading}
            title={contact ? `Edit ${contact.name}` : "Add New Contact"}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
