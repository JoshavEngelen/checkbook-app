"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import type { CategoryExpensePoint } from "@/domains/transactions/operations/buildCategoryChartData";

interface CategoryExpenseChartProps {
  data: CategoryExpensePoint[];
  /** The selected month label for the chart title, e.g. "August 2026". */
  monthLabel: string;
}

// A fixed palette cycles for categories beyond its length.
const BAR_COLORS = [
  "#3b82f6", // blue-500
  "#8b5cf6", // violet-500
  "#f59e0b", // amber-500
  "#06b6d4", // cyan-500
  "#ec4899", // pink-500
  "#10b981", // emerald-500
];

function dollarFormatter(value: number): string {
  return `$${value.toFixed(2)}`;
}

export function CategoryExpenseChart({ data, monthLabel }: CategoryExpenseChartProps) {
  if (data.length === 0) {
    return (
      <div className="flex h-56 items-center justify-center rounded-lg border border-dashed border-gray-200 bg-gray-50">
        <p className="text-sm text-gray-400">No categorised expenses for {monthLabel}</p>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart
        data={data}
        layout="vertical"
        margin={{ top: 4, right: 24, left: 8, bottom: 0 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
        <XAxis
          type="number"
          tickFormatter={dollarFormatter}
          tick={{ fontSize: 11, fill: "#6b7280" }}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          type="category"
          dataKey="name"
          tick={{ fontSize: 11, fill: "#6b7280" }}
          tickLine={false}
          axisLine={false}
          width={80}
        />
        <Tooltip
          formatter={(value) => [dollarFormatter(Number(value ?? 0)), "Expenses"]}
          contentStyle={{ borderRadius: 8, border: "1px solid #e5e7eb", fontSize: 12 }}
        />
        <Bar dataKey="expenses" radius={[0, 4, 4, 0]} maxBarSize={24}>
          {data.map((_, index) => (
            <Cell
              key={index}
              fill={BAR_COLORS[index % BAR_COLORS.length]}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
