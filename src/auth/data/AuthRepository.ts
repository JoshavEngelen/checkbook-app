import {
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  type User,
} from "firebase/auth";
import { auth } from "@/infrastructure/firebase/auth";
import type { AuthUser, EmailCredentials } from "../types";

function toAuthUser(user: User | null): AuthUser | null {
  if (!user) {
    return null;
  }

  return {
    uid: user.uid,
    email: user.email,
    displayName: user.displayName,
    photoURL: user.photoURL,
  };
}

export const AuthRepository = {
  onAuthStateChanged(callback: (user: AuthUser | null) => void) {
    return onAuthStateChanged(auth, (user) => callback(toAuthUser(user)));
  },

  async loginWithGoogle(): Promise<AuthUser | null> {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    return toAuthUser(result.user);
  },

  async loginWithEmail({ email, password }: EmailCredentials): Promise<AuthUser | null> {
    const result = await signInWithEmailAndPassword(auth, email, password);
    return toAuthUser(result.user);
  },

  async registerWithEmail({ email, password }: EmailCredentials): Promise<AuthUser | null> {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    return toAuthUser(result.user);
  },

  async logout(): Promise<void> {
    await signOut(auth);
  },
};
