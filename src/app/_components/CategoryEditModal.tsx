"use client";

import { useMemo, useState } from "react";
import clsx from "clsx";
import { Modal } from "@/shared/components";
import { CategoryForm } from "@/domains/categories";
import { TransactionForm } from "@/domains/transactions";
import type { Category } from "@/domains/categories";
import type { Transaction } from "@/domains/transactions";
import type { CreateCategoryValues } from "@/domains/categories/validation";
import type { CreateTransactionValues } from "@/domains/transactions/validation";

interface CategoryEditModalProps {
  category: Category | null;
  onClose: () => void;
  onUpdateCategory: (values: CreateCategoryValues) => Promise<void>;
  /** All transactions for the book — filtered to category internally */
  transactions: Transaction[];
  categoryOptions: { value: string; label: string }[];
  onUpdateTransaction: (id: string, values: CreateTransactionValues) => Promise<void>;
  onDeleteTransaction: (id: string) => void;
}

export function CategoryEditModal({
  category,
  onClose,
  onUpdateCategory,
  transactions,
  categoryOptions,
  onUpdateTransaction,
  onDeleteTransaction,
}: CategoryEditModalProps) {
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

  const categoryTransactions = useMemo(
    () => (category ? transactions.filter((tx) => tx.categoryId === category.id) : []),
    [transactions, category]
  );

  async function handleSaveTransaction(values: CreateTransactionValues): Promise<void> {
    if (!editingTransaction) return;
    await onUpdateTransaction(editingTransaction.id, values);
    setEditingTransaction(null);
  }

  return (
    <>
      <Modal open={category !== null} onClose={onClose} className="w-full max-w-3xl">
        <h2 className="mb-4 text-lg font-semibold">Edit category</h2>
        <div className="flex flex-col gap-6 sm:flex-row sm:gap-8">
          {/* Left: category form */}
          <div className="sm:w-64 sm:shrink-0">
            <CategoryForm
              initial={category ?? undefined}
              onSubmit={onUpdateCategory}
              onCancel={onClose}
            />
          </div>

          {/* Divider */}
          <div className="hidden w-px self-stretch bg-gray-200 sm:block" />

          {/* Right: transactions belonging to this category */}
          <div className="flex min-w-0 flex-1 flex-col gap-2">
            <p className="text-sm font-medium text-gray-500">
              Transactions in this category
            </p>

            {categoryTransactions.length === 0 ? (
              <p className="py-8 text-center text-sm text-gray-400">
                No transactions assigned to this category yet.
              </p>
            ) : (
              <ul className="flex max-h-72 flex-col gap-2 overflow-y-auto">
                {categoryTransactions.map((tx) => {
                  const isIncome = tx.type === "income";
                  return (
                    <li
                      key={tx.id}
                      className="flex items-center justify-between gap-4 rounded-lg border border-gray-100 bg-gray-50 px-4 py-3"
                    >
                      <div className="flex min-w-0 flex-col gap-0.5">
                        <p className="truncate text-sm font-medium text-gray-900">
                          {tx.title || "Untitled"}
                        </p>
                        <p className="text-xs text-gray-400">
                          {tx.date.toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex shrink-0 items-center gap-3">
                        <span
                          className={clsx(
                            "text-sm font-semibold",
                            isIncome ? "text-green-600" : "text-red-600"
                          )}
                        >
                          {isIncome ? "+" : "-"}${tx.amount.toFixed(2)}
                        </span>
                        <button
                          type="button"
                          onClick={() => setEditingTransaction(tx)}
                          className="text-xs text-gray-400 hover:text-gray-700"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => onDeleteTransaction(tx.id)}
                          className="text-xs text-gray-400 hover:text-red-600"
                        >
                          Delete
                        </button>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      </Modal>

      {/* Nested transaction edit modal */}
      <Modal
        open={editingTransaction !== null}
        onClose={() => setEditingTransaction(null)}
      >
        <h2 className="mb-4 text-lg font-semibold">Edit transaction</h2>
        <TransactionForm
          initial={editingTransaction ?? undefined}
          categoryOptions={categoryOptions}
          onSubmit={handleSaveTransaction}
          onCancel={() => setEditingTransaction(null)}
        />
      </Modal>
    </>
  );
}
