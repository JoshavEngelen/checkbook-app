"use client";

import { useState } from "react";
import { useCategories, CategoryList, CategoryForm } from "@/domains/categories";
import type { Category } from "@/domains/categories";
import { useTransactions } from "@/domains/transactions";
import { Button, Modal } from "@/shared/components";
import type { CreateCategoryValues } from "@/domains/categories/validation";
import type { CreateTransactionValues } from "@/domains/transactions/validation";
import { CategoryEditModal } from "@/app/_components/CategoryEditModal";

export function CategoriesContent({ bookId }: { bookId: string }) {
  const { categories, loading, createCategory, updateCategory, deleteCategory } =
    useCategories(bookId);
  const { transactions, updateTransaction, deleteTransaction } = useTransactions(bookId);

  const [isCreating, setIsCreating] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  const categoryOptions = categories.map((c) => ({ value: c.id, label: c.name }));

  async function handleCreate(values: CreateCategoryValues) {
    await createCategory(values);
    setIsCreating(false);
  }

  async function handleUpdateCategory(values: CreateCategoryValues) {
    if (!editingCategory) return;
    await updateCategory(editingCategory.id, values);
    setEditingCategory(null);
  }

  async function handleUpdateTransaction(id: string, values: CreateTransactionValues) {
    await updateTransaction(id, values);
  }

  if (loading) return null;

  return (
    <>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Categories</h1>
        <Button onClick={() => setIsCreating(true)}>New category</Button>
      </div>

      <CategoryList
        categories={categories}
        onEdit={setEditingCategory}
        onDelete={(c) => deleteCategory(c.id)}
      />

      <Modal open={isCreating} onClose={() => setIsCreating(false)}>
        <h2 className="mb-4 text-lg font-semibold">Create category</h2>
        <CategoryForm onSubmit={handleCreate} onCancel={() => setIsCreating(false)} />
      </Modal>

      <CategoryEditModal
        category={editingCategory}
        onClose={() => setEditingCategory(null)}
        onUpdateCategory={handleUpdateCategory}
        transactions={transactions}
        categoryOptions={categoryOptions}
        onUpdateTransaction={handleUpdateTransaction}
        onDeleteTransaction={(id) => deleteTransaction(id)}
      />
    </>
  );
}
