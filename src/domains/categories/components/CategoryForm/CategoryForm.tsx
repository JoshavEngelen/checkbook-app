"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input, Button } from "@/shared/components";
import { categorySchema, type CreateCategoryInput, type CreateCategoryValues } from "../../validation";
import type { Category } from "../../types";

interface CategoryFormProps {
  initial?: Category;
  onSubmit: (values: CreateCategoryValues) => Promise<void>;
  onCancel: () => void;
}

export function CategoryForm({ initial, onSubmit, onCancel }: CategoryFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CreateCategoryInput, unknown, CreateCategoryValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: initial?.name ?? "",
      budget: initial?.budget ?? 0,
      endDate: initial?.endDate ? initial.endDate.toISOString().split('T')[0] : undefined
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <Input
        id="category-name"
        label="Name"
        error={errors.name?.message}
        {...register("name")}
      />
      <Input
        id="category-budget"
        label="Budget"
        type="number"
        step="0.01"
        min="0"
        error={errors.budget?.message}
        {...register("budget", { valueAsNumber: true })}
      />
      <Input
        id="category-end-date"
        label="End date"
        type="date"
        error={errors.endDate?.message}
        {...register("endDate")}
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
