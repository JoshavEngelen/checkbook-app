"use client";

import { useEffect, useState } from "react";
import { BookRepository } from "../data/BookRepository";
import type { Book } from "../types";

export function useBook(id: string) {
  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loadedId, setLoadedId] = useState(id);

  // Reset state synchronously during render instead of in the effect, per
  // https://react.dev/learn/you-might-not-need-an-effect#adjusting-some-state-when-a-prop-changes
  if (id !== loadedId) {
    setLoadedId(id);
    setBook(null);
    setError(null);
    setLoading(true);
  }

  useEffect(() => {
    BookRepository.getBookById(id)
      .then(setBook)
      .catch(() => setError("Failed to load book."))
      .finally(() => setLoading(false));
  }, [id]);

  return { book, loading, error };
}
