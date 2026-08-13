import { z } from "zod";

export const transactionSchema = z.object({
  // Title is optional; a transaction is meaningful with only an amount.
  title: z.string().default(""),
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
