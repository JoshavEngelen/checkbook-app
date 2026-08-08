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
}

export function BookSelector({
  activeBooks,
  selectedBook,
  onSelect,
  onCreateBook,
  onEditBook,
  onArchiveBook,
}: BookSelectorProps) {
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
