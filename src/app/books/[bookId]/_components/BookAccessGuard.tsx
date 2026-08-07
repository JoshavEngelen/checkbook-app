"use client";

import { useEffect } from "react";
import type { ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useBook } from "@/domains/books";
import { Spinner } from "@/shared/components";

export function BookAccessGuard({
  bookId,
  children,
}: {
  bookId: string;
  children: ReactNode;
}) {
  const router = useRouter();
  const { loading, forbidden } = useBook(bookId);

  useEffect(() => {
    if (!loading && forbidden) {
      router.replace("/books?error=forbidden");
    }
  }, [loading, forbidden, router]);

  if (loading || forbidden) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return <>{children}</>;
}
