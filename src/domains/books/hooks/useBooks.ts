"use client";

import { useEffect, useReducer } from "react";
import { BookRepository } from "../data/BookRepository";
import { booksInitialState, booksReducer } from "../reducers/booksReducer";
import type { Book, CreateBookRequest, UpdateBookRequest } from "../types";
import { useAuth } from "@/auth/hooks/useAuth";

export function useBooks() {
  const { user } = useAuth();
  const [state, dispatch] = useReducer(booksReducer, booksInitialState);

  useEffect(() => {
    if (!user) return;
    BookRepository.getBooks(user.uid).then((books) =>
      dispatch({ type: "LOAD_BOOKS", payload: books })
    );
  }, [user]);

  async function createBook(request: CreateBookRequest): Promise<Book> {
    if (!user) throw new Error("Cannot create a book: user is not authenticated.");
    const book = await BookRepository.createBook(user.uid, request);
    dispatch({ type: "ADD_BOOK", payload: book });
    return book;
  }

  async function updateBook(id: string, request: UpdateBookRequest): Promise<void> {
    await BookRepository.updateBook(id, request);
    const updated = await BookRepository.getBookById(id);
    if (updated) dispatch({ type: "UPDATE_BOOK", payload: updated });
  }

  async function archiveBook(id: string): Promise<void> {
    await BookRepository.archiveBook(id);
    dispatch({ type: "ARCHIVE_BOOK", payload: id });
  }

  async function restoreBook(id: string): Promise<void> {
    await BookRepository.restoreBook(id);
    dispatch({ type: "RESTORE_BOOK", payload: id });
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
