"use client";

import Link from "next/link";
import { Card, Button } from "@/shared/components";
import type { Book } from "../../types";

interface BookCardProps {
  book: Book;
  onEdit: (book: Book) => void;
  onArchive: (book: Book) => void;
  onRestore: (book: Book) => void;
}

export function BookCard({ book, onEdit, onArchive, onRestore }: BookCardProps) {
  return (
    <Card className="flex flex-col gap-3">
      <div className="flex items-start justify-between gap-2">
        <Link href={`/books/${book.id}`} className="group flex flex-col gap-0.5">
          <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 group-hover:underline">
            {book.name}
          </h3>
          {book.description && (
            <p className="text-sm text-gray-500">{book.description}</p>
          )}
        </Link>
        {book.archived && (
          <span className="shrink-0 rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-500">
            Archived
          </span>
        )}
      </div>

      <p className="text-xs text-gray-400">
        {book.participants.length} participant
        {book.participants.length !== 1 ? "s" : ""}
      </p>

      <div className="flex gap-2">
        <Button size="sm" variant="secondary" onClick={() => onEdit(book)}>
          Edit
        </Button>
        {book.archived ? (
          <Button size="sm" variant="ghost" onClick={() => onRestore(book)}>
            Restore
          </Button>
        ) : (
          <Button size="sm" variant="ghost" onClick={() => onArchive(book)}>
            Archive
          </Button>
        )}
      </div>
    </Card>
  );
}
