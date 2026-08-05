"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "@/auth/hooks/useAuth";
import { RegisterForm } from "@/auth/components/RegisterForm";
import { GoogleSignInButton } from "@/auth/components/GoogleSignInButton";
import { Card } from "@/shared/components";

export default function RegisterPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.replace("/dashboard");
    }
  }, [loading, user, router]);

  if (loading || user) {
    return null;
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 p-8">
      <div className="w-full max-w-sm">
        <Card className="space-y-6">
          <h1 className="text-center text-2xl font-semibold">Create an account</h1>

          <RegisterForm />

          <div className="flex items-center gap-3 text-sm text-zinc-500">
            <span className="h-px flex-1 bg-zinc-200" />
            or
            <span className="h-px flex-1 bg-zinc-200" />
          </div>

          <GoogleSignInButton />

          <p className="text-center text-sm text-zinc-500">
            Already have an account?{" "}
            <Link href="/auth/login" className="font-medium text-zinc-900 underline">
              Sign in
            </Link>
          </p>
        </Card>
      </div>
    </div>
  );
}
