"use client";

import { Button } from "@/shared/components";
import { useAuth } from "../hooks/useAuth";

export function GoogleSignInButton() {
  const { loginWithGoogle } = useAuth();

  return (
    <Button type="button" variant="secondary" className="w-full" onClick={() => loginWithGoogle()}>
      Continue with Google
    </Button>
  );
}
