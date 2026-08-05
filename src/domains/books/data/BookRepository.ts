import {
  Timestamp,
  addDoc,
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
    participants: data.participants as string[],
    createdAt: data.createdAt as Timestamp,
  };
}

export const BookRepository = {
  async getBooks(ownerId: string): Promise<Book[]> {
    const q = query(booksCollection, where("ownerId", "==", ownerId));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((d) => docToBook(d.id, d.data()));
  },

  async getBookById(id: string): Promise<Book | null> {
    const snapshot = await getDoc(doc(booksCollection, id));
    if (!snapshot.exists()) return null;
    return docToBook(snapshot.id, snapshot.data());
  },

  async createBook(ownerId: string, request: CreateBookRequest): Promise<Book> {
    const data = {
      ...request,
      ownerId,
      archived: false,
      participants: request.participants ?? [],
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
};
