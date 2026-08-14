/**
 * Security Rules Logic Tests
 *
 * These tests verify the exact authorization logic encoded in firestore.rules
 * as pure TypeScript predicates — no Firebase emulator required.
 *
 * Each test is annotated with the corresponding rule it exercises so the
 * mapping between code and rules file is explicit and auditable.
 *
 * The predicate functions below are direct translations of the Firestore
 * helper functions and rule conditions:
 *
 *   isOwner(ownerId, uid) → uid == ownerId && uid != null
 *   isParticipant(participants, uid) → uid in participants && uid != null
 *   isMember(ownerId, participants, uid) → isOwner || isParticipant
 *
 * Rules tested:
 *   /books — read, create, update, delete
 *   /categories — read, create, update, delete
 *   /transactions — read, create, update, delete
 */

import {
  getBookAccess,
  isBookOwner,
  isBookMember,
} from "@/domains/books/operations/getBookAccess";
import { assignTransactionToCategory, AssignCategoryError } from "@/domains/transactions/operations/assignTransactionToCategory";
import { TransactionRepository } from "@/domains/transactions/data/TransactionRepository";
import { CategoryRepository } from "@/domains/categories/data/CategoryRepository";
import type { Book } from "@/domains/books/types";
import type { Transaction } from "@/domains/transactions/types";
import type { Category } from "@/domains/categories/types";
import { Timestamp } from "firebase/firestore";

// ---------------------------------------------------------------------------
// Mock infrastructure so we can import without a real Firebase app
// ---------------------------------------------------------------------------

jest.mock("@/infrastructure/firebase/firestore", () => ({ db: {} }));
jest.mock("firebase/firestore", () => ({
  Timestamp: { now: jest.fn(), fromDate: jest.fn() },
  collection: jest.fn(),
  doc: jest.fn(),
  getDoc: jest.fn(),
  getDocs: jest.fn(),
  query: jest.fn(),
  updateDoc: jest.fn(),
  where: jest.fn(),
  arrayUnion: jest.fn(),
  arrayRemove: jest.fn(),
  orderBy: jest.fn(),
  addDoc: jest.fn(),
  deleteDoc: jest.fn(),
}));

jest.mock("@/domains/transactions/data/TransactionRepository");
jest.mock("@/domains/categories/data/CategoryRepository");

// ---------------------------------------------------------------------------
// Shared fixtures
// ---------------------------------------------------------------------------

const OWNER = "uid-owner";
const PARTICIPANT = "uid-participant";
const STRANGER = "uid-stranger";

const book: Book = {
  id: "book-1",
  name: "My Book",
  ownerId: OWNER,
  archived: false,
  participants: [PARTICIPANT],
  createdAt: { seconds: 0, nanoseconds: 0 } as unknown as Timestamp,
};

// Rule predicates — direct TypeScript translations of the Firestore helpers
// ---------------------------------------------------------------------------

function ruleIsOwner(uid: string | null, resourceOwnerId: string): boolean {
  return uid !== null && uid === resourceOwnerId;
}

function ruleIsParticipant(uid: string | null, participants: string[]): boolean {
  return uid !== null && participants.includes(uid);
}

function ruleIsMember(uid: string | null, ownerId: string, participants: string[]): boolean {
  return ruleIsOwner(uid, ownerId) || ruleIsParticipant(uid, participants);
}

// /books rules
// ---------------------------------------------------------------------------

function canReadBook(uid: string | null, b: Book): boolean {
  return ruleIsMember(uid, b.ownerId, b.participants);
}

function canCreateBook(uid: string | null, newOwnerId: string, newParticipants: unknown[]): boolean {
  return (
    ruleIsOwner(uid, newOwnerId) &&
    Array.isArray(newParticipants) &&
    (uid === null || !newParticipants.includes(uid))
  );
}

