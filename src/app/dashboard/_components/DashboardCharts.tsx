"use client";

import { MonthlyTrendChart } from "./MonthlyTrendChart";
import { CategoryExpenseChart } from "./CategoryExpenseChart";
import type { MonthlyTrendPoint } from "@/domains/transactions/operations/buildMonthlyChartData";
import type { CategoryExpensePoint } from "@/domains/transactions/operations/buildCategoryChartData";

interface DashboardChartsProps {
  trendData: MonthlyTrendPoint[];
  categoryData: CategoryExpensePoint[];
  /** "YYYY-MM" — used to derive the category chart subtitle. */
  statsMonth: string;
}

function monthLabel(yyyyMM: string): string {
  const [year, month] = yyyyMM.split("-").map(Number);
  return new Date(year, month - 1, 1).toLocaleString("default", {
    month: "long",
    year: "numeric",
  });
}

export function DashboardCharts({ trendData, categoryData, statsMonth }: DashboardChartsProps) {
  const label = monthLabel(statsMonth);
  return (
    <section aria-labelledby="charts-heading" className="mb-10">
      <h2 id="charts-heading" className="mb-5 text-lg font-semibold text-gray-900">
        Visual overview
      </h2>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Line chart — 12-month income vs expenses trend */}
        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
          <h3 className="mb-3 text-sm font-semibold text-gray-700">
            Monthly income &amp; expenses
          </h3>
          <MonthlyTrendChart data={trendData} />
        </div>

        {/* Bar chart — expenses by category for the selected month */}
        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
          <h3 className="mb-1 text-sm font-semibold text-gray-700">
            Expenses by category
          </h3>
          <p className="mb-3 text-xs text-gray-400">{label}</p>
          <CategoryExpenseChart data={categoryData} monthLabel={label} />
        </div>
      </div>
    </section>
  );
}
