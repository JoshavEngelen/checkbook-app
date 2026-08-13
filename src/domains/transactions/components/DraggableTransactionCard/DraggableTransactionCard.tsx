"use client";

import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import clsx from "clsx";
import { TransactionCard } from "../TransactionCard/TransactionCard";
import type { Transaction } from "../../types";

interface DraggableTransactionCardProps {
  transaction: Transaction;
  onEdit: (transaction: Transaction) => void;
  onDelete: (transaction: Transaction) => void;
}

/**
 * Wraps TransactionCard with dnd-kit drag behaviour.
 * The drag data carries the transactionId so drop targets can identify
 * which transaction is being assigned.
 */
export function DraggableTransactionCard({
  transaction,
  onEdit,
  onDelete,
}: DraggableTransactionCardProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: transaction.id,
    data: { transactionId: transaction.id },
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    // Lift the card visually above the rest while dragging.
    zIndex: isDragging ? 50 : undefined,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={clsx(
        "cursor-grab rounded-lg transition-opacity",
        isDragging && "opacity-50 cursor-grabbing"
      )}
      // Spread dnd-kit's keyboard and pointer listeners onto the wrapper.
      // aria-roledescription is set to guide screen-reader users.
      {...attributes}
      {...listeners}
      aria-roledescription="draggable transaction"
    >
      <TransactionCard
        transaction={transaction}
        onEdit={onEdit}
        onDelete={onDelete}
      />
    </div>
  );
}
