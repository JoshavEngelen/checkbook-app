import type { Book, BookAccess } from "../types";

/**
 * Returns the current user's access level for a given book.
 *
 * Rules:
 * - The user whose `uid` matches `book.ownerId` is the **owner**.
 * - Any uid listed in `book.participants` is a **participant**.
 * - Everyone else has no access.
 *
 * This is a pure function — it never touches Firebase.
 */
export function getBookAccess(book: Book, userId: string): BookAccess {
  if (book.ownerId === userId) return "owner";
  if (book.participants.includes(userId)) return "participant";
  return "none";
}

/** Convenience predicates built on top of getBookAccess. */

export function isBookOwner(book: Book, userId: string): boolean {
  return getBookAccess(book, userId) === "owner";
}

export function isBookMember(book: Book, userId: string): boolean {
  const access = getBookAccess(book, userId);
  return access === "owner" || access === "participant";
}
