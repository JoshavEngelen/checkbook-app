import { booksReducer, booksInitialState } from "../reducers/booksReducer";
import type { Book } from "../types";
import { Timestamp } from "firebase/firestore";

jest.mock("firebase/firestore", () => ({
  Timestamp: { now: jest.fn(() => ({ seconds: 0, nanoseconds: 0 })) },
}));

const makeBook = (overrides?: Partial<Book>): Book => ({
  id: "book-1",
  name: "Test Book",
  description: "A description",
  ownerId: "user-1",
  archived: false,
  participants: [],
  createdAt: { seconds: 0, nanoseconds: 0 } as unknown as Timestamp,
  ...overrides,
});

describe("booksReducer", () => {
  it("LOAD_BOOKS replaces list and clears loading", () => {
    const books = [makeBook()];
    const state = booksReducer(booksInitialState, { type: "LOAD_BOOKS", payload: books });
    expect(state.books).toEqual(books);
    expect(state.loading).toBe(false);
  });

  it("ADD_BOOK appends a book", () => {
    const existing = makeBook({ id: "book-1" });
    const added = makeBook({ id: "book-2", name: "New" });
    const initial = { ...booksInitialState, books: [existing] };
    const state = booksReducer(initial, { type: "ADD_BOOK", payload: added });
    expect(state.books).toHaveLength(2);
    expect(state.books[1]).toEqual(added);
  });

  it("UPDATE_BOOK replaces the matching book", () => {
    const book = makeBook({ name: "Old" });
    const updated = { ...book, name: "Updated" };
    const initial = { ...booksInitialState, books: [book] };
    const state = booksReducer(initial, { type: "UPDATE_BOOK", payload: updated });
    expect(state.books[0].name).toBe("Updated");
  });

  it("ARCHIVE_BOOK sets archived to true", () => {
    const book = makeBook({ archived: false });
    const initial = { ...booksInitialState, books: [book] };
    const state = booksReducer(initial, { type: "ARCHIVE_BOOK", payload: book.id });
    expect(state.books[0].archived).toBe(true);
  });

  it("RESTORE_BOOK sets archived to false", () => {
    const book = makeBook({ archived: true });
    const initial = { ...booksInitialState, books: [book] };
    const state = booksReducer(initial, { type: "RESTORE_BOOK", payload: book.id });
    expect(state.books[0].archived).toBe(false);
  });

  it("does not mutate unrelated books", () => {
    const target = makeBook({ id: "book-1" });
    const other = makeBook({ id: "book-2" });
    const initial = { ...booksInitialState, books: [target, other] };
    const state = booksReducer(initial, { type: "ARCHIVE_BOOK", payload: "book-1" });
    expect(state.books[1].archived).toBe(false);
  });
});
