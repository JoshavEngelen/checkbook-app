import {
  Timestamp,
  addDoc,
  arrayRemove,
  arrayUnion,
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import { db } from "@/infrastructure/firebase/firestore";
import type { Book, CreateBookRequest, UpdateBookRequest } from "../types";

const booksCollection = collection(db, "books");

function docToBook(id: string, data: Record<string, unknown>): Book {
  return {
    id,
    name: data.name as string,
    description: data.description as string | undefined,
    ownerId: data.ownerId as string,
    archived: data.archived as boolean,
    // Guard against documents created before the participants field existed.
    participants: Array.isArray(data.participants) ? (data.participants as string[]) : [],
    createdAt: data.createdAt as Timestamp,
  };
}

export const BookRepository = {
  /**
   * Returns all books where `userId` is either the owner or a participant.
   * Runs two parallel Firestore queries (Firestore does not support OR across
   * different fields in a single query) and deduplicates by document id.
   */
  async getBooks(userId: string): Promise<Book[]> {
    const [ownedSnap, participantSnap] = await Promise.all([
      getDocs(query(booksCollection, where("ownerId", "==", userId))),
      getDocs(query(booksCollection, where("participants", "array-contains", userId))),
    ]);

    const seen = new Set<string>();
    const books: Book[] = [];

    for (const snap of [ownedSnap, participantSnap]) {
      for (const d of snap.docs) {
        if (!seen.has(d.id)) {
          seen.add(d.id);
          books.push(docToBook(d.id, d.data()));
        }
      }
    }

    return books;
  },

  async getBookById(id: string): Promise<Book | null> {
    const snapshot = await getDoc(doc(booksCollection, id));
    if (!snapshot.exists()) return null;
    return docToBook(snapshot.id, snapshot.data());
  },

  async createBook(ownerId: string, request: CreateBookRequest): Promise<Book> {
    const data = {
      name: request.name,
      description: request.description,
      ownerId,
      archived: false,
      participants: [],
      createdAt: Timestamp.now(),
    };
    const ref = await addDoc(booksCollection, data);
    return { id: ref.id, ...data };
  },

  async updateBook(id: string, request: UpdateBookRequest): Promise<void> {
    await updateDoc(doc(booksCollection, id), { ...request });
  },

  async archiveBook(id: string): Promise<void> {
    await updateDoc(doc(booksCollection, id), { archived: true });
  },

  async restoreBook(id: string): Promise<void> {
    await updateDoc(doc(booksCollection, id), { archived: false });
  },

  /** Adds `participantUid` to the book's participant list. Idempotent. */
  async addParticipant(bookId: string, participantUid: string): Promise<void> {
    await updateDoc(doc(booksCollection, bookId), {
      participants: arrayUnion(participantUid),
    });
  },

  /** Removes `participantUid` from the book's participant list. Idempotent. */
  async removeParticipant(bookId: string, participantUid: string): Promise<void> {
    await updateDoc(doc(booksCollection, bookId), {
      participants: arrayRemove(participantUid),
    });
  },
};
