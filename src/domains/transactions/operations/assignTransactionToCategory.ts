import { TransactionRepository } from "../data/TransactionRepository";
import { CategoryRepository } from "@/domains/categories/data/CategoryRepository";

export class AssignCategoryError extends Error {}

/**
 * Domain operation: assign a transaction to a category.
 *
 * Validates that both documents exist and belong to the same household book
 * before persisting. Throws {@link AssignCategoryError} for domain violations.
 * Has no React or dnd-kit dependency.
 */
export async function assignTransactionToCategory(
  transactionId: string,
  categoryId: string
): Promise<void> {
  const [transaction, category] = await Promise.all([
    TransactionRepository.getTransactionById(transactionId),
    CategoryRepository.getCategoryById(categoryId),
  ]);

  if (!transaction) {
    throw new AssignCategoryError(`Transaction "${transactionId}" not found.`);
  }
  if (!category) {
    throw new AssignCategoryError(`Category "${categoryId}" not found.`);
  }
  if (transaction.bookId !== category.bookId) {
    throw new AssignCategoryError(
      "Cannot assign: transaction and category belong to different books."
    );
  }

  await TransactionRepository.updateTransaction(transactionId, { categoryId });
}
