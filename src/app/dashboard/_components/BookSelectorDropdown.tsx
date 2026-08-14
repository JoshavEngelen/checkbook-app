"use client";

import clsx from "clsx";
import type { Book } from "@/domains/books";
import { Dropdown, type DropdownItem } from "@/shared/components";

interface BookSelectorDropdownProps {
  activeBooks: Book[];
  selectedBook: Book | null;
  currentUserId: string;
  onSelect: (bookId: string) => void;
}

export function BookSelectorDropdown({
  activeBooks,
  selectedBook,
  currentUserId,
  onSelect,
}: BookSelectorDropdownProps) {
  const items: DropdownItem[] = activeBooks.map((book) => ({
    id: book.id,
    label: book.name,
    className: clsx(
      book.id === selectedBook?.id
        ? "bg-blue-50 font-semibold text-blue-700"
        : "text-gray-700 hover:bg-gray-50"
    ),
    onSelect: () => onSelect(book.id),
  }));

  return (
    <Dropdown
      items={items}
      renderItem={(item, onSelect) => {
        const book = activeBooks.find((b) => b.id === item.id)!;
        const isOwner = book.ownerId === currentUserId;
        return (
          <button
            type="button"
            role="menuitem"
            onClick={() => onSelect(item.onSelect)}
            className={clsx(
              "flex w-full flex-col px-4 py-2.5 text-left text-sm transition-colors",
              item.className
            )}
          >
            <span className="flex items-center gap-2 leading-tight">
              <span>{item.label}</span>
              <span
                className={clsx(
                  "inline-flex items-center rounded-full px-1.5 py-0.5 text-xs font-medium",
                  isOwner
                    ? "bg-blue-100 text-blue-700"
                    : "bg-gray-100 text-gray-500"
                )}
              >
                {isOwner ? "Owner" : "Participant"}
              </span>
            </span>
            {book.description && (
              <span className="mt-0.5 text-xs text-gray-400 leading-tight">
                {book.description}
              </span>
            )}
          </button>
        );
      }}
      trigger={({ isOpen, onClick }) => (
        <button
          type="button"
          onClick={onClick}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          className={clsx(
            "inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition-colors",
            "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1",
            isOpen
              ? "border-blue-500 bg-blue-50 text-blue-700"
              : "border-gray-300 bg-white text-gray-700 hover:border-gray-400 hover:bg-gray-50"
          )}
        >
          <span className="max-w-[160px] truncate">
            {selectedBook?.name ?? "Select book"}
          </span>
          {/* Chevron icon */}
          <svg
            aria-hidden="true"
            className={clsx(
              "h-4 w-4 shrink-0 transition-transform",
              isOpen && "rotate-180"
            )}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      )}
    />
  );
}
