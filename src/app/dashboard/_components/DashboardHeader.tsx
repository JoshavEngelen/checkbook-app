"use client";

import { LogoutButton } from "@/auth/components/LogoutButton";
import type { AuthUser } from "@/auth";

interface DashboardHeaderProps {
  user: AuthUser;
}

export function DashboardHeader({ user }: DashboardHeaderProps) {
  const greeting = user.displayName ?? user.email ?? "there";

  return (
    <header className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-200 bg-white px-6 py-4">
      <div className="flex flex-col gap-0.5">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500">Welcome back, {greeting}</p>
      </div>
      <LogoutButton />
    </header>
  );
}
