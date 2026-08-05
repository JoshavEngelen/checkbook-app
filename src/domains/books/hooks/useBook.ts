"use client";

import { useEffect, useState } from "react";
import { BookRepository } from "../data/BookRepository";
import type { Book } from "../types";

export function useBook(id: string) {
  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    BookRepository.getBook(id)
      .then(setBook)
      .catch(() => setError("Failed to load book."))
      .finally(() => setLoading(false));
  }, [id]);

  return { book, loading, error };
}
