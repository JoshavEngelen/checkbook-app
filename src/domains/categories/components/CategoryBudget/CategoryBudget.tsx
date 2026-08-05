interface CategoryBudgetProps {
  budget: number;
  spent?: number;
}

export function CategoryBudget({ budget, spent = 0 }: CategoryBudgetProps) {
  const remaining = budget - spent;
  const pct = budget > 0 ? Math.min((spent / budget) * 100, 100) : 0;
  const isOver = spent > budget;

  return (
    <div className="flex flex-col gap-1">
      <div className="flex justify-between text-xs text-gray-500">
        <span>Spent: ${spent.toFixed(2)}</span>
        <span className={isOver ? "text-red-600 font-medium" : ""}>
          {isOver ? `Over by $${(spent - budget).toFixed(2)}` : `$${remaining.toFixed(2)} left`}
        </span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
        <div
          className={`h-full rounded-full transition-all ${isOver ? "bg-red-500" : "bg-blue-500"}`}
          style={{ width: `${pct}%` }}
          role="progressbar"
          aria-valuenow={pct}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      </div>
      <p className="text-xs text-gray-400">Budget: ${budget.toFixed(2)}</p>
    </div>
  );
}
