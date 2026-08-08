import { z } from "zod";

export const categorySchema = z.object({
  name: z.string().min(1, "Name is required"),
  budget: z
    .number({ error: "Budget must be a number" })
    .min(0, "Budget must be at least 0"),
  endDate: z.preprocess(
    (v) => (v === "" ? undefined : v),
    z.coerce.date().optional()
  ),
});

export const updateCategorySchema = categorySchema.partial();

// Raw form input (endDate is a string from <input type="date">)
export type CreateCategoryInput = z.input<typeof categorySchema>;
export type CreateCategoryValues = z.output<typeof categorySchema>;
export type UpdateCategoryValues = z.output<typeof updateCategorySchema>;
