import { useRef, useState } from "react";
import { toast } from "sonner";
import { Download, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { dunbarLevels } from "@/data/dunbarLevels";
import {
  buildBackup,
  contactKey,
  parseBackup,
  previewImport,
  type BackupFile,
  type ImportPreview,
} from "@/lib/backup";
import {
  importHistory,
  importInteractions,
  readHistory,
  readInteractions,
  withChangeSource,
} from "@/lib/relationship-log";
import { generateFilename } from "@/lib/export-utils";
import { trackEvent } from "@/lib/analytics";
import type { ContactForm } from "@/lib/contact-models";

interface BackupPanelProps {
  contacts: ReadonlyArray<Record<string, any>>;
  /** Adds one contact; resolves to its new id, or null on failure. */
  onAddContact: (contact: ContactForm) => Promise<string | null>;
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
  const [file, setFile] = useState<BackupFile | null>(null);
  const [busy, setBusy] = useState(false);

  const handleExport = () => {
    const json = JSON.stringify(
      buildBackup(contacts, new Date(), {
        interactions: readInteractions(),
        history: readHistory(),
      }),
      null,
      2,
    );
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
      setFile(parsed.file);
      setPreview(previewImport(parsed.file, contacts as any[], LEVEL_IDS));
    }
    if (fileRef.current) fileRef.current.value = "";
  };

  const handleConfirm = async () => {
    if (!preview) return;
    setBusy(true);
    let added = 0;
    let logs = 0;
    await withChangeSource("import", async () => {
      // Map ids in the file to ids in this browser: new people get new ids,
      // people already here (duplicates) keep theirs.
      const idMap = new Map<string, string>();
      const existingByKey = new Map(
        contacts.map((c) => [
          contactKey(c as { name: string; levelId?: string }),
          String(c.id),
        ]),
      );
      for (const d of preview.duplicates) {
        const here = existingByKey.get(contactKey(d));
        if (d.id && here) idMap.set(d.id, here);
      }
      for (const c of preview.toAdd) {
        const { id: sourceId, _v1, ...rest } = c;
        void _v1;
        const newId = await onAddContact(rest as ContactForm);
        if (newId) {
          added += 1;
          if (sourceId) idMap.set(sourceId, newId);
        }
      }
      const remap = <T extends { person_id: string }>(xs: T[] = []) =>
        xs
          .filter((x) => idMap.has(x.person_id))
          .map((x) => ({ ...x, person_id: idMap.get(x.person_id)! }));
      logs += importInteractions(remap(file?.interactions));
      logs += importHistory(remap(file?.history));
    });
    setBusy(false);
    setPreview(null);
    setFile(null);
    trackEvent("import_contacts", { format: "json" });
    toast.success(
      `Imported ${added} contacts${logs ? ` and ${logs} interaction or history records` : ""}`,
    );
    onImported();
  };

  return (
    <section aria-labelledby="backup-heading" className="space-y-3">
      <h2 id="backup-heading" className="text-lg font-semibold">
        Backup and restore
      </h2>
      <p className="text-sm text-gray-600 dark:text-gray-300">
        Download all your contacts, interactions and change history as a file
        (schema version 2), or restore from one. You see a preview first, and
        restoring never overwrites: people already in your list are skipped.
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
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            void handleFile(e.target.files?.[0])
          }
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
            {file?.interactions?.length || file?.history?.length ? (
              <li>
                {file?.interactions?.length ?? 0} interactions and{" "}
                {file?.history?.length ?? 0} history records will be linked to
                the people they belong to
              </li>
            ) : null}
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
