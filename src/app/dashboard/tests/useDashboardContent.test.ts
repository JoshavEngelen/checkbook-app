import { renderHook, act } from "@testing-library/react";
import { useDashboardContent } from "../_hooks/useDashboardContent";
import type { Transaction } from "@/domains/transactions/types";
import type { Category } from "@/domains/categories/types";

// ---------------------------------------------------------------------------
// Module mocks
// ---------------------------------------------------------------------------

jest.mock("@/domains/categories", () => ({ useCategories: jest.fn() }));
jest.mock("@/domains/transactions", () => ({ useTransactions: jest.fn() }));
jest.mock(
  "@/domains/transactions/operations/assignTransactionToCategory",
  () => ({ assignTransactionToCategory: jest.fn() })
);

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const { useCategories } = jest.requireMock("@/domains/categories") as {
  useCategories: jest.Mock;
};
const { useTransactions } = jest.requireMock("@/domains/transactions") as {
  useTransactions: jest.Mock;
};
const { assignTransactionToCategory } = jest.requireMock(
  "@/domains/transactions/operations/assignTransactionToCategory"
) as { assignTransactionToCategory: jest.Mock };

const AUG = "2026-08";

function makeTx(overrides: Partial<Transaction> = {}): Transaction {
  return {
    id: "tx-1",
    bookId: "book-1",
    title: "Groceries",
    amount: 100,
    type: "expense",
    date: new Date("2026-08-10"),
    ...overrides,
  };
}

function makeCat(overrides: Partial<Category> = {}): Category {
  return {
    id: "cat-1",
    bookId: "book-1",
    name: "Food",
    budget: 300,
    ...overrides,
  };
}

function setupMocks(
  transactions: Transaction[],
  categories: Category[] = []
) {
  const mockUpdateTransaction = jest.fn().mockResolvedValue(undefined);

  useTransactions.mockReturnValue({
    transactions,
    loading: false,
    error: null,
    retry: jest.fn(),
    createTransaction: jest.fn(),
    updateTransaction: mockUpdateTransaction,
    deleteTransaction: jest.fn(),
  });

  useCategories.mockReturnValue({
    categories,
    loading: false,
    error: null,
    retry: jest.fn(),
    createCategory: jest.fn(),
    updateCategory: jest.fn(),
    deleteCategory: jest.fn(),
  });

  return { mockUpdateTransaction };
}

// ---------------------------------------------------------------------------
// assignCategory — drag-and-drop optimistic update + rollback
// ---------------------------------------------------------------------------

describe("useDashboardContent.assignCategory", () => {
  beforeEach(() => jest.clearAllMocks());

  it("optimistically calls updateTransaction before persistence", async () => {
    const tx = makeTx({ categoryId: undefined });
    const { mockUpdateTransaction } = setupMocks([tx]);
    assignTransactionToCategory.mockResolvedValue(undefined);

    const { result } = renderHook(() => useDashboardContent("book-1", AUG));

    await act(async () => {
      await result.current.assignCategory("tx-1", "cat-1");
    });

    // updateTransaction must have been called first (optimistic)
    expect(mockUpdateTransaction).toHaveBeenCalledWith("tx-1", { categoryId: "cat-1" });
    // then the domain operation for persistence
    expect(assignTransactionToCategory).toHaveBeenCalledWith("tx-1", "cat-1");
  });

  it("does not roll back when persistence succeeds", async () => {
    const tx = makeTx({ categoryId: "cat-old" });
    const { mockUpdateTransaction } = setupMocks([tx]);
    assignTransactionToCategory.mockResolvedValue(undefined);

    const { result } = renderHook(() => useDashboardContent("book-1", AUG));

    await act(async () => {
      await result.current.assignCategory("tx-1", "cat-1");
    });

    // Only one updateTransaction call (the optimistic one); no rollback
    expect(mockUpdateTransaction).toHaveBeenCalledTimes(1);
  });

  it("rolls back to previous categoryId when persistence fails", async () => {
    const tx = makeTx({ categoryId: "cat-old" });
    const { mockUpdateTransaction } = setupMocks([tx]);
    assignTransactionToCategory.mockRejectedValue(new Error("Network error"));

    const { result } = renderHook(() => useDashboardContent("book-1", AUG));

    await act(async () => {
      await expect(result.current.assignCategory("tx-1", "cat-1")).rejects.toThrow(
        "Could not assign category"
      );
    });

    // First call: optimistic update; second call: rollback
    expect(mockUpdateTransaction).toHaveBeenCalledTimes(2);
    expect(mockUpdateTransaction).toHaveBeenNthCalledWith(2, "tx-1", {
      categoryId: "cat-old",
    });
  });

  it("rolls back to undefined when transaction had no previous category", async () => {
    const tx = makeTx({ categoryId: undefined });
    const { mockUpdateTransaction } = setupMocks([tx]);
    assignTransactionToCategory.mockRejectedValue(new Error("fail"));

    const { result } = renderHook(() => useDashboardContent("book-1", AUG));

    await act(async () => {
      await expect(result.current.assignCategory("tx-1", "cat-1")).rejects.toThrow();
    });

    expect(mockUpdateTransaction).toHaveBeenNthCalledWith(2, "tx-1", {
      categoryId: undefined,
    });
  });

  it("does nothing when the transactionId is not in the list", async () => {
    setupMocks([makeTx({ id: "tx-other" })]);

    const { result } = renderHook(() => useDashboardContent("book-1", AUG));

    await act(async () => {
      await result.current.assignCategory("tx-1", "cat-1");
    });

    expect(assignTransactionToCategory).not.toHaveBeenCalled();
  });
});

