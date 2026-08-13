"use client";

import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { EmptyState, Button } from "@/shared/components";
import { DroppableCategoryCard } from "@/domains/categories/components/DroppableCategoryCard/DroppableCategoryCard";
import type { Category } from "@/domains/categories";
import { SectionError } from "./SectionError";

interface DashboardCategoriesProps {
  categories: Category[];
  /** Expense totals keyed by categoryId */
  spentByCategoryId: Record<string, number>;
  loading?: boolean;
  error?: string | null;
  onRetry?: () => void;
  onAddCategory: () => void;
  onEditCategory: (category: Category) => void;
}

export function DashboardCategories({
  categories,
  spentByCategoryId,
  loading = false,
  error = null,
  onRetry,
  onAddCategory,
  onEditCategory,
}: DashboardCategoriesProps) {
  const reduced = useReducedMotion();
  return (
    <section aria-labelledby="categories-heading">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h2 id="categories-heading" className="text-lg font-semibold text-gray-900">
          Categories
        </h2>
      </div>

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
      ) : error ? (
        <SectionError message={error} onRetry={onRetry ?? (() => {})} />
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
        <motion.div
          key="category-grid"
          className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
          initial="hidden"
          animate="visible"
          variants={{
            hidden: {},
            visible: { transition: { staggerChildren: reduced ? 0 : 0.05 } },
          }}
        >
          <AnimatePresence>
            {categories.map((cat) => (
              <motion.div
                key={cat.id}
                variants={{
                  hidden: { opacity: 0, y: reduced ? 0 : 8 },
                  visible: { opacity: 1, y: 0, transition: { duration: reduced ? 0 : 0.2, ease: "easeOut" } },
                }}
                exit={{ opacity: 0, transition: { duration: reduced ? 0 : 0.12 } }}
              >
                <DroppableCategoryCard
                  category={cat}
                  spent={spentByCategoryId[cat.id] ?? 0}
                  onEdit={onEditCategory}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </section>
  );
}
