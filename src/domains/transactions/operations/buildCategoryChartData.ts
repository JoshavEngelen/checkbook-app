import type { Transaction } from "../types";
import type { Category } from "@/domains/categories/types";

export type CategoryExpensePoint = {
  /** Category name used as the bar label. */
  name: string;
  expenses: number;
};

/**
 * Aggregates expense transactions for a given month into per-category totals
 * for a bar chart.
 *
 * Only expense-type transactions that have a `categoryId` matching a known
 * category are included. Transactions without a category or with an unknown
 * category are intentionally omitted to keep the chart meaningful.
 *
 * Results are sorted descending by expenses so the largest bar appears first.
 *
 * @param transactions - Full transaction list for a book (not pre-filtered).
 * @param categories   - Category list for the same book.
 * @param month        - "YYYY-MM" string. Only transactions in this month are included.
 */
export function buildCategoryChartData(
  transactions: Transaction[],
  categories: Category[],
  month: string
): CategoryExpensePoint[] {
  const categoryNameById = new Map(categories.map((c) => [c.id, c.name]));
  const totals = new Map<string, number>();

  for (const tx of transactions) {
    if (tx.type !== "expense") continue;
    if (!tx.categoryId) continue;
    const name = categoryNameById.get(tx.categoryId);
    if (!name) continue;
    if (toYearMonth(tx.date) !== month) continue;

    totals.set(name, round2((totals.get(name) ?? 0) + tx.amount));
  }

  return Array.from(totals.entries())
    .map(([name, expenses]) => ({ name, expenses }))
    .sort((a, b) => b.expenses - a.expenses);
}

function toYearMonth(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}
