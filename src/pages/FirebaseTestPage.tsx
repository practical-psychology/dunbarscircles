import { useState } from "react";
import PageLayout from "../components/PageLayout";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
// Import the actual exports from their respective files
import { ContactStorage } from "../../lib/contact-storage";
import { testFirebaseConnection } from "../../lib/firebase-test";
import { isSimpleFirebaseReady } from "../../lib/firebase-simple";

// Create instances of the storage classes
// Commented out unused variables to fix lint warnings
// const contactStorage = new ContactStorage();
// const simpleContactStorage = new SimpleContactStorage();

// Import the StoredContact type from contact-card
import type { StoredContact } from "@/components/contact-card";
// import FirebaseStatus from "@/components/firebase-status";

// Define a test contact type that matches StoredContact
interface TestContact extends Omit<StoredContact, "lastContact"> {
  lastContact: Date;
  levelId: string; // Add levelId which is used in the test data
  platform: string; // Add platform which is used in the test data
  decayRate: number; // Add decayRate which is used in the test data
  importDate: Date; // Add importDate which is used in the test data
}

export default function FirebaseTestPage() {
  const [testResults, setTestResults] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const addTestResult = (result: string) => {
    console.log(result);
    setTestResults((prev) => [...prev, result]);
  };

  const clearResults = () => {
    setTestResults([]);
  };

  /* const runAllTests = async () => {
    setTestResults([]);
    setIsLoading(true);

    try {
      // Test Firebase connection
      const connectionTest = await testFirebaseConnection();
      addTestResult(
        `Firebase Connection: ${connectionTest ? "✅" : "❌"} ${connectionTest ? "Connected successfully" : "Connection failed"}`,
      );

      // Test if simple Firebase is available
      const simpleAvailable = isSimpleFirebaseReady;
      addTestResult(
        `Simple Firebase Available: ${simpleAvailable ? "✅ Yes" : "❌ No"}`,
      );

      // Test if simple Firebase is ready
      const simpleReady = isSimpleFirebaseReady;
      addTestResult(
        `Simple Firebase Ready: ${simpleReady ? "✅ Yes" : "❌ No"}`,
      );

      // Add more tests as needed
    } catch (error) {
      addTestResult(`❌ Error running tests: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsLoading(false);
    }
  }; */

  const testContactStorage = async () => {
    setIsLoading(true);
    addTestResult("Testing contact storage...");

    try {
      // Test simple Firebase connection first
      const simpleFirebaseReady = isSimpleFirebaseReady;
      addTestResult(`Simple Firebase available: ${simpleFirebaseReady}`);

      if (simpleFirebaseReady) {
        // Test simple Firebase connection
        const connectionTest = await testFirebaseConnection();
        addTestResult(
          `Simple Firebase connection test: ${connectionTest ? "SUCCESS" : "FAILED"}`,
        );

        if (connectionTest) {
          // Test loading contacts with simple Firebase
          const contacts = await ContactStorage.loadAllContacts();
          addTestResult(
            `Loaded ${contacts.length} existing contacts (Simple Firebase)`,
          );

          // Test adding a contact
          const testContact: TestContact = {
            id: `test_${Date.now()}`,
            name: `Test Contact ${Date.now()}`,
            levelId: "inner-circle",
            lastContact: new Date(),
            contactFrequency: 1,
            strength: 0.9,
            decayRate: 0.001,
            platform: "Test Platform",
            importDate: new Date(),
            tags: [],
          };

          await ContactStorage.addAllContacts([testContact], "manual");
          addTestResult("Successfully added test contact (Simple Firebase)");

          // Verify the contact was added
          const updatedContacts = await ContactStorage.loadAllContacts();
          addTestResult(
            `Total contacts after addition: ${updatedContacts.length}`,
          );
        }
      } else {
        // Fallback to regular contact storage
        addTestResult("Falling back to regular contact storage...");

        const contacts = await ContactStorage.loadAllContacts();
        addTestResult(`Loaded ${contacts.length} existing contacts (Regular)`);

        const testContact: TestContact = {
          id: `test_${Date.now()}`,
          name: `Test Contact ${Date.now()}`,
          levelId: "inner-circle",
          lastContact: new Date(),
          contactFrequency: 1,
          strength: 0.9,
          decayRate: 0.001,
          platform: "Test Platform",
          importDate: new Date(),
          tags: [],
        };

        await ContactStorage.addAllContacts([testContact], "manual");
        addTestResult("Successfully added test contact (Regular)");

        const updatedContacts = await ContactStorage.loadAllContacts();
        addTestResult(
          `Total contacts after addition: ${updatedContacts.length}`,
        );
      }
    } catch (error) {
      addTestResult(`Contact storage test error: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  const clearTestContacts = async () => {
    setIsLoading(true);
    addTestResult("Clearing test contacts...");

    try {
      const contacts = await ContactStorage.loadAllContacts();
      const testContacts = contacts.filter((c) =>
        c.name.includes("Test Contact"),
      );
      addTestResult(`Found ${testContacts.length} test contacts`);

      if (testContacts.length > 0) {
        // For now, just report - in a real implementation we'd need a delete method
        addTestResult(
          "Note: Test contacts found but no delete method implemented yet",
        );
      }
    } catch (error) {
      addTestResult(`Clear test contacts error: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Function to run connection test
  const runConnectionTest = async () => {
    setTestResults([]);
    setIsLoading(true);
    try {
      const isConnected = await testFirebaseConnection();
      addTestResult(
        `Firebase connection test: ${isConnected ? "SUCCESS" : "FAILED"}`,
      );
    } catch (error) {
      addTestResult(`Connection test error: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <PageLayout
      title="Firebase Test Page"
      description="Test and diagnose Firebase connectivity issues"
    >
      <div className="space-y-6">
        {/* Test Controls */}
        <Card>
          <CardHeader>
            <CardTitle>Firebase Tests</CardTitle>
            <CardDescription>
              Run various tests to diagnose Firebase issues
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <Button
                onClick={runConnectionTest}
                disabled={isLoading}
                variant="outline"
              >
                Test Connection
              </Button>
              <Button
                onClick={testContactStorage}
                disabled={isLoading}
                variant="outline"
              >
                Test Contact Storage
              </Button>
              <Button
                onClick={async () => {
                  setIsLoading(true);
                  addTestResult("Testing Simple Firebase connection...");
                  try {
                    const available = isSimpleFirebaseReady;
                    addTestResult(`Simple Firebase available: ${available}`);
                    if (available) {
                      try {
                        const connectionTest = await testFirebaseConnection();
                        addTestResult(
                          `Simple Firebase connection: ${connectionTest ? "SUCCESS" : "FAILED"}`,
                        );
                      } catch (error) {
                        addTestResult(`Simple Firebase test error: ${error}`);
                      }
                    }
                  } catch (error) {
                    addTestResult(`Simple Firebase test error: ${error}`);
                  } finally {
                    setIsLoading(false);
                  }
                }}
                disabled={isLoading}
                variant="outline"
              >
                Test Simple Firebase
              </Button>
              <Button
                onClick={clearTestContacts}
                disabled={isLoading}
                variant="outline"
              >
                Clear Test Data
              </Button>
              <Button
                onClick={clearResults}
                disabled={isLoading}
                variant="secondary"
              >
                Clear Results
              </Button>
            </div>

            {testResults.length > 0 && (
              <div className="mt-4">
                <h4 className="font-medium mb-2">Test Results:</h4>
                <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-3 max-h-64 overflow-y-auto">
                  <pre className="text-sm whitespace-pre-wrap">
                    {testResults.join("\n")}
                  </pre>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Environment Info */}
        <Card>
          <CardHeader>
            <CardTitle>Environment Information</CardTitle>
            <CardDescription>Current environment configuration</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div>
                <strong>Project ID:</strong>{" "}
                {import.meta.env.VITE_FIREBASE_PROJECT_ID || "Not set"}
              </div>
              <div>
                <strong>Auth Domain:</strong>{" "}
                {import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "Not set"}
              </div>
              <div>
                <strong>API Key:</strong>{" "}
                {import.meta.env.VITE_FIREBASE_API_KEY ? "Set" : "Not set"}
              </div>
              <div>
                <strong>Environment:</strong> {import.meta.env.MODE}
              </div>
              <div>
                <strong>Base URL:</strong> {import.meta.env.BASE_URL}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
}
