import { BookRepository } from "../data/BookRepository";
import { Timestamp } from "firebase/firestore";

jest.mock("@/infrastructure/firebase/firestore", () => ({ db: {} }));

const mockTimestamp = { seconds: 0, nanoseconds: 0 } as unknown as Timestamp;

const mockDocs = [
  {
    id: "book-1",
    data: () => ({
      name: "Book One",
      description: "Desc",
      ownerId: "user-1",
      archived: false,
      participants: [],
      createdAt: mockTimestamp,
    }),
    exists: () => true,
  },
];

jest.mock("firebase/firestore", () => ({
  collection: jest.fn(() => "books-collection"),
  getDocs: jest.fn(async () => ({ docs: mockDocs })),
  getDoc: jest.fn(async () => mockDocs[0]),
  addDoc: jest.fn(async () => ({ id: "new-book-id" })),
  updateDoc: jest.fn(async () => undefined),
  doc: jest.fn((_col, id) => `doc-ref-${id}`),
  query: jest.fn(() => "query-ref"),
  where: jest.fn(() => "where-clause"),
  Timestamp: {
    now: jest.fn(() => mockTimestamp),
  },
}));

describe("BookRepository", () => {
  it("getBooks returns mapped books", async () => {
    const books = await BookRepository.getBooks("user-1");
    expect(books).toHaveLength(1);
    expect(books[0]).toMatchObject({ id: "book-1", name: "Book One" });
  });

  it("getBookById returns a book when it exists", async () => {
    const book = await BookRepository.getBookById("book-1");
    expect(book).toMatchObject({ id: "book-1", name: "Book One" });
  });

  it("createBook returns the created book with an id", async () => {
    const book = await BookRepository.createBook("user-1", {
      name: "New Book",
    });
    expect(book.id).toBe("new-book-id");
    expect(book.name).toBe("New Book");
    expect(book.archived).toBe(false);
  });

  it("archiveBook calls updateDoc with archived: true", async () => {
    const { updateDoc } = jest.requireMock("firebase/firestore");
    await BookRepository.archiveBook("book-1");
    expect(updateDoc).toHaveBeenCalledWith("doc-ref-book-1", { archived: true });
  });

  it("restoreBook calls updateDoc with archived: false", async () => {
    const { updateDoc } = jest.requireMock("firebase/firestore");
    await BookRepository.restoreBook("book-1");
    expect(updateDoc).toHaveBeenCalledWith("doc-ref-book-1", { archived: false });
  });
});
