"use client";

import Link from "next/link";
import { Card, EmptyState, Button } from "@/shared/components";
import { CategoryBudget } from "@/domains/categories";
import type { Category } from "@/domains/categories";

interface DashboardCategoriesProps {
  bookId: string;
  categories: Category[];
  /** Expense totals keyed by categoryId */
  spentByCategoryId: Record<string, number>;
  loading?: boolean;
  onAddCategory: () => void;
}

export function DashboardCategories({
  bookId,
  categories,
  spentByCategoryId,
  loading = false,
  onAddCategory,
}: DashboardCategoriesProps) {
  return (
    <section aria-labelledby="categories-heading">
      <h2 id="categories-heading" className="mb-3 text-lg font-semibold text-gray-900">
        Categories
      </h2>
      
      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
              <div className="mb-3 h-4 w-2/3 animate-pulse rounded bg-gray-200" />
              <div className="mb-2 h-3 w-full animate-pulse rounded bg-gray-200" />
              <div className="h-2 w-full animate-pulse rounded-full bg-gray-200" />
            </div>
          ))}
        </div>
      ) : categories.length === 0 ? (
        <EmptyState
          title="No categories yet"
          description="Add a category to start tracking your spending against a budget."
          action={
            <Button variant="secondary" size="sm" onClick={onAddCategory}>
              + Add category
            </Button>
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((cat) => (
            <Card key={cat.id} className="flex flex-col gap-3">
              <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                <Link
                  href={`/books/${bookId}/categories`}
                  className="min-w-0 truncate font-medium text-gray-900 hover:text-blue-600 hover:underline underline-offset-2"
                >
                  {cat.name}
                </Link>
                {cat.endDate && (
                  <span className="shrink-0 whitespace-nowrap text-xs text-gray-400">
                    until {cat.endDate.toLocaleDateString()}
                  </span>
                )}
              </div>
              <CategoryBudget
                budget={cat.budget}
                spent={spentByCategoryId[cat.id] ?? 0}
              />
            </Card>
          ))}
        </div>
      )}
    </section>
  );
}
