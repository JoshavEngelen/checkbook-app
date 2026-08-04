"use client";

import { ReactNode } from "react";
import ThemeProvider from "./ThemeProvider";
import AuthProvider from "./AuthProvider";

interface AppProvidersProps {
  children: ReactNode;
}

export default function AppProviders({ children }: AppProvidersProps) {
  return (
    <ThemeProvider>
      <AuthProvider>{children}</AuthProvider>
    </ThemeProvider>
  );
}
