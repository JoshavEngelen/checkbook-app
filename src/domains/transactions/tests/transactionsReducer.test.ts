import { transactionsReducer, transactionsInitialState } from "../reducers/transactionsReducer";
import type { Transaction } from "../types";

const makeTransaction = (overrides?: Partial<Transaction>): Transaction => ({
  id: "tx-1",
  bookId: "book-1",
  title: "Groceries",
  amount: 50,
  type: "expense",
  date: new Date("2026-08-01"),
  ...overrides,
});

describe("transactionsReducer", () => {
  it("LOAD_TRANSACTIONS replaces list and clears loading", () => {
    const transactions = [makeTransaction()];
    const state = transactionsReducer(transactionsInitialState, {
      type: "LOAD_TRANSACTIONS",
      payload: transactions,
    });
    expect(state.transactions).toEqual(transactions);
    expect(state.loading).toBe(false);
  });

  it("ADD_TRANSACTION prepends to the list", () => {
    const existing = makeTransaction({ id: "tx-1" });
    const added = makeTransaction({ id: "tx-2", title: "Salary" });
    const initial = { ...transactionsInitialState, transactions: [existing] };
    const state = transactionsReducer(initial, { type: "ADD_TRANSACTION", payload: added });
    expect(state.transactions).toHaveLength(2);
    expect(state.transactions[0]).toEqual(added);
  });

  it("UPDATE_TRANSACTION replaces the matching transaction", () => {
    const tx = makeTransaction({ amount: 50 });
    const updated = { ...tx, amount: 75 };
    const initial = { ...transactionsInitialState, transactions: [tx] };
    const state = transactionsReducer(initial, { type: "UPDATE_TRANSACTION", payload: updated });
    expect(state.transactions[0].amount).toBe(75);
  });

  it("DELETE_TRANSACTION removes the transaction by id", () => {
    const target = makeTransaction({ id: "tx-1" });
    const other = makeTransaction({ id: "tx-2" });
    const initial = { ...transactionsInitialState, transactions: [target, other] };
    const state = transactionsReducer(initial, { type: "DELETE_TRANSACTION", payload: "tx-1" });
    expect(state.transactions).toHaveLength(1);
    expect(state.transactions[0].id).toBe("tx-2");
  });

  it("does not mutate unrelated transactions", () => {
    const target = makeTransaction({ id: "tx-1", title: "Old" });
    const other = makeTransaction({ id: "tx-2", title: "Other" });
    const initial = { ...transactionsInitialState, transactions: [target, other] };
    const updated = { ...target, title: "Updated" };
    const state = transactionsReducer(initial, { type: "UPDATE_TRANSACTION", payload: updated });
    expect(state.transactions[1].title).toBe("Other");
  });
});
