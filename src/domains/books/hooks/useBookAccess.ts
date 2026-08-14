"use client";

import { useAuth } from "@/auth/hooks/useAuth";
import { useBook } from "./useBook";
import { getBookAccess } from "../operations/getBookAccess";
import type { BookAccess } from "../types";

export type UseBookAccessResult = {
  book: ReturnType<typeof useBook>["book"];
  access: BookAccess;
  isOwner: boolean;
  isMember: boolean;
  loading: boolean;
  error: string | null;
  forbidden: boolean;
};

/**
 * Combines `useBook` and `useAuth` with the pure `getBookAccess` operation
 * to expose the current user's access level for a given book.
 *
 * Components should use `isOwner` to gate owner-only actions and `isMember`
 * to gate any access at all. Security Rules enforce the authoritative check;
 * this is for UI differentiation only.
 */
export function useBookAccess(bookId: string): UseBookAccessResult {
  const { user } = useAuth();
  const { book, loading, error, forbidden } = useBook(bookId);

  const access: BookAccess =
    book && user ? getBookAccess(book, user.uid) : "none";

  return {
    book,
    access,
    isOwner: access === "owner",
    isMember: access === "owner" || access === "participant",
    loading,
    error,
    forbidden,
  };
}
