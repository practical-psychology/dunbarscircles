import { CheckCircle } from "lucide-react";

/** Quiet reassurance that edits persist in this browser (#49). */
export function SavedLocallyIndicator({
  className = "",
}: {
  className?: string;
}) {
  return (
    <p
      role="status"
      className={`inline-flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-300 ${className}`}
      data-testid="saved-locally"
    >
      <CheckCircle
        className="h-3.5 w-3.5 text-green-600 dark:text-green-400"
        aria-hidden="true"
      />
      All changes saved in this browser
    </p>
  );
}
