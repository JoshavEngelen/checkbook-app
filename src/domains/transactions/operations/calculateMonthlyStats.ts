import type { Transaction } from "../types";

export type MonthlyStats = {
  /** Sum of all income transactions in the month. */
  totalIncome: number;
  /** Sum of all expense transactions in the month. */
  totalExpenses: number;
  /** totalIncome − totalExpenses (positive = surplus). */
  balance: number;
  /** Total number of transactions in the month regardless of type. */
  transactionCount: number;
};

/**
 * Derives financial statistics from an array of transactions filtered to a
 * single calendar month.
 *
 * @param transactions - Full transaction list for a book (not pre-filtered).
 * @param month - Target month in "YYYY-MM" format.
 * @returns Aggregated stats. All monetary values are rounded to two decimal places.
 */
export function calculateMonthlyStats(
  transactions: Transaction[],
  month: string
): MonthlyStats {
  let totalIncome = 0;
  let totalExpenses = 0;
  let transactionCount = 0;

  for (const tx of transactions) {
    const txMonth = toYearMonth(tx.date);
    if (txMonth !== month) continue;

    transactionCount += 1;
    if (tx.type === "income") {
      totalIncome += tx.amount;
    } else {
      totalExpenses += tx.amount;
    }
  }

  return {
    totalIncome: round2(totalIncome),
    totalExpenses: round2(totalExpenses),
    balance: round2(totalIncome - totalExpenses),
    transactionCount,
  };
}

function toYearMonth(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  return `${y}-${m}`;
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}
