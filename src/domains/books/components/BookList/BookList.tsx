"use client";

import { EmptyState } from "@/shared/components";
import { BookCard } from "../BookCard/BookCard";
import type { Book } from "../../types";

interface BookListProps {
  books: Book[];
  currentUserId: string;
  onEdit: (book: Book) => void;
  onArchive: (book: Book) => void;
  onRestore: (book: Book) => void;
}

export function BookList({ books, currentUserId, onEdit, onArchive, onRestore }: BookListProps) {
  if (books.length === 0) {
    return (
      <EmptyState
        title="No books yet"
        description="Create your first checkbook to get started."
      />
    );
  }

  return (
    <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {books.map((book) => (
        <li key={book.id}>
          <BookCard
            book={book}
            currentUserId={currentUserId}
            onEdit={onEdit}
            onArchive={onArchive}
            onRestore={onRestore}
          />
        </li>
      ))}
    </ul>
  );
}
