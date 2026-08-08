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
import type { Category } from "@/domains/categories";
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

// ---------------------------------------------------------------------------
// Placeholder data — categories and transactions will be wired to Firebase
// in a later step. Only books are live at this stage.
// ---------------------------------------------------------------------------

const MOCK_CATEGORIES: Category[] = [
  { id: "cat-1", bookId: "book-1", name: "Groceries", budget: 400 },
  { id: "cat-2", bookId: "book-1", name: "Utilities", budget: 200 },
  { id: "cat-3", bookId: "book-1", name: "Dining out", budget: 150 },
];

const MOCK_TRANSACTIONS: Transaction[] = [
  {
    id: "tx-1",
    bookId: "book-1",
    title: "Supermarket run",
    amount: 87.5,
    type: "expense",
    categoryId: "cat-1",
    date: new Date(2026, 7, 7),
  },
  {
    id: "tx-2",
    bookId: "book-1",
    title: "Electricity bill",
    amount: 64.0,
    type: "expense",
    categoryId: "cat-2",
    date: new Date(2026, 7, 6),
  },
  {
    id: "tx-3",
    bookId: "book-1",
    title: "Salary",
    amount: 2400.0,
    type: "income",
    date: new Date(2026, 7, 1),
  },
  {
    id: "tx-4",
    bookId: "book-1",
    title: "Restaurant dinner",
    amount: 45.0,
    type: "expense",
    categoryId: "cat-3",
    date: new Date(2026, 7, 5),
  },
  {
    id: "tx-5",
    bookId: "book-1",
    title: "Coffee & pastry",
    amount: 12.5,
    type: "expense",
    categoryId: "cat-3",
    date: new Date(2026, 7, 4),
  },
];

const MOCK_SPENT: Record<string, number> = {
  "cat-1": 87.5,
  "cat-2": 64.0,
  "cat-3": 57.5,
};

const RECENT_TRANSACTION_LIMIT = 5;

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

  const [isCreatingBook, setIsCreatingBook] = useState(false);
  const [createBookError, setCreateBookError] = useState<string | null>(null);
  const [editingBook, setEditingBook] = useState<Book | null>(null);
  const [archivingBook, setArchivingBook] = useState<Book | null>(null);
  const [isAddingTransaction, setIsAddingTransaction] = useState(false);
  const [isAddingCategory, setIsAddingCategory] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/auth/login");
    }
  }, [authLoading, user, router]);

  if (authLoading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  // Show a loading spinner while books are being fetched on first load.
  if (booksLoading || !initialized) {
    return (
      <div className="min-h-screen bg-gray-50">
        <DashboardHeader user={user} />
        <div className="flex items-center justify-center py-24">
          <Spinner size="lg" />
        </div>
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
    // Capture the next active book before the archive changes activeBooks.
    const nextActive = activeBooks.find((b) => b.id !== book.id) ?? null;
    await archiveBook(book.id);
    setArchivingBook(null);
    // Keep localStorage in sync with the auto-fallback selection.
    if (nextActive) {
      setSelectedBook(nextActive.id);
    }
  }

  // Placeholder handlers — no-ops until categories/transactions are wired up.
  async function handleAddTransaction(_values: CreateTransactionValues): Promise<void> {
    setIsAddingTransaction(false);
  }

  async function handleAddCategory(_values: CreateCategoryValues): Promise<void> {
    setIsAddingCategory(false);
  }

  const recentTransactions = MOCK_TRANSACTIONS.slice(0, RECENT_TRANSACTION_LIMIT);

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
          />
        </section>

        {/* No active books empty state */}
        {activeBooks.length === 0 ? (
          <div className="rounded-lg border border-dashed border-gray-300 bg-white py-16">
            <EmptyState
              title="No active books"
              description="Create your first checkbook to start tracking your finances."
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
                categories={MOCK_CATEGORIES}
                spentByCategoryId={MOCK_SPENT}
              />
              <DashboardRecentTransactions transactions={recentTransactions} />
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
      />

      <Modal open={isAddingTransaction} onClose={() => setIsAddingTransaction(false)}>
        <h2 className="mb-4 text-lg font-semibold">Add transaction</h2>
        <TransactionForm
          onSubmit={handleAddTransaction}
          onCancel={() => setIsAddingTransaction(false)}
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
