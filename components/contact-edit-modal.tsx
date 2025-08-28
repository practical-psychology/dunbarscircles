import { Button } from "@/components/ui/button";
import { ContactForm } from "./contact-form";
import { Edit } from "lucide-react";

import * as Dialog from "@radix-ui/react-dialog";

// Import types from contact models
import { type ContactFormData } from "@/lib/contact-models";

type ContactUpdateData = Partial<Omit<ContactFormData, "id">> & { id: string };

interface ContactEditModalProps {
  contact?: {
    id: string;
    name: string;
    email?: string;
    phone?: string;
    platform: string;
    notes?: string;
    tags?: string[];
    levelId: string;
    lastContact: Date;
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
  const handleOpenChange = (newOpen: boolean) => {
    if (onOpenChange) {
      onOpenChange(newOpen);
    }
  };

  const handleSave = async (data: ContactFormData) => {
    try {
      if (contact) {
        // Update existing contact - add the id to the form data
        const updateData = {
          ...data,
          id: contact.id,
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

  return (
    <Dialog.Root open={isOpen} onOpenChange={onOpenChange}>
      {trigger ? (
        <Dialog.Trigger asChild>{trigger}</Dialog.Trigger>
      ) : (
        <Dialog.Trigger asChild>
          <Button variant="ghost" size="icon" disabled={isLoading}>
            <Edit className="h-4 w-4" />
          </Button>
        </Dialog.Trigger>
      )}

      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50" />
        <Dialog.Content className="fixed left-1/2 top-1/2 max-h-[85vh] w-[90vw] max-w-[450px] -translate-x-1/2 -translate-y-1/2 rounded-md bg-white p-6 shadow-lg">
          <div className="flex flex-col space-y-1.5 text-center sm:text-left">
            <Dialog.Title className="text-lg font-semibold leading-none tracking-tight">
              {contact ? "Edit Contact" : "Add New Contact"}
            </Dialog.Title>
            <Dialog.Description className="text-sm text-muted-foreground">
              {contact
                ? "Update the contact details below."
                : "Fill in the details below to add a new contact."}
            </Dialog.Description>
          </div>

          <ContactForm
            initialData={contact}
            onSubmit={handleSave}
            onCancel={handleCancel}
            isLoading={isLoading}
          />
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
