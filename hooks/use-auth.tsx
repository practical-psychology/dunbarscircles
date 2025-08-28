import { useState, useEffect } from "react";
import { onAuthStateChanged, type User } from "firebase/auth";
import { auth } from "../firebase-config";

export interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
}

export function useAuth(): AuthState {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!auth) {
      setLoading(false);
      setError("Firebase Auth is not available");
      return;
    }

    const unsubscribe = onAuthStateChanged(
      auth,
      (user) => {
        setUser(user);
        setLoading(false);
        setError(null);
      },
      (error) => {
        console.error("Auth state change error:", error);
        setError(error.message);
        setLoading(false);
      },
    );

    return () => unsubscribe();
  }, []);

  return {
    user,
    loading,
    error,
    isAuthenticated: !!user,
  };
}

// Hook to get current user ID with error handling
export function useUserId(): string | null {
  const { user, isAuthenticated } = useAuth();
  return isAuthenticated ? user!.uid : null;
}

// Hook to require authentication
export function useRequireAuth(): AuthState & { userId: string } {
  const authState = useAuth();

  if (!authState.loading && !authState.isAuthenticated) {
    throw new Error("Authentication required");
  }

  return {
    ...authState,
    userId: authState.user?.uid || "",
  };
}
