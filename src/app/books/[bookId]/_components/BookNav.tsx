"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import { useBookAccess } from "@/domains/books/hooks/useBookAccess";

export function BookNav({ bookId }: { bookId: string }) {
  const pathname = usePathname();
  const { isOwner } = useBookAccess(bookId);

  const navItems = [
    { label: "Transactions", href: `/books/${bookId}/transactions` },
    { label: "Categories", href: `/books/${bookId}/categories` },
    // Participants page is owner-only; absent for participants.
    ...(isOwner ? [{ label: "Participants", href: `/books/${bookId}/participants` }] : []),
  ];

  return (
    <nav className="flex flex-col gap-1">
      {navItems.map(({ label, href }) => (
        <Link
          key={href}
          href={href}
          className={clsx(
            "rounded-md px-3 py-2 text-sm font-medium transition-colors",
            pathname.startsWith(href)
              ? "bg-blue-50 text-blue-700"
              : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
          )}
        >
          {label}
        </Link>
      ))}
    </nav>
  );
}
