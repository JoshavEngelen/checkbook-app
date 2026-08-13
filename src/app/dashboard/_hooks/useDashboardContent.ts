"use client";

import { useMemo } from "react";
import { useCategories } from "@/domains/categories";
import { useTransactions } from "@/domains/transactions";
import { assignTransactionToCategory } from "@/domains/transactions/operations/assignTransactionToCategory";
import { calculateMonthlyStats } from "@/domains/transactions/operations/calculateMonthlyStats";
import type { MonthlyStats } from "@/domains/transactions/operations/calculateMonthlyStats";
import { buildMonthlyChartData } from "@/domains/transactions/operations/buildMonthlyChartData";
import { buildCategoryChartData } from "@/domains/transactions/operations/buildCategoryChartData";

const RECENT_TRANSACTION_LIMIT = 5;

/**
 * Aggregates category and transaction data for the selected dashboard book.
 * Keeps all Firebase-backed domain hooks out of page.tsx.
 *
 * When bookId is null (no active book selected) all lists are empty and
 * loading is false — nothing is fetched.
 */
export function useDashboardContent(bookId: string | null, statsMonth: string) {
  // Hooks must be called unconditionally; empty string is safe because both
  // hooks guard against empty bookId internally.
  const resolvedId = bookId ?? "";

  const {
    categories,
    loading: categoriesLoading,
    error: categoriesError,
    retry: retryCategories,
    createCategory,
    updateCategory,
  } = useCategories(resolvedId);

  const {
    transactions,
    loading: transactionsLoading,
    error: transactionsError,
    retry: retryTransactions,
    createTransaction,
    updateTransaction,
    deleteTransaction,
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

  // Financial statistics for the selected month — derived from already-loaded data.
  const monthlyStats = useMemo<MonthlyStats>(
    () => calculateMonthlyStats(bookId ? transactions : [], statsMonth),
    [transactions, statsMonth, bookId]
  );

  // Chart data — derived entirely from already-loaded transactions + categories.
  const trendData = useMemo(
    () => buildMonthlyChartData(bookId ? transactions : []),
    [transactions, bookId]
  );

  const categoryChartData = useMemo(
    () => buildCategoryChartData(bookId ? transactions : [], bookId ? categories : [], statsMonth),
    [transactions, categories, statsMonth, bookId]
  );

  /**
   * Optimistically assigns a transaction to a category, then persists through
   * the domain operation. Rolls back to the previous categoryId on failure.
   */
  async function assignCategory(transactionId: string, categoryId: string): Promise<void> {
    const tx = transactions.find((t) => t.id === transactionId);
    if (!tx) return;
    const previousCategoryId = tx.categoryId;

    // Optimistic update — updates local reducer state immediately.
    await updateTransaction(transactionId, { categoryId });

    try {
      await assignTransactionToCategory(transactionId, categoryId);
    } catch {
      // Rollback: restore the previous categoryId in local state.
      await updateTransaction(transactionId, { categoryId: previousCategoryId });
      throw new Error("Could not assign category. Please try again.");
    }
  }

  return {
    categories: bookId ? categories : [],
    transactions: bookId ? transactions : [],
    recentTransactions: bookId ? recentTransactions : [],
    spentByCategoryId: bookId ? spentByCategoryId : {},
    categoryOptions: bookId ? categoryOptions : [],
    categoriesLoading: bookId ? categoriesLoading : false,
    transactionsLoading: bookId ? transactionsLoading : false,
    categoriesError: bookId ? categoriesError : null,
    transactionsError: bookId ? transactionsError : null,
    retryCategories,
    retryTransactions,
    createCategory,
    updateCategory,
    createTransaction,
    updateTransaction,
    deleteTransaction,
    assignCategory,
    monthlyStats,
    trendData,
    categoryChartData,
  };
}
