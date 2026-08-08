import { Card, EmptyState } from "@/shared/components";
import { CategoryBudget } from "@/domains/categories";
import type { Category } from "@/domains/categories";

interface DashboardCategoriesProps {
  categories: Category[];
  /** Expense totals keyed by categoryId */
  spentByCategoryId: Record<string, number>;
}

export function DashboardCategories({
  categories,
  spentByCategoryId,
}: DashboardCategoriesProps) {
  return (
    <section aria-labelledby="categories-heading">
      <h2 id="categories-heading" className="mb-3 text-lg font-semibold text-gray-900">
        Categories
      </h2>

      {categories.length === 0 ? (
        <EmptyState
          title="No categories yet"
          description="Add categories to track your spending against a budget."
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((cat) => (
            <Card key={cat.id} className="flex flex-col gap-3">
              <div className="flex items-baseline justify-between gap-2">
                <h3 className="font-medium text-gray-900 truncate">{cat.name}</h3>
                {cat.endDate && (
                  <span className="shrink-0 text-xs text-gray-400">
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
