"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/auth/hooks/useAuth";
import { useBooks } from "@/domains/books";
import { Spinner, Modal, EmptyState, Button } from "@/shared/components";
import { BookForm, ArchiveDialog } from "@/domains/books";
import type { Book } from "@/domains/books";
import { CategoryForm } from "@/domains/categories";
import { TransactionForm } from "@/domains/transactions";
import type { Transaction } from "@/domains/transactions";
import type { CreateBookValues } from "@/domains/books/validation";
import type { CreateCategoryValues } from "@/domains/categories/validation";
import type { CreateTransactionValues } from "@/domains/transactions/validation";
import { DashboardHeader } from "./_components/DashboardHeader";
import { BookSelector } from "./_components/BookSelector";
import { BookActions } from "./_components/BookActions";
import { QuickActions } from "./_components/QuickActions";
import { DashboardCategories } from "./_components/DashboardCategories";
import { DashboardRecentTransactions } from "./_components/DashboardRecentTransactions";
import { useSelectedBook } from "./_hooks/useSelectedBook";
import { useDashboardContent } from "./_hooks/useDashboardContent";

// ---------------------------------------------------------------------------

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const {
    books,
    loading: booksLoading,
    createBook,
    updateBook,
    archiveBook,
  } = useBooks();

  const { selectedBook, setSelectedBook, activeBooks, initialized } =
    useSelectedBook(books, booksLoading);

  const {
    categories,
    recentTransactions,
    spentByCategoryId,
    categoryOptions,
    categoriesLoading,
    transactionsLoading,
    createCategory,
    createTransaction,
    updateTransaction,
    deleteTransaction,
  } = useDashboardContent(selectedBook?.id ?? null);

  const [isCreatingBook, setIsCreatingBook] = useState(false);
  const [createBookError, setCreateBookError] = useState<string | null>(null);
  const [editingBook, setEditingBook] = useState<Book | null>(null);
  const [archivingBook, setArchivingBook] = useState<Book | null>(null);
  const [isArchiving, setIsArchiving] = useState(false);
  const [isAddingTransaction, setIsAddingTransaction] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [isAddingCategory, setIsAddingCategory] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/auth/login");
    }
  }, [authLoading, user, router]);

  // Full-page spinner only for auth — everything else uses localized loading states.
  if (authLoading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  async function handleCreateBook(values: CreateBookValues): Promise<void> {
    setCreateBookError(null);
    try {
      const book = await createBook(values);
      setIsCreatingBook(false);
      setSelectedBook(book.id);
    } catch {
      setCreateBookError("Something went wrong. Please try again.");
    }
  }

  function handleCloseCreateBook(): void {
    setIsCreatingBook(false);
    setCreateBookError(null);
  }

  async function handleEditBookSubmit(values: CreateBookValues): Promise<void> {
    if (!editingBook) return;
    await updateBook(editingBook.id, values);
    setEditingBook(null);
  }

  async function handleArchiveConfirm(book: Book): Promise<void> {
    setIsArchiving(true);
    try {
      const nextActive = activeBooks.find((b) => b.id !== book.id) ?? null;
      await archiveBook(book.id);
      setArchivingBook(null);
      if (nextActive) {
        setSelectedBook(nextActive.id);
      }
    } finally {
      setIsArchiving(false);
    }
  }

  async function handleAddTransaction(values: CreateTransactionValues): Promise<void> {
    await createTransaction(values);
    setIsAddingTransaction(false);
  }

  async function handleEditTransaction(values: CreateTransactionValues): Promise<void> {
    if (!editingTransaction) return;
    await updateTransaction(editingTransaction.id, values);
    setEditingTransaction(null);
  }

  async function handleAddCategory(values: CreateCategoryValues): Promise<void> {
    await createCategory(values);
    setIsAddingCategory(false);
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader user={user} />

      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Book selector bar: [ Book ▼ ] [ + New book ] [ Archived books ] */}
        <section aria-labelledby="book-selector-heading" className="mb-6">
          <h2
            id="book-selector-heading"
            className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500"
          >
            Your books
          </h2>
          <BookSelector
            activeBooks={activeBooks}
            selectedBook={selectedBook}
            onSelect={setSelectedBook}
            onCreateBook={() => setIsCreatingBook(true)}
            onEditBook={setEditingBook}
            onArchiveBook={setArchivingBook}
            loading={booksLoading || !initialized}
          />
        </section>

        {/* No active books empty state — only shown after books have loaded */}
        {!booksLoading && initialized && activeBooks.length === 0 ? (
          <div className="rounded-lg border border-dashed border-gray-300 bg-white py-16">
            <EmptyState
              title="Create your first household book"
              description="A book groups your transactions and categories together."
              action={
                <Button onClick={() => setIsCreatingBook(true)}>
                  + Create a book
                </Button>
              }
            />
          </div>
        ) : (
          <>
            {/* Book-specific management links */}
            <div className="mb-8">
              <BookActions selectedBookId={selectedBook?.id ?? null} />
            </div>

            {/* Quick actions */}
            <div className="mb-10">
              <QuickActions
                selectedBookId={selectedBook?.id ?? null}
                onAddTransaction={() => setIsAddingTransaction(true)}
                onAddCategory={() => setIsAddingCategory(true)}
              />
            </div>

            {/* Two-column content at md+ */}
            <div className="grid gap-10 md:grid-cols-2">
              <DashboardCategories
                bookId={selectedBook?.id ?? ""}
                categories={categories}
                spentByCategoryId={spentByCategoryId}
                loading={booksLoading || !initialized || categoriesLoading}
                onAddCategory={() => setIsAddingCategory(true)}
              />
              <DashboardRecentTransactions
                transactions={recentTransactions}
                loading={booksLoading || !initialized || transactionsLoading}
                onAddTransaction={() => setIsAddingTransaction(true)}
                onEdit={setEditingTransaction}
                onDelete={(tx) => deleteTransaction(tx.id)}
              />
            </div>
          </>
        )}
      </div>

      {/* Modals */}
      <Modal open={isCreatingBook} onClose={handleCloseCreateBook}>
        <h2 className="mb-4 text-lg font-semibold">Create book</h2>
        {createBookError && (
          <p role="alert" className="mb-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">
            {createBookError}
          </p>
        )}
        <BookForm
          onSubmit={handleCreateBook}
          onCancel={handleCloseCreateBook}
        />
      </Modal>

      <Modal open={editingBook !== null} onClose={() => setEditingBook(null)}>
        <h2 className="mb-4 text-lg font-semibold">Edit book</h2>
        <BookForm
          initial={editingBook ?? undefined}
          onSubmit={handleEditBookSubmit}
          onCancel={() => setEditingBook(null)}
        />
      </Modal>

      <ArchiveDialog
        book={archivingBook}
        onConfirm={handleArchiveConfirm}
        onCancel={() => setArchivingBook(null)}
        isConfirming={isArchiving}
      />

      <Modal open={isAddingTransaction} onClose={() => setIsAddingTransaction(false)}>
        <h2 className="mb-4 text-lg font-semibold">Add transaction</h2>
        <TransactionForm
          categoryOptions={categoryOptions}
          onSubmit={handleAddTransaction}
          onCancel={() => setIsAddingTransaction(false)}
        />
      </Modal>

      <Modal open={editingTransaction !== null} onClose={() => setEditingTransaction(null)}>
        <h2 className="mb-4 text-lg font-semibold">Edit transaction</h2>
        <TransactionForm
          initial={editingTransaction ?? undefined}
          categoryOptions={categoryOptions}
          onSubmit={handleEditTransaction}
          onCancel={() => setEditingTransaction(null)}
        />
      </Modal>

      <Modal open={isAddingCategory} onClose={() => setIsAddingCategory(false)}>
        <h2 className="mb-4 text-lg font-semibold">Add category</h2>
        <CategoryForm
          onSubmit={handleAddCategory}
          onCancel={() => setIsAddingCategory(false)}
        />
      </Modal>
    </div>
  );
}
