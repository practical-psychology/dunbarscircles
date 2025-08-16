import PageLayout from "../components/PageLayout";
import { useState } from "react";
import { signInWithGoogle, signOut } from "@/lib/auth-utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ContactsDashboard } from "@/components/contacts-dashboard";
import { ContactManager } from "@/components/contact-manager";
import { ErrorBoundary, DataErrorFallback } from "@/components/error-boundary";
import { DataStatus } from "@/components/data-status";
import { useAuth } from "@/hooks/use-auth";
import { FirebaseStatus } from "@/components/firebase-status";
import { dunbarLevels } from "../data/dunbarLevels";

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="grid grid-cols-3 gap-4 py-2 border-b last:border-b-0">
      <div className="text-sm font-medium text-gray-600">{label}</div>
      <div className="col-span-2 break-words text-sm">
        {value ?? <span className="text-gray-400">—</span>}
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { user, loading, error: authError, isAuthenticated } = useAuth();
  const [authLoading, setAuthLoading] = useState(false);
  const [localAuthError, setLocalAuthError] = useState<string | null>(null);

  const handleGoogleSignIn = async () => {
    setAuthLoading(true);
    setLocalAuthError(null);
    try {
      await signInWithGoogle();
    } catch (error) {
      console.error("Authentication error:", error);
      setLocalAuthError(
        error instanceof Error
          ? error.message
          : "Failed to sign in with Google",
      );
    } finally {
      setAuthLoading(false);
    }
  };

  const handleSignOut = async () => {
    setAuthLoading(true);
    setLocalAuthError(null);
    try {
      await signOut();
    } catch (error) {
      console.error("Sign out error:", error);
      setLocalAuthError(
        error instanceof Error ? error.message : "Failed to sign out",
      );
    } finally {
      setAuthLoading(false);
    }
  };

  const displayError = localAuthError || authError;

  return (
    <PageLayout
      title="User Dashboard"
      description="Overview of your social relationships and Dunbar's Number"
    >
      <ErrorBoundary
        fallback={({ error, retry }) => (
          <DataErrorFallback
            error={error}
            retry={retry}
            showSampleData={() => (window.location.href = "/")}
          />
        )}
      >
        {/* Data Status Overview */}
        {isAuthenticated && (
          <DataStatus
            onImportClick={() => (window.location.href = "/network")}
            className="mb-6"
          />
        )}

        {/* Contact Manager */}
        <ContactManager levels={dunbarLevels} />

        {/* Contacts Dashboard */}
        <ContactsDashboard levels={dunbarLevels} />

        {/* Firebase Status */}
        <div className="flex justify-center">
          <FirebaseStatus />
        </div>

        {/* Authentication Section */}
        <div className="grid grid-cols-1 lg:grid-cols-1 gap-3">
          <Card>
            <CardHeader>
              <CardTitle>Authentication</CardTitle>
              <CardDescription>
                Currently known information about the signed-in user.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-sm text-gray-500">Loading user…</div>
              ) : user ? (
                <div className="space-y-4" data-testid="user-info">
                  <div className="flex flex-wrap gap-2">
                    {user.emailVerified ? (
                      <Badge className="bg-green-600">Email verified</Badge>
                    ) : (
                      <Badge className="bg-amber-500">Email not verified</Badge>
                    )}
                    {user.isAnonymous && (
                      <Badge className="bg-gray-500">Anonymous</Badge>
                    )}
                  </div>

                  <div className="divide-y rounded-md border">
                    <InfoRow
                      label="UID"
                      value={<code className="text-xs">{user.uid}</code>}
                    />
                    <InfoRow label="Email" value={user.email} />
                    <InfoRow label="Display Name" value={user.displayName} />
                    <InfoRow label="Phone" value={user.phoneNumber} />
                    <InfoRow
                      label="Photo"
                      value={
                        user.photoURL ? (
                          <div className="relative h-10 w-10 overflow-hidden rounded-full">
                            <img
                              src={user.photoURL}
                              alt="User avatar"
                              className="object-cover w-full h-full"
                            />
                          </div>
                        ) : null
                      }
                    />
                    <InfoRow
                      label="Provider"
                      value={user.providerData
                        .map((p) => p.providerId)
                        .join(", ")}
                    />
                    <InfoRow
                      label="Created"
                      value={new Date(
                        user.metadata.creationTime ?? "",
                      ).toLocaleString()}
                    />
                    <InfoRow
                      label="Last Sign-in"
                      value={new Date(
                        user.metadata.lastSignInTime ?? "",
                      ).toLocaleString()}
                    />
                  </div>

                  <details className="rounded-md border bg-white/50 p-3">
                    <summary className="cursor-pointer text-sm font-medium">
                      Raw Firebase user JSON
                    </summary>
                    <pre className="mt-2 overflow-auto rounded bg-slate-900 p-3 text-xs text-slate-100">
                      {JSON.stringify(
                        {
                          uid: user.uid,
                          email: user.email,
                          displayName: user.displayName,
                          phoneNumber: user.phoneNumber,
                          photoURL: user.photoURL,
                          providerData: user.providerData,
                          metadata: user.metadata,
                        },
                        null,
                        2,
                      )}
                    </pre>
                  </details>

                  <button
                    onClick={handleSignOut}
                    disabled={authLoading}
                    className="flex items-center justify-center w-full px-4 py-2 space-x-2 text-sm font-medium text-white bg-red-600 border border-red-600 rounded-md shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    data-testid="sign-out"
                  >
                    {authLoading ? (
                      <svg
                        className="w-5 h-5 text-white animate-spin"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                    ) : (
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                        />
                      </svg>
                    )}
                    <span>{authLoading ? "Signing out..." : "Sign Out"}</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600">
                      No user is signed in.
                    </p>
                    <p className="text-xs text-gray-500">
                      Sign in with your Google account to continue.
                    </p>
                  </div>

                  <button
                    onClick={handleGoogleSignIn}
                    disabled={authLoading}
                    className="flex items-center justify-center w-full px-4 py-2 space-x-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    data-testid="sign-in"
                  >
                    {authLoading ? (
                      <svg
                        className="w-5 h-5 text-gray-500 animate-spin"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" viewBox="0 0 24 24">
                        <path
                          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                          fill="#4285F4"
                        />
                        <path
                          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                          fill="#34A853"
                        />
                        <path
                          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                          fill="#FBBC05"
                        />
                        <path
                          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                          fill="#EA4335"
                        />
                      </svg>
                    )}
                    <span>
                      {authLoading ? "Signing in..." : "Sign in with Google"}
                    </span>
                  </button>

                  {displayError && (
                    <div className="p-3 text-sm text-red-600 bg-red-50 rounded-md">
                      {displayError}
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </ErrorBoundary>
    </PageLayout>
  );
}
