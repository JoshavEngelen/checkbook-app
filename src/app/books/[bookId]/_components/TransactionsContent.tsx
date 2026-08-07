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

export function TransactionsContent({ bookId }: { bookId: string }) {
  const { transactions, loading, createTransaction, updateTransaction, deleteTransaction } =
    useTransactions(bookId);
  const { categories } = useCategories(bookId);

  const [filters, setFilters] = useState<TransactionFiltersState>({
    month: currentMonth,
    type: "all",
  });
  const [isCreating, setIsCreating] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

  const categoryOptions = categories.map((c) => ({ value: c.id, label: c.name }));

  const filtered = useMemo(
    () =>
      transactions.filter((tx) => {
        const year = tx.date.getFullYear();
        const month = String(tx.date.getMonth() + 1).padStart(2, "0");
        const txMonth = `${year}-${month}`;
        return (
          txMonth === filters.month &&
          (filters.type === "all" || tx.type === filters.type)
        );
      }),
    [transactions, filters]
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

      <div className="mb-4">
        <FiltersComponent filters={filters} onChange={setFilters} />
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
