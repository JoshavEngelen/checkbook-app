"use client";

import { ReactNode } from "react";
import { AuthContextProvider } from "@/auth/context/AuthContext";

interface AuthProviderProps {
  children: ReactNode;
}

export default function AuthProvider({ children }: AuthProviderProps) {
  return <AuthContextProvider>{children}</AuthContextProvider>;
}
