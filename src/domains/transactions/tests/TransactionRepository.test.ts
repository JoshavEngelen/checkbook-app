import { TransactionRepository } from "../data/TransactionRepository";

jest.mock("@/infrastructure/firebase/firestore", () => ({ db: {} }));

const mockDate = new Date("2026-08-01");
const mockTimestamp = { toDate: () => mockDate };

const mockDocs = [
  {
    id: "tx-1",
    data: () => ({
      bookId: "book-1",
      title: "Groceries",
      amount: 50,
      type: "expense",
      categoryId: undefined,
      date: mockTimestamp,
    }),
    exists: () => true,
  },
];

jest.mock("firebase/firestore", () => ({
  collection: jest.fn(() => "transactions-collection"),
  getDocs: jest.fn(async () => ({ docs: mockDocs })),
  getDoc: jest.fn(async () => mockDocs[0]),
  addDoc: jest.fn(async () => ({ id: "new-tx-id" })),
  updateDoc: jest.fn(async () => undefined),
  deleteDoc: jest.fn(async () => undefined),
  doc: jest.fn((_col, id) => `doc-ref-${id}`),
  query: jest.fn(() => "query-ref"),
  where: jest.fn(() => "where-clause"),
  orderBy: jest.fn(() => "orderby-clause"),
  Timestamp: {
    fromDate: jest.fn((d) => d),
  },
}));

describe("TransactionRepository", () => {
  it("getTransactions returns mapped transactions", async () => {
    const txs = await TransactionRepository.getTransactions("book-1");
    expect(txs).toHaveLength(1);
    expect(txs[0]).toMatchObject({ id: "tx-1", title: "Groceries", amount: 50 });
  });

  it("getTransactionById returns a transaction when it exists", async () => {
    const tx = await TransactionRepository.getTransactionById("tx-1");
    expect(tx).toMatchObject({ id: "tx-1", title: "Groceries" });
  });

  it("createTransaction returns the created transaction with an id", async () => {
    const tx = await TransactionRepository.createTransaction("book-1", {
      title: "Salary",
      amount: 1000,
      type: "income",
      date: new Date("2026-08-01"),
    });
    expect(tx.id).toBe("new-tx-id");
    expect(tx.title).toBe("Salary");
    expect(tx.bookId).toBe("book-1");
  });

  it("deleteTransaction calls deleteDoc with the correct ref", async () => {
    const { deleteDoc } = jest.requireMock("firebase/firestore");
    await TransactionRepository.deleteTransaction("tx-1");
    expect(deleteDoc).toHaveBeenCalledWith("doc-ref-tx-1");
  });

  it("updateTransaction calls updateDoc", async () => {
    const { updateDoc } = jest.requireMock("firebase/firestore");
    await TransactionRepository.updateTransaction("tx-1", { amount: 99 });
    expect(updateDoc).toHaveBeenCalledWith(
      "doc-ref-tx-1",
      expect.objectContaining({ amount: 99 })
    );
  });
});
