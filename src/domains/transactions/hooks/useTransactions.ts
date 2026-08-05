"use client";

import { useEffect, useReducer } from "react";
import { TransactionRepository } from "../data/TransactionRepository";
import {
  transactionsInitialState,
  transactionsReducer,
} from "../reducers/transactionsReducer";
import type { CreateTransactionRequest, UpdateTransactionRequest } from "../types";

export function useTransactions(bookId: string) {
  const [state, dispatch] = useReducer(transactionsReducer, transactionsInitialState);

  useEffect(() => {
    TransactionRepository.getTransactions(bookId).then((transactions) =>
      dispatch({ type: "LOAD_TRANSACTIONS", payload: transactions })
    );
  }, [bookId]);

  async function createTransaction(request: CreateTransactionRequest): Promise<void> {
    const transaction = await TransactionRepository.createTransaction(bookId, request);
    dispatch({ type: "ADD_TRANSACTION", payload: transaction });
  }

  async function updateTransaction(
    id: string,
    request: UpdateTransactionRequest
  ): Promise<void> {
    await TransactionRepository.updateTransaction(id, request);
    const updated = state.transactions.find((t) => t.id === id);
    if (updated) dispatch({ type: "UPDATE_TRANSACTION", payload: { ...updated, ...request } });
  }

  async function deleteTransaction(id: string): Promise<void> {
    await TransactionRepository.deleteTransaction(id);
    dispatch({ type: "DELETE_TRANSACTION", payload: id });
  }

  return {
    transactions: state.transactions,
    loading: state.loading,
    error: state.error,
    createTransaction,
    updateTransaction,
    deleteTransaction,
  };
}
