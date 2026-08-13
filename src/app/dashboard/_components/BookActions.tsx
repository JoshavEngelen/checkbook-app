"use client";

import Link from "next/link";
import { Button } from "@/shared/components";

interface BookActionsProps {
  selectedBookId: string | null;
}

export function BookActions({ selectedBookId }: BookActionsProps) {
  if (!selectedBookId) return null;

  return (
    <div className="flex flex-wrap items-center gap-3">
      <Link href={`/books/${selectedBookId}/transactions`}>
        <Button variant="ghost" size="sm">
          Manage transactions
        </Button>
      </Link>
      <Link href={`/books/${selectedBookId}/categories`}>
        <Button variant="ghost" size="sm">
          Manage categories
        </Button>
      </Link>
    </div>
  );
}
