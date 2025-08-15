import { useState } from "react";
import { ContactForm } from "./contact-form";
import { ContactEditModal } from "./contact-edit-modal";
import { ContactDeleteConfirmation } from "./contact-delete-confirmation";
import {
  type ContactFormData,
  type ContactUpdateData,
} from "@/lib/contact-models";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

// Demo component to showcase the contact form components
export function ContactFormDemo() {
  const [contacts, setContacts] = useState<
    Array<{
      id: string;
      name: string;
      email?: string;
      phone?: string;
      notes?: string;
      levelId: string;
      platform: string;
      contactFrequency: number;
      strength: number;
      lastContact: Date;
    }>
  >([
    {
      id: "1",
      name: "John Doe",
      email: "john@example.com",
      phone: "+1 (555) 123-4567",
      notes: "Met at conference",
      levelId: "active-network",
      platform: "work",
      contactFrequency: 30,
      strength: 0.6,
      lastContact: new Date(),
    },
  ]);

  const handleCreateContact = async (
    data: ContactFormData | ContactUpdateData,
  ) => {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    if ("id" in data) {
      // Update existing contact
      setContacts((prev) =>
        prev.map((contact) =>
          contact.id === data.id
            ? { ...contact, ...data, lastContact: new Date() }
            : contact,
        ),
      );
      toast.success("Contact updated successfully!");
    } else {
      // Create new contact
      const newContact = {
        id: Date.now().toString(),
        ...data,
        lastContact: new Date(),
      };

      setContacts((prev) => [...prev, newContact]);
      toast.success("Contact created successfully!");
    }
  };

  const handleUpdateContact = async (
    data: ContactFormData | ContactUpdateData,
  ) => {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    if ("id" in data) {
      setContacts((prev) =>
        prev.map((contact) =>
          contact.id === data.id ? { ...contact, ...data } : contact,
        ),
      );
      toast.success("Contact updated successfully!");
    }
  };

  const handleDeleteContact = async (contactId: string) => {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    setContacts((prev) => prev.filter((contact) => contact.id !== contactId));
  };

  return (
    <div className="space-y-8 p-6">
      <Card>
        <CardHeader>
          <CardTitle>Contact Form Components Demo</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Standalone Contact Form */}
          <div>
            <h3 className="text-lg font-semibold mb-4">
              Standalone Contact Form
            </h3>
            <ContactForm onSubmit={handleCreateContact} />
          </div>

          {/* Contact Edit Modal */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact Edit Modal</h3>
            <div className="flex gap-4">
              <ContactEditModal
                onSave={handleCreateContact}
                trigger={<Button>Add New Contact</Button>}
              />

              {contacts.length > 0 && (
                <ContactEditModal
                  contact={contacts[0]}
                  onSave={handleUpdateContact}
                  trigger={
                    <Button variant="outline">Edit First Contact</Button>
                  }
                />
              )}
            </div>
          </div>

          {/* Contact Delete Confirmation */}
          <div>
            <h3 className="text-lg font-semibold mb-4">
              Contact Delete Confirmation
            </h3>
            {contacts.length > 0 && (
              <ContactDeleteConfirmation
                contact={contacts[0]}
                onDelete={handleDeleteContact}
                trigger={
                  <Button variant="destructive">Delete First Contact</Button>
                }
              />
            )}
          </div>

          {/* Current Contacts */}
          <div>
            <h3 className="text-lg font-semibold mb-4">
              Current Contacts ({contacts.length})
            </h3>
            <div className="space-y-2">
              {contacts.map((contact) => (
                <div key={contact.id} className="p-3 border rounded-lg">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium">{contact.name}</h4>
                      <p className="text-sm text-gray-600">
                        {contact.email} • {contact.levelId.replace("-", " ")}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <ContactEditModal
                        contact={contact}
                        onSave={handleUpdateContact}
                        trigger={
                          <Button size="sm" variant="outline">
                            Edit
                          </Button>
                        }
                      />
                      <ContactDeleteConfirmation
                        contact={contact}
                        onDelete={handleDeleteContact}
                        trigger={
                          <Button size="sm" variant="destructive">
                            Delete
                          </Button>
                        }
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
