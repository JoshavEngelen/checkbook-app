import type { Book } from "../types";

type BooksState = {
  books: Book[];
  loading: boolean;
  error: string | null;
};

type BooksAction =
  | { type: "LOAD"; payload: Book[] }
  | { type: "ADD"; payload: Book }
  | { type: "UPDATE"; payload: Book }
  | { type: "ARCHIVE"; payload: string }
  | { type: "RESTORE"; payload: string };

export const booksInitialState: BooksState = {
  books: [],
  loading: true,
  error: null,
};

export function booksReducer(state: BooksState, action: BooksAction): BooksState {
  switch (action.type) {
    case "LOAD":
      return { ...state, books: action.payload, loading: false };
    case "ADD":
      return { ...state, books: [...state.books, action.payload] };
    case "UPDATE":
      return {
        ...state,
        books: state.books.map((b) =>
          b.id === action.payload.id ? action.payload : b
        ),
      };
    case "ARCHIVE":
      return {
        ...state,
        books: state.books.map((b) =>
          b.id === action.payload ? { ...b, archived: true } : b
        ),
      };
    case "RESTORE":
      return {
        ...state,
        books: state.books.map((b) =>
          b.id === action.payload ? { ...b, archived: false } : b
        ),
      };
  }
}
