import { z } from "zod";

export const bookSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  participants: z.array(z.string().min(1)),
});

export const updateBookSchema = bookSchema.partial();

export type CreateBookValues = z.infer<typeof bookSchema>;
export type UpdateBookValues = z.infer<typeof updateBookSchema>;
