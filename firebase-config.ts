// Firebase configuration
export const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

// Initialize Firebase
import { initializeApp, type FirebaseApp } from "firebase/app";
import type { Analytics } from "firebase/analytics";
import { getFirestore, type Firestore } from "firebase/firestore";
import { getAuth, type Auth } from "firebase/auth";

// Validate configuration
const validateConfig = () => {
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

  if (missing.length > 0) {
    console.error("Missing Firebase configuration fields:", missing);
    return false;
  }
  return true;
};

// Initialize Firebase services
let app: FirebaseApp | null = null;
let analytics: Analytics | null = null;
let db: Firestore | null = null;
let auth: Auth | null = null;

// Track initialization status
let initializationError: Error | null = null;
let isInitialized = false;

const initializeFirebase = () => {
  try {
    if (!validateConfig()) {
      throw new Error("Firebase configuration validation failed");
    }

    console.log("🔥 Initializing Firebase...");

    // Initialize Firebase App
    app = initializeApp(firebaseConfig);
    console.log("✅ Firebase App initialized");

    // Initialize Firestore with error handling
    try {
      db = getFirestore(app);
      console.log("✅ Firestore initialized");
    } catch (firestoreError) {
      console.error("❌ Failed to initialize Firestore:", firestoreError);
      db = null;
    }

    // Initialize Auth with error handling
    try {
      auth = getAuth(app);
      console.log("✅ Firebase Auth initialized");
    } catch (authError) {
      console.error("❌ Failed to initialize Auth:", authError);
      auth = null;
    }

    // Analytics is initialised lazily and only after consent (see lib/analytics.ts)

    isInitialized = true;
    console.log("🚀 Firebase initialization complete");
  } catch (error) {
    console.error("💥 Firebase initialization failed:", error);
    initializationError =
      error instanceof Error ? error : new Error(String(error));
    isInitialized = false;
  }
};

// Initialize Firebase immediately
initializeFirebase();

// Export Firebase services and utilities
export { app, analytics, db, auth, isInitialized, initializationError };

// Export helper functions
export const getFirebaseStatus = () => ({
  isInitialized,
  hasApp: app !== null,
  hasDb: db !== null,
  hasAuth: auth !== null,
  hasAnalytics: analytics !== null,
  error: initializationError,
});

export const reinitializeFirebase = () => {
  console.log("🔄 Reinitializing Firebase...");
  initializationError = null;
  isInitialized = false;
  initializeFirebase();
};
