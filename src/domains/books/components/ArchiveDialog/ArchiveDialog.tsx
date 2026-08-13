"use client";

import { Dialog, Button } from "@/shared/components";
import type { Book } from "../../types";

interface ArchiveDialogProps {
  book: Book | null;
  onConfirm: (book: Book) => void;
  onCancel: () => void;
  isConfirming?: boolean;
}

export function ArchiveDialog({ book, onConfirm, onCancel, isConfirming = false }: ArchiveDialogProps) {
  return (
    <Dialog
      open={book !== null}
      onClose={onCancel}
      title="Archive book"
    >
      <p className="mb-6 text-sm text-gray-600">
        Are you sure you want to archive{" "}
        <span className="font-medium text-gray-900">{book?.name}</span>? You can
        restore it at any time.
      </p>
      <div className="flex justify-end gap-2">
        <Button variant="ghost" onClick={onCancel} disabled={isConfirming}>
          Cancel
        </Button>
        <Button
          variant="danger"
          disabled={isConfirming}
          onClick={() => book && onConfirm(book)}
        >
          {isConfirming ? "Archiving..." : "Archive"}
        </Button>
      </div>
    </Dialog>
  );
}
