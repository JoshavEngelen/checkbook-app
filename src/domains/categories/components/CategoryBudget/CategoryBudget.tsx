interface CategoryBudgetProps {
  budget: number;
  spent?: number;
}

export function CategoryBudget({ budget, spent = 0 }: CategoryBudgetProps) {
  const remaining = budget - spent;
  const pct = budget > 0 ? Math.min((spent / budget) * 100, 100) : 0;
  const isOver = spent > budget;
  const isNear = !isOver && pct >= 80;

  const barColor = isOver ? "bg-red-500" : isNear ? "bg-amber-400" : "bg-blue-500";
  const valueColor = isOver ? "text-red-600" : isNear ? "text-amber-600" : "text-gray-700";
  const remainingLabel = isOver ? "Over budget" : "Remaining";

  return (
    <div className="flex flex-col gap-1">
      {/* Two-row label/value layout avoids wrapping issues in narrow cards */}
      <div className="flex justify-between text-xs text-gray-400">
        <span>Spent</span>
        <span>{remainingLabel}</span>
      </div>
      <div className="flex justify-between text-xs font-medium">
        <span className="text-gray-700">${spent.toFixed(2)}</span>
        <span className={valueColor}>
          {isOver ? `$${(spent - budget).toFixed(2)}` : `$${remaining.toFixed(2)}`}
        </span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
        <div
          className={`h-full rounded-full transition-all ${barColor}`}
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
