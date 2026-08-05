"use client";

import { Card, Button } from "@/shared/components";
import type { Category } from "../../types";

interface CategoryCardProps {
  category: Category;
  onEdit: (category: Category) => void;
  onDelete: (category: Category) => void;
}

export function CategoryCard({ category, onEdit, onDelete }: CategoryCardProps) {
  return (
    <Card className="flex flex-col gap-3">
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-semibold text-gray-900">{category.name}</h3>
        <span className="shrink-0 text-sm font-medium text-gray-700">
          ${category.budget.toFixed(2)}
        </span>
      </div>

      {category.endDate && (
        <p className="text-xs text-gray-400">
          Ends {category.endDate.toLocaleDateString()}
        </p>
      )}

      <div className="flex gap-2">
        <Button size="sm" variant="secondary" onClick={() => onEdit(category)}>
          Edit
        </Button>
        <Button size="sm" variant="danger" onClick={() => onDelete(category)}>
          Delete
        </Button>
      </div>
    </Card>
  );
}
