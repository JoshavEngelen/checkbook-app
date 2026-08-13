"use client";

import { useState, useMemo } from "react";
import { useTransactions, TransactionList, TransactionForm } from "@/domains/transactions";
import { TransactionFilters as FiltersComponent } from "@/domains/transactions";
import type { TransactionFiltersState } from "@/domains/transactions";
import type { Transaction } from "@/domains/transactions";
import { useCategories } from "@/domains/categories";
import { Button, Modal, Spinner } from "@/shared/components";
import type { CreateTransactionValues } from "@/domains/transactions/validation";

const now = new Date();
const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

export function TransactionsContent({
  bookId,
  initialCategoryId,
}: {
  bookId: string;
  initialCategoryId?: string;
}) {
  const { transactions, loading, createTransaction, updateTransaction, deleteTransaction } =
    useTransactions(bookId);
  const { categories } = useCategories(bookId);

  const [filters, setFilters] = useState<TransactionFiltersState>({
    month: currentMonth,
    type: "all",
  });
  const [activeCategoryId, setActiveCategoryId] = useState<string | undefined>(
    initialCategoryId
  );
  const [isCreating, setIsCreating] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

  const categoryOptions = categories.map((c) => ({ value: c.id, label: c.name }));
  const activeCategory = activeCategoryId
    ? categories.find((c) => c.id === activeCategoryId)
    : undefined;

  const filtered = useMemo(
    () =>
      transactions.filter((tx) => {
        const year = tx.date.getFullYear();
        const month = String(tx.date.getMonth() + 1).padStart(2, "0");
        const txMonth = `${year}-${month}`;
        return (
          txMonth === filters.month &&
          (filters.type === "all" || tx.type === filters.type) &&
          (!activeCategoryId || tx.categoryId === activeCategoryId)
        );
      }),
    [transactions, filters, activeCategoryId]
  );

  async function handleCreate(values: CreateTransactionValues) {
    await createTransaction(values);
    setIsCreating(false);
  }

  async function handleEdit(values: CreateTransactionValues) {
    if (!editingTransaction) return;
    await updateTransaction(editingTransaction.id, values);
    setEditingTransaction(null);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Transactions</h1>
        <Button onClick={() => setIsCreating(true)}>New transaction</Button>
      </div>

      <div className="mb-4 flex flex-wrap items-end gap-3">
        <FiltersComponent filters={filters} onChange={setFilters} />
        {activeCategory && (
          <div className="flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1.5 text-sm text-blue-700">
            <span>{activeCategory.name}</span>
            <button
              type="button"
              onClick={() => setActiveCategoryId(undefined)}
              aria-label={`Remove category filter: ${activeCategory.name}`}
              className="ml-0.5 rounded-full p-0.5 hover:bg-blue-100"
            >
              ×
            </button>
          </div>
        )}
      </div>

      <TransactionList
        transactions={filtered}
        onEdit={setEditingTransaction}
        onDelete={(tx) => deleteTransaction(tx.id)}
      />

      <Modal open={isCreating} onClose={() => setIsCreating(false)}>
        <h2 className="mb-4 text-lg font-semibold">New transaction</h2>
        <TransactionForm
          categoryOptions={categoryOptions}
          onSubmit={handleCreate}
          onCancel={() => setIsCreating(false)}
        />
      </Modal>

      <Modal open={editingTransaction !== null} onClose={() => setEditingTransaction(null)}>
        <h2 className="mb-4 text-lg font-semibold">Edit transaction</h2>
        <TransactionForm
          initial={editingTransaction ?? undefined}
          categoryOptions={categoryOptions}
          onSubmit={handleEdit}
          onCancel={() => setEditingTransaction(null)}
        />
      </Modal>
    </>
  );
}
