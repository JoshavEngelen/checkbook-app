"use client";

import Link from "next/link";
import { Card, Button } from "@/shared/components";
import type { Book } from "../../types";

interface BookCardProps {
  book: Book;
  currentUserId: string;
  onEdit: (book: Book) => void;
  onArchive: (book: Book) => void;
  onRestore: (book: Book) => void;
}

export function BookCard({ book, currentUserId, onEdit, onArchive, onRestore }: BookCardProps) {
  const isOwner = book.ownerId === currentUserId;

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
        <div className="flex shrink-0 items-center gap-1.5">
          {/* Role badge — distinguishes owner from participant at a glance */}
          <span
            className={
              isOwner
                ? "rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700"
                : "rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-500"
            }
          >
            {isOwner ? "Owner" : "Participant"}
          </span>
          {book.archived && (
            <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-500">
              Archived
            </span>
          )}
        </div>
      </div>

      <p className="text-xs text-gray-400">
        {book.participants.length} participant
        {book.participants.length !== 1 ? "s" : ""}
      </p>

      {/* Owner-only actions */}
      {isOwner && (
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
      )}
    </Card>
  );
}
