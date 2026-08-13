"use client";

import Link from "next/link";
import { Button } from "@/shared/components";
import type { Book } from "@/domains/books";
import { BookSelectorDropdown } from "./BookSelectorDropdown";
import { BookActionsMenu } from "./BookActionsMenu";

interface BookSelectorProps {
  activeBooks: Book[];
  selectedBook: Book | null;
  onSelect: (bookId: string) => void;
  onCreateBook: () => void;
  onEditBook: (book: Book) => void;
  onArchiveBook: (book: Book) => void;
  loading?: boolean;
  error?: string | null;
  onRetry?: () => void;
}

export function BookSelector({
  activeBooks,
  selectedBook,
  onSelect,
  onCreateBook,
  onEditBook,
  onArchiveBook,
  loading = false,
  error = null,
  onRetry,
}: BookSelectorProps) {
  if (error) {
    return (
      <div className="flex flex-wrap items-center gap-3">
        <span className="text-sm text-red-600">{error}</span>
        {onRetry && (
          <Button variant="secondary" size="sm" onClick={onRetry}>
            Try again
          </Button>
        )}
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex flex-wrap items-center gap-3">
        <div className="h-9 w-36 animate-pulse rounded-lg bg-gray-200" />
        <div className="h-9 w-24 animate-pulse rounded-lg bg-gray-200" />
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <BookSelectorDropdown
        activeBooks={activeBooks}
        selectedBook={selectedBook}
        onSelect={onSelect}
      />
      <BookActionsMenu
        book={selectedBook}
        onEdit={onEditBook}
        onArchive={onArchiveBook}
      />
      <Button variant="secondary" size="sm" onClick={onCreateBook}>
        + New book
      </Button>
      <Link
        href="/books/archived"
        className="text-sm text-gray-500 underline-offset-2 hover:text-gray-700 hover:underline"
      >
        Archived books
      </Link>
    </div>
  );
}
