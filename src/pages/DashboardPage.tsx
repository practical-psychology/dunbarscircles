import { ContactsDashboard } from "../../components/contacts-dashboard";
import { ContactManager } from "../../components/contact-manager";
import {
  ErrorBoundary,
  DataErrorFallback,
} from "../../components/error-boundary";
import { dunbarLevels } from "../../data/dunbarLevels";
import PageLayout from "../components/PageLayout";
import { MobileAddContactFab } from "../../components/mobile-add-contact-fab";
import { SavedLocallyIndicator } from "../../components/saved-locally-indicator";

export default function DashboardPage() {
  return (
    <PageLayout
      title="User Dashboard"
      description="Overview of your social relationships and Dunbar's Number"
    >
      <ErrorBoundary
        fallback={({ error, retry }: { error: Error; retry: () => void }) => (
          <DataErrorFallback
            error={error}
            retry={retry}
            showSampleData={() => (window.location.href = "/")}
          />
        )}
      >
        {/* Main Content */}
        <div className="space-y-8">
          {/* Contact Manager */}
          <div>
            <ContactManager levels={dunbarLevels} />
          </div>

          {/* Contacts Dashboard */}
          <div className="space-y-4">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Your Network
              </h2>
              <SavedLocallyIndicator />
            </div>
            <ContactsDashboard levels={dunbarLevels} />
          </div>
        </div>
      </ErrorBoundary>
      <MobileAddContactFab />
    </PageLayout>
  );
}
