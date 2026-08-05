import {
  Timestamp,
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import { db } from "@/infrastructure/firebase/firestore";
import type { Category, CreateCategoryRequest, UpdateCategoryRequest } from "../types";

const categoriesCollection = collection(db, "categories");

function docToCategory(id: string, data: Record<string, unknown>): Category {
  return {
    id,
    bookId: data.bookId as string,
    name: data.name as string,
    budget: data.budget as number,
    endDate: data.endDate
      ? (data.endDate as Timestamp).toDate()
      : undefined,
  };
}

export const CategoryRepository = {
  async getCategories(bookId: string): Promise<Category[]> {
    const q = query(categoriesCollection, where("bookId", "==", bookId));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((d) => docToCategory(d.id, d.data()));
  },

  async getCategoryById(id: string): Promise<Category | null> {
    const snapshot = await getDoc(doc(categoriesCollection, id));
    if (!snapshot.exists()) return null;
    return docToCategory(snapshot.id, snapshot.data());
  },

  async createCategory(bookId: string, request: CreateCategoryRequest): Promise<Category> {
    const data = {
      ...request,
      bookId,
      endDate: request.endDate ? Timestamp.fromDate(request.endDate) : null,
    };
    const ref = await addDoc(categoriesCollection, data);
    return { id: ref.id, ...request, bookId };
  },

  async updateCategory(id: string, request: UpdateCategoryRequest): Promise<void> {
    const data = {
      ...request,
      ...(request.endDate !== undefined && {
        endDate: request.endDate ? Timestamp.fromDate(request.endDate) : null,
      }),
    };
    await updateDoc(doc(categoriesCollection, id), data);
  },

  async deleteCategory(id: string): Promise<void> {
    await deleteDoc(doc(categoriesCollection, id));
  },
};
