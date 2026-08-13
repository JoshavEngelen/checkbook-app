import type { Book } from "../types";

type BooksState = {
  books: Book[];
  loading: boolean;
};

type BooksAction =
  | { type: "LOAD_BOOKS"; payload: Book[] }
  | { type: "ADD_BOOK"; payload: Book }
  | { type: "UPDATE_BOOK"; payload: Book }
  | { type: "ARCHIVE_BOOK"; payload: string }
  | { type: "RESTORE_BOOK"; payload: string };

export const booksInitialState: BooksState = {
  books: [],
  loading: true,
};

export function booksReducer(state: BooksState, action: BooksAction): BooksState {
  switch (action.type) {
    case "LOAD_BOOKS":
      return { ...state, books: action.payload, loading: false };
    case "ADD_BOOK":
      return { ...state, books: [...state.books, action.payload] };
    case "UPDATE_BOOK":
      return {
        ...state,
        books: state.books.map((b) =>
          b.id === action.payload.id ? action.payload : b
        ),
      };
    case "ARCHIVE_BOOK":
      return {
        ...state,
        books: state.books.map((b) =>
          b.id === action.payload ? { ...b, archived: true } : b
        ),
      };
    case "RESTORE_BOOK":
      return {
        ...state,
        books: state.books.map((b) =>
          b.id === action.payload ? { ...b, archived: false } : b
        ),
      };
  }
}
