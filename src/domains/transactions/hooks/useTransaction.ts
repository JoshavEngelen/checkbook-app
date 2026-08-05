"use client";

import { useEffect, useState } from "react";
import { TransactionRepository } from "../data/TransactionRepository";
import type { Transaction } from "../types";

export function useTransaction(id: string) {
  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loadedId, setLoadedId] = useState(id);

  // Reset state synchronously during render instead of in the effect, per
  // https://react.dev/learn/you-might-not-need-an-effect#adjusting-some-state-when-a-prop-changes
  if (id !== loadedId) {
    setLoadedId(id);
    setTransaction(null);
    setError(null);
    setLoading(true);
  }

  useEffect(() => {
    TransactionRepository.getTransactionById(id)
      .then(setTransaction)
      .catch(() => setError("Failed to load transaction."))
      .finally(() => setLoading(false));
  }, [id]);

  return { transaction, loading, error };
}
