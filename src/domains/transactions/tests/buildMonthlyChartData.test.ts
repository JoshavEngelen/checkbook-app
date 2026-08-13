import { buildMonthlyChartData } from "../operations/buildMonthlyChartData";
import type { Transaction } from "../types";

const NOW = new Date("2026-08-13");

function tx(
  id: string,
  type: Transaction["type"],
  amount: number,
  dateStr: string
): Transaction {
  return { id, bookId: "book-1", title: id, amount, type, date: new Date(dateStr) };
}

describe("buildMonthlyChartData", () => {
  it("returns exactly monthCount points for an empty transaction list", () => {
    const result = buildMonthlyChartData([], 6, NOW);
    expect(result).toHaveLength(6);
  });

  it("points are sorted chronologically (oldest first)", () => {
    const result = buildMonthlyChartData([], 3, NOW);
    expect(result[0].month).toBe("2026-06");
    expect(result[1].month).toBe("2026-07");
    expect(result[2].month).toBe("2026-08");
  });

  it("uses human-readable short labels", () => {
    const result = buildMonthlyChartData([], 1, NOW);
    expect(result[0].label).toMatch(/Aug.*2026/);
  });

  it("all points have zero income and expenses when no transactions", () => {
    const result = buildMonthlyChartData([], 3, NOW);
    for (const point of result) {
      expect(point.income).toBe(0);
      expect(point.expenses).toBe(0);
    }
  });

  it("correctly accumulates income in the matching month", () => {
    const result = buildMonthlyChartData(
      [tx("t1", "income", 1000, "2026-08-01"), tx("t2", "income", 500, "2026-08-15")],
      3,
      NOW
    );
    const aug = result.find((p) => p.month === "2026-08")!;
    expect(aug.income).toBe(1500);
    expect(aug.expenses).toBe(0);
  });

  it("correctly accumulates expenses in the matching month", () => {
    const result = buildMonthlyChartData(
      [tx("t1", "expense", 200, "2026-08-01"), tx("t2", "expense", 50.5, "2026-08-20")],
      3,
      NOW
    );
    const aug = result.find((p) => p.month === "2026-08")!;
    expect(aug.expenses).toBe(250.5);
    expect(aug.income).toBe(0);
  });

  it("keeps income and expenses in separate buckets for the same month", () => {
    const result = buildMonthlyChartData(
      [tx("t1", "income", 2000, "2026-08-01"), tx("t2", "expense", 600, "2026-08-10")],
      3,
      NOW
    );
    const aug = result.find((p) => p.month === "2026-08")!;
    expect(aug.income).toBe(2000);
    expect(aug.expenses).toBe(600);
  });

  it("places transactions in their correct month bucket", () => {
    const result = buildMonthlyChartData(
      [tx("t1", "income", 100, "2026-07-15"), tx("t2", "expense", 50, "2026-08-01")],
      3,
      NOW
    );
    const jul = result.find((p) => p.month === "2026-07")!;
    const aug = result.find((p) => p.month === "2026-08")!;
    expect(jul.income).toBe(100);
    expect(jul.expenses).toBe(0);
    expect(aug.income).toBe(0);
    expect(aug.expenses).toBe(50);
  });

  it("transactions outside the window are not reflected in any point", () => {
    // Transaction from 2025 — older than the 3-month window ending Aug 2026
    const result = buildMonthlyChartData(
      [tx("t1", "income", 99999, "2025-01-01")],
      3,
      NOW
    );
    for (const point of result) {
      expect(point.income).toBe(0);
    }
  });

  it("rounds monetary values to two decimal places", () => {
    const result = buildMonthlyChartData(
      [tx("t1", "income", 0.1, "2026-08-01"), tx("t2", "income", 0.2, "2026-08-01")],
      1,
      NOW
    );
    expect(result[0].income).toBe(0.3);
  });

  it("default monthCount is 12", () => {
    const result = buildMonthlyChartData([], undefined, NOW);
    expect(result).toHaveLength(12);
  });
});
