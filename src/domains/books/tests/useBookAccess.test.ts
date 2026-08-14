import { renderHook } from "@testing-library/react";
import { useBookAccess } from "../hooks/useBookAccess";
import { useBook } from "../hooks/useBook";
import { Timestamp } from "firebase/firestore";
import type { Book } from "../types";

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

jest.mock("firebase/firestore", () => ({
  Timestamp: { now: jest.fn() },
  getFirestore: jest.fn(),
  collection: jest.fn(),
  doc: jest.fn(),
  getDoc: jest.fn(),
  getDocs: jest.fn(),
  query: jest.fn(),
  updateDoc: jest.fn(),
  where: jest.fn(),
  arrayUnion: jest.fn(),
  arrayRemove: jest.fn(),
}));

jest.mock("firebase/auth", () => ({
  getAuth: jest.fn(),
  onAuthStateChanged: jest.fn(),
  GoogleAuthProvider: jest.fn(),
  signInWithPopup: jest.fn(),
  signInWithEmailAndPassword: jest.fn(),
  createUserWithEmailAndPassword: jest.fn(),
  signOut: jest.fn(),
}));

jest.mock("@/infrastructure/firebase/auth", () => ({ auth: {} }));
jest.mock("@/infrastructure/firebase/firestore", () => ({ db: {} }));

jest.mock("../hooks/useBook");
jest.mock("@/auth/hooks/useAuth");

const mockBook: Book = {
  id: "book-1",
  name: "Test Book",
  ownerId: "owner-uid",
  archived: false,
  participants: ["participant-uid"],
  createdAt: { seconds: 0, nanoseconds: 0 } as unknown as Timestamp,
};

function setupMocks(opts: {
  book: Book | null;
  loading?: boolean;
  error?: string | null;
  forbidden?: boolean;
  uid: string | null;
}) {
  const { useBook: mockUseBook } = jest.requireMock("../hooks/useBook") as {
    useBook: jest.Mock;
  };
  const { useAuth } = jest.requireMock("@/auth/hooks/useAuth") as {
    useAuth: jest.Mock;
  };

  mockUseBook.mockReturnValue({
    book: opts.book,
    loading: opts.loading ?? false,
    error: opts.error ?? null,
    forbidden: opts.forbidden ?? false,
  });

  useAuth.mockReturnValue({ user: opts.uid ? { uid: opts.uid } : null });
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("useBookAccess", () => {
  beforeEach(() => jest.clearAllMocks());

  it("returns 'owner' access for the book owner", () => {
    setupMocks({ book: mockBook, uid: "owner-uid" });
    const { result } = renderHook(() => useBookAccess("book-1"));
    expect(result.current.access).toBe("owner");
    expect(result.current.isOwner).toBe(true);
    expect(result.current.isMember).toBe(true);
  });

  it("returns 'participant' access for a participant", () => {
    setupMocks({ book: mockBook, uid: "participant-uid" });
    const { result } = renderHook(() => useBookAccess("book-1"));
    expect(result.current.access).toBe("participant");
    expect(result.current.isOwner).toBe(false);
    expect(result.current.isMember).toBe(true);
  });

  it("returns 'none' for a stranger", () => {
    setupMocks({ book: mockBook, uid: "stranger-uid" });
    const { result } = renderHook(() => useBookAccess("book-1"));
    expect(result.current.access).toBe("none");
    expect(result.current.isOwner).toBe(false);
    expect(result.current.isMember).toBe(false);
  });

  it("returns 'none' when the book has not loaded yet", () => {
    setupMocks({ book: null, loading: true, uid: "owner-uid" });
    const { result } = renderHook(() => useBookAccess("book-1"));
    expect(result.current.access).toBe("none");
    expect(result.current.loading).toBe(true);
  });

  it("returns 'none' when the user is not authenticated", () => {
    setupMocks({ book: mockBook, uid: null });
    const { result } = renderHook(() => useBookAccess("book-1"));
    expect(result.current.access).toBe("none");
  });

  it("passes through forbidden flag from useBook", () => {
    setupMocks({ book: null, forbidden: true, uid: "owner-uid" });
    const { result } = renderHook(() => useBookAccess("book-1"));
    expect(result.current.forbidden).toBe(true);
  });

  it("passes through error from useBook", () => {
    setupMocks({ book: null, error: "Network error", uid: "owner-uid" });
    const { result } = renderHook(() => useBookAccess("book-1"));
    expect(result.current.error).toBe("Network error");
  });
});