// ---------------------------------------------------------------------------
// Financial statistics
// ---------------------------------------------------------------------------

describe("useDashboardContent monthly stats", () => {
  beforeEach(() => jest.clearAllMocks());

  it("calculates income, expenses, balance and count for the selected month", () => {
    setupMocks([
      makeTx({ id: "t1", type: "income", amount: 1500, date: new Date("2026-08-01") }),
      makeTx({ id: "t2", type: "expense", amount: 400, date: new Date("2026-08-15") }),
    ]);

    const { result } = renderHook(() => useDashboardContent("book-1", AUG));

    expect(result.current.monthlyStats.totalIncome).toBe(1500);
    expect(result.current.monthlyStats.totalExpenses).toBe(400);
    expect(result.current.monthlyStats.balance).toBe(1100);
    expect(result.current.monthlyStats.transactionCount).toBe(2);
  });

  it("returns all-zero stats when no transactions exist", () => {
    setupMocks([]);

    const { result } = renderHook(() => useDashboardContent("book-1", AUG));

    expect(result.current.monthlyStats).toEqual({
      totalIncome: 0,
      totalExpenses: 0,
      balance: 0,
      transactionCount: 0,
    });
  });

  it("returns all-zero stats when bookId is null (no book selected)", () => {
    setupMocks([makeTx({ id: "t1", type: "income", amount: 1000 })]);

    const { result } = renderHook(() => useDashboardContent(null, AUG));

    expect(result.current.monthlyStats).toEqual({
      totalIncome: 0,
      totalExpenses: 0,
      balance: 0,
      transactionCount: 0,
    });
  });

  it("excludes transactions outside the selected month", () => {
    setupMocks([
      makeTx({ id: "t1", type: "income", amount: 999, date: new Date("2026-07-15") }),
      makeTx({ id: "t2", type: "expense", amount: 100, date: new Date("2026-08-01") }),
    ]);

    const { result } = renderHook(() => useDashboardContent("book-1", AUG));

    expect(result.current.monthlyStats.totalIncome).toBe(0);
    expect(result.current.monthlyStats.totalExpenses).toBe(100);
    expect(result.current.monthlyStats.transactionCount).toBe(1);
  });

  it("updates stats when statsMonth changes", () => {
    setupMocks([
      makeTx({ id: "t1", type: "income", amount: 500, date: new Date("2026-07-01") }),
      makeTx({ id: "t2", type: "income", amount: 800, date: new Date("2026-08-01") }),
    ]);

    const { result, rerender } = renderHook(
      ({ month }) => useDashboardContent("book-1", month),
      { initialProps: { month: AUG } }
    );

    expect(result.current.monthlyStats.totalIncome).toBe(800);

    rerender({ month: "2026-07" });

    expect(result.current.monthlyStats.totalIncome).toBe(500);
  });
});

// ---------------------------------------------------------------------------
// Chart data
// ---------------------------------------------------------------------------

describe("useDashboardContent chart data", () => {
  beforeEach(() => jest.clearAllMocks());

  it("returns non-empty trendData when a book is selected", () => {
    setupMocks([makeTx()]);

    const { result } = renderHook(() => useDashboardContent("book-1", AUG));

    // buildMonthlyChartData always returns 12 points
    expect(result.current.trendData).toHaveLength(12);
  });

  it("returns 12 data points with all zeros when bookId is null", () => {
    setupMocks([makeTx()]);

    const { result } = renderHook(() => useDashboardContent(null, AUG));

    // buildMonthlyChartData always generates the 12-month window; when no book
    // is selected it fills every point with zeros (empty transactions list).
    expect(result.current.trendData).toHaveLength(12);
    expect(result.current.trendData.every((p) => p.income === 0 && p.expenses === 0)).toBe(true);
  });

  it("returns empty categoryChartData when bookId is null", () => {
    setupMocks([makeTx()], [makeCat()]);

    const { result } = renderHook(() => useDashboardContent(null, AUG));

    expect(result.current.categoryChartData).toHaveLength(0);
  });

  it("categoryChartData reflects expenses for the selected month only", () => {
    setupMocks(
      [
        makeTx({ id: "t1", categoryId: "cat-1", amount: 200, date: new Date("2026-08-01") }),
        makeTx({ id: "t2", categoryId: "cat-1", amount: 999, date: new Date("2026-07-01") }),
      ],
      [makeCat({ id: "cat-1", name: "Food" })]
    );

    const { result } = renderHook(() => useDashboardContent("book-1", AUG));

    expect(result.current.categoryChartData).toHaveLength(1);
    expect(result.current.categoryChartData[0].expenses).toBe(200);
  });

  it("categoryChartData updates when statsMonth changes", () => {
    setupMocks(
      [
        makeTx({ id: "t1", categoryId: "cat-1", amount: 100, date: new Date("2026-07-10") }),
        makeTx({ id: "t2", categoryId: "cat-1", amount: 300, date: new Date("2026-08-10") }),
      ],
      [makeCat({ id: "cat-1" })]
    );

    const { result, rerender } = renderHook(
      ({ month }) => useDashboardContent("book-1", month),
      { initialProps: { month: AUG } }
    );

    expect(result.current.categoryChartData[0].expenses).toBe(300);

    rerender({ month: "2026-07" });

    expect(result.current.categoryChartData[0].expenses).toBe(100);
  });

  it("income transactions are excluded from categoryChartData", () => {
    setupMocks(
      [makeTx({ id: "t1", type: "income", categoryId: "cat-1", amount: 1000 })],
      [makeCat({ id: "cat-1" })]
    );

    const { result } = renderHook(() => useDashboardContent("book-1", AUG));

    expect(result.current.categoryChartData).toHaveLength(0);
  });
});
