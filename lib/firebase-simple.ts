// Simplified Firebase configuration focused on basic operations
// This version avoids real-time listeners that cause 400 errors

import { initializeApp, type FirebaseApp } from "firebase/app";
import { getFirestore, type Firestore } from "firebase/firestore";
import { getAuth, type Auth } from "firebase/auth";

// Import config from main file
import { firebaseConfig } from "../firebase-config";

// Simple Firebase services
let simpleApp: FirebaseApp | null = null;
let simpleDb: Firestore | null = null;
let simpleAuth: Auth | null = null;

// Initialize with minimal configuration
const initializeSimpleFirebase = () => {
  try {
    console.log("🔥 Initializing Simple Firebase...");

    // Initialize Firebase App
    simpleApp = initializeApp(firebaseConfig, "simple-app");
    console.log("✅ Simple Firebase App initialized");

    // Initialize Firestore
    simpleDb = getFirestore(simpleApp);
    console.log("✅ Simple Firestore initialized");

    // Initialize Auth
    simpleAuth = getAuth(simpleApp);
    console.log("✅ Simple Firebase Auth initialized");

    return true;
  } catch (error) {
    console.error("❌ Simple Firebase initialization failed:", error);
    return false;
  }
};

// Initialize immediately
const isSimpleFirebaseReady = initializeSimpleFirebase();

export { simpleApp, simpleDb, simpleAuth, isSimpleFirebaseReady };

// Helper to check if simple Firebase is available
export const isSimpleFirebaseAvailable = () => {
  return isSimpleFirebaseReady && simpleDb !== null && simpleAuth !== null;
};