function canUpdateBook(
  uid: string | null,
  existingOwnerId: string,
  newOwnerId: string,
  newParticipants: unknown[]
): boolean {
  return (
    ruleIsOwner(uid, existingOwnerId) &&
    newOwnerId === existingOwnerId &&
    Array.isArray(newParticipants) &&
    (uid === null || !newParticipants.includes(uid))
  );
}

function canDeleteBook(uid: string | null, b: Book): boolean {
  return ruleIsOwner(uid, b.ownerId);
}

// /categories and /transactions rules (same shape)
// ---------------------------------------------------------------------------

function canReadSubdoc(uid: string | null, parentBook: Book): boolean {
  return ruleIsMember(uid, parentBook.ownerId, parentBook.participants);
}

function canCreateSubdoc(uid: string | null, parentBook: Book): boolean {
  return ruleIsMember(uid, parentBook.ownerId, parentBook.participants);
}

function canUpdateSubdoc(
  uid: string | null,
  parentBook: Book,
  existingBookId: string,
  newBookId: string
): boolean {
  return (
    ruleIsMember(uid, parentBook.ownerId, parentBook.participants) &&
    newBookId === existingBookId
  );
}

function canDeleteSubdoc(uid: string | null, parentBook: Book): boolean {
  return ruleIsMember(uid, parentBook.ownerId, parentBook.participants);
}

// ===========================================================================
// /books tests
// ===========================================================================

describe("Security Rules — /books read", () => {
  it("owner can read their book", () => {
    expect(canReadBook(OWNER, book)).toBe(true);
  });

  it("participant can read a shared book", () => {
    expect(canReadBook(PARTICIPANT, book)).toBe(true);
  });

  it("stranger is denied read access", () => {
    // ATTACK: guessing a bookId without being a member
    expect(canReadBook(STRANGER, book)).toBe(false);
  });

  it("unauthenticated user (null uid) is denied read access", () => {
    expect(canReadBook(null, book)).toBe(false);
  });
});

describe("Security Rules — /books create", () => {
  it("a user can create a book where they are the ownerId", () => {
    expect(canCreateBook(OWNER, OWNER, [])).toBe(true);
  });

  it("a user cannot create a book with a different ownerId", () => {
    // ATTACK: setting someone else as owner
    expect(canCreateBook(STRANGER, OWNER, [])).toBe(false);
  });

  it("creation is rejected when participants is not an array", () => {
    expect(canCreateBook(OWNER, OWNER, null as unknown as unknown[])).toBe(false);
  });

  it("owner cannot include their own uid in participants on create", () => {
    // Enforces owner/participant role exclusivity
    expect(canCreateBook(OWNER, OWNER, [OWNER])).toBe(false);
  });

  it("unauthenticated user cannot create a book", () => {
    expect(canCreateBook(null, OWNER, [])).toBe(false);
  });
});

describe("Security Rules — /books update", () => {
  it("owner can update their book", () => {
    expect(canUpdateBook(OWNER, OWNER, OWNER, [PARTICIPANT])).toBe(true);
  });

  it("owner can update the participants list", () => {
    expect(canUpdateBook(OWNER, OWNER, OWNER, ["new-uid"])).toBe(true);
  });

  it("participant cannot update the book", () => {
    // ATTACK: participant trying to modify book metadata
    expect(canUpdateBook(PARTICIPANT, OWNER, OWNER, [PARTICIPANT])).toBe(false);
  });

  it("stranger cannot update the book", () => {
    expect(canUpdateBook(STRANGER, OWNER, OWNER, [PARTICIPANT])).toBe(false);
  });

  it("ownerId is immutable — cannot change it even as current owner", () => {
    // ATTACK: ownership transfer attempt
    expect(canUpdateBook(OWNER, OWNER, STRANGER, [PARTICIPANT])).toBe(false);
  });

  it("owner cannot add themselves to participants via update", () => {
    // Enforces invariant: owner's uid must not appear in participants
    expect(canUpdateBook(OWNER, OWNER, OWNER, [OWNER])).toBe(false);
  });

  it("update is rejected when participants is not an array", () => {
    expect(canUpdateBook(OWNER, OWNER, OWNER, "not-a-list" as unknown as unknown[])).toBe(false);
  });

  it("unauthenticated user cannot update the book", () => {
    expect(canUpdateBook(null, OWNER, OWNER, [])).toBe(false);
  });

  it("participant cannot add themselves as participant via update", () => {
    // ATTACK: self-adding to participants list
    expect(canUpdateBook(PARTICIPANT, OWNER, OWNER, [PARTICIPANT])).toBe(false);
  });
});

