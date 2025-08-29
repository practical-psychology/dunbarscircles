import {
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signOut as firebaseSignOut,
  type UserCredential,
  type User,
} from "firebase/auth";
import { auth } from "../firebase-config";

export async function signInWithGoogle(): Promise<UserCredential> {
  if (!auth) {
    throw new Error("Firebase Auth is not initialized");
  }

  const provider = new GoogleAuthProvider();

  // Configure provider for better UX
  provider.setCustomParameters({
    prompt: "select_account",
  });

  // Add any additional scopes here if needed
  // provider.addScope('https://www.googleapis.com/auth/userinfo.email');

  try {
    return await signInWithPopup(auth, provider);
  } catch (error: any) {
    console.error("Error signing in with Google", error);

    // Handle specific Firebase Auth errors
    if (error.code === "auth/popup-closed-by-user") {
      throw new Error("Sign-in was cancelled. Please try again.");
    } else if (error.code === "auth/popup-blocked") {
      throw new Error(
        "Popup was blocked by your browser. Please allow popups for this site and try again.",
      );
    } else if (error.code === "auth/cancelled-popup-request") {
      throw new Error(
        "Another sign-in popup is already open. Please complete that first.",
      );
    } else if (error.code === "auth/network-request-failed") {
      throw new Error(
        "Network error. Please check your internet connection and try again.",
      );
    } else if (error.code === "auth/too-many-requests") {
      throw new Error("Too many failed attempts. Please try again later.");
    }

    throw error;
  }
}

export async function signOut(): Promise<void> {
  if (!auth) {
    throw new Error("Firebase Auth is not initialized");
  }

  try {
    await firebaseSignOut(auth);
  } catch (error) {
    console.error("Error signing out", error);
    throw error;
  }
}

export async function signInWithGoogleRedirect(): Promise<void> {
  if (!auth) {
    throw new Error("Firebase Auth is not initialized");
  }

  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({
    prompt: "select_account",
  });

  try {
    await signInWithRedirect(auth, provider);
  } catch (error) {
    console.error("Error initiating Google redirect sign-in", error);
    throw error;
  }
}

export async function handleRedirectResult(): Promise<UserCredential | null> {
  if (!auth) {
    throw new Error("Firebase Auth is not initialized");
  }

  try {
    return await getRedirectResult(auth);
  } catch (error) {
    console.error("Error handling redirect result", error);
    throw error;
  }
}

export function getUserDisplayName(user: User | null): string {
  if (!user) return "";
  return user.displayName || user.email?.split("@")[0] || "User";
}
