import { useEffect, useState } from "react";
import { toast } from "sonner";
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
  CONTACT_SAVED_EVENT,
  dismissCleanupOffer,
  isCleanupOfferDismissed,
  isSampleContact,
} from "@/lib/sample-data";

// Loaded on demand so Firebase stays out of the first-paint bundle.
const storage = async () =>
  (
    await import("@/lib/contact-storage-service")
  ).ContactStorageService.getInstance();

export const CONTACTS_CHANGED_EVENT = "dc:contacts-changed";

/**
 * After the first real contact is saved, offer once to remove the sample
 * people (#48). Deletes only contacts marked as samples.
 */
export function SampleCleanupPrompt() {
  const [sampleIds, setSampleIds] = useState<string[]>([]);
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const onSaved = async () => {
      if (isCleanupOfferDismissed()) return;
      const result = await (await storage()).readContacts();
      const contacts = result.success && result.data ? result.data : [];
      const samples = contacts.filter(isSampleContact);
      const hasReal = contacts.some((c) => !isSampleContact(c));
      if (samples.length > 0 && hasReal) {
        setSampleIds(samples.map((c) => c.id));
        setOpen(true);
      }
    };
    const handler = () => void onSaved();
    window.addEventListener(CONTACT_SAVED_EVENT, handler);
    return () => window.removeEventListener(CONTACT_SAVED_EVENT, handler);
  }, []);

  const keep = () => {
    dismissCleanupOffer();
    setOpen(false);
  };

  const remove = async () => {
    setBusy(true);
    try {
      const result = await (await storage()).deleteContacts(sampleIds);
      const deleted = result.data?.deleted ?? 0;
      dismissCleanupOffer();
      setOpen(false);
      window.dispatchEvent(new CustomEvent(CONTACTS_CHANGED_EVENT));
      toast.success(
        `Removed ${deleted} sample ${deleted === 1 ? "person" : "people"}`,
        { description: "Your own contacts were not touched." },
      );
    } catch (error) {
      console.error("Failed to remove sample contacts:", error);
      toast.error("Could not remove the sample people. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  const n = sampleIds.length;

  return (
    <AlertDialog open={open} onOpenChange={(o) => (o ? setOpen(true) : keep())}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            Remove the {n} sample {n === 1 ? "person" : "people"}?
          </AlertDialogTitle>
          <AlertDialogDescription>
            You have added your own contact. The made-up sample people can go
            now so your map shows only real relationships. Your own contacts
            stay exactly as they are.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={keep} disabled={busy}>
            Keep samples
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              void remove();
            }}
            disabled={busy}
            className="bg-red-600 hover:bg-red-700"
          >
            {busy ? "Removing…" : `Remove ${n} sample${n === 1 ? "" : "s"}`}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
