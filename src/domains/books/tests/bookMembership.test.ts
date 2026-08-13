import { getBookAccess, isBookOwner, isBookMember } from "../operations/getBookAccess";
import { BookRepository } from "../data/BookRepository";
import type { Book } from "../types";
import { Timestamp } from "firebase/firestore";

// ---------------------------------------------------------------------------
// Pure function tests — no Firebase dependency
// ---------------------------------------------------------------------------

jest.mock("firebase/firestore", () => ({
  Timestamp: { now: jest.fn() },
  getFirestore: jest.fn(),
}));

const base: Book = {
  id: "book-1",
  name: "Test",
  ownerId: "owner-uid",
  archived: false,
  participants: ["participant-uid"],
  createdAt: { seconds: 0, nanoseconds: 0 } as unknown as Timestamp,
};

describe("getBookAccess", () => {
  it("returns 'owner' for the user who owns the book", () => {
    expect(getBookAccess(base, "owner-uid")).toBe("owner");
  });

  it("returns 'participant' for a user in the participants list", () => {
    expect(getBookAccess(base, "participant-uid")).toBe("participant");
  });

  it("returns 'none' for a user not related to the book", () => {
    expect(getBookAccess(base, "stranger-uid")).toBe("none");
  });

  it("returns 'none' when participants list is empty and user is not owner", () => {
    const noParticipants = { ...base, participants: [] };
    expect(getBookAccess(noParticipants, "stranger-uid")).toBe("none");
  });

  it("owner is not treated as a participant even if uid is also in participants", () => {
    // Defensive: owner appears in both positions — must still return 'owner'.
    const overlapping = { ...base, participants: ["owner-uid", "participant-uid"] };
    expect(getBookAccess(overlapping, "owner-uid")).toBe("owner");
  });

  it("handles multiple participants and finds the correct one", () => {
    const multiParticipant = { ...base, participants: ["uid-a", "uid-b", "uid-c"] };
    expect(getBookAccess(multiParticipant, "uid-b")).toBe("participant");
    expect(getBookAccess(multiParticipant, "uid-d")).toBe("none");
  });
});

describe("isBookOwner", () => {
  it("returns true only for the owner", () => {
    expect(isBookOwner(base, "owner-uid")).toBe(true);
    expect(isBookOwner(base, "participant-uid")).toBe(false);
    expect(isBookOwner(base, "stranger-uid")).toBe(false);
  });
});

describe("isBookMember", () => {
  it("returns true for owner", () => {
    expect(isBookMember(base, "owner-uid")).toBe(true);
  });

  it("returns true for participant", () => {
    expect(isBookMember(base, "participant-uid")).toBe(true);
  });

  it("returns false for a non-member", () => {
    expect(isBookMember(base, "stranger-uid")).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Repository membership operations — Firebase mocked
// ---------------------------------------------------------------------------

jest.mock("@/infrastructure/firebase/firestore", () => ({ db: {} }));

jest.mock("firebase/firestore", () => ({
  collection: jest.fn(() => "books-collection"),
  doc: jest.fn((_col: unknown, id: string) => `doc-ref-${id}`),
  updateDoc: jest.fn(async () => undefined),
  arrayUnion: jest.fn((v: string) => `arrayUnion(${v})`),
  arrayRemove: jest.fn((v: string) => `arrayRemove(${v})`),
  // Unused by these tests but required so the module resolves:
  getDocs: jest.fn(async () => ({ docs: [] })),
  getDoc: jest.fn(),
  addDoc: jest.fn(),
  query: jest.fn(),
  where: jest.fn(),
  Timestamp: { now: jest.fn() },
}));

describe("BookRepository.addParticipant", () => {
  it("calls updateDoc with arrayUnion on the correct doc", async () => {
    const { updateDoc, arrayUnion } = jest.requireMock("firebase/firestore");
    await BookRepository.addParticipant("book-1", "new-uid");
    expect(updateDoc).toHaveBeenCalledWith(
      "doc-ref-book-1",
      { participants: arrayUnion("new-uid") }
    );
  });
});

describe("BookRepository.removeParticipant", () => {
  it("calls updateDoc with arrayRemove on the correct doc", async () => {
    const { updateDoc, arrayRemove } = jest.requireMock("firebase/firestore");
    await BookRepository.removeParticipant("book-1", "old-uid");
    expect(updateDoc).toHaveBeenCalledWith(
      "doc-ref-book-1",
      { participants: arrayRemove("old-uid") }
    );
  });
});
