"use client";

import { useState } from "react";
import { useCategories, CategoryList, CategoryForm } from "@/domains/categories";
import type { Category } from "@/domains/categories";
import { Button, Modal } from "@/shared/components";
import type { CreateCategoryValues } from "@/domains/categories/validation";

export function CategoriesContent({ bookId }: { bookId: string }) {
  const { categories, loading, createCategory, updateCategory, deleteCategory } =
    useCategories(bookId);

  const [isCreating, setIsCreating] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  async function handleCreate(values: CreateCategoryValues) {
    await createCategory(values);
    setIsCreating(false);
  }

  async function handleEdit(values: CreateCategoryValues) {
    if (!editingCategory) return;
    await updateCategory(editingCategory.id, values);
    setEditingCategory(null);
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

      <Modal open={editingCategory !== null} onClose={() => setEditingCategory(null)}>
        <h2 className="mb-4 text-lg font-semibold">Edit category</h2>
        <CategoryForm
          initial={editingCategory ?? undefined}
          onSubmit={handleEdit}
          onCancel={() => setEditingCategory(null)}
        />
      </Modal>
    </>
  );
}
