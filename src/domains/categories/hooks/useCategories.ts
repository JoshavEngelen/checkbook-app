"use client";

import { useEffect, useReducer, useState } from "react";
import { CategoryRepository } from "../data/CategoryRepository";
import {
  categoriesInitialState,
  categoriesReducer,
} from "../reducers/categoriesReducer";
import type { CreateCategoryRequest, UpdateCategoryRequest } from "../types";

export function useCategories(bookId: string) {
  const [state, dispatch] = useReducer(categoriesReducer, categoriesInitialState);
  const [retryCount, setRetryCount] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!bookId) return;
    setError(null);
    CategoryRepository.getCategories(bookId)
      .then((categories) => dispatch({ type: "LOAD_CATEGORIES", payload: categories }))
      .catch(() => {
        dispatch({ type: "LOAD_CATEGORIES", payload: [] }); // clears state.loading
        setError("Couldn't load categories.");
      });
  }, [bookId, retryCount]);

  async function createCategory(request: CreateCategoryRequest): Promise<void> {
    const category = await CategoryRepository.createCategory(bookId, request);
    dispatch({ type: "ADD_CATEGORY", payload: category });
  }

  async function updateCategory(
    id: string,
    request: UpdateCategoryRequest
  ): Promise<void> {
    await CategoryRepository.updateCategory(id, request);
    const updated = state.categories.find((c) => c.id === id);
    if (updated) dispatch({ type: "UPDATE_CATEGORY", payload: { ...updated, ...request } });
  }

  async function deleteCategory(id: string): Promise<void> {
    await CategoryRepository.deleteCategory(id);
    dispatch({ type: "DELETE_CATEGORY", payload: id });
  }

  return {
    categories: state.categories,
    loading: state.loading,
    error,
    retry: () => setRetryCount((c) => c + 1),
    createCategory,
    updateCategory,
    deleteCategory,
  };
}
