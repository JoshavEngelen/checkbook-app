import {
  Timestamp,
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import { db } from "@/infrastructure/firebase/firestore";
import type { Transaction, CreateTransactionRequest, UpdateTransactionRequest } from "../types";

const transactionsCollection = collection(db, "transactions");

function docToTransaction(id: string, data: Record<string, unknown>): Transaction {
  return {
    id,
    bookId: data.bookId as string,
    title: data.title as string,
    amount: data.amount as number,
    type: data.type as Transaction["type"],
    categoryId: data.categoryId as string | undefined,
    date: (data.date as Timestamp).toDate(),
  };
}

export const TransactionRepository = {
  async getTransactions(bookId: string): Promise<Transaction[]> {
    const q = query(
      transactionsCollection,
      where("bookId", "==", bookId),
      orderBy("date", "desc")
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((d) => docToTransaction(d.id, d.data()));
  },

  async getTransactionById(id: string): Promise<Transaction | null> {
    const snapshot = await getDoc(doc(transactionsCollection, id));
    if (!snapshot.exists()) return null;
    return docToTransaction(snapshot.id, snapshot.data());
  },

  async createTransaction(
    bookId: string,
    request: CreateTransactionRequest
  ): Promise<Transaction> {
    const data = {
      ...request,
      bookId,
      date: Timestamp.fromDate(request.date),
    };
    const ref = await addDoc(transactionsCollection, data);
    return { id: ref.id, ...request, bookId };
  },

  async updateTransaction(
    id: string,
    request: UpdateTransactionRequest
  ): Promise<void> {
    const data = {
      ...request,
      ...(request.date !== undefined && { date: Timestamp.fromDate(request.date) }),
    };
    await updateDoc(doc(transactionsCollection, id), data);
  },

  async deleteTransaction(id: string): Promise<void> {
    await deleteDoc(doc(transactionsCollection, id));
  },
};
