import { ReactNode } from "react";
import Link from "next/link";
import { BookNav } from "./_components/BookNav";
import { BookAccessGuard } from "./_components/BookAccessGuard";

export default async function BookLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ bookId: string }>;
}) {
  const { bookId } = await params;

  return (
    <BookAccessGuard bookId={bookId}>
      <div className="flex min-h-screen">
        <aside className="w-56 shrink-0 border-r border-gray-200 bg-white p-4">
          <Link
            href="/books"
            className="mb-6 flex items-center gap-1 text-xs text-gray-400 hover:text-gray-700"
          >
            ← All books
          </Link>
          <BookNav bookId={bookId} />
        </aside>

        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </BookAccessGuard>
  );
}
