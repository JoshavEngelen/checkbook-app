"use client";

import Link from "next/link";
import { useBooks, BookList } from "@/domains/books";
import { useAuth } from "@/auth/hooks/useAuth";
import { EmptyState, Spinner } from "@/shared/components";

export default function ArchivedBooksPage() {
  const { books, loading, restoreBook } = useBooks();
  const { user } = useAuth();

  const archivedBooks = books.filter((b) => b.archived);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <main className="mx-auto max-w-5xl p-6">
      <div className="mb-6">
        <Link
          href="/dashboard"
          className="mb-4 inline-flex items-center gap-1 text-sm text-gray-400 hover:text-gray-700"
        >
          ← Back to dashboard
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Archived books</h1>
        <p className="mt-1 text-sm text-gray-500">
          Restore a book to make it active again.
        </p>
      </div>

      {archivedBooks.length === 0 ? (
        <EmptyState
          title="No archived books"
          description="Books you archive from the books page will appear here."
        />
      ) : (
        <BookList
          books={archivedBooks}
          currentUserId={user?.uid ?? ""}
          onEdit={() => {}}
          onArchive={() => {}}
          onRestore={(book) => restoreBook(book.id)}
        />
      )}
    </main>
  );
}
