import {
  GoogleAuthProvider,
  signInWithPopup,
  signOut as firebaseSignOut,
  type UserCredential,
  type User,
} from "firebase/auth";
import { auth } from "@/firebase-config";

export async function signInWithGoogle(): Promise<UserCredential> {
  if (!auth) {
    throw new Error("Firebase Auth is not initialized");
  }

  const provider = new GoogleAuthProvider();
  // Add any additional scopes here if needed
  // provider.addScope('https://www.googleapis.com/auth/userinfo.email');

  try {
    return await signInWithPopup(auth, provider);
  } catch (error) {
    console.error("Error signing in with Google", error);
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

export function getUserDisplayName(user: User | null): string {
  if (!user) return "";
  return user.displayName || user.email?.split("@")[0] || "User";
}
