import {
  GoogleAuthProvider,
  signInWithPopup,
  signOut as firebaseSignOut,
  getAuth,
  type UserCredential,
  type User,
} from "firebase/auth";
import { app as firebaseApp } from "@/firebase-config";

// Initialize Firebase Auth
const auth = getAuth(firebaseApp);

export async function signInWithGoogle(): Promise<UserCredential> {
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
