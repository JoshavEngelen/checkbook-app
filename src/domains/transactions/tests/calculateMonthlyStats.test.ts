import { calculateMonthlyStats } from "../operations/calculateMonthlyStats";
import type { Transaction } from "../types";

function tx(
  id: string,
  type: Transaction["type"],
  amount: number,
  dateStr: string
): Transaction {
  return { id, bookId: "book-1", title: id, amount, type, date: new Date(dateStr) };
}

const AUG = "2026-08";
const JUL = "2026-07";

describe("calculateMonthlyStats", () => {
  it("returns all-zero stats for an empty transaction list", () => {
    const stats = calculateMonthlyStats([], AUG);
    expect(stats).toEqual({
      totalIncome: 0,
      totalExpenses: 0,
      balance: 0,
      transactionCount: 0,
    });
  });

  it("counts only income transactions correctly", () => {
    const stats = calculateMonthlyStats(
      [tx("t1", "income", 1000, "2026-08-01"), tx("t2", "income", 500, "2026-08-15")],
      AUG
    );
    expect(stats.totalIncome).toBe(1500);
    expect(stats.totalExpenses).toBe(0);
    expect(stats.balance).toBe(1500);
    expect(stats.transactionCount).toBe(2);
  });

  it("counts only expense transactions correctly", () => {
    const stats = calculateMonthlyStats(
      [tx("t1", "expense", 200, "2026-08-05"), tx("t2", "expense", 50.5, "2026-08-20")],
      AUG
    );
    expect(stats.totalIncome).toBe(0);
    expect(stats.totalExpenses).toBe(250.5);
    expect(stats.balance).toBe(-250.5);
    expect(stats.transactionCount).toBe(2);
  });

  it("calculates correct balance with mixed income and expenses", () => {
    const stats = calculateMonthlyStats(
      [
        tx("t1", "income", 2000, "2026-08-01"),
        tx("t2", "expense", 600, "2026-08-10"),
        tx("t3", "expense", 150, "2026-08-25"),
      ],
      AUG
    );
    expect(stats.totalIncome).toBe(2000);
    expect(stats.totalExpenses).toBe(750);
    expect(stats.balance).toBe(1250);
    expect(stats.transactionCount).toBe(3);
  });

  it("excludes transactions outside the selected month", () => {
    const stats = calculateMonthlyStats(
      [
        tx("t1", "income", 3000, "2026-07-15"), // July — excluded
        tx("t2", "expense", 100, "2026-08-01"), // August — included
        tx("t3", "income", 500, "2026-09-01"), // September — excluded
      ],
      AUG
    );
    expect(stats.totalIncome).toBe(0);
    expect(stats.totalExpenses).toBe(100);
    expect(stats.transactionCount).toBe(1);
  });

  it("returns zero stats when month has no transactions but others exist", () => {
    const stats = calculateMonthlyStats(
      [tx("t1", "income", 1000, "2026-07-10"), tx("t2", "expense", 200, "2026-07-20")],
      AUG
    );
    expect(stats).toEqual({
      totalIncome: 0,
      totalExpenses: 0,
      balance: 0,
      transactionCount: 0,
    });
  });

  it("handles multiple transactions summing correctly across the full month", () => {
    const many = Array.from({ length: 10 }, (_, i) =>
      tx(`t${i}`, i % 2 === 0 ? "income" : "expense", 100, `2026-08-${String(i + 1).padStart(2, "0")}`)
    );
    const stats = calculateMonthlyStats(many, AUG);
    // 5 income × 100 = 500, 5 expense × 100 = 500
    expect(stats.totalIncome).toBe(500);
    expect(stats.totalExpenses).toBe(500);
    expect(stats.balance).toBe(0);
    expect(stats.transactionCount).toBe(10);
  });

  it("rounds monetary values to two decimal places", () => {
    const stats = calculateMonthlyStats(
      [
        tx("t1", "income", 0.1, "2026-08-01"),
        tx("t2", "income", 0.2, "2026-08-01"),
      ],
      AUG
    );
    // 0.1 + 0.2 in floating point = 0.30000...004; should round to 0.30
    expect(stats.totalIncome).toBe(0.3);
  });

  it("correctly handles the boundary between months (last day of July vs first of August)", () => {
    const stats = calculateMonthlyStats(
      [
        tx("t1", "expense", 999, "2026-07-31"), // July — excluded
        tx("t2", "income", 1, "2026-08-01"),    // August — included
      ],
      AUG
    );
    expect(stats.totalExpenses).toBe(0);
    expect(stats.totalIncome).toBe(1);
    expect(stats.transactionCount).toBe(1);
  });

  it("correctly uses July stats when July is selected", () => {
    const stats = calculateMonthlyStats(
      [
        tx("t1", "income", 800, "2026-07-01"),
        tx("t2", "expense", 300, "2026-08-01"),
      ],
      JUL
    );
    expect(stats.totalIncome).toBe(800);
    expect(stats.totalExpenses).toBe(0);
    expect(stats.balance).toBe(800);
    expect(stats.transactionCount).toBe(1);
  });
});
