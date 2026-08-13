"use client";

import { Button } from "@/shared/components";

interface QuickActionsProps {
  selectedBookId: string | null;
  onAddTransaction: () => void;
  onAddCategory: () => void;
}

export function QuickActions({
  selectedBookId,
  onAddTransaction,
  onAddCategory,
}: QuickActionsProps) {
  return (
    <section aria-labelledby="quick-actions-heading">
      <h2 id="quick-actions-heading" className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">
        Quick actions
      </h2>
      <div className="flex flex-wrap gap-3">
        <Button
          onClick={onAddTransaction}
          disabled={!selectedBookId}
          title={!selectedBookId ? "Select a book first" : undefined}
        >
          + Add transaction
        </Button>
        <Button
          variant="secondary"
          onClick={onAddCategory}
          disabled={!selectedBookId}
          title={!selectedBookId ? "Select a book first" : undefined}
        >
          + Add category
        </Button>
      </div>
      {!selectedBookId && (
        <p className="mt-2 text-xs text-gray-400">Select a book above to enable quick actions.</p>
      )}
    </section>
  );
}
