import { z } from "zod";

export const transactionSchema = z.object({
  title: z.string().min(1, "Title is required"),
  amount: z
    .number({ error: "Amount must be a number" })
    .positive("Amount must be greater than 0"),
  type: z.enum(["income", "expense"], { error: "Transaction type is required" }),
  categoryId: z.string().optional(),
  date: z.coerce.date(),
});

export const updateTransactionSchema = transactionSchema.partial();

// Raw form input (date is a string from <input type="date">)
export type CreateTransactionInput = z.input<typeof transactionSchema>;
export type CreateTransactionValues = z.output<typeof transactionSchema>;
export type UpdateTransactionValues = z.output<typeof updateTransactionSchema>;
