"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input, Button } from "@/shared/components";
import { bookSchema, type CreateBookValues } from "../../validation";
import type { Book } from "../../types";

interface BookFormProps {
  initial?: Book;
  onSubmit: (values: CreateBookValues) => Promise<void>;
  onCancel: () => void;
}

export function BookForm({ initial, onSubmit, onCancel }: BookFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CreateBookValues>({
    resolver: zodResolver(bookSchema),
    defaultValues: {
      name: initial?.name ?? "",
      description: initial?.description ?? "",
      participants: initial?.participants ?? [],
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <Input
        id="book-name"
        label="Name"
        error={errors.name?.message}
        {...register("name")}
      />
      <Input
        id="book-description"
        label="Description"
        error={errors.description?.message}
        {...register("description")}
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