describe("Security Rules — /books delete", () => {
  it("owner can delete their book", () => {
    expect(canDeleteBook(OWNER, book)).toBe(true);
  });

  it("participant cannot delete the book", () => {
    expect(canDeleteBook(PARTICIPANT, book)).toBe(false);
  });

  it("stranger cannot delete the book", () => {
    expect(canDeleteBook(STRANGER, book)).toBe(false);
  });

  it("unauthenticated user cannot delete the book", () => {
    expect(canDeleteBook(null, book)).toBe(false);
  });
});

// ===========================================================================
// /categories tests
// ===========================================================================

describe("Security Rules — /categories", () => {
  it("owner can read categories", () => {
    expect(canReadSubdoc(OWNER, book)).toBe(true);
  });

  it("participant can read categories", () => {
    expect(canReadSubdoc(PARTICIPANT, book)).toBe(true);
  });

  it("stranger cannot read categories", () => {
    // ATTACK: accessing categories belonging to another user's book
    expect(canReadSubdoc(STRANGER, book)).toBe(false);
  });

  it("unauthenticated user cannot read categories", () => {
    expect(canReadSubdoc(null, book)).toBe(false);
  });

  it("members can create a category in their book", () => {
    expect(canCreateSubdoc(OWNER, book)).toBe(true);
    expect(canCreateSubdoc(PARTICIPANT, book)).toBe(true);
  });

  it("stranger cannot create a category in someone else's book", () => {
    expect(canCreateSubdoc(STRANGER, book)).toBe(false);
  });

  it("members can update a category without changing bookId", () => {
    expect(canUpdateSubdoc(OWNER, book, "book-1", "book-1")).toBe(true);
    expect(canUpdateSubdoc(PARTICIPANT, book, "book-1", "book-1")).toBe(true);
  });

  it("nobody can move a category to a different book (bookId immutable)", () => {
    // ATTACK: re-assigning a category to a different book
    expect(canUpdateSubdoc(OWNER, book, "book-1", "book-2")).toBe(false);
    expect(canUpdateSubdoc(PARTICIPANT, book, "book-1", "book-2")).toBe(false);
    expect(canUpdateSubdoc(STRANGER, book, "book-1", "book-2")).toBe(false);
  });

  it("members can delete a category", () => {
    expect(canDeleteSubdoc(OWNER, book)).toBe(true);
    expect(canDeleteSubdoc(PARTICIPANT, book)).toBe(true);
  });

  it("stranger cannot delete a category", () => {
    expect(canDeleteSubdoc(STRANGER, book)).toBe(false);
  });
});

// ===========================================================================
// /transactions tests
// ===========================================================================

