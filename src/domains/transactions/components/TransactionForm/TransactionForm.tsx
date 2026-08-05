"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input, Button, Select } from "@/shared/components";
import { transactionSchema, type CreateTransactionInput, type CreateTransactionValues } from "../../validation";
import type { Transaction } from "../../types";

const today = new Date().toISOString().split("T")[0];

interface TransactionFormProps {
  initial?: Transaction;
  categoryOptions?: { value: string; label: string }[];
  onSubmit: (values: CreateTransactionValues) => Promise<void>;
  onCancel: () => void;
}

export function TransactionForm({
  initial,
  categoryOptions = [],
  onSubmit,
  onCancel,
}: TransactionFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CreateTransactionInput, unknown, CreateTransactionValues>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      title: initial?.title ?? "",
      amount: initial?.amount ?? (undefined as unknown as number),
      type: initial?.type ?? "expense",
      categoryId: initial?.categoryId ?? "",
      date: initial?.date
        ? initial.date.toISOString().split("T")[0]
        : today,
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <Input
        id="tx-title"
        label="Title"
        error={errors.title?.message}
        {...register("title")}
      />
      <Input
        id="tx-amount"
        label="Amount"
        type="number"
        step="0.01"
        min="0.01"
        error={errors.amount?.message}
        {...register("amount", { valueAsNumber: true })}
      />
      <Select
        id="tx-type"
        label="Type"
        error={errors.type?.message}
        options={[
          { value: "expense", label: "Expense" },
          { value: "income", label: "Income" },
        ]}
        {...register("type")}
      />
      {categoryOptions.length > 0 && (
        <Select
          id="tx-category"
          label="Category"
          options={[{ value: "", label: "None" }, ...categoryOptions]}
          {...register("categoryId")}
        />
      )}
      <Input
        id="tx-date"
        label="Date"
        type="date"
        error={errors.date?.message}
        {...register("date")}
      />
      <div className="flex justify-end gap-2">
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : initial ? "Save" : "Create"}
        </Button>
      </div>
    </form>
  );
}
