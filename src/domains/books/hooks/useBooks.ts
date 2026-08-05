"use client";

import { useEffect, useReducer } from "react";
import { BookRepository } from "../data/BookRepository";
import { booksInitialState, booksReducer } from "../reducers/booksReducer";
import type { Book, BookForm } from "../types";
import { useAuth } from "@/auth/hooks/useAuth";

export function useBooks() {
  const { user } = useAuth();
  const [state, dispatch] = useReducer(booksReducer, booksInitialState);

  useEffect(() => {
    if (!user) return;
    BookRepository.getBooks(user.uid).then((books) =>
      dispatch({ type: "LOAD", payload: books })
    );
  }, [user]);

  async function createBook(form: BookForm): Promise<void> {
    if (!user) return;
    const book = await BookRepository.createBook(user.uid, form);
    dispatch({ type: "ADD", payload: book });
  }

  async function updateBook(id: string, form: Partial<BookForm>): Promise<void> {
    await BookRepository.updateBook(id, form);
    const updated = await BookRepository.getBook(id);
    if (updated) dispatch({ type: "UPDATE", payload: updated });
  }

  async function archiveBook(id: string): Promise<void> {
    await BookRepository.archiveBook(id);
    dispatch({ type: "ARCHIVE", payload: id });
  }

  async function restoreBook(id: string): Promise<void> {
    await BookRepository.restoreBook(id);
    dispatch({ type: "RESTORE", payload: id });
  }

  return {
    books: state.books,
    loading: state.loading,
    error: state.error,
    createBook,
    updateBook,
    archiveBook,
    restoreBook,
  };
}