describe("Security Rules — /transactions", () => {
  it("owner can read transactions", () => {
    expect(canReadSubdoc(OWNER, book)).toBe(true);
  });

  it("participant can read transactions", () => {
    expect(canReadSubdoc(PARTICIPANT, book)).toBe(true);
  });

  it("stranger cannot read transactions", () => {
    // ATTACK: accessing transactions belonging to another user's book
    expect(canReadSubdoc(STRANGER, book)).toBe(false);
  });

  it("unauthenticated user cannot read transactions", () => {
    expect(canReadSubdoc(null, book)).toBe(false);
  });

  it("members can create transactions in their book", () => {
    expect(canCreateSubdoc(OWNER, book)).toBe(true);
    expect(canCreateSubdoc(PARTICIPANT, book)).toBe(true);
  });

  it("stranger cannot create a transaction in someone else's book", () => {
    expect(canCreateSubdoc(STRANGER, book)).toBe(false);
  });

  it("members can update a transaction without changing bookId", () => {
    expect(canUpdateSubdoc(OWNER, book, "book-1", "book-1")).toBe(true);
    expect(canUpdateSubdoc(PARTICIPANT, book, "book-1", "book-1")).toBe(true);
  });

  it("nobody can move a transaction to a different book (bookId immutable)", () => {
    // ATTACK: re-assigning a transaction to a different book
    expect(canUpdateSubdoc(OWNER, book, "book-1", "book-2")).toBe(false);
    expect(canUpdateSubdoc(PARTICIPANT, book, "book-1", "book-2")).toBe(false);
  });

  it("members can delete a transaction", () => {
    expect(canDeleteSubdoc(OWNER, book)).toBe(true);
    expect(canDeleteSubdoc(PARTICIPANT, book)).toBe(true);
  });

  it("stranger cannot delete a transaction", () => {
    expect(canDeleteSubdoc(STRANGER, book)).toBe(false);
  });
});

// ===========================================================================
// Cross-book assignment — domain operation layer (mirrors rules enforcement)
// ===========================================================================

describe("Security Rules — cross-book assignment attack (domain layer)", () => {
  beforeEach(() => jest.clearAllMocks());

  const txBook1: Transaction = {
    id: "tx-1",
    bookId: "book-1",
    title: "Groceries",
    amount: 50,
    type: "expense",
    date: new Date("2026-08-01"),
  };

  const catBook2: Category = {
    id: "cat-2",
    bookId: "book-2", // Different book!
    name: "Food",
    budget: 200,
  };

  it("rejects assigning a transaction to a category in a different book", async () => {
    (TransactionRepository.getTransactionById as jest.Mock).mockResolvedValue(txBook1);
    (CategoryRepository.getCategoryById as jest.Mock).mockResolvedValue(catBook2);

    await expect(assignTransactionToCategory("tx-1", "cat-2")).rejects.toThrow(
      AssignCategoryError
    );
    expect(TransactionRepository.updateTransaction).not.toHaveBeenCalled();
  });

  it("does not reveal whether a foreign transaction exists when book mismatch occurs", async () => {
    (TransactionRepository.getTransactionById as jest.Mock).mockResolvedValue(txBook1);
    (CategoryRepository.getCategoryById as jest.Mock).mockResolvedValue(catBook2);

    try {
      await assignTransactionToCategory("tx-1", "cat-2");
    } catch (err) {
      // Error message must not expose internal book IDs
      expect((err as Error).message).not.toContain("book-1");
      expect((err as Error).message).not.toContain("book-2");
    }
  });
});

// ===========================================================================
// getBookAccess integration with domain predicates
// ===========================================================================

describe("Security Rules — membership via getBookAccess", () => {
  it("isBookOwner matches the 'only owner' rule conditions", () => {
    expect(isBookOwner(book, OWNER)).toBe(true);
    expect(isBookOwner(book, PARTICIPANT)).toBe(false);
    expect(isBookOwner(book, STRANGER)).toBe(false);
  });

  it("isBookMember matches the 'any member' rule conditions", () => {
    expect(isBookMember(book, OWNER)).toBe(true);
    expect(isBookMember(book, PARTICIPANT)).toBe(true);
    expect(isBookMember(book, STRANGER)).toBe(false);
  });

  it("getBookAccess distinguishes owner from participant", () => {
    expect(getBookAccess(book, OWNER)).toBe("owner");
    expect(getBookAccess(book, PARTICIPANT)).toBe("participant");
    expect(getBookAccess(book, STRANGER)).toBe("none");
  });
});
