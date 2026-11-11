import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
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
  CLOUD_CONSENT_REQUEST_EVENT,
  setCloudConsent,
} from "@/lib/cloud-consent";

/**
 * Asks for an explicit choice before any cloud backup. Opened after sign-in
 * (PageLayout) or from a "Turn on cloud backup" button. The answer is
 * recorded with a timestamp (lib/cloud-consent.ts).
 */
export function CloudConsentPrompt() {
  const [uid, setUid] = useState<string | null>(null);

  useEffect(() => {
    const open = (e: Event) => {
      const id = (e as CustomEvent<{ uid?: string }>).detail?.uid;
      if (id) setUid(id);
    };
    window.addEventListener(CLOUD_CONSENT_REQUEST_EVENT, open);
    return () => window.removeEventListener(CLOUD_CONSENT_REQUEST_EVENT, open);
  }, []);

  const choose = (choice: "granted" | "declined") => {
    if (uid) setCloudConsent(uid, choice);
    setUid(null);
  };

  return (
    <AlertDialog
      open={uid !== null}
      onOpenChange={(o) => {
        if (!o) choose("declined");
      }}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Turn on cloud backup?</AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-2 text-sm">
              <p>
                You are signed in, but nothing has been uploaded. If you turn on
                backup, the people in your list (names, circles, notes and
                ratings) are copied to Google Firebase under your account, and
                kept in step with this browser.
              </p>
              <p>
                Interactions and change history stay in this browser only. You
                can turn backup off at any time from the dashboard. See{" "}
                <Link to="/privacy" className="underline">
                  Privacy
                </Link>
                .
              </p>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={() => choose("declined")}>
            Not now
          </AlertDialogCancel>
          <AlertDialogAction onClick={() => choose("granted")}>
            Turn on cloud backup
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
