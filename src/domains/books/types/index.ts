import { Timestamp } from "firebase/firestore";

export type Book = {
  id: string;
  name: string;
  description?: string;
  ownerId: string;
  archived: boolean;
  participants: string[];
  createdAt: Timestamp;
};

// Fields the user provides when creating or editing a book
export type BookForm = Pick<Book, "name" | "description" | "participants">;

// Lightweight projection for list views
export type BookSummary = Pick<
  Book,
  "id" | "name" | "description" | "archived" | "createdAt"
> & {
  participantCount: number;
};
