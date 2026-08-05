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

export type CreateBookRequest = Pick<Book, "name" | "description" | "participants">;

export type UpdateBookRequest = Partial<CreateBookRequest>;

// Lightweight projection for list views
export type BookSummary = Pick<
  Book,
  "id" | "name" | "description" | "archived" | "createdAt"
> & {
  participantCount: number;
};
