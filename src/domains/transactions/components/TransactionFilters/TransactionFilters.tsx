"use client";

import { Select } from "@/shared/components";
import type { TransactionType } from "../../types";

export interface TransactionFilters {
  month: string; // "YYYY-MM"
  type: TransactionType | "all";
}

interface TransactionFiltersProps {
  filters: TransactionFilters;
  onChange: (filters: TransactionFilters) => void;
}

function toYearMonth(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function buildMonthOptions(): { value: string; label: string }[] {
  const options = [];
  const now = new Date();
  for (let i = 0; i < 12; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const value = toYearMonth(d);
    const label = d.toLocaleString("default", { month: "long", year: "numeric" });
    options.push({ value, label });
  }
  return options;
}

export function TransactionFilters({ filters, onChange }: TransactionFiltersProps) {
  return (
    <div className="flex flex-wrap gap-3">
      <Select
        id="filter-month"
        label="Month"
        value={filters.month}
        options={buildMonthOptions()}
        onChange={(e) => onChange({ ...filters, month: e.target.value })}
      />
      <Select
        id="filter-type"
        label="Type"
        value={filters.type}
        options={[
          { value: "all", label: "All" },
          { value: "expense", label: "Expenses" },
          { value: "income", label: "Income" },
        ]}
        onChange={(e) =>
          onChange({ ...filters, type: e.target.value as TransactionFilters["type"] })
        }
      />
    </div>
  );
}
