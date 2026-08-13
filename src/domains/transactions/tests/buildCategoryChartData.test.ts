import { buildCategoryChartData } from "../operations/buildCategoryChartData";
import type { Transaction } from "../types";
import type { Category } from "@/domains/categories/types";

function tx(
  id: string,
  amount: number,
  dateStr: string,
  categoryId?: string
): Transaction {
  return {
    id,
    bookId: "book-1",
    title: id,
    amount,
    type: "expense",
    date: new Date(dateStr),
    categoryId,
  };
}

function income(id: string, amount: number, dateStr: string): Transaction {
  return { id, bookId: "book-1", title: id, amount, type: "income", date: new Date(dateStr) };
}

const cat = (id: string, name: string): Category => ({
  id,
  bookId: "book-1",
  name,
  budget: 100,
});

const AUG = "2026-08";
const food = cat("cat-food", "Food");
const travel = cat("cat-travel", "Travel");

describe("buildCategoryChartData", () => {
  it("returns empty array when there are no transactions", () => {
    expect(buildCategoryChartData([], [food], AUG)).toEqual([]);
  });

  it("returns empty array when categories list is empty", () => {
    const result = buildCategoryChartData(
      [tx("t1", 50, "2026-08-01", "cat-food")],
      [],
      AUG
    );
    expect(result).toEqual([]);
  });

  it("excludes income transactions from the chart", () => {
    const result = buildCategoryChartData(
      [income("t1", 1000, "2026-08-01")],
      [food],
      AUG
    );
    expect(result).toHaveLength(0);
  });

  it("excludes expense transactions without a category", () => {
    const result = buildCategoryChartData(
      [tx("t1", 50, "2026-08-01")], // no categoryId
      [food],
      AUG
    );
    expect(result).toHaveLength(0);
  });

  it("excludes expense transactions whose categoryId is not in the categories list", () => {
    const result = buildCategoryChartData(
      [tx("t1", 50, "2026-08-01", "unknown-id")],
      [food],
      AUG
    );
    expect(result).toHaveLength(0);
  });

  it("aggregates multiple expenses into the correct category", () => {
    const result = buildCategoryChartData(
      [
        tx("t1", 100, "2026-08-01", "cat-food"),
        tx("t2", 50, "2026-08-15", "cat-food"),
      ],
      [food],
      AUG
    );
    expect(result).toEqual([{ name: "Food", expenses: 150 }]);
  });

  it("produces one entry per category with expenses", () => {
    const result = buildCategoryChartData(
      [
        tx("t1", 100, "2026-08-01", "cat-food"),
        tx("t2", 200, "2026-08-02", "cat-travel"),
      ],
      [food, travel],
      AUG
    );
    expect(result).toHaveLength(2);
  });

  it("sorts results descending by expenses", () => {
    const result = buildCategoryChartData(
      [
        tx("t1", 100, "2026-08-01", "cat-food"),
        tx("t2", 300, "2026-08-02", "cat-travel"),
      ],
      [food, travel],
      AUG
    );
    expect(result[0].name).toBe("Travel");
    expect(result[1].name).toBe("Food");
  });

  it("excludes transactions outside the selected month", () => {
    const result = buildCategoryChartData(
      [
        tx("t1", 500, "2026-07-31", "cat-food"), // July
        tx("t2", 100, "2026-08-01", "cat-food"), // August — included
      ],
      [food],
      AUG
    );
    expect(result).toEqual([{ name: "Food", expenses: 100 }]);
  });

  it("returns empty array when selected month has no matching expenses", () => {
    const result = buildCategoryChartData(
      [tx("t1", 100, "2026-07-01", "cat-food")],
      [food],
      AUG
    );
    expect(result).toEqual([]);
  });

  it("rounds expenses to two decimal places", () => {
    const result = buildCategoryChartData(
      [
        tx("t1", 0.1, "2026-08-01", "cat-food"),
        tx("t2", 0.2, "2026-08-01", "cat-food"),
      ],
      [food],
      AUG
    );
    expect(result[0].expenses).toBe(0.3);
  });
});
