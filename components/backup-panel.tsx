import { useRef, useState } from "react";
import { toast } from "sonner";
import { Download, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { dunbarLevels } from "@/data/dunbarLevels";
import {
  buildBackup,
  parseBackup,
  previewImport,
  type ImportPreview,
} from "@/lib/backup";
import { generateFilename } from "@/lib/export-utils";
import { trackEvent } from "@/lib/analytics";
import type { ContactForm } from "@/lib/contact-models";

interface BackupPanelProps {
  contacts: ReadonlyArray<Record<string, any>>;
  /** Adds one contact; resolves true on success. */
  onAddContact: (contact: ContactForm) => Promise<boolean>;
  /** Called after an import finishes so the page can reload its list. */
  onImported: () => void;
}

const LEVEL_IDS = dunbarLevels.map((l) => l.id);

export function BackupPanel({
  contacts,
  onAddContact,
  onImported,
}: BackupPanelProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<ImportPreview | null>(null);
  const [busy, setBusy] = useState(false);

  const handleExport = () => {
    const json = JSON.stringify(buildBackup(contacts), null, 2);
    const url = URL.createObjectURL(
      new Blob([json], { type: "application/json" }),
    );
    const a = document.createElement("a");
    a.href = url;
    a.download = generateFilename("dunbars-circles-backup", "json");
    a.click();
    URL.revokeObjectURL(url);
    trackEvent("export_data", { format: "json" });
    toast.success(`Exported ${contacts.length} contacts`);
  };

  const handleFile = async (file: File | undefined) => {
    if (!file) return;
    const parsed = parseBackup(await file.text());
    if (!parsed.ok) {
      setPreview(null);
      toast.error(parsed.error);
    } else {
      setPreview(previewImport(parsed.file, contacts as any[], LEVEL_IDS));
    }
    if (fileRef.current) fileRef.current.value = "";
  };

  const handleConfirm = async () => {
    if (!preview) return;
    setBusy(true);
    let added = 0;
    for (const c of preview.toAdd) {
      if (await onAddContact(c)) added += 1;
    }
    setBusy(false);
    setPreview(null);
    trackEvent("import_contacts", { format: "json" });
    toast.success(`Imported ${added} contacts`);
    onImported();
  };

  return (
    <section aria-labelledby="backup-heading" className="space-y-3">
      <h2 id="backup-heading" className="text-lg font-semibold">
        Backup and restore
      </h2>
      <p className="text-sm text-gray-600 dark:text-gray-300">
        Download all your contacts as a file, or restore from one. Restoring
        never overwrites: people already in your list are skipped.
      </p>
      <div className="flex flex-wrap gap-2">
        <Button
          variant="outline"
          onClick={handleExport}
          disabled={!contacts.length}
          className="gap-2"
        >
          <Download className="w-4 h-4" aria-hidden="true" /> Download backup
        </Button>
        <Button
          variant="outline"
          onClick={() => fileRef.current?.click()}
          className="gap-2"
        >
          <Upload className="w-4 h-4" aria-hidden="true" /> Restore from backup
        </Button>
        <input
          ref={fileRef}
          type="file"
          accept="application/json,.json"
          className="sr-only"
          aria-label="Choose a backup file to restore"
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => void handleFile(e.target.files?.[0])}
        />
      </div>

      {preview && (
        <div
          role="region"
          aria-label="Import preview"
          className="rounded-xl border border-gray-200 dark:border-gray-700 p-4 space-y-2 bg-white/70 dark:bg-gray-900/60"
        >
          <p className="font-medium">Import preview</p>
          <ul className="text-sm space-y-1">
            <li>{preview.toAdd.length} new contacts will be added</li>
            <li>
              {preview.duplicates.length} already in your list will be skipped
            </li>
            {preview.invalid.length > 0 && (
              <li>
                {preview.invalid.length} entries cannot be read (for example
                entry {preview.invalid[0].index}: {preview.invalid[0].reason})
              </li>
            )}
          </ul>
          <div className="flex gap-2 pt-1">
            <Button
              onClick={() => void handleConfirm()}
              disabled={busy || preview.toAdd.length === 0}
            >
              {busy ? "Importing…" : `Add ${preview.toAdd.length} contacts`}
            </Button>
            <Button variant="ghost" onClick={() => setPreview(null)}>
              Cancel
            </Button>
          </div>
        </div>
      )}
    </section>
  );
}
