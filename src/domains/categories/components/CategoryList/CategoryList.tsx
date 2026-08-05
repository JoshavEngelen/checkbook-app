"use client";

import { EmptyState } from "@/shared/components";
import { CategoryCard } from "../CategoryCard/CategoryCard";
import type { Category } from "../../types";

interface CategoryListProps {
  categories: Category[];
  onEdit: (category: Category) => void;
  onDelete: (category: Category) => void;
}

export function CategoryList({ categories, onEdit, onDelete }: CategoryListProps) {
  if (categories.length === 0) {
    return (
      <EmptyState
        title="No categories yet"
        description="Add a category to start organizing your transactions."
      />
    );
  }

  return (
    <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {categories.map((category) => (
        <li key={category.id}>
          <CategoryCard
            category={category}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        </li>
      ))}
    </ul>
  );
}
