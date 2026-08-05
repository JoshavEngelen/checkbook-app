"use client";

import { EmptyState } from "@/shared/components";
import { TransactionCard } from "../TransactionCard/TransactionCard";
import type { Transaction } from "../../types";

interface TransactionListProps {
  transactions: Transaction[];
  onEdit: (transaction: Transaction) => void;
  onDelete: (transaction: Transaction) => void;
}

export function TransactionList({ transactions, onEdit, onDelete }: TransactionListProps) {
  if (transactions.length === 0) {
    return (
      <EmptyState
        title="No transactions yet"
        description="Add your first transaction to start tracking."
      />
    );
  }

  return (
    <ul className="flex flex-col gap-2">
      {transactions.map((transaction) => (
        <li key={transaction.id}>
          <TransactionCard
            transaction={transaction}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        </li>
      ))}
    </ul>
  );
}
