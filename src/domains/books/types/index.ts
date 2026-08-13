import { Timestamp } from "firebase/firestore";

export type Book = {
  id: string;
  name: string;
  description?: string;
  ownerId: string;
  archived: boolean;
  /** Firebase UIDs of invited participants (does not include the owner). */
  participants: string[];
  createdAt: Timestamp;
};

/**
 * The current user's relationship to a household book.
 * - `owner`       — created the book; full control.
 * - `participant` — invited member; can read/write contents.
 * - `none`        — no relationship; must not access the book.
 */
export type BookAccess = "owner" | "participant" | "none";

export type CreateBookRequest = Pick<Book, "name" | "description">;

export type UpdateBookRequest = Partial<CreateBookRequest>;

// Lightweight projection for list views — includes ownerId so consumers can
// distinguish owner from participant without fetching the full document.
export type BookSummary = Pick<
  Book,
  "id" | "name" | "description" | "archived" | "ownerId" | "createdAt"
> & {
  participantCount: number;
};

