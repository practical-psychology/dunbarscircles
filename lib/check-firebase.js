#!/usr/bin/env node

/**
 * Firebase Configuration Checker
 *
 * This script helps diagnose Firebase configuration issues
 */

import fs from "fs";
import path from "path";

console.log("🔥 Firebase Configuration Checker\n");

// Vite reads .env.local (gitignored) first; .env is the fallback.
const envPath =
  [".env.local", ".env"]
    .map((f) => path.join(process.cwd(), f))
    .find((f) => fs.existsSync(f)) ?? path.join(process.cwd(), ".env.local");
if (!fs.existsSync(envPath)) {
  console.error("❌ .env.local file not found (copy .env.example)");
  console.log(
    "   Copy .env.example to .env.local and fill in the Firebase web app config",
  );
  process.exit(1);
}

// Read .env file
const envContent = fs.readFileSync(envPath, "utf8");
const envLines = envContent
  .split("\n")
  .filter((line) => line.trim() && !line.startsWith("#"));

console.log("📄 Environment file found");
console.log(`   Location: ${envPath}`);
console.log(`   Lines: ${envLines.length}\n`);

// Required Firebase environment variables
const requiredVars = [
  "VITE_FIREBASE_API_KEY",
  "VITE_FIREBASE_AUTH_DOMAIN",
  "VITE_FIREBASE_PROJECT_ID",
  "VITE_FIREBASE_STORAGE_BUCKET",
  "VITE_FIREBASE_MESSAGING_SENDER_ID",
  "VITE_FIREBASE_APP_ID",
];

const optionalVars = ["VITE_FIREBASE_MEASUREMENT_ID"];

// Parse environment variables
const envVars = {};
envLines.forEach((line) => {
  const [key, ...valueParts] = line.split("=");
  if (key && valueParts.length > 0) {
    envVars[key.trim()] = valueParts.join("=").trim();
  }
});

console.log("🔍 Checking required Firebase variables:\n");

let allRequiredPresent = true;
requiredVars.forEach((varName) => {
  const value = envVars[varName];
  if (value && value.length > 0) {
    console.log(`   ✅ ${varName}: Set (${value.length} characters)`);
  } else {
    console.log(`   ❌ ${varName}: Missing or empty`);
    allRequiredPresent = false;
  }
});

console.log("\n🔍 Checking optional Firebase variables:\n");

optionalVars.forEach((varName) => {
  const value = envVars[varName];
  if (value && value.length > 0) {
    console.log(`   ✅ ${varName}: Set (${value.length} characters)`);
  } else {
    console.log(`   ⚠️  ${varName}: Not set (optional)`);
  }
});

// Check Firebase project configuration
console.log("\n🔍 Firebase project validation:\n");

const projectId = envVars["VITE_FIREBASE_PROJECT_ID"];
const authDomain = envVars["VITE_FIREBASE_AUTH_DOMAIN"];
const storageBucket = envVars["VITE_FIREBASE_STORAGE_BUCKET"];

if (projectId) {
  console.log(`   📋 Project ID: ${projectId}`);

  // Check if auth domain matches project ID
  if (authDomain && authDomain === `${projectId}.firebaseapp.com`) {
    console.log("   ✅ Auth domain matches project ID");
  } else if (authDomain) {
    console.log(
      `   ⚠️  Auth domain (${authDomain}) doesn't match expected pattern`,
    );
  }

  // Check if storage bucket matches project ID
  if (storageBucket && storageBucket === `${projectId}.firebasestorage.app`) {
    console.log("   ✅ Storage bucket matches project ID");
  } else if (storageBucket && storageBucket === `${projectId}.appspot.com`) {
    console.log("   ✅ Storage bucket uses legacy appspot.com domain");
  } else if (storageBucket) {
    console.log(
      `   ⚠️  Storage bucket (${storageBucket}) doesn't match expected pattern`,
    );
  }
}

// Check firebase.json
const firebaseJsonPath = path.join(process.cwd(), "firebase.json");
if (fs.existsSync(firebaseJsonPath)) {
  console.log("\n📄 Firebase configuration file found");
  try {
    const firebaseConfig = JSON.parse(
      fs.readFileSync(firebaseJsonPath, "utf8"),
    );
    if (firebaseConfig.firestore) {
      console.log("   ✅ Firestore configuration present");
    }
    if (firebaseConfig.hosting) {
      console.log("   ✅ Hosting configuration present");
    }
  } catch (error) {
    console.log("   ❌ Error parsing firebase.json:", error.message);
  }
} else {
  console.log("\n⚠️  firebase.json not found (optional for client-only apps)");
}

// Summary
console.log("\n📊 Summary:\n");

if (allRequiredPresent) {
  console.log("   ✅ All required Firebase variables are set");
  console.log("   🚀 Your Firebase configuration appears to be complete");
  console.log("\n💡 If you're still experiencing issues:");
  console.log("   1. Check the Firebase console for your project status");
  console.log("   2. Verify Firestore security rules allow your operations");
  console.log("   3. Ensure billing is enabled if using paid features");
  console.log("   4. Check browser console for detailed error messages");
} else {
  console.log("   ❌ Some required Firebase variables are missing");
  console.log("   🔧 Please add the missing variables to your .env file");
  console.log("\n📖 Get your Firebase config from:");
  console.log(
    "   https://console.firebase.google.com/project/YOUR_PROJECT/settings/general",
  );
}

console.log("\n🔗 Useful links:");
console.log("   Firebase Console: https://console.firebase.google.com/");
console.log("   Firebase Documentation: https://firebase.google.com/docs");
console.log(
  "   Firestore Security Rules: https://firebase.google.com/docs/firestore/security/get-started",
);
