import { renderHook, act, waitFor } from "@testing-library/react";
import { useTransactions } from "../hooks/useTransactions";
import { TransactionRepository } from "../data/TransactionRepository";
import type { Transaction } from "../types";

jest.mock("../data/TransactionRepository");

const mockTransaction: Transaction = {
  id: "tx-1",
  bookId: "book-1",
  title: "Groceries",
  amount: 50,
  type: "expense",
  date: new Date("2026-08-01"),
};

beforeEach(() => {
  jest.mocked(TransactionRepository.getTransactions).mockResolvedValue([mockTransaction]);
  jest.mocked(TransactionRepository.createTransaction).mockResolvedValue({
    ...mockTransaction,
    id: "tx-2",
    title: "Salary",
    type: "income",
    amount: 1000,
  });
  jest.mocked(TransactionRepository.updateTransaction).mockResolvedValue(undefined);
  jest.mocked(TransactionRepository.deleteTransaction).mockResolvedValue(undefined);
});

describe("useTransactions", () => {
  it("loads transactions on mount", async () => {
    const { result } = renderHook(() => useTransactions("book-1"));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.transactions).toHaveLength(1);
    expect(result.current.transactions[0].title).toBe("Groceries");
  });

  it("createTransaction prepends the new transaction", async () => {
    const { result } = renderHook(() => useTransactions("book-1"));
    await waitFor(() => expect(result.current.loading).toBe(false));
    await act(async () => {
      await result.current.createTransaction({
        title: "Salary",
        amount: 1000,
        type: "income",
        date: new Date(),
      });
    });
    expect(result.current.transactions).toHaveLength(2);
    expect(result.current.transactions[0].title).toBe("Salary");
  });

  it("deleteTransaction removes the transaction from state", async () => {
    const { result } = renderHook(() => useTransactions("book-1"));
    await waitFor(() => expect(result.current.loading).toBe(false));
    await act(async () => {
      await result.current.deleteTransaction("tx-1");
    });
    expect(result.current.transactions).toHaveLength(0);
  });

  it("updateTransaction patches the transaction in state", async () => {
    const { result } = renderHook(() => useTransactions("book-1"));
    await waitFor(() => expect(result.current.loading).toBe(false));
    await act(async () => {
      await result.current.updateTransaction("tx-1", { amount: 999 });
    });
    expect(result.current.transactions[0].amount).toBe(999);
  });
});
