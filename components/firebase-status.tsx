import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Badge } from "@/components/ui/badge";
import {
  AlertCircle,
  CheckCircle,
  RefreshCw,
  Wifi,
  WifiOff,
} from "lucide-react";
import {
  runFirebaseDiagnostics,
  type FirebaseDiagnostics,
} from "@/lib/firebase-diagnostics";
import { getFirebaseStatus, reinitializeFirebase } from "@/firebase-config";

export function FirebaseStatus() {
  const [diagnostics, setDiagnostics] = useState<FirebaseDiagnostics | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(false);
  const [firebaseStatus, setFirebaseStatus] = useState(getFirebaseStatus());

  const runTest = async () => {
    setIsLoading(true);
    try {
      const result = await runFirebaseDiagnostics();
      setDiagnostics(result);
      setFirebaseStatus(getFirebaseStatus());
    } catch (error) {
      console.error("Failed to run diagnostics:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReinitialize = () => {
    setIsLoading(true);
    try {
      reinitializeFirebase();
      setFirebaseStatus(getFirebaseStatus());
      // Run diagnostics after reinitializing
      setTimeout(() => runTest(), 1000);
    } catch (error) {
      console.error("Failed to reinitialize Firebase:", error);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    runTest();
  }, []);

  const getStatusIcon = (status: boolean) => {
    return status ? (
      <CheckCircle className="h-4 w-4 text-green-500" />
    ) : (
      <AlertCircle className="h-4 w-4 text-red-500" />
    );
  };

  const getStatusBadge = (status: boolean) => {
    return (
      <Badge variant={status ? "default" : "destructive"}>
        {status ? "OK" : "Failed"}
      </Badge>
    );
  };

  const isConnected =
    diagnostics?.configValid && diagnostics?.connectionWorking;

  return (
    <Card className="w-full max-w-2xl" data-testid="firebase-status">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {isConnected ? (
            <Wifi className="h-5 w-5 text-green-500" />
          ) : (
            <WifiOff className="h-5 w-5 text-red-500" />
          )}
          Firebase Connection Status
        </CardTitle>
        <CardDescription>
          Monitor your Firebase connection and permissions
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between items-center gap-2">
          <Button
            onClick={runTest}
            disabled={isLoading}
            variant="outline"
            size="sm"
            aria-label="Test Firebase database connection"
          >
            {isLoading ? (
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4 mr-2" />
            )}
            Test Connection
          </Button>

          <Button
            onClick={handleReinitialize}
            disabled={isLoading}
            variant="secondary"
            size="sm"
            aria-label="Reinitialize Firebase connection"
          >
            Reinitialize
          </Button>
        </div>

        {/* Firebase Initialization Status */}
        <div className="space-y-3">
          <h4 className="font-medium text-sm">Initialization Status</h4>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {getStatusIcon(firebaseStatus.isInitialized)}
              <span>Firebase Initialized</span>
            </div>
            {getStatusBadge(firebaseStatus.isInitialized)}
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {getStatusIcon(firebaseStatus.hasApp)}
              <span>Firebase App</span>
            </div>
            {getStatusBadge(firebaseStatus.hasApp)}
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {getStatusIcon(firebaseStatus.hasDb)}
              <span>Firestore Database</span>
            </div>
            {getStatusBadge(firebaseStatus.hasDb)}
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {getStatusIcon(firebaseStatus.hasAuth)}
              <span>Firebase Auth</span>
            </div>
            {getStatusBadge(firebaseStatus.hasAuth)}
          </div>

          {firebaseStatus.error && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
              <h5 className="font-medium text-red-800 dark:text-red-200 mb-1">
                Initialization Error:
              </h5>
              <p className="text-sm text-red-700 dark:text-red-300">
                {firebaseStatus.error.message}
              </p>
            </div>
          )}
        </div>

        {diagnostics && (
          <div className="space-y-3">
            <h4 className="font-medium text-sm">Connection Tests</h4>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {getStatusIcon(diagnostics.configValid)}
                <span>Configuration Valid</span>
              </div>
              {getStatusBadge(diagnostics.configValid)}
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {getStatusIcon(diagnostics.connectionWorking)}
                <span>Database Connection</span>
              </div>
              {getStatusBadge(diagnostics.connectionWorking)}
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {getStatusIcon(diagnostics.readPermission)}
                <span>Read Permission</span>
              </div>
              {getStatusBadge(diagnostics.readPermission)}
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {getStatusIcon(diagnostics.writePermission)}
                <span>Write Permission</span>
              </div>
              {getStatusBadge(diagnostics.writePermission)}
            </div>

            {diagnostics.errors.length > 0 && (
              <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                <h4 className="font-medium text-red-800 dark:text-red-200 mb-2">
                  Errors Detected:
                </h4>
                <ul className="text-sm text-red-700 dark:text-red-300 space-y-1">
                  {diagnostics.errors.map((error, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <AlertCircle className="h-3 w-3 mt-0.5 flex-shrink-0" />
                      {error}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {diagnostics.errors.length > 0 && (
              <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-2">
                  Troubleshooting Tips:
                </h4>
                <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                  <li>
                    • Check your .env file has all required Firebase variables
                  </li>
                  <li>
                    • Verify your Firebase project is active and billing is
                    enabled
                  </li>
                  <li>
                    • Ensure Firestore security rules allow read/write access
                  </li>
                  <li>• Check browser console for additional error details</li>
                </ul>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
