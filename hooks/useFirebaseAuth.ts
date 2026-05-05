"use client";

import { useEffect, useMemo, useState } from "react";
import {
  GoogleAuthProvider,
  browserLocalPersistence,
  onAuthStateChanged,
  setPersistence,
  signInWithPopup,
  signOut,
  type User
} from "firebase/auth";
import { firebaseAuth } from "@/lib/firebase";

export type FirebaseAuthState = {
  user: User | null;
  isLoading: boolean;
  error: string;
  signInWithGoogle: () => Promise<void>;
  signOutUser: () => Promise<void>;
};

let cachedUser: User | null = null;
let hasResolvedAuthState = false;

export function useFirebaseAuth(): FirebaseAuthState {
  const [user, setUser] = useState<User | null>(
    () => cachedUser ?? firebaseAuth.currentUser
  );
  const [isLoading, setIsLoading] = useState(
    () => !hasResolvedAuthState && !firebaseAuth.currentUser
  );
  const [error, setError] = useState("");
  const provider = useMemo(() => {
    const googleProvider = new GoogleAuthProvider();
    googleProvider.setCustomParameters({ prompt: "select_account" });
    return googleProvider;
  }, []);

  useEffect(() => {
    const loadingFallback = window.setTimeout(() => {
      setIsLoading(false);
    }, 1500);

    const unsubscribe = onAuthStateChanged(firebaseAuth, (nextUser) => {
      window.clearTimeout(loadingFallback);
      cachedUser = nextUser;
      hasResolvedAuthState = true;
      setUser(nextUser);
      setIsLoading(false);
    });

    return () => {
      window.clearTimeout(loadingFallback);
      unsubscribe();
    };
  }, []);

  async function signInWithGoogle() {
    setError("");
    setIsLoading(true);

    try {
      await setPersistence(firebaseAuth, browserLocalPersistence);
      await signInWithPopup(firebaseAuth, provider);
      cachedUser = firebaseAuth.currentUser;
      hasResolvedAuthState = true;
    } catch (signInError) {
      setError(firebaseAuthErrorMessage(signInError));
    } finally {
      setIsLoading(false);
    }
  }

  async function signOutUser() {
    setError("");
    await signOut(firebaseAuth);
    cachedUser = null;
    hasResolvedAuthState = true;
  }

  return {
    user,
    isLoading,
    error,
    signInWithGoogle,
    signOutUser
  };
}

function firebaseAuthErrorMessage(error: unknown) {
  if (error instanceof Error && error.message) {
    return `Google 로그인 실패: ${error.message}`;
  }

  return "Google 로그인에 실패했습니다.";
}
