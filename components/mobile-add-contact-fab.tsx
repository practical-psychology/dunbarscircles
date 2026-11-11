import { Link } from "react-router-dom";
import { Plus } from "lucide-react";

/**
 * Floating "Add contact" button for small screens (#47). Sits within thumb
 * reach at the bottom-right, 56 px (above the 44 px minimum tap target).
 * Hidden from md upwards, where the page header buttons are visible.
 */
export function MobileAddContactFab() {
  return (
    <Link
      to="/contacts/edit/new"
      aria-label="Add contact"
      title="Add contact"
      data-testid="mobile-add-contact"
      className="md:hidden fixed right-4 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-blue-600 text-white shadow-lg shadow-blue-600/30 transition-transform hover:bg-blue-700 active:scale-95 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-300"
      style={{ bottom: "max(1.25rem, env(safe-area-inset-bottom))" }}
    >
      <Plus className="h-6 w-6" aria-hidden="true" />
    </Link>
  );
}
