"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";

const navItems = (bookId: string) => [
  { label: "Transactions", href: `/books/${bookId}/transactions` },
  { label: "Categories", href: `/books/${bookId}/categories` },
  { label: "Statistics", href: `/books/${bookId}/statistics` },
];

export function BookNav({ bookId }: { bookId: string }) {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-1">
      {navItems(bookId).map(({ label, href }) => (
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
