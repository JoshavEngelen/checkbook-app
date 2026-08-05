"use client";

import { useEffect, useState } from "react";
import { CategoryRepository } from "../data/CategoryRepository";
import type { Category } from "../types";

export function useCategory(id: string) {
  const [category, setCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loadedId, setLoadedId] = useState(id);

  // Reset state synchronously during render instead of in the effect, per
  // https://react.dev/learn/you-might-not-need-an-effect#adjusting-some-state-when-a-prop-changes
  if (id !== loadedId) {
    setLoadedId(id);
    setCategory(null);
    setError(null);
    setLoading(true);
  }

  useEffect(() => {
    CategoryRepository.getCategoryById(id)
      .then(setCategory)
      .catch(() => setError("Failed to load category."))
      .finally(() => setLoading(false));
  }, [id]);

  return { category, loading, error };
}
