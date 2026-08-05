import { renderHook, act, waitFor } from "@testing-library/react";
import { useBooks } from "../hooks/useBooks";
import { BookRepository } from "../data/BookRepository";
import { Timestamp } from "firebase/firestore";

jest.mock("firebase/firestore", () => ({
  Timestamp: { now: jest.fn(() => ({ seconds: 0, nanoseconds: 0 })) },
  getFirestore: jest.fn(),
  collection: jest.fn(),
  doc: jest.fn(),
  addDoc: jest.fn(),
  getDoc: jest.fn(),
  getDocs: jest.fn(),
  query: jest.fn(),
  updateDoc: jest.fn(),
  where: jest.fn(),
}));

jest.mock("../data/BookRepository");
const mockUser = { uid: "user-1" };
jest.mock("@/auth/hooks/useAuth", () => ({
  useAuth: () => ({ user: mockUser }),
}));

const mockBook = {
  id: "book-1",
  name: "Test Book",
  ownerId: "user-1",
  archived: false,
  participants: [],
  createdAt: { seconds: 0, nanoseconds: 0 } as unknown as Timestamp,
};

beforeEach(() => {
  jest.mocked(BookRepository.getBooks).mockResolvedValue([mockBook]);
  jest.mocked(BookRepository.createBook).mockResolvedValue({ ...mockBook, id: "book-2", name: "New" });
  jest.mocked(BookRepository.getBookById).mockResolvedValue(mockBook);
  jest.mocked(BookRepository.archiveBook).mockResolvedValue(undefined);
  jest.mocked(BookRepository.restoreBook).mockResolvedValue(undefined);
});

describe("useBooks", () => {
  it("loads books on mount", async () => {
    const { result } = renderHook(() => useBooks());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.books).toHaveLength(1);
    expect(result.current.books[0].name).toBe("Test Book");
  });

  it("createBook appends the new book", async () => {
    const { result } = renderHook(() => useBooks());
    await waitFor(() => expect(result.current.loading).toBe(false));
    await act(async () => {
      await result.current.createBook({ name: "New", participants: [] });
    });
    expect(result.current.books).toHaveLength(2);
  });

  it("archiveBook sets the book as archived", async () => {
    const { result } = renderHook(() => useBooks());
    await waitFor(() => expect(result.current.loading).toBe(false));
    await act(async () => {
      await result.current.archiveBook("book-1");
    });
    expect(result.current.books[0].archived).toBe(true);
  });

  it("restoreBook sets the book as not archived", async () => {
    jest.mocked(BookRepository.getBooks).mockResolvedValue([{ ...mockBook, archived: true }]);
    const { result } = renderHook(() => useBooks());
    await waitFor(() => expect(result.current.loading).toBe(false));
    await act(async () => {
      await result.current.restoreBook("book-1");
    });
    expect(result.current.books[0].archived).toBe(false);
  });
});
