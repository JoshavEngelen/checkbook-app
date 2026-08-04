"use client";

import { createContext, ReactNode, useEffect, useState } from "react";
import { AuthRepository } from "../data/AuthRepository";
import type { AuthUser, EmailCredentials } from "../types";

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  loginWithGoogle: () => Promise<void>;
  loginWithEmail: (credentials: EmailCredentials) => Promise<void>;
  registerWithEmail: (credentials: EmailCredentials) => Promise<void>;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);

interface AuthContextProviderProps {
  children: ReactNode;
}

export function AuthContextProvider({ children }: AuthContextProviderProps) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = AuthRepository.onAuthStateChanged((nextUser) => {
      setUser(nextUser);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value: AuthContextValue = {
    user,
    loading,
    loginWithGoogle: async () => {
      await AuthRepository.loginWithGoogle();
    },
    loginWithEmail: async (credentials) => {
      await AuthRepository.loginWithEmail(credentials);
    },
    registerWithEmail: async (credentials) => {
      await AuthRepository.registerWithEmail(credentials);
    },
    logout: async () => {
      await AuthRepository.logout();
    },
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
