export type TransactionType = "income" | "expense";

export type Transaction = {
  id: string;
  bookId: string;
  title: string;
  amount: number;
  type: TransactionType;
  categoryId?: string;
  date: Date;
};

export type CreateTransactionRequest = Pick<
  Transaction,
  "title" | "amount" | "type" | "categoryId" | "date"
>;

export type UpdateTransactionRequest = Partial<CreateTransactionRequest>;

// Lightweight projection for list views
export type TransactionSummary = Pick<
  Transaction,
  "id" | "title" | "amount" | "type" | "date"
>;
