"use client";

import { Suspense, useState } from "react";
import { useBooks, BookList, BookForm, ArchiveDialog } from "@/domains/books";
import type { Book } from "@/domains/books";
import { Button, Modal, Spinner } from "@/shared/components";
import type { CreateBookValues } from "@/domains/books/validation";
import { AccessDeniedNotice } from "./_components/AccessDeniedNotice";

export default function BooksPage() {
  const { books, loading, createBook, updateBook, archiveBook, restoreBook } =
    useBooks();

  const [editingBook, setEditingBook] = useState<Book | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [archivingBook, setArchivingBook] = useState<Book | null>(null);

  async function handleCreate(values: CreateBookValues) {
    await createBook(values);
    setIsCreating(false);
  }

  async function handleEdit(values: CreateBookValues) {
    if (!editingBook) return;
    await updateBook(editingBook.id, values);
    setEditingBook(null);
  }

  async function handleArchiveConfirm(book: Book) {
    await archiveBook(book.id);
    setArchivingBook(null);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <main className="mx-auto max-w-5xl p-6">
      <Suspense fallback={null}>
        <AccessDeniedNotice />
      </Suspense>

      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Books</h1>
        <Button onClick={() => setIsCreating(true)}>New book</Button>
      </div>

      <BookList
        books={books}
        onEdit={setEditingBook}
        onArchive={setArchivingBook}
        onRestore={(book) => restoreBook(book.id)}
      />

      <Modal open={isCreating} onClose={() => setIsCreating(false)}>
        <h2 className="mb-4 text-lg font-semibold">Create book</h2>
        <BookForm onSubmit={handleCreate} onCancel={() => setIsCreating(false)} />
      </Modal>

      <Modal open={editingBook !== null} onClose={() => setEditingBook(null)}>
        <h2 className="mb-4 text-lg font-semibold">Edit book</h2>
        <BookForm
          initial={editingBook ?? undefined}
          onSubmit={handleEdit}
          onCancel={() => setEditingBook(null)}
        />
      </Modal>

      <ArchiveDialog
        book={archivingBook}
        onConfirm={handleArchiveConfirm}
        onCancel={() => setArchivingBook(null)}
      />
    </main>
  );
}
