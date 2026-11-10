import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  OPEN_CONSENT_EVENT,
  getConsent,
  initAnalytics,
  setConsent,
} from "../lib/analytics";

/** Opt-in analytics prompt. Hidden when the visitor already chose. */
export function ConsentBanner() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    void initAnalytics();
    if (
      getConsent() === "unset" &&
      import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
    ) {
      setOpen(true);
    }
    const reopen = () => setOpen(true);
    window.addEventListener(OPEN_CONSENT_EVENT, reopen);
    return () => window.removeEventListener(OPEN_CONSENT_EVENT, reopen);
  }, []);

  if (!open) return null;

  const choose = (value: "granted" | "denied") => {
    setConsent(value);
    setOpen(false);
  };

  return (
    <div
      role="region"
      aria-label="Analytics choice"
      className="fixed inset-x-0 bottom-0 z-[60] border-t border-gray-200 bg-white/95 p-4 text-sm text-gray-800 shadow-lg backdrop-blur dark:border-gray-700 dark:bg-gray-900/95 dark:text-gray-100"
    >
      <div className="mx-auto flex max-w-3xl flex-col gap-3 sm:flex-row sm:items-center">
        <p className="flex-1">
          May we measure anonymous usage (which pages and buttons are used) to
          improve the site? Your contacts never leave your browser for this.{" "}
          <Link to="/privacy" className="underline">
            Privacy details
          </Link>
        </p>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => choose("denied")}
            className="min-h-[44px] rounded-lg border border-gray-400 px-4 py-2 font-medium"
          >
            No thanks
          </button>
          <button
            type="button"
            onClick={() => choose("granted")}
            className="min-h-[44px] rounded-lg bg-blue-700 px-4 py-2 font-medium text-white"
          >
            Allow analytics
          </button>
        </div>
      </div>
    </div>
  );
}
