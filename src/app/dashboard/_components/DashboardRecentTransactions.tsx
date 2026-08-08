import { EmptyState, Spinner } from "@/shared/components";
import { TransactionCard } from "@/domains/transactions";
import type { Transaction } from "@/domains/transactions";

interface DashboardRecentTransactionsProps {
  transactions: Transaction[];
  loading?: boolean;
}

export function DashboardRecentTransactions({
  transactions,
  loading = false,
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
        <div className="flex items-center justify-center py-12">
          <Spinner size="md" />
        </div>
      ) : transactions.length === 0 ? (
        <EmptyState
          title="No transactions yet"
          description="Add your first transaction via the quick actions above."
        />
      ) : (
        <div className="flex flex-col gap-2">
          {transactions.map((tx) => (
            // TransactionCard requires onEdit/onDelete; in the dashboard shell
            // these are no-ops — real wiring happens when Firebase is connected.
            <TransactionCard
              key={tx.id}
              transaction={tx}
              onEdit={() => {}}
              onDelete={() => {}}
            />
          ))}
        </div>
      )}
    </section>
  );
}
