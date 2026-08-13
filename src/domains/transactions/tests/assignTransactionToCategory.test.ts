import {
  assignTransactionToCategory,
  AssignCategoryError,
} from "../operations/assignTransactionToCategory";
import { TransactionRepository } from "../data/TransactionRepository";
import { CategoryRepository } from "@/domains/categories/data/CategoryRepository";
import type { Transaction } from "../types";
import type { Category } from "@/domains/categories/types";

jest.mock("../data/TransactionRepository");
jest.mock("@/domains/categories/data/CategoryRepository");

const mockTransaction: Transaction = {
  id: "tx-1",
  bookId: "book-1",
  title: "Groceries",
  amount: 50,
  type: "expense",
  date: new Date("2026-08-01"),
};

const mockCategory: Category = {
  id: "cat-1",
  bookId: "book-1",
  name: "Food",
  budget: 200,
};

describe("assignTransactionToCategory", () => {
  beforeEach(() => jest.clearAllMocks());

  it("updates the transaction's categoryId when both exist in the same book", async () => {
    (TransactionRepository.getTransactionById as jest.Mock).mockResolvedValue(mockTransaction);
    (CategoryRepository.getCategoryById as jest.Mock).mockResolvedValue(mockCategory);
    (TransactionRepository.updateTransaction as jest.Mock).mockResolvedValue(undefined);

    await assignTransactionToCategory("tx-1", "cat-1");

    expect(TransactionRepository.updateTransaction).toHaveBeenCalledWith("tx-1", {
      categoryId: "cat-1",
    });
  });

  it("throws AssignCategoryError when the transaction does not exist", async () => {
    (TransactionRepository.getTransactionById as jest.Mock).mockResolvedValue(null);
    (CategoryRepository.getCategoryById as jest.Mock).mockResolvedValue(mockCategory);

    await expect(assignTransactionToCategory("bad-tx", "cat-1")).rejects.toThrow(
      AssignCategoryError
    );
    expect(TransactionRepository.updateTransaction).not.toHaveBeenCalled();
  });

  it("throws AssignCategoryError when the category does not exist", async () => {
    (TransactionRepository.getTransactionById as jest.Mock).mockResolvedValue(mockTransaction);
    (CategoryRepository.getCategoryById as jest.Mock).mockResolvedValue(null);

    await expect(assignTransactionToCategory("tx-1", "bad-cat")).rejects.toThrow(
      AssignCategoryError
    );
    expect(TransactionRepository.updateTransaction).not.toHaveBeenCalled();
  });

  it("throws AssignCategoryError when transaction and category belong to different books", async () => {
    const otherBookCategory: Category = { ...mockCategory, bookId: "book-2" };
    (TransactionRepository.getTransactionById as jest.Mock).mockResolvedValue(mockTransaction);
    (CategoryRepository.getCategoryById as jest.Mock).mockResolvedValue(otherBookCategory);

    await expect(assignTransactionToCategory("tx-1", "cat-1")).rejects.toThrow(
      AssignCategoryError
    );
    expect(TransactionRepository.updateTransaction).not.toHaveBeenCalled();
  });

  it("propagates unexpected repository errors without wrapping them", async () => {
    const networkError = new Error("Network failure");
    (TransactionRepository.getTransactionById as jest.Mock).mockRejectedValue(networkError);
    (CategoryRepository.getCategoryById as jest.Mock).mockResolvedValue(mockCategory);

    await expect(assignTransactionToCategory("tx-1", "cat-1")).rejects.toThrow("Network failure");
  });
});
