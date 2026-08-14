"use client";

import { useEffect, useState } from "react";
import { BookRepository } from "../data/BookRepository";
import type { Book } from "../types";

function isPermissionDenied(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: unknown }).code === "permission-denied"
  );
}

export function useBook(id: string) {
  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // True when the book doesn't exist or the current user has no membership
  // (neither owner nor participant). Used by BookAccessGuard to redirect.
  const [forbidden, setForbidden] = useState(false);
  const [loadedId, setLoadedId] = useState(id);

  // Reset state synchronously during render instead of in the effect, per
  // https://react.dev/learn/you-might-not-need-an-effect#adjusting-some-state-when-a-prop-changes
  if (id !== loadedId) {
    setLoadedId(id);
    setBook(null);
    setError(null);
    setForbidden(false);
    setLoading(true);
  }

  useEffect(() => {
    BookRepository.getBookById(id)
      .then((result) => {
        if (!result) {
          setForbidden(true);
          return;
        }
        setBook(result);
      })
      .catch((err) => {
        if (isPermissionDenied(err)) {
          setForbidden(true);
        } else {
          setError("Failed to load book.");
        }
      })
      .finally(() => setLoading(false));
  }, [id]);

  return { book, loading, error, forbidden };
}
