"use client";

import clsx from "clsx";
import type { Transaction } from "../../types";

interface TransactionCardProps {
  transaction: Transaction;
  onEdit: (transaction: Transaction) => void;
  onDelete: (transaction: Transaction) => void;
}

export function TransactionCard({ transaction, onEdit, onDelete }: TransactionCardProps) {
  const isIncome = transaction.type === "income";

  return (
    <div className="flex items-center justify-between gap-4 rounded-lg border border-gray-100 bg-white px-4 py-3 shadow-sm">
      <div className="flex min-w-0 flex-col gap-0.5">
        <p className="truncate font-medium text-gray-900">
          {transaction.title || "Untitled"}
        </p>
        <p className="text-xs text-gray-400">
          {transaction.date.toLocaleDateString()}
        </p>
      </div>

      <div className="flex items-center gap-3 shrink-0">
        <span
          className={clsx(
            "font-semibold",
            isIncome ? "text-green-600" : "text-red-600"
          )}
        >
          {isIncome ? "+" : "-"}${transaction.amount.toFixed(2)}
        </span>
        <button
          onClick={() => onEdit(transaction)}
          className="text-xs text-gray-400 hover:text-gray-700"
        >
          Edit
        </button>
        <button
          onClick={() => onDelete(transaction)}
          className="text-xs text-gray-400 hover:text-red-600"
        >
          Delete
        </button>
      </div>
    </div>
  );
}
