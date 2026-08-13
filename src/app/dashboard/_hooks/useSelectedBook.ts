"use client";

import { useEffect, useState } from "react";
import type { Book } from "@/domains/books";

const STORAGE_KEY = "dashboard:selectedBookId";

/**
 * Manages which active book is currently selected on the dashboard.
 *
 * Selection priority on first load:
 *  1. The previously persisted book id (if it is still an active book).
 *  2. The first active book.
 *  3. null — when no active books exist.
 *
 * The selected book id is persisted to localStorage so a page refresh
 * does not unnecessarily reset the selection.
 */
export function useSelectedBook(books: Book[], loading: boolean) {
  const [selectedBookId, setSelectedBookIdState] = useState<string | null>(null);
  const [initialized, setInitialized] = useState(false);

  // Run once when books have finished loading.
  useEffect(() => {
    if (loading || initialized) return;

    const activeBooks = books.filter((b) => !b.archived);
    const stored =
      typeof window !== "undefined" ? localStorage.getItem(STORAGE_KEY) : null;
    const candidate = stored ? activeBooks.find((b) => b.id === stored) : null;
    setSelectedBookIdState(candidate?.id ?? activeBooks[0]?.id ?? null);
    setInitialized(true);
  }, [loading, initialized, books]);

  function setSelectedBook(id: string): void {
    setSelectedBookIdState(id);
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, id);
    }
  }

  const activeBooks = books.filter((b) => !b.archived);

  // If the selected book was archived mid-session, fall back to the first active one.
  const selectedBook =
    activeBooks.find((b) => b.id === selectedBookId) ??
    activeBooks[0] ??
    null;

  return { selectedBook, setSelectedBook, activeBooks, initialized };
}
