import type { Transaction } from "../types";

export type MonthlyTrendPoint = {
  /** "YYYY-MM" — used as the chart x-axis key. */
  month: string;
  /** Human-readable label, e.g. "Aug 2026". */
  label: string;
  income: number;
  expenses: number;
};

/**
 * Aggregates all transactions into monthly income/expense totals for a line chart.
 *
 * Produces exactly `monthCount` data points ending with the current month,
 * sorted chronologically (oldest first). Months with no transactions get 0 values
 * so the line is continuous rather than broken.
 *
 * @param transactions - Full transaction list for a book (not pre-filtered).
 * @param monthCount   - Number of months to include (default 12).
 * @param now          - Reference date; defaults to today. Injected for testability.
 */
export function buildMonthlyChartData(
  transactions: Transaction[],
  monthCount = 12,
  now: Date = new Date()
): MonthlyTrendPoint[] {
  // Build a map of totals keyed by "YYYY-MM".
  const totals = new Map<string, { income: number; expenses: number }>();

  for (const tx of transactions) {
    const key = toYearMonth(tx.date);
    const entry = totals.get(key) ?? { income: 0, expenses: 0 };
    if (tx.type === "income") {
      entry.income = round2(entry.income + tx.amount);
    } else {
      entry.expenses = round2(entry.expenses + tx.amount);
    }
    totals.set(key, entry);
  }

  // Generate the rolling window of months ending at `now`, oldest first.
  const points: MonthlyTrendPoint[] = [];
  for (let i = monthCount - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const month = toYearMonth(d);
    const label = d.toLocaleString("default", { month: "short", year: "numeric" });
    const entry = totals.get(month) ?? { income: 0, expenses: 0 };
    points.push({ month, label, ...entry });
  }

  return points;
}

function toYearMonth(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}
