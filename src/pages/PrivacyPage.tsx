import PageLayout from "../components/PageLayout";

export default function PrivacyPage() {
  return (
    <PageLayout
      title="Privacy & Cookies"
      description="What Dunbar's Circles stores, where it goes, and how to remove it"
    >
      <div className="mx-auto max-w-3xl space-y-6 text-gray-800 dark:text-gray-100">
        <p className="text-sm text-gray-600 dark:text-gray-300">
          Last updated: 7 November 2026
        </p>

        <section aria-labelledby="p-local" className="space-y-2">
          <h2 id="p-local" className="text-xl font-semibold">
            Your contacts stay in your browser
          </h2>
          <p>
            The contacts, relationship levels and settings you enter are saved
            in your browser&apos;s local storage on your own device. We do not
            receive them. Clearing your browser data for this site, or using the
            delete options inside the app, removes them.
          </p>
        </section>

        <section aria-labelledby="p-cloud" className="space-y-2">
          <h2 id="p-cloud" className="text-xl font-semibold">
            Optional cloud backup
          </h2>
          <p>
            If you choose to sign in with Google, your contacts are backed up to
            Google Firebase (Cloud Firestore) under your account ID. Access
            rules allow only the signed-in owner to read, change or delete their
            own records. We store your Google account ID, display name and email
            address only to run the sign-in. Signing out stops the sync; you can
            delete your cloud copy from the Contacts page, or ask us to delete
            it using the contact link on the About page.
          </p>
        </section>

        <section aria-labelledby="p-analytics" className="space-y-2">
          <h2 id="p-analytics" className="text-xl font-semibold">
            Analytics (opt-in)
          </h2>
          <p>
            Analytics is off until you choose &quot;Allow analytics&quot;. If
            you allow it, Google Analytics for Firebase records anonymous usage
            events such as which pages and buttons are used, plus coarse device
            and country information. It never receives your contacts. We respect
            the Do Not Track and Global Privacy Control browser signals and keep
            nothing when either is on. Change your mind at any time with
            &quot;Privacy choices&quot; in the footer.
          </p>
        </section>

        <section aria-labelledby="p-storage" className="space-y-2">
          <h2 id="p-storage" className="text-xl font-semibold">
            Cookies and storage we use
          </h2>
          <ul className="list-disc space-y-1 pl-6">
            <li>
              <strong>Local storage (essential):</strong> your contacts, theme,
              welcome-tour progress and your analytics choice.
            </li>
            <li>
              <strong>Firebase Authentication (only if you sign in):</strong>{" "}
              session data in browser storage.
            </li>
            <li>
              <strong>Analytics cookies (only if you allow them):</strong>{" "}
              Google Analytics identifiers with a limited lifetime.
            </li>
          </ul>
        </section>

        <section aria-labelledby="p-proc" className="space-y-2">
          <h2 id="p-proc" className="text-xl font-semibold">
            Who processes data
          </h2>
          <p>
            Google LLC (Firebase Hosting, Authentication, Firestore and
            Analytics) and GitHub (source code and deployment). We do not sell
            data and run no advertising.
          </p>
        </section>

        <section aria-labelledby="p-keep" className="space-y-2">
          <h2 id="p-keep" className="text-xl font-semibold">
            Retention, deletion and your rights
          </h2>
          <p>
            Cloud backups are kept until you delete them or ask us to. Firebase
            Analytics data follows the retention period configured in the
            project (maximum 14 months). To access, correct or delete data about
            you, use the contact link on the About page.
          </p>
        </section>
      </div>
    </PageLayout>
  );
}
