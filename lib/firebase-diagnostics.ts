import { db, firebaseConfig, getFirebaseStatus } from "../firebase-config";
import {
  collection,
  getDocs,
  doc,
  setDoc,
  deleteDoc,
} from "firebase/firestore";

export interface FirebaseDiagnostics {
  configValid: boolean;
  connectionWorking: boolean;
  readPermission: boolean;
  writePermission: boolean;
  errors: string[];
}

export async function runFirebaseDiagnostics(): Promise<FirebaseDiagnostics> {
  const diagnostics: FirebaseDiagnostics = {
    configValid: false,
    connectionWorking: false,
    readPermission: false,
    writePermission: false,
    errors: [],
  };

  // Get Firebase status
  const status = getFirebaseStatus();

  // Check initialization
  if (status.error) {
    diagnostics.errors.push(`Initialization error: ${status.error.message}`);
  }

  if (!status.isInitialized) {
    diagnostics.errors.push("Firebase is not initialized");
    return diagnostics;
  }

  // Check configuration
  try {
    const requiredFields = [
      "apiKey",
      "authDomain",
      "projectId",
      "storageBucket",
      "messagingSenderId",
      "appId",
    ];
    const missing = requiredFields.filter(
      (field) => !firebaseConfig[field as keyof typeof firebaseConfig],
    );

    if (missing.length === 0) {
      diagnostics.configValid = true;
    } else {
      diagnostics.errors.push(`Missing config fields: ${missing.join(", ")}`);
    }
  } catch (error) {
    diagnostics.errors.push(`Config validation error: ${error}`);
  }

  // Check database connection
  if (!status.hasDb || !db) {
    diagnostics.errors.push("Firestore database instance is not available");
    return diagnostics;
  }

  diagnostics.connectionWorking = true;

  // Test read permission
  try {
    const testCollection = collection(db, "test");
    await getDocs(testCollection);
    diagnostics.readPermission = true;
  } catch (error: any) {
    diagnostics.errors.push(`Read test failed: ${error.message}`);
  }

  // Test write permission
  try {
    const testDocRef = doc(db, "test", "diagnostic-test");
    await setDoc(testDocRef, {
      timestamp: new Date(),
      test: true,
    });

    // Clean up test document
    await deleteDoc(testDocRef);
    diagnostics.writePermission = true;
  } catch (error: any) {
    diagnostics.errors.push(`Write test failed: ${error.message}`);
  }

  return diagnostics;
}

export function logFirebaseDiagnostics(diagnostics: FirebaseDiagnostics): void {
  console.group("🔥 Firebase Diagnostics");
  console.log("Configuration Valid:", diagnostics.configValid ? "✅" : "❌");
  console.log(
    "Connection Working:",
    diagnostics.connectionWorking ? "✅" : "❌",
  );
  console.log("Read Permission:", diagnostics.readPermission ? "✅" : "❌");
  console.log("Write Permission:", diagnostics.writePermission ? "✅" : "❌");

  if (diagnostics.errors.length > 0) {
    console.group("❌ Errors:");
    diagnostics.errors.forEach((error) => console.error(error));
    console.groupEnd();
  }

  console.groupEnd();
}

export async function testFirebaseConnection(): Promise<boolean> {
  try {
    const diagnostics = await runFirebaseDiagnostics();
    logFirebaseDiagnostics(diagnostics);

    return (
      diagnostics.configValid &&
      diagnostics.connectionWorking &&
      diagnostics.readPermission &&
      diagnostics.writePermission
    );
  } catch (error) {
    console.error("Firebase diagnostics failed:", error);
    return false;
  }
}
