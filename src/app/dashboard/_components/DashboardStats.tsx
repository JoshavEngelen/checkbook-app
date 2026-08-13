"use client";

import clsx from "clsx";
import { Card, Select } from "@/shared/components";
import type { MonthlyStats } from "@/domains/transactions/operations/calculateMonthlyStats";

interface DashboardStatsProps {
  stats: MonthlyStats;
  month: string; // "YYYY-MM"
  onMonthChange: (month: string) => void;
  loading?: boolean;
}

function buildMonthOptions(): { value: string; label: string }[] {
  const options = [];
  const now = new Date();
  for (let i = 0; i < 12; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const value = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const label = d.toLocaleString("default", { month: "long", year: "numeric" });
    options.push({ value, label });
  }
  return options;
}

interface StatCardProps {
  label: string;
  prefix: string;
  value: number;
  valueClass: string;
  loading: boolean;
}

function StatCard({ label, prefix, value, valueClass, loading }: StatCardProps) {
  return (
    <Card className="flex flex-col gap-1 p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">{label}</p>
      {loading ? (
        <div className="mt-1 h-6 w-24 animate-pulse rounded bg-gray-200" />
      ) : (
        <p className={clsx("text-xl font-bold tabular-nums", valueClass)}>
          {prefix}${Math.abs(value).toFixed(2)}
        </p>
      )}
    </Card>
  );
}

export function DashboardStats({
  stats,
  month,
  onMonthChange,
  loading = false,
}: DashboardStatsProps) {
  const balancePositive = stats.balance >= 0;

  return (
    <section aria-labelledby="stats-heading" className="mb-10">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <h2 id="stats-heading" className="text-lg font-semibold text-gray-900">
          Financial overview
        </h2>
        <Select
          id="stats-month"
          label="Month"
          value={month}
          options={buildMonthOptions()}
          onChange={(e) => onMonthChange(e.target.value)}
        />
      </div>

      <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {/* Income */}
        <div>
          <StatCard
            label="Income"
            prefix="+"
            value={stats.totalIncome}
            valueClass="text-green-700"
            loading={loading}
          />
          <p className="sr-only">Total income: ${stats.totalIncome.toFixed(2)}</p>
        </div>

        {/* Expenses */}
        <div>
          <StatCard
            label="Expenses"
            prefix="-"
            value={stats.totalExpenses}
            valueClass="text-red-700"
            loading={loading}
          />
          <p className="sr-only">Total expenses: ${stats.totalExpenses.toFixed(2)}</p>
        </div>

        {/* Balance */}
        <div>
          <Card className="flex flex-col gap-1 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
              Balance
            </p>
            {loading ? (
              <div className="mt-1 h-6 w-24 animate-pulse rounded bg-gray-200" />
            ) : (
              <p
                className={clsx(
                  "text-xl font-bold tabular-nums",
                  balancePositive ? "text-green-700" : "text-red-700"
                )}
              >
                {/* Sign is explicit in the text so colour is not the only indicator */}
                {balancePositive ? "+" : "−"}${Math.abs(stats.balance).toFixed(2)}
              </p>
            )}
          </Card>
          <p className="sr-only">
            Balance: {balancePositive ? "surplus" : "deficit"} ${Math.abs(stats.balance).toFixed(2)}
          </p>
        </div>

        {/* Transaction count */}
        <div>
          <Card className="flex flex-col gap-1 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
              Transactions
            </p>
            {loading ? (
              <div className="mt-1 h-6 w-16 animate-pulse rounded bg-gray-200" />
            ) : (
              <p className="text-xl font-bold tabular-nums text-gray-900">
                {stats.transactionCount}
              </p>
            )}
          </Card>
          <p className="sr-only">Transaction count: {stats.transactionCount}</p>
        </div>
      </dl>
    </section>
  );
}
