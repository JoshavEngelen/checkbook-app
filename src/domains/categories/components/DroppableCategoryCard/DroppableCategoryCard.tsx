"use client";

import { useDroppable } from "@dnd-kit/core";
import clsx from "clsx";
import { Card } from "@/shared/components";
import { CategoryBudget } from "../CategoryBudget/CategoryBudget";
import type { Category } from "../../types";

interface DroppableCategoryCardProps {
  category: Category;
  spent: number;
  onEdit: (category: Category) => void;
}

/**
 * Category card that acts as a drop target for DraggableTransactionCard.
 * Highlights with a ring when a transaction is dragged over it.
 */
export function DroppableCategoryCard({ category, spent, onEdit }: DroppableCategoryCardProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: category.id,
    data: { categoryId: category.id },
  });

  return (
    <div
      ref={setNodeRef}
      className={clsx(
        "rounded-lg transition-shadow",
        isOver && "ring-2 ring-blue-400 ring-offset-2"
      )}
      aria-label={`Drop zone: ${category.name}`}
    >
      <Card className="flex flex-col gap-3">
        <button
          type="button"
          onClick={() => onEdit(category)}
          className="min-w-0 truncate text-left font-medium text-gray-900 hover:text-blue-600 hover:underline underline-offset-2"
        >
          {category.name}
        </button>
        {category.endDate && (
          <span className="text-xs text-gray-400">
            until {category.endDate.toLocaleDateString()}
          </span>
        )}
        <CategoryBudget budget={category.budget} spent={spent} />
        {isOver && (
          <p className="text-center text-xs font-medium text-blue-600" aria-live="polite">
            Drop to assign
          </p>
        )}
      </Card>
    </div>
  );
}
