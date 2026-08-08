"use client";

import { useMemo } from "react";
import { useCategories } from "@/domains/categories";
import { useTransactions } from "@/domains/transactions";
import type { CreateCategoryRequest } from "@/domains/categories";
import type { CreateTransactionRequest } from "@/domains/transactions";

const RECENT_TRANSACTION_LIMIT = 5;

/**
 * Aggregates category and transaction data for the selected dashboard book.
 * Keeps all Firebase-backed domain hooks out of page.tsx.
 *
 * When bookId is null (no active book selected) all lists are empty and
 * loading is false — nothing is fetched.
 */
export function useDashboardContent(bookId: string | null) {
  // Hooks must be called unconditionally; empty string is safe because both
  // hooks guard against empty bookId internally.
  const resolvedId = bookId ?? "";

  const {
    categories,
    loading: categoriesLoading,
    createCategory,
  } = useCategories(resolvedId);

  const {
    transactions,
    loading: transactionsLoading,
    createTransaction,
  } = useTransactions(resolvedId);

  // Sum expense amounts per category across all transactions.
  const spentByCategoryId = useMemo<Record<string, number>>(() => {
    const totals: Record<string, number> = {};
    for (const tx of transactions) {
      if (tx.type === "expense" && tx.categoryId) {
        totals[tx.categoryId] = (totals[tx.categoryId] ?? 0) + tx.amount;
      }
    }
    return totals;
  }, [transactions]);

  // Most recent transactions for the dashboard preview.
  const recentTransactions = useMemo(
    () => transactions.slice(0, RECENT_TRANSACTION_LIMIT),
    [transactions]
  );

  // Category picker options for the transaction form.
  const categoryOptions = useMemo(
    () => categories.map((c) => ({ value: c.id, label: c.name })),
    [categories]
  );

  return {
    categories: bookId ? categories : [],
    recentTransactions: bookId ? recentTransactions : [],
    spentByCategoryId: bookId ? spentByCategoryId : {},
    categoryOptions: bookId ? categoryOptions : [],
    // Only report loading when a real book is selected.
    loading: bookId ? categoriesLoading || transactionsLoading : false,
    createCategory,
    createTransaction,
  };
}
