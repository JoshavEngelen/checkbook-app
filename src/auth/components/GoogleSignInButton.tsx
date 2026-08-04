"use client";

import { useAuth } from "../hooks/useAuth";

export function GoogleSignInButton() {
  const { loginWithGoogle } = useAuth();

  return (
    <button type="button" onClick={() => loginWithGoogle()}>
      Continue with Google
    </button>
  );
}
