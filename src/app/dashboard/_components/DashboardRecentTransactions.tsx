import { Button, EmptyState } from "@/shared/components";
import { TransactionCard } from "@/domains/transactions";
import type { Transaction } from "@/domains/transactions";

interface DashboardRecentTransactionsProps {
  transactions: Transaction[];
  loading?: boolean;
  onAddTransaction: () => void;
  onEdit: (transaction: Transaction) => void;
  onDelete: (transaction: Transaction) => void;
}

export function DashboardRecentTransactions({
  transactions,
  loading = false,
  onAddTransaction,
  onEdit,
  onDelete,
}: DashboardRecentTransactionsProps) {
  return (
    <section aria-labelledby="recent-transactions-heading">
      <h2
        id="recent-transactions-heading"
        className="mb-3 text-lg font-semibold text-gray-900"
      >
        Recent transactions
      </h2>

      {loading ? (
        <div className="flex flex-col gap-2">
          {[0, 1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-center justify-between rounded-lg border border-gray-100 bg-white px-4 py-3 shadow-sm">
              <div className="flex flex-col gap-1.5">
                <div className="h-3.5 w-32 animate-pulse rounded bg-gray-200" />
                <div className="h-3 w-20 animate-pulse rounded bg-gray-200" />
              </div>
              <div className="h-4 w-16 animate-pulse rounded bg-gray-200" />
            </div>
          ))}
        </div>
      ) : transactions.length === 0 ? (
        <EmptyState
          title="No transactions yet"
          description="Record your first transaction to start tracking your finances."
          action={
            <Button size="sm" onClick={onAddTransaction}>
              + Add transaction
            </Button>
          }
        />
      ) : (
        <div className="flex flex-col gap-2">
          {transactions.map((tx) => (
            <TransactionCard
              key={tx.id}
              transaction={tx}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </section>
  );
}
