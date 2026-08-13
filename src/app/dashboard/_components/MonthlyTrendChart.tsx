"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import type { MonthlyTrendPoint } from "@/domains/transactions/operations/buildMonthlyChartData";

interface MonthlyTrendChartProps {
  data: MonthlyTrendPoint[];
}

function dollarFormatter(value: number): string {
  return `$${value.toFixed(2)}`;
}

export function MonthlyTrendChart({ data }: MonthlyTrendChartProps) {
  const hasData = data.some((p) => p.income > 0 || p.expenses > 0);

  if (!hasData) {
    return (
      <div className="flex h-56 items-center justify-center rounded-lg border border-dashed border-gray-200 bg-gray-50">
        <p className="text-sm text-gray-400">No transactions yet</p>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={220}>
      <LineChart data={data} margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis
          dataKey="label"
          tick={{ fontSize: 11, fill: "#6b7280" }}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          tickFormatter={dollarFormatter}
          tick={{ fontSize: 11, fill: "#6b7280" }}
          tickLine={false}
          axisLine={false}
          width={64}
        />
        <Tooltip
          formatter={(value, name) => [
            dollarFormatter(Number(value ?? 0)),
            name === "income" ? "Income" : "Expenses",
          ]}
          labelStyle={{ fontWeight: 600, marginBottom: 4 }}
          contentStyle={{ borderRadius: 8, border: "1px solid #e5e7eb", fontSize: 12 }}
        />
        <Legend
          formatter={(value) => (value === "income" ? "Income" : "Expenses")}
          iconType="circle"
          wrapperStyle={{ fontSize: 12 }}
        />
        <Line
          type="monotone"
          dataKey="income"
          stroke="#16a34a"
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 4 }}
        />
        <Line
          type="monotone"
          dataKey="expenses"
          stroke="#dc2626"
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 4 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
