import { z } from "zod";

export const BookSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  ownerId: z.string().min(1),
  archived: z.boolean(),
  participants: z.array(z.string().min(1)),
  createdAt: z.any(), // Firestore Timestamp is not a plain JS type
});

// Used for create/edit forms — mirrors BookForm
export const BookFormSchema = BookSchema.pick({
  name: true,
  description: true,
  participants: true,
});

export type BookFormValues = z.infer<typeof BookFormSchema>;
